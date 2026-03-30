import gc
import json
import re
import torch
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Literal
from pydantic import BaseModel
from transformers import AutoTokenizer
from vllm import LLM, SamplingParams
from vllm.sampling_params import StructuredOutputsParams
from confluent_kafka import Consumer, Producer, KafkaError

# =========================================================
# 1) 경로 및 환경 설정
# =========================================================
METADATA_JSON_PATH = "./metadata.json"
RULE_TXT_MAP = {
    "ssadimdol": "./ssadimdol.txt",
    "ssageumjari": "./ssageumjari.txt",
}
JUDGE_CRITERIA_PATH = "./judge_criteria.txt"
MODEL_NAME = "Qwen/Qwen3-14B"

# Kafka 설정
KAFKA_BOOTSTRAP_SERVERS = "j14a406.p.ssafy.io:80"
INPUT_TOPIC = "review-request"
OUTPUT_TOPIC = "report-response"
GROUP_ID = "judge-engine-group"

# 전역 상수 및 정규식
ARTICLE_HEADER_RE = re.compile(r"^(제\d+조)\s*(.+?)\s*$", re.MULTILINE)
THINK_BLOCK_RE = re.compile(r"<think>.*?</think>", re.DOTALL)
RESULT_SET = {"승인", "검토", "반려"}

# =========================================================
# 2) 데이터 모델 (Pydantic)
# =========================================================
class MatchedRule(BaseModel):
    clauseId: str
    clauseText: str


class FieldTarget(BaseModel):
    product: str
    fieldKey: str
    koreanField: str
    value: Any
    matched_articles: List[str]
    matchedRules: List[MatchedRule]
    required: bool
    excluded_from_final: bool

FIELD_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "result": {"type": "string", "enum": ["승인", "검토", "반려"]},
        "reason": {"type": "string"},
        "usedArticles": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["result", "reason", "usedArticles"],
    "additionalProperties": False
}

SUMMARY_JSON_SCHEMA = {
    "type": "object",
    "properties": {
        "finalResult": {"type": "string", "enum": ["승인", "검토", "반려"]},
        "reason": {"type": "string"},
        "keyApprovalReasons": {"type": "array", "items": {"type": "string"}},
        "keyRejectReasons": {"type": "array", "items": {"type": "string"}},
        "keyReviewReasons": {"type": "array", "items": {"type": "string"}}
    },
    "required": ["finalResult", "reason", "keyApprovalReasons", "keyRejectReasons", "keyReviewReasons"],
    "additionalProperties": False
}


# =========================================================
# 3) 유틸리티 및 확정 규칙 (Deterministic Logic)
# =========================================================
def load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_text(path: str) -> str:
    return Path(path).read_text(encoding="utf-8")

def cleanup_cuda():
    gc.collect()
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

def is_empty_value(value: Any) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    if isinstance(value, (list, dict)) and len(value) == 0:
        return True
    return False

def strip_thinking_content(text: str) -> str:
    return THINK_BLOCK_RE.sub("", text).strip()

def extract_first_json_object(text: str) -> str:
    start = text.find("{")
    if start == -1:
        raise ValueError("JSON object start not found")
    depth = 0
    for idx in range(start, len(text)):
        char = text[idx]
        if char == "{":
            depth += 1
        elif char == "}":
            depth -= 1
            if depth == 0:
                return text[start:idx + 1]
    raise ValueError("JSON object end not found")

def load_rule_index_from_txt(path: str) -> Dict[str, Dict[str, str]]:
    text = load_text(path).strip()
    matches = list(ARTICLE_HEADER_RE.finditer(text))
    if not matches:
        raise ValueError(f"조항 헤더를 찾지 못했습니다: {path}")

    rule_index: Dict[str, Dict[str, str]] = {}
    for idx, match in enumerate(matches):
        article_id = match.group(1).strip()
        title = match.group(2).strip()
        start = match.start()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(text)
        rule_index[article_id] = {
            "clauseId": article_id,
            "title": title,
            "clauseText": text[start:end].strip(),
        }
    return rule_index

def get_rule_texts(matched_articles: List[str], rule_index: Dict[str, Dict[str, str]]) -> List[MatchedRule]:
    rules: List[MatchedRule] = []
    for article_id in matched_articles:
        rule = rule_index.get(article_id)
        if rule:
            rules.append(MatchedRule(clauseId=rule["clauseId"], clauseText=rule["clauseText"]))
    return rules

