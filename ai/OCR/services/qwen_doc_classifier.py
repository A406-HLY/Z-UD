# services/qwen_doc_classifier.py
import json
import re
import time
from pathlib import Path
from typing import Any, Optional, Union

import torch
from PIL import Image
from transformers import AutoProcessor, Qwen2_5_VLForConditionalGeneration

DOC_TYPE_TO_LABEL = {
    "RESIDENT_REGISTRATION": "주민등록등본",
    "RESIDENT_REGISTRATION_ABSTRACT": "주민등록초본",
    "FAMILY_RELATION_CERTIFICATE": "가족관계증명서",
    "EMPLOYMENT_CERTIFICATE": "재직증명서",
    "HEALTH_INSURANCE_ELIGIBILITY": "건강보험 자격득실 확인서",
    "WITHHOLDING_TAX_CERTIFICATE": "근로소득 원천징수영수증",
    "SALARY_ACCOUNT_STATEMENT": "급여거래내역서",
    "INCOME_AMOUNT_CERTIFICATE": "소득금액증명원",
    "BUSINESS_REGISTRATION_CERTIFICATE": "사업자등록증명원",
    "VAT_TAX_BASE_CERTIFICATE": "부가가치세과세표준증명",
    "NATIONAL_TAX_CERTIFICATE": "납세증명서",
    "LOCAL_TAX_CERTIFICATE": "지방세 납세증명서",
    "LOCAL_TAX_ITEM_CERTIFICATE": "지방세 세목별 과세증명서",
    "TITLE_DEED": "등기사항전부증명서",
    "BUILDING_REGISTER": "건축물대장",
    "SALE_CONTRACT": "매매계약서",
    "OTHER": "기타",
}

DOC_TYPE_TO_GROUP = {
    "RESIDENT_REGISTRATION": "IDENTITY_FAMILY",
    "RESIDENT_REGISTRATION_ABSTRACT": "IDENTITY_FAMILY",
    "FAMILY_RELATION_CERTIFICATE": "IDENTITY_FAMILY",
    "EMPLOYMENT_CERTIFICATE": "INCOME_EMPLOYEE",
    "HEALTH_INSURANCE_ELIGIBILITY": "INCOME_EMPLOYEE",
    "WITHHOLDING_TAX_CERTIFICATE": "INCOME_EMPLOYEE",
    "SALARY_ACCOUNT_STATEMENT": "INCOME_EMPLOYEE",
    "INCOME_AMOUNT_CERTIFICATE": "INCOME_BUSINESS",
    "BUSINESS_REGISTRATION_CERTIFICATE": "INCOME_BUSINESS",
    "VAT_TAX_BASE_CERTIFICATE": "INCOME_BUSINESS",
    "NATIONAL_TAX_CERTIFICATE": "TAX",
    "LOCAL_TAX_CERTIFICATE": "TAX",
    "LOCAL_TAX_ITEM_CERTIFICATE": "TAX",
    "TITLE_DEED": "PROPERTY_HOUSING",
    "BUILDING_REGISTER": "PROPERTY_HOUSING",
    "SALE_CONTRACT": "PROPERTY_HOUSING",
    "OTHER": "OTHER",
}

VALID_TYPES = set(DOC_TYPE_TO_LABEL.keys())

TITLE_PATTERNS = [
    ("지방세세목별과세증명서", "LOCAL_TAX_ITEM_CERTIFICATE"),
    ("지방세세목별과세증명", "LOCAL_TAX_ITEM_CERTIFICATE"),
    ("지방세납세증명서", "LOCAL_TAX_CERTIFICATE"),
    ("지방세납세증명", "LOCAL_TAX_CERTIFICATE"),
    ("납세증명서", "NATIONAL_TAX_CERTIFICATE"),
    ("납세증명", "NATIONAL_TAX_CERTIFICATE"),
    ("주민등록표등본", "RESIDENT_REGISTRATION"),
    ("주민등록등본", "RESIDENT_REGISTRATION"),
    ("주민등록표초본", "RESIDENT_REGISTRATION_ABSTRACT"),
    ("주민등록초본", "RESIDENT_REGISTRATION_ABSTRACT"),
    ("가족관계증명서", "FAMILY_RELATION_CERTIFICATE"),
    ("등기사항전부증명서", "TITLE_DEED"),
    ("건축물대장", "BUILDING_REGISTER"),
    ("부동산매매계약서", "SALE_CONTRACT"),
    ("매매계약서", "SALE_CONTRACT"),
    ("재직증명서", "EMPLOYMENT_CERTIFICATE"),
    ("건강보험자격득실확인서", "HEALTH_INSURANCE_ELIGIBILITY"),
    ("근로소득원천징수영수증", "WITHHOLDING_TAX_CERTIFICATE"),
    ("급여거래내역서", "SALARY_ACCOUNT_STATEMENT"),
    ("거래내역서", "SALARY_ACCOUNT_STATEMENT"),
    ("소득금액증명원", "INCOME_AMOUNT_CERTIFICATE"),
    ("소득금액증명", "INCOME_AMOUNT_CERTIFICATE"),
    ("사업자등록증명원", "BUSINESS_REGISTRATION_CERTIFICATE"),
    ("사업자등록증명", "BUSINESS_REGISTRATION_CERTIFICATE"),
    ("부가가치세과세표준증명원", "VAT_TAX_BASE_CERTIFICATE"),
    ("부가가치세과세표준증명", "VAT_TAX_BASE_CERTIFICATE"),
]

