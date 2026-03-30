# services/storage_service.py
# 클라우드 스토리지에서 파일 가져오기

from __future__ import annotations

import hashlib
import mimetypes
import shutil
from pathlib import Path
from typing import Dict
from urllib.parse import unquote, urlparse

import requests


class StorageService:
    """
    presigned URL 기반 다운로드 서비스
    """

    def __init__(self, *, default_bucket: str = "loan-docs", timeout_sec: int = 60):
        self.default_bucket = default_bucket
        self.timeout_sec = timeout_sec

    def parse_storage_meta(self, document_url: str) -> Dict[str, str]:
        parsed = urlparse(document_url)
        file_key = unquote(parsed.path.lstrip("/"))
        file_name = Path(file_key).name
        mime_type, _ = mimetypes.guess_type(file_name)

        return {
            "storageType": "OBJECT_STORAGE",
            "bucket": self.default_bucket,
            "fileKey": file_key,
            "fileName": file_name,
            "mimeType": mime_type or "application/pdf",
        }

    def build_file_id(self, consultation_id: str, file_name: str, index: int) -> str:
        seed = f"{consultation_id}:{index}:{file_name}"
        digest = hashlib.md5(seed.encode("utf-8")).hexdigest()[:12].upper()
        return f"FILE_{digest}"

    def download_to_local(
        self,
        *,
        consultation_id: str,
        file_id: str,
        document_url: str,
        download_dir: str | Path,
    ) -> Path:
        download_dir = Path(download_dir)
        download_dir.mkdir(parents=True, exist_ok=True)

        parsed = urlparse(document_url)
        meta = self.parse_storage_meta(document_url)
        local_path = download_dir / f"{file_id}_{meta['fileName']}"

        # 로컬 파일 테스트
        if parsed.scheme == "file":
            src_path = Path(unquote(parsed.path)).resolve()
            if not src_path.exists():
                raise FileNotFoundError(f"로컬 파일이 존재하지 않습니다: {src_path}")
            shutil.copy2(src_path, local_path)
            return local_path.resolve()

        # presigned URL 다운로드
        with requests.get(document_url, stream=True, timeout=self.timeout_sec) as response:
            response.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)

        return local_path.resolve()