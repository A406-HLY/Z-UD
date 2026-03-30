# qwen_client.py

from __future__ import annotations

import json
import re
import time
from typing import Any, Optional

import torch
from PIL import Image
from transformers import AutoProcessor, Qwen2_5_VLForConditionalGeneration


def extract_first_json(text: str):
    if not text or not isinstance(text, str):
        return None

    text = text.strip()

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

    m = re.search(r"(\{.*\}|\[.*\])", fenced, re.DOTALL)
    if not m:
        return None

    try:
        return json.loads(m.group(1))
    except Exception:
        return None


class QwenVLClient:
    """
    extractor_service.py와 바로 연결되는 Qwen client
    """

    def __init__(
        self,
        model_name: str = "Qwen/Qwen2.5-VL-7B-Instruct",
        min_pixels: int = 512 * 28 * 28,
        max_pixels: int = 1280 * 28 * 28,
        use_flash_attn: bool = True,
        default_max_new_tokens: int = 1200,
        debug: bool = False,
    ):
        self.model_name = model_name
        self.default_max_new_tokens = default_max_new_tokens
        self.debug = debug

        self.processor = AutoProcessor.from_pretrained(
            model_name,
            min_pixels=min_pixels,
            max_pixels=max_pixels,
        )

        model_kwargs = {
            "torch_dtype": torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            "device_map": "auto",
        }

        if torch.cuda.is_available():
            model_kwargs["attn_implementation"] = "flash_attention_2" if use_flash_attn else "sdpa"

        self.model = Qwen2_5_VLForConditionalGeneration.from_pretrained(
            model_name,
            **model_kwargs,
        )
        self.model.eval()

    def _build_messages(
        self,
        prompt: str,
        image_paths: Optional[list[str]] = None,
        pil_images: Optional[list[Image.Image]] = None,
    ):
        image_paths = image_paths or []
        pil_images = pil_images or []

        content = []

        for p in image_paths:
            content.append({"type": "image", "image": p})

        for img in pil_images:
            content.append({"type": "image", "image": img})

        content.append({"type": "text", "text": prompt})

        return [{"role": "user", "content": content}]

    def _normalize_pil(self, image: Image.Image) -> Image.Image:
        if not isinstance(image, Image.Image):
            raise TypeError(f"image must be PIL.Image.Image, got {type(image)}")
        return image.convert("RGB")

    def _run_generation_with_pil(
        self,
        *,
        prompt: str,
        pil_images: Optional[list[Image.Image]] = None,
        max_new_tokens: Optional[int] = None,
    ) -> dict[str, Any]:
        pil_images = pil_images or []
        max_new_tokens = max_new_tokens or self.default_max_new_tokens

        normalized_images = [self._normalize_pil(img) for img in pil_images]

        messages = self._build_messages(
            prompt=prompt,
            pil_images=normalized_images,
        )

        text = self.processor.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True,
        )

        if normalized_images:
            inputs = self.processor(
                text=[text],
                images=normalized_images,
                padding=True,
                return_tensors="pt",
            )
        else:
            inputs = self.processor(
                text=[text],
                padding=True,
                return_tensors="pt",
            )

        inputs = {
            k: v.to(self.model.device) if hasattr(v, "to") else v
            for k, v in inputs.items()
        }

        if torch.cuda.is_available():
            torch.cuda.synchronize()
        start = time.time()

        with torch.inference_mode():
            generated_ids = self.model.generate(
                **inputs,
                max_new_tokens=max_new_tokens,
                do_sample=False,
            )

        if torch.cuda.is_available():
            torch.cuda.synchronize()
        elapsed = time.time() - start

        generated_ids_trimmed = [
            out_ids[len(in_ids):]
            for in_ids, out_ids in zip(inputs["input_ids"], generated_ids)
        ]

        output_text = self.processor.batch_decode(
            generated_ids_trimmed,
            skip_special_tokens=True,
            clean_up_tokenization_spaces=False,
        )[0]

        if self.debug:
            print("\n" + "=" * 100)
            print("[QWEN PROMPT]")
            print(prompt)
            print("-" * 100)
            print("[QWEN RAW OUTPUT]")
            print(output_text)
            print("=" * 100 + "\n")

        return {
            "raw_output": output_text,
            "elapsed_sec": round(elapsed, 3),
        }

    def _run_generation_with_paths(
        self,
        *,
        prompt: str,
        image_paths: Optional[list[str]] = None,
        max_new_tokens: Optional[int] = None,
    ) -> dict[str, Any]:
        image_paths = image_paths or []
        max_new_tokens = max_new_tokens or self.default_max_new_tokens

        pil_images = []
        for path in image_paths:
            img = Image.open(path).convert("RGB")
            pil_images.append(img)

        return self._run_generation_with_pil(
            prompt=prompt,
            pil_images=pil_images,
            max_new_tokens=max_new_tokens,
        )

    def _build_text_result(
        self,
        raw_output: str,
        elapsed_sec: float,
    ) -> dict[str, Any]:
        text = raw_output.strip() if isinstance(raw_output, str) else raw_output
        confidence = self._heuristic_confidence_from_text(text)

        return {
            "text": text,
            "value": text,
            "raw_text": text,
            "confidence": confidence,
            "elapsed_sec": elapsed_sec,
            "parse_success": True,
        }

    def _build_json_result(
        self,
        raw_output: str,
        elapsed_sec: float,
    ) -> dict[str, Any]:
        parsed = extract_first_json(raw_output)
        confidence = self._heuristic_confidence_from_text(raw_output)

        return {
            "json": parsed,
            "value": parsed,
            "text": raw_output,
            "raw_text": raw_output,
            "confidence": confidence,
            "elapsed_sec": elapsed_sec,
            "parse_success": parsed is not None,
        }

    def _heuristic_confidence_from_text(self, text: Any) -> Optional[float]:
        if text is None:
            return None
        if not isinstance(text, str):
            return 0.9

        s = text.strip()
        if not s:
            return 0.5
        if s.lower() in {"null", "none", "unknown"}:
            return 0.6
        return 0.9

    def extract_text(
        self,
        *,
        image: Image.Image,
        prompt: str,
        max_new_tokens: Optional[int] = None,
    ) -> dict[str, Any]:
        result = self._run_generation_with_pil(
            prompt=prompt,
            pil_images=[image],
            max_new_tokens=max_new_tokens,
        )
        return self._build_text_result(
            raw_output=result["raw_output"],
            elapsed_sec=result["elapsed_sec"],
        )

    def extract_json(
        self,
        *,
        image: Image.Image,
        prompt: str,
        max_new_tokens: Optional[int] = None,
    ) -> dict[str, Any]:
        result = self._run_generation_with_pil(
            prompt=prompt,
            pil_images=[image],
            max_new_tokens=max_new_tokens,
        )
        return self._build_json_result(
            raw_output=result["raw_output"],
            elapsed_sec=result["elapsed_sec"],
        )

    def infer(
        self,
        *,
        image: Image.Image,
        prompt: str,
        max_new_tokens: Optional[int] = None,
    ) -> dict[str, Any]:
        return self.extract_text(
            image=image,
            prompt=prompt,
            max_new_tokens=max_new_tokens,
        )

    def generate(
        self,
        prompt: str,
        image_paths: Optional[list[str]] = None,
        max_new_tokens: Optional[int] = None,
    ) -> str:
        result = self._run_generation_with_paths(
            prompt=prompt,
            image_paths=image_paths,
            max_new_tokens=max_new_tokens,
        )
        return result["raw_output"]

    def generate_json(
        self,
        prompt: str,
        image_paths: Optional[list[str]] = None,
        max_new_tokens: Optional[int] = None,
    ) -> dict:
        result = self._run_generation_with_paths(
            prompt=prompt,
            image_paths=image_paths,
            max_new_tokens=max_new_tokens,
        )
        parsed = extract_first_json(result["raw_output"])
        if parsed is None:
            raise ValueError("Qwen output is not valid JSON.")
        if not isinstance(parsed, dict):
            raise ValueError("Parsed JSON is not a dict.")
        return parsed