TITLE_EXTRACTION_PROMPT = """
너는 문서 제목 판독기다.
문서 분류를 직접 하지 말고, 문서 상단에서 보이는 제목과 핵심 단서만 뽑아라.

규칙:
- 문서 상단 제목을 최대한 정확히 읽어라.
- "국세청민원사무처리규정", "제15호 서식", "민원사무처리규정" 같은 서식 머리말은 문서 제목으로 보지 마라.
- 실제 증명서 이름(예: 소득금액증명, 납세증명서, 사업자등록증명)을 titleText로 추출하라.
- 서식 번호, 규정명, 제n호 서식 문구는 titleText에서 제외하라.
- 모르면 추측하지 말고 null 또는 짧게 적어라.
- 핵심 단서는 상단에서 보이는 구분 단어 1~5개만 적어라.
- JSON 객체만 출력하라.
- 코드블록 마크다운 금지.

반드시 아래 JSON만 출력:
{
  "titleText": "문서 상단 제목 또는 null",
  "issuerText": "발급기관 또는 null",
  "keyClues": ["단서1", "단서2"],
  "confidence": 0.0
}
""".strip()

FALLBACK_CLASSIFICATION_PROMPT = """
너는 한국 금융 제출서류 분류기다.
제목 읽기가 애매할 때만 전체 문맥을 보고 documentType 하나를 고른다.

가능한 documentType 후보:
- RESIDENT_REGISTRATION
- RESIDENT_REGISTRATION_ABSTRACT
- FAMILY_RELATION_CERTIFICATE
- EMPLOYMENT_CERTIFICATE
- HEALTH_INSURANCE_ELIGIBILITY
- WITHHOLDING_TAX_CERTIFICATE
- SALARY_ACCOUNT_STATEMENT
- INCOME_AMOUNT_CERTIFICATE
- BUSINESS_REGISTRATION_CERTIFICATE
- VAT_TAX_BASE_CERTIFICATE
- NATIONAL_TAX_CERTIFICATE
- LOCAL_TAX_CERTIFICATE
- LOCAL_TAX_ITEM_CERTIFICATE
- TITLE_DEED
- BUILDING_REGISTER
- SALE_CONTRACT
- OTHER

반드시 아래 JSON만 출력:
{
  "documentType": "위 코드값 중 하나",
  "confidence": 0.0,
  "keyClues": ["단서1", "단서2"]
}
""".strip()


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return default


def try_parse_json(text: str) -> Optional[dict[str, Any]]:
    text = (text or "").strip()
    if text.startswith("```json"):
        text = text[len("```json"):].strip()
    if text.startswith("```"):
        text = text[len("```"):].strip()
    if text.endswith("```"):
        text = text[:-3].strip()
    try:
        parsed = json.loads(text)
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except Exception:
        return None


def normalize_text(text: Any) -> str:
    text = "" if text is None else str(text)
    text = text.strip()
    text = text.replace(" ", "")
    text = re.sub(r"[\[\](){}<>]", "", text)
    return text


def load_image(image_input: Union[str, Path, Image.Image]) -> Image.Image:
    if isinstance(image_input, Image.Image):
        return image_input.convert("RGB")
    return Image.open(image_input).convert("RGB")


def make_header_crop_image(image_input: Union[str, Path, Image.Image], crop_ratio: float = 0.5) -> Image.Image:
    img = load_image(image_input)
    w, h = img.size
    crop_h = max(int(h * crop_ratio), 1)
    return img.crop((0, 0, w, crop_h))


def match_title_to_doc_type(title_text: Any) -> Optional[str]:
    norm = normalize_text(title_text)
    if not norm:
        return None
    for pattern, doc_type in TITLE_PATTERNS:
        if normalize_text(pattern) in norm:
            return doc_type
    return None


def _contains_any(text: str, keywords: list[str]) -> bool:
    return any(keyword in text for keyword in keywords)