def sum_maximum_claim_amount(senior_rights_value: Any) -> Optional[int]:
    if not isinstance(senior_rights_value, list):
        return None
    total = 0
    found = False
    for item in senior_rights_value:
        if isinstance(item, dict) and isinstance(item.get("maximumClaimAmount"), (int, float)):
            total += int(item["maximumClaimAmount"])
            found = True
    return total if found else None

def infer_regulation_region(address: Any, metadata: dict) -> Optional[str]:
    if not isinstance(address, str) or not address.strip():
        return None
    keywords = metadata["ltv_rules"]["regulated_keywords"]
    return "규제지역" if any(keyword in address for keyword in keywords) else "비규제지역"

def infer_ltv_ratio(address: Any, owned_house_count: Any, metadata: dict) -> Tuple[Optional[float], Optional[str], Optional[int], str]:
    region = infer_regulation_region(address, metadata)
    if region is None:
        return None, None, None, "소재지 주소가 없어 규제지역 여부를 판단할 수 없습니다."
    if not isinstance(owned_house_count, int):
        return None, region, None, "규제지역 여부는 확인되지만 보유주택 수가 없어 LTV 비율을 산정할 수 없습니다."
    
    if region == "규제지역":
        table = metadata["ltv_rules"]["regulated_house_count_to_ratio"]
    else:
        table = metadata["ltv_rules"]["non_regulated_house_count_to_ratio"]

    if owned_house_count >= 2:
        ratio = float(table["2_or_more"])
    else:
        ratio = float(table[str(owned_house_count)])

    return ratio, region, owned_house_count, f"{region}이며 보유주택 수 {owned_house_count}채 기준으로 LTV 비율을 적용했습니다."

def infer_annual_income_total(product_block: dict) -> Tuple[Optional[int], str]:
    employment_value = product_block.get("employmentType", {}).get("value")
    annual_income = product_block.get("annualIncomeTotal", {}).get("value")
    income_amount = product_block.get("incomeAmount", {}).get("value")

    if employment_value == "근로자":
        if isinstance(annual_income, (int, float)):
            return int(annual_income), "근로자이므로 annualIncomeTotal 값을 사용했습니다."
        return None, "근로자이나 annualIncomeTotal 값이 없어 연소득을 확정할 수 없습니다."

    if employment_value in {"사업자", "개인사업자"}:
        if isinstance(income_amount, (int, float)):
            return int(income_amount), "사업자이므로 incomeAmount 값을 연소득으로 사용했습니다."
        return None, "사업자이나 incomeAmount 값이 없어 연소득을 확정할 수 없습니다."

    if isinstance(annual_income, (int, float)):
        return int(annual_income), "employmentType과 무관하게 annualIncomeTotal 값이 존재하여 사용했습니다."
    if isinstance(income_amount, (int, float)):
        return int(income_amount), "employmentType과 무관하게 incomeAmount 값이 존재하여 사용했습니다."

    return None, "연소득 판단에 사용할 소득 정보가 없습니다."

def infer_dsr_ratio(product_block: dict, metadata: dict) -> Tuple[float, str]:
    annual_income = product_block.get("annualIncomeTotal", {}).get("value")
    income_amount = product_block.get("incomeAmount", {}).get("value")
    taxable_sales = product_block.get("taxableSalesAmount", {}).get("value")

    has_income_data = any(isinstance(v, (int, float)) for v in [annual_income, income_amount, taxable_sales])
    if has_income_data:
        ratio = float(metadata["dsr_rules"]["default_ratio"])
        return ratio, "소득 관련 데이터가 확인되어 DSR 비율 40%를 적용했습니다."

    ratio = float(metadata["dsr_rules"]["missing_income_ratio"])
    return ratio, "소득 관련 데이터가 전혀 확인되지 않아 DSR 비율 20%를 적용했습니다."

def flatten_input_value(value: Any) -> str:
    return json.dumps(value, ensure_ascii=False) if isinstance(value, (dict, list)) else str(value)

