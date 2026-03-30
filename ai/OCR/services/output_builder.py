# services/output_builder.py
# 최종 output.json 만들기

from __future__ import annotations

import json
from copy import deepcopy
from typing import Any, Dict, List, Optional

from registry.doc_registry import get_doc_config, get_doc_label

def normalize_bbox_ratio(bbox_ratio):
    """
    bbox ratio를 float + 소수점 정리
    [x1, y1, x2, y2] 형태 유지
    """
    if not bbox_ratio or len(bbox_ratio) != 4:
        return None

    return [round(float(v), 6) for v in bbox_ratio]


class OutputBuilder:
    """
    5단계 담당
    - 문서별 추출 결과를 output.json 형식으로 조립
    - output_example.json 구조를 기준으로 문서 단위 payload 생성 및 전체 documents 배열 생성
    """

    def build_document_output(
        self,
        *,
        consultation_id: str,
        file_id: str,
        storage_type: str,
        bucket: Optional[str],
        file_key: Optional[str],
        file_name: Optional[str],
        file_url: Optional[str],
        mime_type: Optional[str],
        process_started_at: str,
        process_finished_at: str,
        doc_type: Optional[str],
        doc_label: Optional[str],
        classification: Optional[dict],
        extracted_content: Optional[dict],
        raw_text: Optional[str],
        page_nums: Optional[List[int]],
        status: str,
        error: Optional[dict] = None,
    ) -> Dict[str, Any]:
        return {
            "consultationId": consultation_id,
            "fileId": file_id,
            "storageType": storage_type,
            "bucket": bucket,
            "fileKey": file_key,
            "fileName": file_name,
            "fileUrl": file_url,
            "mimeType": mime_type,
            "processStartedAt": process_started_at,
            "processFinishedAt": process_finished_at,
            "documentClassification": classification,
            "documentType": doc_type,
            "documentTypeLabel": doc_label,
            "pageNums": page_nums or [],
            "content": extracted_content,
            "rawText": raw_text,
            "status": status,
            "error": error,
        }

    def build_consultation_output(
        self,
        *,
        consultation_id: str,
        process_started_at: str,
        process_finished_at: str,
        documents: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return {
            "consultationId": consultation_id,
            "processStartedAt": process_started_at,
            "processFinishedAt": process_finished_at,
            "documents": documents,
        }

    def dump_json(self, data: Dict[str, Any], output_path: str) -> None:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)