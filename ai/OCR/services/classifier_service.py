# services/classifier_service.py
# 문서 분류

from __future__ import annotations

from collections import defaultdict
from typing import Any

from services.qwen_doc_classifier import QwenDocumentClassifier, DOC_TYPE_TO_GROUP

classifier = QwenDocumentClassifier(
    model_name="Qwen/Qwen2.5-VL-3B-Instruct",
    use_header_crop=True,
    crop_ratio=0.5,
)

TITLE_MATCH_ACCEPT_THRESHOLD = 0.88
CLUE_MATCH_ACCEPT_THRESHOLD = 0.76
DOCUMENT_REVIEW_THRESHOLD = 0.72
FIRST_PAGE_WEIGHT = 1.25
MIN_SCORE_GAP = 0.12

_CLASSIFICATION_KEYS = (
    "documentGroup",
    "documentType",
    "documentTypeLabel",
    "classificationConfidence",
    "classificationModel",
    "classificationCropMode",
    "classificationStrategy",
    "titleText",
    "issuerText",
    "documentNumberText",
    "keyClues",
    "elapsedSec",
    "rawOutput",
    "fallbackClassification",
)


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return default


def _normalize_classification(classification: dict[str, Any]) -> dict[str, Any]:
    classification = classification or {}
    normalized = {key: classification.get(key) for key in _CLASSIFICATION_KEYS}
    normalized["classificationConfidence"] = _safe_float(
        normalized.get("classificationConfidence"), 0.0
    )
    return normalized


def _extract_document_pages(document: dict[str, Any]) -> list[dict[str, Any]]:
    pages = document.get("pages")
    if isinstance(pages, list) and pages:
        normalized_pages = []
        for idx, page in enumerate(pages, start=1):
            if not isinstance(page, dict):
                continue
            image_path = page.get("imagePath") or page.get("path") or page.get("image_file")
            normalized_pages.append(
                {
                    "pageNum": page.get("pageNum", idx),
                    "imagePath": image_path,
                }
            )
        return normalized_pages

    page_images = document.get("pageImages", [])
    normalized_pages = []
    for idx, item in enumerate(page_images, start=1):
        if isinstance(item, dict):
            image_path = item.get("imagePath") or item.get("path") or item.get("image_file")
        else:
            image_path = str(item)
        normalized_pages.append(
            {
                "pageNum": idx,
                "imagePath": image_path,
            }
        )
    return normalized_pages


def _is_high_confidence_title_match(result: dict[str, Any]) -> bool:
    strategy = result.get("classificationStrategy")
    conf = _safe_float(result.get("classificationConfidence"))
    if strategy == "title" and conf >= TITLE_MATCH_ACCEPT_THRESHOLD:
        return True
    if strategy == "clue" and conf >= CLUE_MATCH_ACCEPT_THRESHOLD:
        return True
    return False


def _classify_with_header(image_path: str) -> dict[str, Any]:
    result = classifier.classify_image(
        image_path,
        use_header_crop=True,
        fallback_to_multiclass=False,
    ) or {}
    normalized = _normalize_classification(result)
    normalized["classificationMethod"] = "header_title"
    return normalized


def _classify_with_fullpage(image_path: str) -> dict[str, Any]:
    result = classifier.classify_image(
        image_path,
        use_header_crop=False,
        fallback_to_multiclass=True,
    ) or {}
    normalized = _normalize_classification(result)
    normalized["classificationMethod"] = "full_page_title_or_fallback"
    return normalized


def classify_page(image_path: str, page_num: int) -> dict[str, Any]:
    print(f"[CLASSIFY_PAGE_START] page={page_num} image={image_path}")

    header_result = _classify_with_header(image_path)
    final_result = header_result
    fallback_used = False

    if not _is_high_confidence_title_match(header_result):
        fullpage_result = _classify_with_fullpage(image_path)
        final_result = fullpage_result
        fallback_used = True
        print(
            "[CLASSIFY_PAGE_COMPARE]",
            {
                "pageNum": page_num,
                "headerResult": header_result,
                "fullPageResult": fullpage_result,
                "selected": final_result,
            },
        )

    if final_result.get("documentType") == "OTHER":
        final_result["documentType"] = "BUILDING_REGISTER"
        final_result["documentTypeLabel"] = "건축물대장"
        final_result["documentGroup"] = "PROPERTY_HOUSING"
        final_result["classificationStrategy"] = "forced_building_register_from_other"

    final_result["pageNum"] = page_num
    final_result["fallbackUsed"] = fallback_used
    final_result["documentGroup"] = DOC_TYPE_TO_GROUP.get(final_result.get("documentType"), "OTHER")

    print(f"[CLASSIFY_PAGE_DONE] page={page_num} result={final_result}")
    return final_result


