# run_local_batch.py
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List
from urllib.parse import quote

from batch_pipeline import BatchOCRPipeline


APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
WORK_DIR = APP_DIR / "work"


def collect_pdfs(input_dir: Path, recursive: bool = False) -> List[Path]:
    if recursive:
        return sorted([p for p in input_dir.rglob("*.pdf") if p.is_file()])
    return sorted([p for p in input_dir.glob("*.pdf") if p.is_file()])


def local_path_to_file_url(path: Path) -> str:
    # storage_service를 안 거치고 바로 테스트하려면 file:// URL 형태로 맞춰줌
    return path.resolve().as_uri()


def main() -> None:
    parser = argparse.ArgumentParser(description="data 폴더 PDF들로 consultation 단위 OCR 배치 테스트")
    parser.add_argument(
        "--input-dir",
        type=str,
        default=str(DATA_DIR),
        help="로컬 PDF 폴더 경로",
    )
    parser.add_argument(
        "--consultation-id",
        type=str,
        default="CONSULT_LOCAL_TEST_001",
        help="테스트 consultationId",
    )
    parser.add_argument(
        "--work-root",
        type=str,
        default=str(WORK_DIR),
        help="작업 디렉토리 루트",
    )
    parser.add_argument(
        "--model",
        type=str,
        default="Qwen/Qwen2.5-VL-7B-Instruct",
        help="extractor 모델명",
    )
    parser.add_argument(
        "--max-new-tokens",
        type=int,
        default=1200,
        help="LLM 최대 생성 토큰",
    )
    parser.add_argument(
        "--dpi",
        type=int,
        default=180,
        help="PDF 렌더링 DPI",
    )
    parser.add_argument(
        "--recursive",
        action="store_true",
        help="하위 폴더까지 재귀 탐색",
    )
    parser.add_argument(
        "--debug",
        action="store_true",
        help="디버그 로그 출력",
    )

    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    if not input_dir.is_absolute():
        input_dir = (APP_DIR / input_dir).resolve()

    if not input_dir.exists():
        raise FileNotFoundError(f"입력 폴더가 없습니다: {input_dir}")

    pdfs = collect_pdfs(input_dir, recursive=args.recursive)
    if not pdfs:
        raise FileNotFoundError(f"PDF가 없습니다: {input_dir}")

    # 로컬 테스트용 job 구성
    # batch_pipeline의 구조를 최대한 유지하기 위해 documentUrls 자리에 file:// URI 사용
    job = {
        "consultationId": args.consultation_id,
        "documentUrls": [local_path_to_file_url(p) for p in pdfs],
    }

    pipeline = BatchOCRPipeline(
        work_root=args.work_root,
        extractor_model_name=args.model,
        max_new_tokens=args.max_new_tokens,
        render_dpi=args.dpi,
        default_bucket="loan-docs",
        debug=args.debug,
    )

    result = pipeline.process_consultation_job(job)

    output_path = Path(args.work_root) / args.consultation_id / "output" / "output.json"

    print("=" * 100)
    print("[LOCAL_BATCH_DONE]")
    print(f"consultationId : {result['consultationId']}")
    print(f"documents      : {len(result['documents'])}")
    print(f"output         : {output_path.resolve()}")
    print("=" * 100)

    print(json.dumps(
        {
            "consultationId": result["consultationId"],
            "documentCount": len(result["documents"]),
            "outputPath": str(output_path.resolve()),
        },
        ensure_ascii=False,
        indent=2,
    ))


if __name__ == "__main__":
    main()