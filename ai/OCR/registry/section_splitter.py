# registry/section_splitter.py

from typing import List, Dict, Any, Tuple
import cv2
import numpy as np
from PIL import Image

Box = List[int]  # [x1, y1, x2, y2]


def load_image(image_path: str):
    img_bgr = cv2.imread(image_path)
    if img_bgr is None:
        raise ValueError(f"이미지 읽기 실패: {image_path}")
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    return img_bgr, img_rgb


def preprocess(img_bgr: np.ndarray):
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    bin_img = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        15,
        8
    )

    return bin_img


def detect_boxes(
    bin_img: np.ndarray,
    min_area: int = 5000,
    min_width_ratio: float = 0.2,
    min_height: int = 20,
    dilate_kernel_size: Tuple[int, int] = (25, 15),
):
    h, w = bin_img.shape

    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, dilate_kernel_size)
    merged = cv2.dilate(bin_img, kernel, iterations=1)

    contours, _ = cv2.findContours(
        merged,
        cv2.RETR_EXTERNAL,
        cv2.CHAIN_APPROX_SIMPLE
    )

    boxes: List[Box] = []

    for cnt in contours:
        x, y, bw, bh = cv2.boundingRect(cnt)
        area = bw * bh

        if area < min_area:
            continue

        if bw < w * min_width_ratio or bh < min_height:
            continue

        boxes.append([x, y, x + bw, y + bh])

    boxes = sorted(boxes, key=lambda b: b[1])
    return boxes


def crop_single_region(image_rgb: np.ndarray, bbox: Box, index: int, name: str):
    h, w = image_rgb.shape[:2]
    x1, y1, x2, y2 = bbox

    x1 = max(0, min(x1, w))
    x2 = max(0, min(x2, w))
    y1 = max(0, min(y1, h))
    y2 = max(0, min(y2, h))

    crop = image_rgb[y1:y2, x1:x2]
    crop_pil = Image.fromarray(crop)

    return {
        "index": index,
        "name": name,
        "bbox": [x1, y1, x2, y2],
        "image_pil": crop_pil
    }


def build_title_deed_sections_from_boxes(
    image_rgb: np.ndarray,
    boxes: List[Box],
    title_idx: int = 2,
    gap_idx: int = 3,
    eul_idx: int = 4,
) -> Dict[str, Any]:
    """
    등기사항전부증명서 섹션 나누기용 함수
    """
    if len(boxes) <= eul_idx:
        raise ValueError(f"등기부등본 섹션 분할 실패: boxes 부족 (len={len(boxes)})")

    title_box = boxes[title_idx]
    gap_box = boxes[gap_idx]
    eul_box = boxes[eul_idx]

    tx1, ty1, tx2, ty2 = title_box

    header_box = [tx1, 0, tx2, ty1]

    return {
        "header": crop_single_region(image_rgb, header_box, -1, "header"),
        "title_section": crop_single_region(image_rgb, title_box, title_idx, "title_section"),
        "gap_section": crop_single_region(image_rgb, gap_box, gap_idx, "gap_section"),
        "eul_section": crop_single_region(image_rgb, eul_box, eul_idx, "eul_section"),
    }


def split_title_deed_sections(image_path: str) -> Dict[str, Any]:
    img_bgr, img_rgb = load_image(image_path)
    bin_img = preprocess(img_bgr)
    boxes = detect_boxes(bin_img)

    named_sections = build_title_deed_sections_from_boxes(
        image_rgb=img_rgb,
        boxes=boxes,
        title_idx=2,
        gap_idx=3,
        eul_idx=4,
    )

    return {
        "boxes": boxes,
        "named_sections": named_sections
    }