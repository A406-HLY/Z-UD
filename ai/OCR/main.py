# main.py

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List

from pipeline import OCRPipeline


APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
TMP_DIR = APP_DIR / "_tmp"
RENDER_DIR = TMP_DIR / "rendered_pages"
OUTPUT_DIR = TMP_DIR / "outputs"


def find_first_pdf(data_dir: Path) -> Path | None:
    pdfs = sorted(data_dir.glob("*.pdf"))
    return pdfs[0] if pdfs else None


def collect_pdfs(input_dir: Path) -> List[Path]:
    return sorted([p for p in input_dir.glob("*.pdf") if p.is_file()])


def parse_args() -> argparse.Namespace:
    default_pdf = find_first_pdf(DATA_DIR)

    parser = argparse.ArgumentParser(description="OCR 파이프라인 실행")
    parser.add_argument(
        "--pdf",
        type=str,
        default=None,
        help="처리할 PDF 경로",
    )
    parser.add_argument(
        "--input-dir",
        type=str,
        default=None,
        help="일괄 처리할 PDF 폴더 경로",
    )
    parser.add_argument(
        "--render-dir",
        type=str,
        default=str(RENDER_DIR),
        help="렌더링된 페이지 이미지 저장 경로",
    )
    parser.add_argument(
        "--output-dir",
        type=str,
        default=str(OUTPUT_DIR),
        help="최종 JSON 저장 경로",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="Qwen/Qwen2.5-VL-7B-Instruct",
        help="extractor용 모델명",
    )
    parser.add_argument(
        "--max-new-tokens",
        type=int,
        default=1200,
        help="생성 최대 토큰 수",
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=180,
        help="PDF 렌더링 DPI",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="디버그 로그 출력",
    )
    parser.add_argument(
        "--fail-fast",
        action="store_true",
        help="파일 하나 실패 시 즉시 종료",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="input-dir 하위 폴더까지 재귀 탐색",
    )

    args = parser.parse_args()

    if not args.pdf and not args.input_dir and default_pdf is not None:
        args.pdf = str(default_pdf)

    return args


def resolve_pdf_list(args: argparse.Namespace) -> List[Path]:
    if args.pdf and args.input_dir:
        raise ValueError("--pdf 와 --input-dir 중 하나만 사용하세요.")

    if args.pdf:
        pdf_path = Path(args.pdf)
        if not pdf_path.is_absolute():
            pdf_path = (APP_DIR / pdf_path).resolve()
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF 파일이 존재하지 않습니다: {pdf_path}")
        return [pdf_path]

    if args.input_dir:
        input_dir = Path(args.input_dir)
        if not input_dir.is_absolute():
            input_dir = (APP_DIR / input_dir).resolve()
        if not input_dir.exists():
            raise FileNotFoundError(f"입력 폴더가 존재하지 않습니다: {input_dir}")
        if not input_dir.is_dir():
            raise NotADirectoryError(f"입력 경로가 폴더가 아닙니다: {input_dir}")

        if args.recursive:
            pdfs = sorted([p for p in input_dir.rglob("*.pdf") if p.is_file()])
        else:
            pdfs = collect_pdfs(input_dir)

        if not pdfs:
            raise FileNotFoundError(f"입력 폴더에 PDF가 없습니다: {input_dir}")

        return pdfs

    raise FileNotFoundError("처리할 PDF가 없습니다. --pdf 또는 --input-dir을 지정하세요.")


def main() -> None:
    args = parse_args()

    pdf_list = resolve_pdf_list(args)

    pipeline = OCRPipeline(
        extractor_model_name=args.model,
        max_new_tokens=args.max_new_tokens,
        render_dpi=args.dpi,
        debug=args.debug,
    )

    render_dir = Path(args.render_dir)
    output_dir = Path(args.output_dir)
    render_dir.mkdir(parents=True, exist_ok=True)
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []
    failures = []

    for idx, pdf_path in enumerate(pdf_list, start=1):
        print("=" * 100)
        print(f"[PROCESS_START] ({idx}/{len(pdf_list)}) {pdf_path}")
        print("=" * 100)

        try:
            result = pipeline.process_pdf(
                pdf_path=pdf_path,
                render_dir=render_dir,
                output_dir=output_dir,
            )
            results.append(
                {
                    "pdfPath": result["pdfPath"],
                    "outputPath": result["outputPath"],
                    "documentType": result["documentClassification"].get("documentType"),
                    "documentTypeLabel": result["documentClassification"].get("documentTypeLabel"),
                    "timing": result["timing"],
                    "status": "SUCCESS",
                }
            )

            print(f"[PROCESS_DONE] {pdf_path.name}")
            print(f"  - outputPath : {result['outputPath']}")
            print(f"  - documentType : {result['documentClassification'].get('documentType')}")
            print(f"  - totalSec : {result['timing'].get('totalSec')}")

        except Exception as e:
            failure = {
                "pdfPath": str(pdf_path),
                "status": "FAILED",
                "error": str(e),
            }
            failures.append(failure)

            print(f"[PROCESS_FAILED] {pdf_path.name}")
            print(f"  - error : {e}")

            if args.fail_fast:
                raise

    summary = {
        "totalFiles": len(pdf_list),
        "successCount": len(results),
        "failureCount": len(failures),
        "results": results,
        "failures": failures,
    }

    summary_path = output_dir / "_batch_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 100)
    print("[BATCH_SUMMARY]")
    print(json.dumps(
        {
            "totalFiles": summary["totalFiles"],
            "successCount": summary["successCount"],
            "failureCount": summary["failureCount"],
            "summaryPath": str(summary_path),
        },
        ensure_ascii=False,
        indent=2,
    ))
    print("=" * 100)


if __name__ == "__main__":
    main()