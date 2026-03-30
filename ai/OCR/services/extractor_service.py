# services/extractor_service.py
# 정보 추출

from __future__ import annotations

import json
import re
from copy import deepcopy
from typing import Any, Dict, List, Optional

from PIL import Image

from registry.doc_registry import build_empty_content, build_extraction_plan, get_doc_config
from services.crop_service import CropService


COMMON_SINGLE_SUFFIX = (
    "\n\n[출력 규칙]\n"
    "1. 반드시 최종 값만 출력하라.\n"
    "2. 설명문, 조사, 문장, 라벨, 접두어를 붙이지 마라.\n"
    "3. 따옴표 없이 값만 출력하라.\n"
    "4. 예시: 김민수 or 900101-1234567 or 2025-06-16 or 8192-2003-6927-1836\n"
    "5. 절대 '이름은 김민수입니다', '발행번호: 1234' 같은 형태로 출력하지 마라.\n"
    "6. 필드별로 하나의 정보 값만 받도록 출력하라.\n"
    "7. 값이 없으면 null만 출력하라."
)

COMMON_JSON_SUFFIX = (
    "\n\n[출력 규칙]\n"
    "1. 반드시 JSON만 출력하라.\n"
    "2. 마크다운 코드블록(```json), 설명문, 추가 문장을 절대 출력하지 마라.\n"
    "3. JSON 바깥 텍스트를 출력하지 마라.\n"
    "4. 값이 없으면 null로 반환하라."
)