# =========================================================
# 4) LLM 초기화 및 스키마 설정
# =========================================================
print(f"[*] 모델 로딩 시작: {MODEL_NAME}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
llm = LLM(
    model=MODEL_NAME,
    trust_remote_code=True,
    gpu_memory_utilization=0.6,
    max_num_seqs=8,
    max_model_len=16384,
)

# =========================================================
# 5) 프롬프트 빌더 및 실행 함수
# =========================================================
def build_field_prompt(product_name: str, field_target: FieldTarget, judge_criteria: str, product_rule_text: str) -> str:
    matched_rule_text = "\n\n".join(
        [f"[{rule.clauseId}]\n{rule.clauseText}" for rule in field_target.matchedRules]
    )
    if not matched_rule_text:
        matched_rule_text = "(matched_articles에 해당하는 조항 본문 없음)"

    return f"""
당신은 주택담보대출 사전심사 AI이다.
반드시 입력값과 내규를 근거로 현재 필드 하나만 판단한다.

[판단 규칙]
- 결과는 승인, 검토, 반려 중 하나만 사용한다.
- 값이 없거나 null이면 검토다.
- 내규 위반이 명확하면 반려다.
- 충족이 명확하면 승인이다.
- reason은 한 문장으로 작성한다.
- usedArticles에는 실제로 사용한 조항만 넣는다.
- 상품이 싸금자리이고 fieldKey가 deathConfirmed라면 반려하지 말고 승인으로 처리하지도 말아야 한다. 이 경우 검토가 아니라 평가 제외 대상이므로 본 프롬프트는 호출되지 않는다.

[공통 심사 기준]
{judge_criteria}

[상품]
- productCode: {field_target.product}
- productName: {product_name}

[현재 필드]
- fieldKey: {field_target.fieldKey}
- name_ko: {field_target.koreanField}
- value: {flatten_input_value(field_target.value)}
- required: {field_target.required}

[matched_articles]
{json.dumps(field_target.matched_articles, ensure_ascii=False)}

[matched rule text]
{matched_rule_text}

[상품 전체 내규 원문]
{product_rule_text}

반드시 아래 JSON만 반환하라.
""".strip()


def build_summary_prompt(product_code: str, product_name: str, field_results: List[dict]) -> str:
    field_result_text = json.dumps(field_results, ensure_ascii=False, indent=2)
    return f"""
당신은 주택담보대출 사전심사 결과를 요약하는 AI이다.
아래 fieldResults를 보고 summary만 만든다.

[요약 규칙]
- finalResult는 반려가 하나라도 있으면 반려
- 반려가 없고 검토가 하나라도 있으면 검토
- 나머지는 승인
- keyApprovalReasons에는 승인에 영향을 준 핵심 이유만 넣는다.
- keyRejectReasons에는 반려 이유만 넣는다.
- keyReviewReasons에는 검토 이유만 넣는다.
- reason은 finalResult가 왜 그렇게 나왔는지 한두 문장으로 요약한다.

[상품]
- productCode: {product_code}
- productName: {product_name}

[fieldResults]
{field_result_text}

반드시 아래 JSON만 반환하라.
""".strip()

def deterministic_for_report(product_code: str, field_key: str, value: Any, product_block: dict) -> Optional[Tuple[str, str]]:
    if is_empty_value(value):
        return "검토", "입력값이 없어 내규 충족 여부를 확인할 수 없습니다."

    if field_key == "creditRating":
        if value == "A":
            return "승인", "신용등급이 A로 확인되어 자격 요건을 충족합니다."
        return "반려", "신용등급이 허용 기준을 충족하지 못해 취급이 어렵습니다."

    if field_key == "loanPurpose":
        if value == "주택 구매":
            return "승인", "대출 목적이 주택 구매로 확인되어 목적 요건을 충족합니다."
        return "반려", "대출 목적이 주택 구매가 아니어서 상품 목적 요건을 충족하지 못합니다."

    if field_key == "ownedHouseCount":
        if not isinstance(value, int):
            return "검토", "보유주택 수가 없어 다주택 여부를 확인할 수 없습니다."
        if value >= 2:
            return "반려", "보유주택 수가 2채 이상으로 확인되어 취급 제한 대상입니다."
        return "승인", "보유주택 수가 취급 가능 범위로 확인됩니다."

    if field_key in {"ownerName", "buyer"}:
        return "승인", "기본 인적 확인 정보가 존재하여 확인 가능합니다."

    if field_key in {"buildingType", "mainUsage", "employmentType", "workPeriod", "subscriberType", "annualIncomeTotal", "incomeAmount", "taxableSalesAmount", "propertyAddress"}:
        return None

    if field_key == "isViolationBuilding":
        return ("반려", "위반건축물로 확인되어 담보 취급이 어렵습니다.") if value is True else ("승인", "위반건축물 이력이 확인되지 않습니다.")

    if field_key == "hasTrustRegistration":
        return ("반려", "신탁등기가 존재하여 권리관계상 취급이 어렵습니다.") if value is True else ("승인", "신탁등기가 없어 권리관계상 특이사항이 없습니다.")

    if field_key == "hasLandRightCause":
        return ("반려", "토지 권리 분리 사유가 있어 담보 적격성에 문제가 있습니다.") if value is True else ("승인", "토지 권리 분리 사유가 확인되지 않습니다.")

    if field_key == "hasOwnershipTransferClaim":
        return ("반려", "권리침해가 확인되어 담보 취급이 어렵습니다.") if value is True else ("승인", "권리침해가 확인되지 않습니다.")

    if field_key == "floorStatusList":
        if isinstance(value, list) and any(isinstance(item, dict) and any(word in str(item.get("usage", "")) for word in ["주택", "아파트", "공동주택", "빌라", "단독주택"]) for item in value):
            return "승인", "층별 현황상 주거용 용도가 확인됩니다."
        return "검토", "층별 현황에서 주거용 여부를 명확히 확인하기 어렵습니다."

    if field_key == "deathConfirmed":
        if product_code == "ssadimdol":
            if str(value).strip() == "0명":
                return "반려", "싸딤돌은 사망자 확인 요건을 충족하지 못했습니다."
            return "승인", "싸딤돌의 사망자 확인 요건을 충족합니다."
        return None

    return None

def deterministic_for_calculate(product_code: str, field_key: str, product_block: dict, metadata: dict) -> dict:
    product_name = metadata["products"][product_code]["product_name"]
    empty_articles: List[str] = []

    if field_key == "collateralMarketPrice":
        base = product_block.get("collateralMarketPrice", {})
        sale = product_block.get("salePrice", {})
        value = base.get("value")
        if is_empty_value(value):
            value = sale.get("value")
            reason = "담보 시세가 없어 salePrice를 collateralMarketPrice로 적용했습니다."
            used = sale.get("matched_articles", [])
        else:
            reason = "입력된 collateralMarketPrice 값을 사용했습니다."
            used = base.get("matched_articles", [])
        return {"value": value, "reason": reason, "usedArticles": used}

    if field_key == "maximumClaimAmount":
        senior = product_block.get("seniorRights", {})
        value = sum_maximum_claim_amount(senior.get("value"))
        reason = "seniorRights의 maximumClaimAmount 합계를 사용했습니다." if value is not None else "seniorRights에서 maximumClaimAmount를 확인할 수 없습니다."
        return {"value": value, "reason": reason, "usedArticles": senior.get("matched_articles", [])}

    if field_key == "totalRemainingLoanBalance":
        src = product_block.get("totalRemainingLoanBalance", {})
        return {"value": src.get("value"), "reason": "입력값을 그대로 사용했습니다.", "usedArticles": src.get("matched_articles", [])}

    if field_key == "LTVRatio":
        address = product_block.get("propertyAddress", {}).get("value")
        owned = product_block.get("ownedHouseCount", {}).get("value")
        ratio, region, applied_count, reason = infer_ltv_ratio(address, owned, metadata)
        used = sorted(set(product_block.get("propertyAddress", {}).get("matched_articles", []) + product_block.get("ownedHouseCount", {}).get("matched_articles", [])))
        return {
            "value": ratio,
            "reason": reason,
            "usedArticles": used,
            "regulationRegion": region,
            "ownedHouseCountApplied": applied_count,
        }

    if field_key == "annualIncomeTotal":
        value, reason = infer_annual_income_total(product_block)
        used = []
        for key in ["employmentType", "annualIncomeTotal", "incomeAmount"]:
            used.extend(product_block.get(key, {}).get("matched_articles", []))
        return {"value": value, "reason": reason, "usedArticles": sorted(set(used))}

    if field_key == "annualPrincipalAndInterestRepayment":
        src = product_block.get("annualPrincipalAndInterestRepayment", {})
        return {"value": src.get("value"), "reason": "입력값을 그대로 사용했습니다.", "usedArticles": src.get("matched_articles", [])}

    if field_key == "DSRRatio":
        value, reason = infer_dsr_ratio(product_block, metadata)
        used = []
        for key in ["annualIncomeTotal", "incomeAmount", "taxableSalesAmount"]:
            used.extend(product_block.get(key, {}).get("matched_articles", []))
        return {"value": value, "reason": reason, "usedArticles": sorted(set(used))}

    return {"value": None, "reason": f"{product_name} {field_key} 계산 규칙이 정의되지 않았습니다.", "usedArticles": empty_articles}


def build_field_targets(product_code: str, product_block: dict, metadata: dict, rule_index: Dict[str, Dict[str, str]]) -> List[FieldTarget]:
    required_fields = set(metadata["forReport"]["required_fields"])
    excluded = set(metadata["forReport"].get("excluded_by_product", {}).get(product_code, []))
    targets: List[FieldTarget] = []
    for field_key in metadata["forReport"]["fields"]:
        if field_key not in product_block:
            continue
        field = product_block[field_key]
        if not isinstance(field, dict):
            continue
        targets.append(
            FieldTarget(
                product=product_code,
                fieldKey=field_key,
                koreanField=field.get("name_ko", field_key),
                value=field.get("value"),
                matched_articles=field.get("matched_articles", []),
                matchedRules=get_rule_texts(field.get("matched_articles", []), rule_index),
                required=field_key in required_fields,
                excluded_from_final=field_key in excluded,
            )
        )
    return targets

def run_for_report(product_code: str, product_block: dict, metadata: dict, product_rule_text: str, rule_index: Dict[str, Dict[str, str]], judge_criteria: str) -> dict:
    product_name = metadata["products"][product_code]["product_name"]
    field_results: List[dict] = []
    prompts: List[str] = []
    model_targets: List[FieldTarget] = []

    for target in build_field_targets(product_code, product_block, metadata, rule_index):
        if target.excluded_from_final:
            continue

        deterministic = deterministic_for_report(product_code, target.fieldKey, target.value, product_block)
        if deterministic is not None:
            result, reason = deterministic
            field_results.append({
                "fieldKey": target.fieldKey,
                "name_ko": target.koreanField,
                "inputValue": target.value,
                "result": result,
                "reason": reason,
                "usedArticles": target.matched_articles,
                "isRequired": target.required,
                "excludedFromFinal": False,
            })
            continue

        prompts.append(build_field_prompt(product_name, target, judge_criteria, product_rule_text))
        model_targets.append(target)

    if prompts:
        sampling_params = SamplingParams(
            temperature=0.0,
            top_p=1.0,
            max_tokens=350,
            structured_outputs=StructuredOutputsParams(json=FIELD_JSON_SCHEMA),
        )
        outputs = llm.generate(prompts, sampling_params)
        for target, output in zip(model_targets, outputs):
            raw_text = output.outputs[0].text
            try:
                cleaned = strip_thinking_content(raw_text)
                parsed = json.loads(extract_first_json_object(cleaned))
                result = parsed.get("result", "검토")
                if result not in RESULT_SET:
                    result = "검토"
                field_results.append({
                    "fieldKey": target.fieldKey,
                    "name_ko": target.koreanField,
                    "inputValue": target.value,
                    "result": result,
                    "reason": parsed.get("reason", "모델이 사유를 반환하지 않아 검토 처리했습니다."),
                    "usedArticles": parsed.get("usedArticles", target.matched_articles),
                    "isRequired": target.required,
                    "excludedFromFinal": False,
                })
            except Exception as exc:
                field_results.append({
                    "fieldKey": target.fieldKey,
                    "name_ko": target.koreanField,
                    "inputValue": target.value,
                    "result": "검토",
                    "reason": f"모델 출력 파싱에 실패하여 검토 처리했습니다: {exc}",
                    "usedArticles": target.matched_articles,
                    "isRequired": target.required,
                    "excludedFromFinal": False,
                })

    summary_prompt = build_summary_prompt(product_code, product_name, field_results)
    summary_sampling = SamplingParams(
        temperature=0.0,
        top_p=1.0,
        max_tokens=350,
        structured_outputs=StructuredOutputsParams(json=SUMMARY_JSON_SCHEMA),
    )
    summary_output = llm.generate([summary_prompt], summary_sampling)[0].outputs[0].text
    try:
        summary_cleaned = strip_thinking_content(summary_output)
        summary = json.loads(extract_first_json_object(summary_cleaned))
    except Exception:
        final_result = "승인"
        if any(item["result"] == "반려" for item in field_results):
            final_result = "반려"
        elif any(item["result"] == "검토" for item in field_results):
            final_result = "검토"
        summary = {
            "finalResult": final_result,
            "reason": "fieldResults를 기준으로 보수적으로 최종 결과를 산정했습니다.",
            "keyApprovalReasons": [item["reason"] for item in field_results if item["result"] == "승인"][:5],
            "keyRejectReasons": [item["reason"] for item in field_results if item["result"] == "반려"][:5],
            "keyReviewReasons": [item["reason"] for item in field_results if item["result"] == "검토"][:5],
        }

    return {
        "fieldResults": field_results,
        "summary": summary,
    }


def run_for_calculate(product_code: str, product_block: dict, metadata: dict) -> dict:
    result: Dict[str, Any] = {}
    for field_key in metadata["forCalculate"]["fields"]:
        result[field_key] = deterministic_for_calculate(product_code, field_key, product_block, metadata)
    return result


# =========================================================
# 6) Kafka Worker 메인 루프 (최종 수정본)
# =========================================================
def main_worker():
    # 설정 및 기준 로드
    try:
        metadata = load_json(METADATA_JSON_PATH)
        judge_criteria = load_text(JUDGE_CRITERIA_PATH)
    except Exception as e:
        print(f"[치명적 오류] 설정 파일을 불러올 수 없습니다: {e}")
        return

    # Kafka 클라이언트 설정
    c_conf = {
        'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS,
        'group.id': GROUP_ID,
        'auto.offset.reset': 'earliest'
    }
    c = Consumer(c_conf)
    c.subscribe([INPUT_TOPIC])
    
    p = Producer({'bootstrap.servers': KAFKA_BOOTSTRAP_SERVERS})

    print(f"[*] Worker 시작됨. 대기 중... (Topic: {INPUT_TOPIC})")

    try:
        while True:
            msg = c.poll(1.0)
            if msg is None: continue
            if msg.error():
                print(f"Kafka Error: {msg.error()}")
                continue

            try:
                # 1. 입력 데이터 파싱
                raw_data = msg.value().decode('utf-8')
                raw_input = json.loads(raw_data)
                cons_id = raw_input.get("consultationId", "UNKNOWN_ID")
                
                print(f"\n[작업 시작] ID: {cons_id}")

                output = {"consultationId": cons_id, "products": []}

                # 2. 결과 단위 (result 내부에 상품키들이 존재)
                products_dict = raw_input.get("result", {})
                if not products_dict:
                    # 백워드 호환을 위해 products 키 확인
                    p_list = raw_input.get("products", [])
                    if isinstance(p_list, dict):
                        products_dict = p_list
                    elif isinstance(p_list, list):
                        for item in p_list:
                            if "productCode" in item:
                                products_dict[item["productCode"]] = item

                for product_code, product_block in products_dict.items():
                    if product_code not in metadata.get("products", {}):
                        print(f"  - 지원하지 않는 상품코드 건너뜀: {product_code}")
                        continue
                    
                    print(f"  > 상품 심사 중: {product_code}")

                    try:
                        r_index = load_rule_index_from_txt(RULE_TXT_MAP[product_code])
                        r_text = load_text(RULE_TXT_MAP[product_code])
                    except Exception as e:
                        print(f"  [오류] 규칙 파일을 읽지 못했습니다 ({product_code}): {e}")
                        continue
                    
                    # 4. 결과 객체 조립 (test_prompt.py와 동일한 방식 적용)
                    res = {
                        "productCode": product_code,
                        "productName": metadata["products"][product_code]["product_name"],
                        "forCalculate": run_for_calculate(product_code, product_block, metadata),
                        "forReport": run_for_report(product_code, product_block, metadata, r_text, r_index, judge_criteria)
                    }
                    output["products"].append(res)

                # 5. Kafka 전송
                if output["products"]:
                    p.produce(
                        OUTPUT_TOPIC, 
                        key=str(cons_id), 
                        value=json.dumps(output, ensure_ascii=False).encode('utf-8')
                    )
                    p.flush()
                    print(f"[완료] ID: {cons_id} 전송 완료 (상품 수: {len(output['products'])})")
                
                cleanup_cuda()

            except Exception as e:
                print(f"[오류] 메시지 처리 중 예외 발생: {e}")
                import traceback
                traceback.print_exc() # 상세 에러 로그 출력

    except KeyboardInterrupt:
        print("\n[*] 사용자에 의해 종료 중...")
    finally:
        c.close()

if __name__ == "__main__":
    main_worker()