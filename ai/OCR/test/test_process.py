# test_process.py
from __future__ import annotations

import argparse
import json
import time
from pathlib import Path
from typing import Any

from PIL import Image

# services
from services.pdf_service import pdf_to_images
from services.classifier_service import classify_document
from services.extractor_service import ExtractorService
from services.output_builder import OutputBuilder

# registry
from registry.doc_registry import get_doc_config

# client
from qwen_client import QwenVLClient


# =========================================================
# 경로 설정
# =========================================================
APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
TMP_DIR = APP_DIR / "_tmp"
RENDER_DIR = TMP_DIR / "rendered_pages"
OUTPUT_DIR = TMP_DIR / "outputs"


# =========================================================
# PDF -> document_input 생성
# =========================================================
def build_document_input(pdf_path: Path, render_dir: Path) -> dict[str, Any]:
    page_images = pdf_to_images(
        pdf_path=str(pdf_path),
        output_dir=str(render_dir),
        dpi=180,
        image_format="png",
    )

    pages = []
    for idx, image_path in enumerate(page_images, start=1):
        pages.append(
            {
                "pageNum": idx,
                "imagePath": image_path,
            }
        )

    return {
        "fileId": pdf_path.stem,
        "storageType": "LOCAL",
        "bucket": None,
        "fileKey": str(pdf_path),
        "fileName": pdf_path.name,
        "fileUrl": None,
        "mimeType": "application/pdf",
        "pages": pages,
    }


# =========================================================
# 추출 수행
# =========================================================
def run_extraction(document, extractor_service: ExtractorService):
    doc_cls = document.get("documentClassification", {}) or {}
    doc_type = doc_cls.get("documentType")

    if not doc_type:
        raise ValueError("documentType 없음 (분류 실패)")

    config = get_doc_config(doc_type)
    pages = document.get("pages", [])

    page_results = []

    for page in pages:
        page_num = page.get("pageNum")
        image_path = page.get("imagePath")

        image = Image.open(image_path).convert("RGB")

        print(f"[EXTRACT] page={page_num}")

        start = time.time()
        result = extractor_service.extract_document(
            doc_type=doc_type,
            image=image,
            image_path=image_path,
            page_num=page_num,
        )
        print(f"  -> {round(time.time() - start, 2)}s")

        page_results.append(result)

    merged = extractor_service.merge_page_results(
        doc_type=doc_type,
        page_results=page_results,
    )

    return page_results, merged


# =========================================================
# main
# =========================================================
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--pdf",
        type=str,
        required=False,
        help="테스트할 PDF 경로 (기본: data 폴더 첫 번째 파일)",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="Qwen/Qwen2.5-VL-7B-Instruct",
    )
    args = parser.parse_args()

    # PDF 선택
    if args.pdf:
        pdf_path = Path(args.pdf)
    else:
        pdfs = list(DATA_DIR.glob("*.pdf"))
        if not pdfs:
            raise FileNotFoundError("data 폴더에 PDF 없음")
        pdf_path = pdfs[0]

    if not pdf_path.is_absolute():
        pdf_path = (APP_DIR / pdf_path).resolve()

    print("=" * 60)
    print(f"PDF: {pdf_path}")
    print("=" * 60)

    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    total_start = time.time()

    # 1. PDF -> 이미지
    document = build_document_input(pdf_path, RENDER_DIR)
    print(f"[PDF] pages={len(document['pages'])}")

    # 2. 분류
    start = time.time()
    document = classify_document(document)
    print("[CLASSIFY RESULT]")
    print(json.dumps(document["documentClassification"], indent=2, ensure_ascii=False))
    print(f"[CLASSIFY TIME] {round(time.time() - start, 2)}s")

    # 3. extractor init
    qwen_client = QwenVLClient(
        model_name=args.model,
        default_max_new_tokens=1200,
    )
    extractor_service = ExtractorService(qwen_client)

    # 4. 추출
    start = time.time()
    page_results, merged = run_extraction(document, extractor_service)
    print(f"[EXTRACT TIME] {round(time.time() - start, 2)}s")

    print("[MERGED RESULT]")
    print(json.dumps(merged, indent=2, ensure_ascii=False))

    # 5. output 생성
    builder = OutputBuilder()

    final_doc = builder.build_document_output(
        file_id=document.get("fileId"),
        bucket=document.get("bucket"),
        file_key=document.get("fileKey"),
        file_name=document.get("fileName"),
        file_url=document.get("fileUrl"),
        mime_type=document.get("mimeType"),
        doc_type=document["documentClassification"]["documentType"],
        classification_confidence=document["documentClassification"].get(
            "classificationConfidence"
        ),
        extracted_content=merged,
        raw_text=None,
        page_nums=[p["pageNum"] for p in document["pages"]],
        status="SUCCESS",
        storage_type=document.get("storageType"),
    )

    final_output = builder.build_final_output([final_doc])

    output_path = OUTPUT_DIR / f"{pdf_path.stem}_output.json"
    builder.dump_json(final_output, str(output_path))

    print("=" * 60)
    print(f"[DONE] {output_path}")
    print(f"[TOTAL] {round(time.time() - total_start, 2)}s")
    print("=" * 60)


if __name__ == "__main__":
    main()