class ExtractorService:
    """
    4단계 담당
    - doc_registry의 extraction plan을 읽음
    - crop_service로 대상 이미지 준비
    - qwen_client를 호출하여 field/object/list 추출
    - schema 형태에 맞춰 content dict 구성
    """

    def __init__(self, qwen_client: Any, crop_service: Optional[CropService] = None):
        self.qwen_client = qwen_client
        self.crop_service = crop_service or CropService()

    def extract_document(
        self,
        *,
        doc_type: str,
        image: Optional[Image.Image] = None,
        image_path: Optional[str] = None,
        page_num: int = 1,
        raw_text: Optional[str] = None,
    ) -> Dict[str, Any]:
        result_content = build_empty_content(doc_type)
        plan = build_extraction_plan(doc_type)

        cached_title_deed_sections = None
        if doc_type == "TITLE_DEED":
            if not image_path:
                raise ValueError("TITLE_DEED 추출 시 image_path가 필요합니다.")
            split_result = self.crop_service.split_title_deed(image_path)
            cached_title_deed_sections = split_result["named_sections"]

        for field_plan in plan:
            field_name = field_plan["fieldName"]
            source = field_plan["source"]
            extractor = field_plan["extractor"]
            output_type = field_plan["outputType"]

            target = self.crop_service.resolve_source(
                doc_type=doc_type,
                source=source,
                image=image,
                image_path=image_path,
                page_num=page_num,
                cached_title_deed_sections=cached_title_deed_sections,
            )

            target_image = target.get("image")
            bbox = target.get("bbox")

            if target_image is None:
                parsed = self._empty_output(output_type, page_num=page_num, bbox=bbox)
                self._assign_field(result_content, field_name, parsed)
                continue

            raw_response = self._call_llm(target_image, extractor)
            parsed = self._parse_response(
                raw_response=raw_response,
                extractor=extractor,
                output_type=output_type,
                page_num=page_num,
                bbox=bbox,
            )
            self._assign_field(result_content, field_name, parsed)

        return result_content

    
    def _build_final_prompt(self, extractor: Dict[str, Any]) -> str:
        base_prompt = extractor["prompt"]
        extractor_type = extractor.get("type")
        parser = extractor.get("parser", "text")
    
        if extractor_type in {"object", "list"} or parser == "json":
            return base_prompt + COMMON_JSON_SUFFIX
    
        return base_prompt + COMMON_SINGLE_SUFFIX

        
    def _call_llm(self, image: Image.Image, extractor: Dict[str, Any]) -> Any:
        prompt = self._build_final_prompt(extractor)
        extractor_type = extractor.get("type")
        parser = extractor.get("parser", "text")
    
        if extractor_type in {"object", "list"} or parser == "json":
            if hasattr(self.qwen_client, "extract_json"):
                return self.qwen_client.extract_json(image=image, prompt=prompt)
            raise AttributeError("qwen_client must implement extract_json() for object/list extraction")
    
        if hasattr(self.qwen_client, "extract_text"):
            return self.qwen_client.extract_text(image=image, prompt=prompt)
    
        if hasattr(self.qwen_client, "infer"):
            return self.qwen_client.infer(image=image, prompt=prompt)
    
        raise AttributeError("qwen_client must implement extract_text(), extract_json(), or infer()")

    def _parse_response(
        self,
        *,
        raw_response: Any,
        extractor: Dict[str, Any],
        output_type: str,
        page_num: int,
        bbox: Any,
    ) -> Any:
        extractor_type = extractor["type"]
        parser = extractor.get("parser", "text")
        postprocess = extractor.get("postprocess", [])

        if extractor_type == "single":
            value = self._extract_single_value(raw_response, parser)
            value = self._apply_postprocess(value, postprocess)
            return self._wrap_field(
                value=value,
                confidence=self._extract_confidence(raw_response),
                page_num=page_num,
                bbox=bbox,
                raw_text=self._extract_raw_text(raw_response),
            )

        if extractor_type == "object":
            obj = self._extract_json_payload(raw_response)
            field_defs = extractor.get("fields", {})
            output: Dict[str, Any] = {}
            for key in field_defs.keys():
                value = obj.get(key) if isinstance(obj, dict) else None
                value = self._apply_postprocess(value, postprocess)
                output[key] = self._wrap_field(
                    value=value,
                    confidence=self._extract_confidence(raw_response),
                    page_num=page_num,
                    bbox=bbox,
                    raw_text=self._extract_raw_text(raw_response),
                )
            return output

        if extractor_type == "list":
            payload = self._extract_json_payload(raw_response)
            item_schema = extractor.get("itemSchema", {})
            rows: List[Dict[str, Any]] = []

            if not isinstance(payload, list):
                payload = []

            for item in payload:
                if not isinstance(item, dict):
                    continue

                row: Dict[str, Any] = {}
                for key in item_schema.keys():
                    value = item.get(key)
                    value = self._apply_postprocess(value, postprocess)
                    row[key] = self._wrap_field(
                        value=value,
                        confidence=self._extract_confidence(raw_response),
                        page_num=page_num,
                        bbox=bbox,
                        raw_text=self._extract_raw_text(raw_response),
                    )

                if any(self._row_has_value(v) for v in row.values()):
                    rows.append(row)

            return self._dedup_rows(rows, extractor.get("dedupKeys", []))

        raise ValueError(f"unsupported extractor.type: {extractor_type}")

    def _extract_single_value(self, raw_response: Any, parser: str) -> Any:
        if isinstance(raw_response, dict):
            if "value" in raw_response and not isinstance(raw_response["value"], (dict, list)):
                base = raw_response["value"]
            elif "text" in raw_response:
                base = raw_response["text"]
            elif "raw_text" in raw_response:
                base = raw_response["raw_text"]
            elif "json" in raw_response and not isinstance(raw_response["json"], (dict, list)):
                base = raw_response["json"]
            else:
                base = None
        else:
            base = raw_response

        if base is None:
            return None

        if isinstance(base, str):
            base = base.strip()
            if base.lower() in {"null", "none", "unknown", ""}:
                return None

        if parser == "bool":
            return self._parse_bool(base)
        if parser == "amount":
            return self._parse_amount(base)
        if parser == "int":
            return self._parse_int(base)
        if parser in {"text", "name", "address", "date", "rrn", "biz_no", "year", "enum", "text_block"}:
            return None if base is None else str(base).strip()
        return base

    def _extract_json_payload(self, raw_response: Any) -> Any:
        if isinstance(raw_response, dict):
            if raw_response.get("json") is not None:
                return raw_response["json"]

            if isinstance(raw_response.get("value"), (dict, list)):
                return raw_response["value"]

            if isinstance(raw_response.get("text"), str):
                maybe = self._parse_json_string(raw_response["text"])
                if maybe is not None:
                    return maybe

            if isinstance(raw_response.get("raw_text"), str):
                maybe = self._parse_json_string(raw_response["raw_text"])
                if maybe is not None:
                    return maybe

            return {}

        if isinstance(raw_response, str):
            maybe = self._parse_json_string(raw_response)
            return maybe if maybe is not None else {}

        return {}

    @staticmethod
    def _parse_json_string(text: str) -> Optional[Any]:
        text = text.strip()
        if not text:
            return None

        try:
            return json.loads(text)
        except Exception:
            pass

        fenced = re.sub(r"^```(?:json)?\s*", "", text)
        fenced = re.sub(r"\s*```$", "", fenced).strip()

        try:
            return json.loads(fenced)
        except Exception:
            pass

        match = re.search(r"(\{.*\}|\[.*\])", fenced, re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group(1))
        except Exception:
            return None

    @staticmethod
    def _parse_bool(value: Any) -> Optional[bool]:
        if isinstance(value, bool):
            return value
        if value is None:
            return None

        s = str(value).strip().lower()
        if s in {"true", "yes", "y", "1", "있음", "존재", "해당", "o"}:
            return True
        if s in {"false", "no", "n", "0", "없음", "미존재", "x"}:
            return False
        return None

    @staticmethod
    def _parse_amount(value: Any) -> Any:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return value

        s = str(value).strip()
        s = s.replace(",", "").replace("원", "").replace(" ", "")
        if not s:
            return None

        try:
            if "." in s:
                return float(s)
            return int(s)
        except ValueError:
            return str(value).strip()

    @staticmethod
    def _parse_int(value: Any) -> Optional[int]:
        if value is None:
            return None
        if isinstance(value, int):
            return value

        m = re.search(r"\d+", str(value))
        return int(m.group()) if m else None

    def _apply_postprocess(self, value: Any, steps: List[str]) -> Any:
        if value is None:
            return None

        result = value
        for step in steps:
            if step == "trim" and isinstance(result, str):
                result = result.strip()
            elif step == "numeric_string" and isinstance(result, str):
                result = result.replace(",", "").replace("원", "").replace(" ", "").strip()
            elif step == "dedup":
                continue
        return result

    @staticmethod
    def _wrap_field(value: Any, confidence: Optional[float], page_num: int, bbox: Any, raw_text: Any) -> Dict[str, Any]:
        return {
            "value": value,
            "confidence": confidence,
            "evidence": {
                "pageNum": page_num,
                "bbox": bbox,
                "rawText": raw_text,
                "confidence": confidence,
            },
        }

    @staticmethod
    def _extract_confidence(raw_response: Any) -> Optional[float]:
        if isinstance(raw_response, dict):
            return raw_response.get("confidence")
        return None

    @staticmethod
    def _extract_raw_text(raw_response: Any) -> Any:
        if isinstance(raw_response, dict):
            return raw_response.get("raw_text") or raw_response.get("text")
        if isinstance(raw_response, str):
            return raw_response
        return None

    @staticmethod
    def _row_has_value(field_obj: Dict[str, Any]) -> bool:
        return field_obj.get("value") not in (None, "", [], {})

    @staticmethod
    def _dig(obj: Dict[str, Any], path: str) -> Any:
        cur: Any = obj
        for part in path.split("."):
            if isinstance(cur, dict):
                cur = cur.get(part)
            else:
                return None
        return cur

    def _dedup_rows(self, rows: List[Dict[str, Any]], dedup_keys: List[str]) -> List[Dict[str, Any]]:
        if not dedup_keys:
            return rows

        seen = set()
        deduped = []
        for row in rows:
            key = tuple(self._dig(row, k) for k in dedup_keys)
            if key in seen:
                continue
            seen.add(key)
            deduped.append(row)
        return deduped

    @staticmethod
    def _assign_field(result_content: Dict[str, Any], field_name: str, parsed: Any) -> None:
        result_content[field_name] = parsed

    @staticmethod
    def _empty_output(output_type: str, page_num: int, bbox: Any) -> Any:
        if output_type == "field":
            return {
                "value": None,
                "confidence": None,
                "evidence": {
                    "pageNum": page_num,
                    "bbox": bbox,
                    "rawText": None,
                    "confidence": None,
                },
            }
        if output_type == "object":
            return {}
        if output_type == "list":
            return []
        return None

    def merge_page_results(self, doc_type: str, page_results: List[Dict[str, Any]]) -> Dict[str, Any]:
        config = get_doc_config(doc_type)
        strategy = config.get("mergeStrategy")
        merge_spec = config.get("mergeSpec", {})

        if not page_results:
            return build_empty_content(doc_type)
        if len(page_results) == 1:
            return deepcopy(page_results[0])

        merged = build_empty_content(doc_type)

        for field_name, spec in merge_spec.items():
            spec_type = spec.get("type")
            if spec_type in {"field", "bool_field"}:
                merged[field_name] = self._merge_scalar_field([p.get(field_name) for p in page_results])
            elif spec_type == "object":
                merged[field_name] = {}
                for sub_name in spec.get("fields", {}).keys():
                    merged[field_name][sub_name] = self._merge_scalar_field([
                        (p.get(field_name) or {}).get(sub_name) for p in page_results
                    ])
            elif spec_type == "list":
                all_rows: List[Dict[str, Any]] = []
                for p in page_results:
                    rows = p.get(field_name) or []
                    if isinstance(rows, list):
                        all_rows.extend(rows)
                merged[field_name] = self._dedup_rows(all_rows, spec.get("dedupKeys", []))
            else:
                merged[field_name] = page_results[0].get(field_name)

        return merged

    @staticmethod
    def _merge_scalar_field(candidates: List[Any]) -> Any:
        valid = [c for c in candidates if isinstance(c, dict) and c.get("value") not in (None, "")]
        if not valid:
            for c in candidates:
                if isinstance(c, dict):
                    return c
            return {
                "value": None,
                "confidence": None,
                "evidence": {
                    "pageNum": None,
                    "bbox": None,
                    "rawText": None,
                    "confidence": None,
                },
            }

        valid.sort(
            key=lambda x: (x.get("confidence") is not None, x.get("confidence") or -1),
            reverse=True,
        )
        return valid[0]