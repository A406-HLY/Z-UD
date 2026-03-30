# services/pdf_service.py
# PDF를 페이지 이미지로 변환

from pathlib import Path
import fitz


def pdf_to_images(
    pdf_path: str,
    output_dir: str,
    dpi: int = 200,
    image_format: str = "png",
) -> list[str]:
    pdf_path = Path(pdf_path)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    doc = fitz.open(pdf_path)
    image_paths = []

    try:
        for page_idx in range(len(doc)):
            page = doc.load_page(page_idx)
            pix = page.get_pixmap(dpi=dpi, alpha=False)
            image_path = output_dir / f"{pdf_path.stem}_page_{page_idx + 1:03d}.{image_format}"
            pix.save(image_path)
            image_paths.append(str(image_path))
    finally:
        doc.close()

    return image_paths


def build_document_input(
    file_id: str,
    bucket: str,
    file_key: str,
    pdf_path: str,
    output_dir: str,
    storage_type: str = "OBJECT_STORAGE",
) -> dict:
    """
    현재 시스템 전제:
    - 1 PDF = 1 page
    - 여러 페이지 문서는 여러 개 PDF 파일이 연속으로 들어오고,
      분류 후 grouping으로 하나의 논리적 문서로 묶음
    """
    page_images = pdf_to_images(pdf_path, output_dir, dpi=180)

    if len(page_images) != 1:
        raise ValueError(
            f"[build_document_input] {Path(pdf_path).name} 는 {len(page_images)}페이지로 렌더링됨. "
            "현재 파이프라인은 1파일=1페이지 PDF만 허용함."
        )

    return {
        "fileId": file_id,
        "storageType": storage_type,
        "bucket": bucket,
        "fileKey": file_key,
        "fileName": Path(pdf_path).name,
        "mimeType": "application/pdf",
        "pages": [
            {
                "pageNum": 1,
                "imagePath": page_images[0],
            }
        ],
    }