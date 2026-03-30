# pipeline.py

from __future__ import annotations

import time
from pathlib import Path
from typing import Any, Dict, List, Optional

from PIL import Image

from services.pdf_service import pdf_to_images
from services.classifier_service import classify_document
from services.extractor_service import ExtractorService
from services.output_builder import OutputBuilder
from qwen_client import QwenVLClient


class OCRPipeline:

    def __init__(
        self,
        *,
        extractor_model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
        max_new_tokens: int = 1200,
        render_dpi: int = 180,
        debug: bool = False,
        qwen_client: Optional[QwenVLClient] = None,
        extractor_service: Optional[ExtractorService] = None,
        output_builder: Optional[OutputBuilder] = None,
    ):
        self.render_dpi = render_dpi
        self.debug = debug

        self.qwen_client = qwen_client or QwenVLClient(
            model_name=extractor_model_name,
            default_max_new_tokens=max_new_tokens,
        )
        self.extractor_service = extractor_service or ExtractorService(self.qwen_client)
        self.output_builder = output_builder or OutputBuilder()

    def process_pdf(
        self,
        *,
        pdf_path: str | Path,
        render_dir: str | Path,
        output_dir: str | Path,
    ) -> Dict[str, Any]:
        total_start = time.time()

        pdf_path = Path(pdf_path).resolve()
        render_dir = Path(render_dir).resolve()
        output_dir = Path(output_dir).resolve()

        render_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF 파일이 존재하지 않습니다: {pdf_path}")

        # 1. PDF -> page images
        render_start = time.time()
        document = self._build_document_input(pdf_path=pdf_path, render_dir=render_dir)
        render_elapsed = round(time.time() - render_start, 3)

        # 2. classify
        classify_start = time.time()
        document = classify_document(document)
        classify_elapsed = round(time.time() - classify_start, 3)

        doc_cls = document.get("documentClassification", {}) or {}
        doc_type = doc_cls.get("documentType")
        if not doc_type:
            raise ValueError("문서 분류 실패: documentType이 없습니다.")

        # 3. extract page by page
        extract_start = time.time()
        page_results = self._extract_pages(document)
        merged_content = self.extractor_service.merge_page_results(
            doc_type=doc_type,
            page_results=page_results,
        )
        extract_elapsed = round(time.time() - extract_start, 3)

        # 4. build final output
        build_start = time.time()
        final_doc = self.output_builder.build_document_output(
            file_id=document.get("fileId"),
            bucket=document.get("bucket"),
            file_key=document.get("fileKey"),
            file_name=document.get("fileName"),
            file_url=document.get("fileUrl"),
            mime_type=document.get("mimeType"),
            doc_type=doc_type,
            classification_confidence=doc_cls.get("classificationConfidence"),
            extracted_content=merged_content,
            raw_text=None,
            page_nums=[p["pageNum"] for p in document.get("pages", [])],
            status="SUCCESS",
            storage_type=document.get("storageType", "LOCAL"),
        )
        final_output = self.output_builder.build_final_output([final_doc])

        output_path = output_dir / f"{pdf_path.stem}_output.json"
        self.output_builder.dump_json(final_output, str(output_path))
        build_elapsed = round(time.time() - build_start, 3)

        total_elapsed = round(time.time() - total_start, 3)

        result = {
            "pdfPath": str(pdf_path),
            "renderedPages": len(document.get("pages", [])),
            "documentClassification": doc_cls,
            "pageResults": page_results,
            "mergedContent": merged_content,
            "outputPath": str(output_path),
            "timing": {
                "renderSec": render_elapsed,
                "classifySec": classify_elapsed,
                "extractSec": extract_elapsed,
                "buildSec": build_elapsed,
                "totalSec": total_elapsed,
            },
        }

        if self.debug:
            self._print_debug_summary(result)

        return result

    def _build_document_input(
        self,
        *,
        pdf_path: Path,
        render_dir: Path,
    ) -> Dict[str, Any]:
        page_images = pdf_to_images(
            pdf_path=str(pdf_path),
            output_dir=str(render_dir),
            dpi=self.render_dpi,
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

    def _extract_pages(self, document: Dict[str, Any]) -> List[Dict[str, Any]]:
        doc_cls = document.get("documentClassification", {}) or {}
        doc_type = doc_cls.get("documentType")
        pages = document.get("pages", [])

        results: List[Dict[str, Any]] = []

        for page in pages:
            page_num = page.get("pageNum")
            image_path = page.get("imagePath")

            if not image_path:
                continue

            image = Image.open(image_path).convert("RGB")

            if self.debug:
                print(f"[EXTRACT_START] page={page_num} doc_type={doc_type} image={image_path}")

            start = time.time()
            page_result = self.extractor_service.extract_document(
                doc_type=doc_type,
                image=image,
                image_path=image_path,
                page_num=page_num,
            )
            elapsed = round(time.time() - start, 3)

            if self.debug:
                print(f"[EXTRACT_DONE] page={page_num} elapsed={elapsed}s")

            results.append(page_result)

        return results

    def _print_debug_summary(self, result: Dict[str, Any]) -> None:
        print("=" * 80)
        print("[PIPELINE_RESULT]")
        print(f"pdfPath      : {result['pdfPath']}")
        print(f"outputPath   : {result['outputPath']}")
        print(f"pages        : {result['renderedPages']}")
        print(f"docType      : {result['documentClassification'].get('documentType')}")
        print(f"docLabel     : {result['documentClassification'].get('documentTypeLabel')}")
        print(f"timing       : {result['timing']}")
        print("=" * 80)