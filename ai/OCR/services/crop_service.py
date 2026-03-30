# services/crop_service.py
# 비율좌표 기반 이미지 크롭 (크롭이미지 + bbox 반환)

from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

from PIL import Image

from registry.crop_templates import CROP_TEMPLATES
from registry.section_splitter import split_title_deed_sections


BBox = List[int]


class CropService:
    """
    3번 단계 담당
    - 일반 템플릿 문서: crop_templates.py의 비율 좌표 기반 크롭
    - 등기사항전부증명서(TITLE_DEED): section_splitter.py 기반 header/표제부/갑구/을구 분리
    - full_document 추출 문서: 원본 그대로 전달
    """

    def __init__(self, crop_templates: Optional[Dict[str, Dict[str, List[float]]]] = None):
        self.crop_templates = crop_templates or CROP_TEMPLATES

    def has_template(self, doc_type: str) -> bool:
        return doc_type in self.crop_templates

    def get_template(self, doc_type: str) -> Dict[str, List[float]]:
        if doc_type not in self.crop_templates:
            raise KeyError(f"crop template not found for doc_type={doc_type}")
        return self.crop_templates[doc_type]

    @staticmethod
    def ratio_to_bbox(image_size: Tuple[int, int], ratio_box: List[float]) -> BBox:
        width, height = image_size
        if len(ratio_box) != 4:
            raise ValueError(f"ratio_box length must be 4, got {ratio_box}")

        x1 = int(width * ratio_box[0])
        y1 = int(height * ratio_box[1])
        x2 = int(width * ratio_box[2])
        y2 = int(height * ratio_box[3])

        x1 = max(0, min(width, x1))
        x2 = max(0, min(width, x2))
        y1 = max(0, min(height, y1))
        y2 = max(0, min(height, y2))
        
        if x2 <= x1 or y2 <= y1:
            raise ValueError(f"invalid bbox converted from ratio_box={ratio_box}")

        return [x1, y1, x2, y2]

    
    @staticmethod
    def bbox_to_ratio(image_size: Tuple[int, int], bbox: BBox) -> List[float]:
        width, height = image_size
    
        if bbox is None or len(bbox) != 4:
            raise ValueError(f"bbox length must be 4, got {bbox}")
    
        x1, y1, x2, y2 = bbox
    
        if width == 0 or height == 0:
            raise ValueError("image size must be non-zero")
    
        return [
            round(x1 / width, 6),
            round(y1 / height, 6),
            round(x2 / width, 6),
            round(y2 / height, 6),
        ]


    @staticmethod
    def crop_image(image: Image.Image, bbox: BBox) -> Image.Image:
        return image.crop(tuple(bbox))

    def crop_by_section(
        self,
        image: Image.Image,
        doc_type: str,
        section_name: str,
        page_num: int = 1,
    ) -> Dict[str, Any]:
        template = self.get_template(doc_type)
        if section_name not in template:
            raise KeyError(f"section '{section_name}' not found for doc_type={doc_type}")

        bbox = self.ratio_to_bbox(image.size, template[section_name])
        cropped = self.crop_image(image, bbox)

        bbox_ratio = self.bbox_to_ratio(image.size, bbox)
        
        return {
            "sectionName": section_name,
            "bbox": bbox_ratio,
            "pageNum": page_num,
            "image": cropped,
        }

    def crop_all_sections(
        self,
        image: Image.Image,
        doc_type: str,
        page_num: int = 1,
    ) -> Dict[str, Dict[str, Any]]:
        template = self.get_template(doc_type)
        results: Dict[str, Dict[str, Any]] = {}
        for section_name in template.keys():
            results[section_name] = self.crop_by_section(
                image=image,
                doc_type=doc_type,
                section_name=section_name,
                page_num=page_num,
            )
        return results

    def split_title_deed(self, image_path: str) -> Dict[str, Any]:
        """
        TITLE_DEED 전용 section splitter wrapper
        return:
        {
            "boxes": [...],
            "named_sections": {
                "header": {...},
                "title_section": {...},
                "gap_section": {...},
                "eul_section": {...},
            }
        }
        """
        return split_title_deed_sections(image_path)

    def resolve_source(
        self,
        *,
        doc_type: str,
        source: Dict[str, Any],
        image: Optional[Image.Image],
        image_path: Optional[str],
        page_num: int,
        cached_title_deed_sections: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        extractor_service에서 source 설정만 넘기면
        실제 대상 image/bbox를 반환하도록 하는 공통 resolver.
        """
        source_type = source.get("type")

        if source_type == "full_document":
            if image is None:
                raise ValueError("full_document source requires PIL image")
            return {
                "sectionName": "full_document",
                "bbox": None,
                "pageNum": page_num,
                "image": image,
            }

        if source_type == "crop_section":
            if image is None:
                raise ValueError("crop_section source requires PIL image")
            return self.crop_by_section(
                image=image,
                doc_type=doc_type,
                section_name=source["cropSection"],
                page_num=page_num,
            )

        if source_type == "split_section":
            if doc_type != "TITLE_DEED":
                raise ValueError(f"split_section source is only supported for TITLE_DEED, got {doc_type}")

            if cached_title_deed_sections is None:
                if not image_path:
                    raise ValueError("TITLE_DEED split_section source requires image_path")
                split_result = self.split_title_deed(image_path)
                cached_title_deed_sections = split_result["named_sections"]

            section_name = source["sectionName"]
            section_data = cached_title_deed_sections.get(section_name)
            if section_data is None:
                return {
                    "sectionName": section_name,
                    "bbox": self.bbox_to_ratio(image.size, section_data.get("bbox")),
                    "pageNum": page_num,
                    "image": section_data.get("image_pil"),
                }

            return {
                "sectionName": section_name,
                "bbox": self.bbox_to_ratio(image.size, section_data.get("bbox")),
                "pageNum": page_num,
                "image": section_data.get("image_pil"),
            }

        raise ValueError(f"unsupported source.type: {source_type}")
