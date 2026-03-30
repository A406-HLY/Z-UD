# batch_pipeline.py

from __future__ import annotations

import traceback
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List

from PIL import Image

from qwen_client import QwenVLClient
from registry.doc_registry import get_doc_label
from services.classifier_service import classify_document
from services.extractor_service import ExtractorService
from services.output_builder import OutputBuilder
from services.pdf_service import pdf_to_images
from services.storage_service import StorageService


KST = timezone(timedelta(hours=9))


def now_iso() -> str:
    return datetime.now(KST).isoformat(timespec="seconds")


class BatchOCRPipeline:
    """
    consultation 단위 OCR batch pipeline
    입력:
      {
        "consultationId": "...",
        "documentUrls": ["...", "..."]
      }
    출력:
      {
        "consultationId": "...",
        "processStartedAt": "...",
        "processFinishedAt": "...",
        "documents": [...]
      }
    """

    def __init__(
        self,
        *,
        work_root: str | Path,
        extractor_model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
        max_new_tokens: int = 1200,
        render_dpi: int = 180,
        default_bucket: str = "loan-docs",
        debug: bool = False,
    ):
        self.work_root = Path(work_root)
        self.work_root.mkdir(parents=True, exist_ok=True)

        self.render_dpi = render_dpi
        self.debug = debug

        self.storage_service = StorageService(default_bucket=default_bucket)
        self.qwen_client = QwenVLClient(
            model_name=extractor_model_name,
            default_max_new_tokens=max_new_tokens,
        )
        self.extractor_service = ExtractorService(self.qwen_client)
        self.output_builder = OutputBuilder()

    def process_consultation_job(self, job: Dict[str, Any]) -> Dict[str, Any]:
        consultation_id = job["consultationId"]
        document_urls = job.get("documentUrls", [])

        consultation_dir = self.work_root / consultation_id
        raw_dir = consultation_dir / "raw"
        render_dir = consultation_dir / "rendered"
        output_dir = consultation_dir / "output"

        raw_dir.mkdir(parents=True, exist_ok=True)
        render_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)

        batch_started_at = now_iso()
        document_results: List[Dict[str, Any]] = []

        for idx, document_url in enumerate(document_urls, start=1):
            meta = self.storage_service.parse_storage_meta(document_url)
            file_id = self.storage_service.build_file_id(
                consultation_id=consultation_id,
                file_name=meta["fileName"],
                index=idx,
            )

            local_pdf_path = self.storage_service.download_to_local(
                consultation_id=consultation_id,
                file_id=file_id,
                document_url=document_url,
                download_dir=raw_dir,
            )

            file_meta = {
                "fileId": file_id,
                "fileUrl": document_url,
                **meta,
            }

            result = self.process_document_file(
                consultation_id=consultation_id,
                local_pdf_path=local_pdf_path,
                file_meta=file_meta,
                render_dir=render_dir / file_id,
            )
            document_results.append(result)

        batch_finished_at = now_iso()

        final_output = self.output_builder.build_consultation_output(
            consultation_id=consultation_id,
            process_started_at=batch_started_at,
            process_finished_at=batch_finished_at,
            documents=document_results,
        )

        final_output_path = output_dir / "output.json"
        self.output_builder.dump_json(final_output, str(final_output_path))

        if self.debug:
            print(f"[BATCH_DONE] consultationId={consultation_id}")
            print(f"  - documents={len(document_results)}")
            print(f"  - output={final_output_path}")

        return final_output

    def process_document_file(
        self,
        *,
        consultation_id: str,
        local_pdf_path: str | Path,
        file_meta: Dict[str, Any],
        render_dir: str | Path,
    ) -> Dict[str, Any]:
        started_at = now_iso()
        local_pdf_path = Path(local_pdf_path)
        render_dir = Path(render_dir)
        render_dir.mkdir(parents=True, exist_ok=True)

        try:
            document = self._build_document_input(
                consultation_id=consultation_id,
                pdf_path=local_pdf_path,
                file_meta=file_meta,
                render_dir=render_dir,
            )

            # classify
            document = classify_document(document)
            classification = document.get("documentClassification", {}) or {}
            doc_type = classification.get("documentType")
            doc_label = classification.get("documentTypeLabel") or (
                get_doc_label(doc_type) if doc_type else None
            )

            if not doc_type:
                raise ValueError("documentType이 없습니다. 문서 분류 실패")

            # extract
            page_results = self._extract_pages(document, doc_type=doc_type)
            merged_content = self.extractor_service.merge_page_results(
                doc_type=doc_type,
                page_results=page_results,
            )

            finished_at = now_iso()

            return self.output_builder.build_document_output(
                consultation_id=consultation_id,
                file_id=file_meta["fileId"],
                storage_type=file_meta["storageType"],
                bucket=file_meta.get("bucket"),
                file_key=file_meta.get("fileKey"),
                file_name=file_meta.get("fileName"),
                file_url=file_meta.get("fileUrl"),
                mime_type=file_meta.get("mimeType"),
                process_started_at=started_at,
                process_finished_at=finished_at,
                doc_type=doc_type,
                doc_label=doc_label,
                classification=classification,
                extracted_content=merged_content,
                raw_text=None,
                page_nums=[p.get("pageNum") for p in document.get("pages", [])],
                status="SUCCESS",
                error=None,
            )

        except Exception as e:
            finished_at = now_iso()
            error_message = str(e)

            if self.debug:
                print(f"[DOCUMENT_FAILED] {local_pdf_path.name}")
                print(traceback.format_exc())

            return self.output_builder.build_document_output(
                consultation_id=consultation_id,
                file_id=file_meta["fileId"],
                storage_type=file_meta["storageType"],
                bucket=file_meta.get("bucket"),
                file_key=file_meta.get("fileKey"),
                file_name=file_meta.get("fileName"),
                file_url=file_meta.get("fileUrl"),
                mime_type=file_meta.get("mimeType"),
                process_started_at=started_at,
                process_finished_at=finished_at,
                doc_type=None,
                doc_label=None,
                classification=None,
                extracted_content=None,
                raw_text=None,
                page_nums=[],
                status="FAILED",
                error={
                    "code": "OCR_PROCESSING_ERROR",
                    "message": error_message,
                },
            )

    def _build_document_input(
        self,
        *,
        consultation_id: str,
        pdf_path: Path,
        file_meta: Dict[str, Any],
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
            "consultationId": consultation_id,
            "fileId": file_meta["fileId"],
            "storageType": file_meta["storageType"],
            "bucket": file_meta.get("bucket"),
            "fileKey": file_meta.get("fileKey"),
            "fileName": file_meta.get("fileName"),
            "fileUrl": file_meta.get("fileUrl"),
            "mimeType": file_meta.get("mimeType"),
            "pages": pages,
        }

    def _extract_pages(self, document: Dict[str, Any], *, doc_type: str) -> List[Dict[str, Any]]:
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

            page_result = self.extractor_service.extract_document(
                doc_type=doc_type,
                image=image,
                image_path=image_path,
                page_num=page_num,
            )
            results.append(page_result)

        return results