def classify_document_pages(document: dict[str, Any]) -> list[dict[str, Any]]:
    pages = _extract_document_pages(document)
    page_classifications: list[dict[str, Any]] = []

    for page in pages:
        image_path = page.get("imagePath")
        page_num = page.get("pageNum")
        if not image_path:
            print(f"[CLASSIFY_PAGE_SKIP] file={document.get('fileId')} missing imagePath: {page}")
            continue
        page_classifications.append(classify_page(image_path, page_num))

    return page_classifications


def resolve_document_classification(page_classifications: list[dict[str, Any]]) -> dict[str, Any]:
    if not page_classifications:
        return {
            "documentGroup": None,
            "documentType": None,
            "documentTypeLabel": None,
            "classificationConfidence": 0.0,
            "classificationStatus": "EMPTY",
            "classificationMethod": None,
            "reviewRequired": True,
        }

    scores_by_type: dict[str, float] = defaultdict(float)
    best_by_type: dict[str, dict[str, Any]] = {}
    method_counter: dict[str, int] = defaultdict(int)

    for page_cls in page_classifications:
        doc_type = page_cls.get("documentType")
        if not doc_type:
            continue

        confidence = _safe_float(page_cls.get("classificationConfidence"))
        page_num = int(page_cls.get("pageNum") or 0)
        weight = FIRST_PAGE_WEIGHT if page_num == 1 else 1.0
        scores_by_type[doc_type] += confidence * weight

        prev_best = best_by_type.get(doc_type)
        if prev_best is None or confidence > _safe_float(prev_best.get("classificationConfidence")):
            best_by_type[doc_type] = page_cls

        method = page_cls.get("classificationMethod")
        if method:
            method_counter[method] += 1

    if not scores_by_type:
        first = page_classifications[0]
        first_conf = _safe_float(first.get("classificationConfidence"))
        first_type = first.get("documentType")
        return {
            "documentGroup": DOC_TYPE_TO_GROUP.get(first_type, "OTHER"),
            "documentType": first_type,
            "documentTypeLabel": first.get("documentTypeLabel"),
            "classificationConfidence": first_conf,
            "classificationStatus": "LOW_CONFIDENCE" if first_conf < DOCUMENT_REVIEW_THRESHOLD else "OK",
            "classificationMethod": first.get("classificationMethod"),
            "classificationStrategy": first.get("classificationStrategy"),
            "reviewRequired": first_conf < DOCUMENT_REVIEW_THRESHOLD,
            "titleText": first.get("titleText"),
            "keyClues": first.get("keyClues") or [],
        }

    sorted_doc_types = sorted(
        scores_by_type.items(),
        key=lambda item: (
            item[1],
            _safe_float(best_by_type[item[0]].get("classificationConfidence")),
        ),
        reverse=True,
    )

    best_doc_type, best_score = sorted_doc_types[0]
    representative = best_by_type[best_doc_type]

    total_weight = 0.0
    for page_cls in page_classifications:
        page_num = int(page_cls.get("pageNum") or 0)
        total_weight += FIRST_PAGE_WEIGHT if page_num == 1 else 1.0
    total_weight = max(total_weight, 1.0)

    aggregated_confidence = round(best_score / total_weight, 4)
    second_score = sorted_doc_types[1][1] if len(sorted_doc_types) > 1 else 0.0
    score_gap = round(best_score - second_score, 4)
    review_required = aggregated_confidence < DOCUMENT_REVIEW_THRESHOLD or score_gap < MIN_SCORE_GAP

    dominant_method = None
    if method_counter:
        dominant_method = max(method_counter.items(), key=lambda x: x[1])[0]

    return {
        "documentGroup": DOC_TYPE_TO_GROUP.get(best_doc_type, "OTHER"),
        "documentType": best_doc_type,
        "documentTypeLabel": representative.get("documentTypeLabel"),
        "classificationConfidence": aggregated_confidence,
        "classificationStatus": "REVIEW_REQUIRED" if review_required else "OK",
        "classificationMethod": dominant_method,
        "classificationStrategy": representative.get("classificationStrategy"),
        "reviewRequired": review_required,
        "scoreGap": score_gap,
        "titleText": representative.get("titleText"),
        "issuerText": representative.get("issuerText"),
        "documentNumberText": representative.get("documentNumberText"),
        "keyClues": representative.get("keyClues") or [],
        "fallbackClassification": representative.get("fallbackClassification"),
    }


def classify_document(document: dict[str, Any]) -> dict[str, Any]:
    page_classifications = classify_document_pages(document)
    document["pageClassifications"] = page_classifications
    document["documentClassification"] = resolve_document_classification(page_classifications)

    print(
        "[CLASSIFY]",
        {
            "fileId": document.get("fileId"),
            "fileName": document.get("fileName"),
            "documentClassification": document.get("documentClassification"),
        },
    )
    return document


def classify_documents(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [classify_document(document) for document in documents]