def infer_doc_type_from_clues(title_text: Any, issuer_text: Any, document_number_text: Any, key_clues: Any) -> Optional[str]:
    parts = [str(title_text or ""), str(issuer_text or ""), str(document_number_text or "")]
    if isinstance(key_clues, list):
        parts.extend([str(x) for x in key_clues])
    text = " ".join(parts)

    if _contains_any(text, ["세대주", "세대원", "동거인", "현 세대원"]):
        return "RESIDENT_REGISTRATION"
    if _contains_any(text, ["주소변동", "병역", "정정", "과거의 주소"]):
        return "RESIDENT_REGISTRATION_ABSTRACT"
    if _contains_any(text, ["가족관계증명서"]):
        return "FAMILY_RELATION_CERTIFICATE"

    if _contains_any(text, ["재직증명서"]):
        return "EMPLOYMENT_CERTIFICATE"
    if _contains_any(text, ["건강보험", "자격득실"]):
        return "HEALTH_INSURANCE_ELIGIBILITY"
    if _contains_any(text, ["근로소득", "원천징수영수증", "결정세액", "차감징수"]):
        return "WITHHOLDING_TAX_CERTIFICATE"
    if _contains_any(text, ["급여거래내역", "급여", "거래내역"]):
        return "SALARY_ACCOUNT_STATEMENT"

    if _contains_any(text, ["소득금액증명", "종합소득세", "과세기간"]):
        return "INCOME_AMOUNT_CERTIFICATE"
    if _contains_any(text, ["사업자등록증명"]):
        return "BUSINESS_REGISTRATION_CERTIFICATE"
    if _contains_any(text, ["부가가치세", "과세표준증명", "부가가치세과세표준증명"]):
        return "VAT_TAX_BASE_CERTIFICATE"

    if _contains_any(text, ["지방세", "세목별", "과세증명", "과세연도", "과세대상"]):
        return "LOCAL_TAX_ITEM_CERTIFICATE"
    if _contains_any(text, ["지방세", "납세증명서", "체납액", "징수유예", "체납처분비"]):
        return "LOCAL_TAX_CERTIFICATE"
    if _contains_any(text, ["납세증명서", "체납", "유효기간"]) and "지방세" not in text:
        return "NATIONAL_TAX_CERTIFICATE"

    if _contains_any(text, ["등기사항전부증명서", "갑구", "을구", "등기목적", "등기원인", "권리자"]):
        return "TITLE_DEED"
    if _contains_any(text, ["건축물대장", "구조", "용도", "면적", "대지위치", "연면적"]):
        return "BUILDING_REGISTER"
    if _contains_any(text, ["매매계약서", "매도인", "매수인", "계약금", "잔금"]):
        return "SALE_CONTRACT"
    return None


class QwenDocumentClassifier:
    def __init__(
        self,
        model_name: str = "Qwen/Qwen2.5-VL-3B-Instruct",
        min_pixels: int = 256 * 28 * 28,
        max_pixels: int = 640 * 28 * 28,
        use_flash_attn: bool = True,
        use_header_crop: bool = True,
        crop_ratio: float = 0.5,
    ):
        self.model_name = model_name
        self.use_header_crop = use_header_crop
        self.crop_ratio = crop_ratio

        self.processor = AutoProcessor.from_pretrained(
            model_name,
            min_pixels=min_pixels,
            max_pixels=max_pixels,
        )

        model_kwargs = {
            "torch_dtype": torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            "device_map": "auto",
        }
        if torch.cuda.is_available():
            model_kwargs["attn_implementation"] = "flash_attention_2" if use_flash_attn else "sdpa"

        self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            model_name,
            **model_kwargs,
        )
        self.model.eval()

    def _prepare_image(self, image_input: Union[str, Path, Image.Image], use_header_crop: Optional[bool]) -> Image.Image:
        header_crop = self.use_header_crop if use_header_crop is None else use_header_crop
        if header_crop:
            return make_header_crop_image(image_input, crop_ratio=self.crop_ratio)
        return load_image(image_input)

    def _build_inputs(self, image: Image.Image, prompt: str) -> dict[str, Any]:
        messages = [{
            "role": "user",
            "content": [
                {"type": "image", "image": image},
                {"type": "text", "text": prompt},
            ],
        }]
        text = self.processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )
        inputs = self.processor(
            text=[text],
            images=[image],
            padding=True,
            return_tensors="pt",
        )
        return {k: v.to(self.model.device) if hasattr(v, "to") else v for k, v in inputs.items()}

    def _run_prompt(self, image: Image.Image, prompt: str, max_new_tokens: int) -> tuple[dict[str, Any], str, float]:
        inputs = self._build_inputs(image, prompt)
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        start = time.time()
        with torch.inference_mode():
            generated_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
            )
        if torch.cuda.is_available():
            torch.cuda.synchronize()
        elapsed = round(time.time() - start, 4)
        generated_ids_trimmed = [
            out_ids[len(in_ids):]
            for in_ids, out_ids in zip(inputs["input_ids"], generated_ids)
        ]
        output_text = self.processor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )[0]
        parsed = try_parse_json(output_text) or {}
        return parsed, output_text, elapsed

    def extract_title_info(
        self,
        image_input: Union[str, Path, Image.Image],
        max_new_tokens: int = 96,
        use_header_crop: Optional[bool] = None,
    ) -> dict[str, Any]:
        image = self._prepare_image(image_input, use_header_crop=use_header_crop)
        parsed, output_text, elapsed = self._run_prompt(image, TITLE_EXTRACTION_PROMPT, max_new_tokens)
        key_clues = parsed.get("keyClues") if isinstance(parsed.get("keyClues"), list) else []
        return {
            "titleText": parsed.get("titleText"),
            "issuerText": parsed.get("issuerText"),
            "documentNumberText": parsed.get("documentNumberText"),
            "keyClues": key_clues,
            "confidence": max(0.0, min(1.0, _safe_float(parsed.get("confidence"), 0.0))),
            "elapsedSec": elapsed,
            "rawOutput": output_text,
            "classificationCropMode": "header" if (self.use_header_crop if use_header_crop is None else use_header_crop) else "full_page",
        }

    def fallback_classify(
        self,
        image_input: Union[str, Path, Image.Image],
        max_new_tokens: int = 64,
        use_header_crop: Optional[bool] = None,
    ) -> dict[str, Any]:
        image = self._prepare_image(image_input, use_header_crop=use_header_crop)
        parsed, output_text, elapsed = self._run_prompt(image, FALLBACK_CLASSIFICATION_PROMPT, max_new_tokens)
        doc_type = parsed.get("documentType")
        if doc_type not in VALID_TYPES:
            doc_type = "OTHER"
        key_clues = parsed.get("keyClues") if isinstance(parsed.get("keyClues"), list) else []
        return {
            "documentType": doc_type,
            "confidence": max(0.0, min(1.0, _safe_float(parsed.get("confidence"), 0.0))),
            "keyClues": key_clues,
            "elapsedSec": elapsed,
            "rawOutput": output_text,
            "classificationCropMode": "header" if (self.use_header_crop if use_header_crop is None else use_header_crop) else "full_page",
        }

    def classify_image(
        self,
        image_input: Union[str, Path, Image.Image],
        max_new_tokens: int = 96,
        use_header_crop: Optional[bool] = None,
        fallback_to_multiclass: bool = True,
    ) -> dict[str, Any]:
        title_result = self.extract_title_info(
            image_input=image_input,
            max_new_tokens=max_new_tokens,
            use_header_crop=use_header_crop,
        )

        title_text = title_result.get("titleText")
        issuer_text = title_result.get("issuerText")
        document_number_text = title_result.get("documentNumberText")
        key_clues = title_result.get("keyClues") or []

        matched_type = match_title_to_doc_type(title_text)
        matched_by = None
        if matched_type:
            matched_by = "title"
        else:
            matched_type = infer_doc_type_from_clues(title_text, issuer_text, document_number_text, key_clues)
            if matched_type:
                matched_by = "clue"

        fallback_result = None
        if not matched_type and fallback_to_multiclass:
            fallback_result = self.fallback_classify(
                image_input=image_input,
                max_new_tokens=64,
                use_header_crop=use_header_crop,
            )
            matched_type = fallback_result.get("documentType") or "OTHER"
            matched_by = "fallback"

        final_type = matched_type if matched_type in VALID_TYPES else "OTHER"
        final_conf = _safe_float(title_result.get("confidence"), 0.0)
        if matched_by == "clue":
            final_conf = max(final_conf, 0.78)
        elif matched_by == "title":
            final_conf = max(final_conf, 0.92)
        elif matched_by == "fallback" and fallback_result:
            final_conf = _safe_float(fallback_result.get("confidence"), 0.0)

        result = {
            "documentGroup": DOC_TYPE_TO_GROUP.get(final_type, "OTHER"),
            "documentType": final_type,
            "documentTypeLabel": DOC_TYPE_TO_LABEL.get(final_type, "기타"),
            "classificationConfidence": round(max(0.0, min(1.0, final_conf)), 4),
            "classificationModel": self.model_name,
            "classificationCropMode": title_result.get("classificationCropMode"),
            "classificationStrategy": matched_by or "unknown",
            "titleText": title_text,
            "issuerText": issuer_text,
            "documentNumberText": document_number_text,
            "keyClues": key_clues,
            "elapsedSec": title_result.get("elapsedSec"),
            "rawOutput": title_result.get("rawOutput"),
        }
        if fallback_result:
            result["fallbackClassification"] = fallback_result
        return result
