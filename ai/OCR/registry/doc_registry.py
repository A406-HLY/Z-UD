# registry/doc_registry.py
# 문서 종류별 설정관리
# "무슨 필드를 어떻게 추출할지"를 정의

from __future__ import annotations

from copy import deepcopy
from typing import Any, Dict, List, Optional


def evidence_template() -> dict:
    return {
        "pageNum": None,
        "bbox": None,
        "rawText": None,
        "confidence": None,
    }


def field_template() -> dict:
    return {
        "value": None,
        "confidence": None,
        "evidence": evidence_template(),
    }


def f() -> dict:
    return field_template()


def make_source_full() -> dict:
    return {
        "type": "full_document",
    }


def make_source_crop(section: str) -> dict:
    return {
        "type": "crop_section",
        "cropSection": section,
    }


def make_source_split_section(
    section_name: str,
    selector_type: str = "name",
    index: Optional[int] = None,
) -> dict:
    """
    section_splitter 결과를 사용하는 source 정의

    section_name:
        - title_section
        - gap_section
        - eul_section

    selector_type:
        - name: 섹션명 기준 선택
        - index: 특정 index 기준 선택
        - first_match: 첫 매칭 사용
    """
    data = {
        "type": "split_section",
        "sectionName": section_name,
        "selectorType": selector_type,
    }
    if index is not None:
        data["index"] = index
    return data


def make_extractor_single(
    prompt: str,
    parser: str = "text",
    postprocess: Optional[List[str]] = None,
) -> dict:
    return {
        "type": "single",
        "prompt": prompt,
        "parser": parser,
        "postprocess": postprocess or [],
    }


def make_extractor_object(
    prompt: str,
    fields: Dict[str, dict],
    parser: str = "json",
    postprocess: Optional[List[str]] = None,
) -> dict:
    return {
        "type": "object",
        "prompt": prompt,
        "parser": parser,
        "fields": fields,
        "postprocess": postprocess or [],
    }


def make_extractor_list(
    prompt: str,
    item_schema: Dict[str, dict],
    parser: str = "json",
    dedup_keys: Optional[List[str]] = None,
    postprocess: Optional[List[str]] = None,
) -> dict:
    return {
        "type": "list",
        "prompt": prompt,
        "parser": parser,
        "itemSchema": item_schema,
        "dedupKeys": dedup_keys or [],
        "postprocess": postprocess or [],
    }


DOC_CONFIG: Dict[str, dict] = {
    "RESIDENT_REGISTRATION": {
        "label": "주민등록등본",
        "group": "IDENTITY_FAMILY",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "MERGE_RESIDENT_REGISTRATION",
        "useCropTemplate": True,
        "schema": {
            "issueDate": f(),
            "issueNumber": f(),
            "householdMembers": [
                {
                    "name": f(),
                    "residentRegistrationNumber": f(),
                }
            ],
        },
        "fields": {
            "issueDate": {
                "description": "문서 상단의 발급일자",
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt=(
                        "주민등록등본 상단 영역에서 발급일자 1건만 추출하라. "
                        "설명 없이 값만 반환하라. 불명확하면 null."
                    ),
                    parser="date",
                    postprocess=["trim"],
                ),
                "required": False,
                "outputType": "field",
            },
            "issueNumber": {
                "description": "문서 상단의 발행번호 또는 문서확인번호",
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt=(
                        "주민등록등본 상단 영역에서 발행번호 또는 문서확인번호 1건만 추출하라. "
                        "설명 없이 값만 반환하라. 불명확하면 null."
                    ),
                    parser="text",
                    postprocess=["trim"],
                ),
                "required": False,
                "outputType": "field",
            },
            "householdMembers": {
                "description": "세대주 포함 세대원 목록",
                "source": make_source_crop("member_table"),
                "extractor": make_extractor_list(
                    prompt=(
                        "주민등록등본의 세대원 표 영역에서 세대원 행을 기반으로 추출하라. "
                        "각 행은 이름과 주민등록번호만 포함하라."
                        "이름은 name, 주민등록번호는 residentRegistrationNumber에 각각 매핑하라."
                        "일부 마스킹되어 있어도 가능한 부분까지 추출하라." 
                        "표 헤더, 안내문, 발급기관 정보는 제외하라."
                    ),
                    parser="json",
                    item_schema={
                        "name": f(),
                        "residentRegistrationNumber": f(),
                    },
                    dedup_keys=["name.value"],
                ),
                "required": False,
                "outputType": "list",
            },
        },
        "rules": [
            "issueDate는 문서 상단의 발급일자 1건만 반환하라.",
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "householdMembers에는 세대주를 포함한 세대원 목록 표에서 확인되는 구성원만 모두 넣어라.",
            "세대원 목록이 아닌 발급기관 정보, 문서 하단 안내문, 발급번호 라인, 기관장명, 민원 안내 문구는 householdMembers에 넣지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueDate": {"type": "field"},
            "issueNumber": {"type": "field"},
            "householdMembers": {
                "type": "list",
                "dedupKeys": [
                    "name.value"
                ]
            },
        },
    },

    "RESIDENT_REGISTRATION_ABSTRACT": {
        "label": "주민등록초본",
        "group": "IDENTITY_FAMILY",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueDate": f(),
            "issueNumber": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "currentAddress": f(),
            "moveInDate": f(),
        },
        "fields": {
            "issueDate": {
                "description": "상단 발급일자",
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="주민등록초본 상단에서 발급일자 1건만 추출하라. 불명확하면 null.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "issueNumber": {
                "description": "상단 발행번호 또는 문서확인번호",
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="주민등록초본 상단에서 발행번호 또는 문서확인번호 1건만 추출하라. 불명확하면 null.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "description": "본인 이름",
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="주민등록초본 개인정보 영역에서 본인 이름 1건만 추출하라. 불명확하면 null.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "description": "본인 주민등록번호",
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="주민등록초본 개인정보 영역에서 본인 주민등록번호 1건만 추출하라. 불명확하면 null.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "currentAddress": {
                "description": "현재 주소",
                "source": make_source_crop("address_info"),
                "extractor": make_extractor_single(
                    prompt=(
                        "주민등록초본 주소 영역에서 현재 주소/현주소/최종 주소 1건만 추출하라."
                        "과거 주소, 변동 이력, 말소 주소는 제외하라. 불명확하면 null."
                    ),
                    parser="address",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "moveInDate": {
                "description": "현주소에 해당하는 전입일자",
                "source": make_source_crop("address_info"),
                "extractor": make_extractor_single(
                    prompt=(
                        "주민등록초본 주소 영역에서 현재 주소와 같은 행에 해당하는 전입일자 1건만 추출하라. "
                        "불명확하면 null."
                    ),
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueDate는 문서 상단의 발급일자 1건만 반환하라.",
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "name은 본인 이름 1건만 반환하라.",
            "residentRegistrationNumber는 본인 주민등록번호 1건만 반환하라.",
            "currentAddress는 현재 주소로 명시된 1건만 반환하라.",
            "과거 주소, 주소 변동 이력, 전입 변동 내역, 말소 주소는 currentAddress에 넣지 마라.",
            "발급기관명, 기관장명, 시청, 구청, 동주민센터 명칭, 안내문, QR 주변 텍스트는 currentAddress에 넣지 마라.",
            "moveInDate는 현주소에 해당하는 전입일자 1건만 반환하라.",
            "현재 주소 여부가 명확하지 않거나 주소가 일부만 보이면 null로 반환하라."
        ],
        "mergeSpec": {
            "issueDate": {"type": "field"},
            "issueNumber": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "currentAddress": {"type": "field"},
            "moveInDate": {"type": "field"},
        },
    },

    "FAMILY_RELATION_CERTIFICATE": {
        "label": "가족관계증명서",
        "group": "IDENTITY_FAMILY",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "spouse": {
                "exists": f(),
                "name": f(),
                "residentRegistrationNumber": f(),
            },
        },
        "fields": {
            "issueNumber": {
                "description": "문서확인번호",
                "source": make_source_crop("issue_info"),
                "extractor": make_extractor_single(
                    prompt="가족관계증명서 하단 발급 정보 영역에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "description": "본인 이름",
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="가족관계증명서 개인정보 영역에서 본인 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "description": "본인 주민등록번호",
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="가족관계증명서 개인정보 영역에서 본인 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "spouse": {
                "description": "배우자 정보",
                "source": make_source_crop("family_info"),
                "extractor": make_extractor_object(
                    prompt=(
                        "가족관계 정보 영역에서 배우자 정보만 추출하라. "
                        "결과는 exists, name, residentRegistrationNumber를 포함하라. "
                        "배우자가 없으면 exists=false, 나머지는 null로 반환하라. "
                        "부모, 자녀, 기타 가족은 제외하라."
                    ),
                    parser="json",
                    fields={
                        "exists": f(),
                        "name": f(),
                        "residentRegistrationNumber": f(),
                    },
                ),
                "outputType": "object",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "name은 본인 이름 1건만 반환하라.",
            "residentRegistrationNumber는 본인 주민등록번호 1건만 반환하라.",
            "spouse에는 가족관계 중 '배우자'만 포함하라.",
            "배우자가 없으면 spouse.exists=false로 반환하고 spouse.name, spouse.residentRegistrationNumber는 null로 반환하라.",
            "부모, 자녀, 기타 가족은 spouse에 넣지 마라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "spouse": {
                "type": "object",
                "fields": {
                    "exists": {"type": "bool_field"},
                    "name": {"type": "field"},
                    "residentRegistrationNumber": {"type": "field"}
                }
            },
        },
    },

    "EMPLOYMENT_CERTIFICATE": {
        "label": "재직증명서",
        "group": "INCOME_EMPLOYEE",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": False,
        "schema": {
            "name": f(),
            "residentRegistrationNumber": f(),
            "hasRepresentativeName": f(),
            "hasCompanySeal": f(),
        },
        "fields": {
            "name": {
                "description": "재직자 본인 이름",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt="재직증명서 전체 문서에서 재직자 본인 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "description": "재직자 본인 주민등록번호",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt="재직증명서 전체 문서에서 재직자 본인 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "hasRepresentativeName": {
                "description": "대표자 이름 항목 존재 여부",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt=(
                        "재직증명서 전체 문서에서 대표자 이름 항목 존재 여부만 판단하라. "
                        "존재하면 true, 없으면 false, 불명확하면 null."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
            "hasCompanySeal": {
                "description": "회사 직인 존재 여부",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt=(
                        "재직증명서 전체 문서에서 회사 직인 또는 도장 존재 여부만 판단하라. "
                        "있으면 true, 없으면 false, 불명확하면 null."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "name은 재직자 본인 이름 1건만 반환하라.",
            "residentRegistrationNumber는 재직자 본인 주민등록번호 1건만 반환하라.",
            "hasRepresentativeName은 대표자 이름 항목이 명확히 존재하면 true로 반환하라.",
            "대표자 이름 항목이 없으면 hasRepresentativeName은 false로 반환하라.",
            "대표자 이름 존재 여부가 불명확하면 hasRepresentativeName은 null로 반환하라.",
            "hasCompanySeal은 직인, 인감, 회사 도장이 명확히 보이면 true로 반환하라.",
            "직인, 인감, 회사 도장이 명확히 없으면 hasCompanySeal은 false로 반환하라.",
            "도장 여부가 불명확하면 추정하지 말고 hasCompanySeal은 null로 반환하라."
        ],
        "mergeSpec": {
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "hasRepresentativeName": {"type": "bool_field"},
            "hasCompanySeal": {"type": "bool_field"}
        },
    },

    "HEALTH_INSURANCE_ELIGIBILITY": {
        "label": "건강보험 자격득실 확인서",
        "group": "INCOME_EMPLOYEE",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "subscriberType": f(),
            "latestAcquisitionDate": f(),
            "latestLossDate": f(),
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="건강보험 자격득실 확인서 상단에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 본인 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 본인 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "subscriberType": {
                "source": make_source_crop("eligibility"),
                "extractor": make_extractor_single(
                    prompt="자격 정보 영역에서 최상단 가장 최신 자격 이력의 가입자 구분 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "latestAcquisitionDate": {
                "source": make_source_crop("eligibility"),
                "extractor": make_extractor_single(
                    prompt="자격 정보 영역에서 최상단 가장 최신 자격취득일 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "latestLossDate": {
                "source": make_source_crop("eligibility"),
                "extractor": make_extractor_single(
                    prompt="자격 정보 영역에서 최상단 가장 최신 자격취득일과 동일한 행의 자격상실일 1건만 추출하라. 없으면 null.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueNumber는 문서 상단의 발행번호 또는 문서확인번호 1건만 반환하라.",
            "name은 본인 이름 1건만 반환하라.",
            "residentRegistrationNumber는 본인 주민등록번호 1건만 반환하라.",
            "subscriberType은 가장 최신 자격 이력과 같은 행 또는 동일한 자격 정보 영역에서 확인되는 가입자 구분 1건만 반환하라.",
            "latestAcquisitionDate는 자격득실 이력 표에서 가장 최신 자격취득일 1건만 반환하라.",
            "latestLossDate는 latestAcquisitionDate와 동일한 행의 자격상실일만 반환하라.",
            "가장 최신 취득 이력에 상실일이 없으면 latestLossDate는 null로 반환하라.",
            "과거 이력의 상실일을 latestLossDate에 넣지 마라.",
            "표 헤더, 합계, 안내문, 기관 정보는 추출 대상에 포함하지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "subscriberType": {"type": "field"},
            "latestAcquisitionDate": {"type": "field"},
            "latestLossDate": {"type": "field"}
        },
    },

    "WITHHOLDING_TAX_CERTIFICATE": {
        "label": "근로소득 원천징수영수증",
        "group": "INCOME_EMPLOYEE",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "name": f(),
            "residentRegistrationNumber": f(),
            "workPeriod": f(),
            "annualIncomeTotal": f(),
        },
        "fields": {
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="근로소득 원천징수영수증 개인정보 영역에서 소득자 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="근로소득 원천징수영수증 개인정보 영역에서 소득자 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "workPeriod": {
                "source": make_source_crop("withholding_table"),
                "extractor": make_extractor_single(
                    prompt="원천징수 표 영역에서 근무기간 또는 귀속 대상 기간 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "annualIncomeTotal": {
                "source": make_source_crop("withholding_table"),
                "extractor": make_extractor_single(
                    prompt="원천징수 표 영역에서 16번 항목의 계의 항목 1건만 추출하라.",
                    parser="amount",
                    postprocess=["trim", "numeric_string"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "name은 소득자 이름 1건만 반환하라.",
            "residentRegistrationNumber는 소득자 주민등록번호 1건만 반환하라.",
            "workPeriod는 근무기간 또는 귀속 대상 기간 1건만 반환하라.",
            "annualIncomeTotal은 16번 항목의 계 또는 총급여 관련 합계값 1건만 반환하라.",
            "다른 합계 금액, 세액, 공제액, 납부세액은 annualIncomeTotal에 넣지 마라.",
            "여러 금액이 보여도 16번 항목과 직접 연결되는 값만 사용하라.",
            "소득자 정보가 아닌 원천징수의무자 정보는 incomeRecipientName이나 incomeRecipientResidentRegistrationNumber에 넣지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "workPeriod": {"type": "field"},
            "annualIncomeTotal": {"type": "field"}
        },
    },

    "SALARY_ACCOUNT_STATEMENT": {
        "label": "급여통장거래내역서",
        "group": "INCOME_EMPLOYEE",
        "extractStrategy": "PAGE_BY_PAGE",
        "mergeStrategy": "MERGE_SALARY_ACCOUNT_STATEMENT",
        "useCropTemplate": False,
        "schema": {
            "manualReviewRequired": f(),
        },
        "fields": {
            "manualReviewRequired": {
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt=(
                        "이 문서가 급여통장거래내역서로 확인되면 true, "
                        "확인할 수 없으면 null을 반환하라."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "급여통장거래내역서 문서가 확인되면 manualReviewRequired=true로 반환하라.",
            "문서 존재 여부 외의 거래 금액, 입금 횟수, 급여 여부 판단 등 다른 해석은 하지 마라."
        ],
        "mergeSpec": {
            "manualReviewRequired": {"type": "bool_field"}
        },
    },

    "INCOME_AMOUNT_CERTIFICATE": {
        "label": "소득금액증명원",
        "group": "INCOME_BUSINESS",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "issueDate": f(),
            "incomeYear": f(),
            "incomeAmount": f(),
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="소득금액증명원 상단에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 본인 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 본인 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "issueDate": {
                "source": make_source_crop("issue_date"),
                "extractor": make_extractor_single(
                    prompt="발급일자 영역에서 발급일자 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "incomeYear": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="header에서 귀속연도 1건만 추출하라.",
                    parser="year",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "incomeAmount": {
                "source": make_source_crop("income_info"),
                "extractor": make_extractor_single(
                    prompt="사업 컬럼에 해당하는 소득금액 1건만 추출하라.",
                    parser="amount",
                    postprocess=["trim", "numeric_string"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "name은 본인 이름 1건만 반환하라.",
            "residentRegistrationNumber는 본인 주민등록번호 1건만 반환하라.",
            "issueDate는 발급일자 1건만 반환하라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "issueDate": {"type": "field"},
            "incomeYear": {"type": "field"},
            "incomeAmount": {"type": "field"},
        },
    },

    "BUSINESS_REGISTRATION_CERTIFICATE": {
        "label": "사업자등록증명원",
        "group": "INCOME_BUSINESS",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "businessName": f(),
            "businessRegistrationNumber": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "issueDate": f(),
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="사업자등록증명원 상단에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "businessName": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="사업자 정보 영역에서 상호 또는 법인명 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "businessRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="사업자 정보 영역에서 사업자등록번호 1건만 추출하라.",
                    parser="biz_no",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="사업자 정보 영역에서 대표자 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="사업자 정보 영역에서 주민등록번호가 명확히 있을 때만 1건 추출하라. 없으면 null.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "issueDate": {
                "source": make_source_crop("issue_date"),
                "extractor": make_extractor_single(
                    prompt="하단 발급일자 영역에서 발급일자 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "businessName은 상호 또는 법인명 1건만 반환하라.",
            "businessRegistrationNumber는 사업자등록번호 1건만 반환하라.",
            "name은 대표자 이름 1건만 반환하라.",
            "residentRegistrationNumber는 주민등록번호가 명확히 있을 때만 반환하라.",
            "issueDate는 발급일자 1건만 반환하라.",
            "발급기관명이나 세무서 정보는 businessName에 넣지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "businessName": {"type": "field"},
            "businessRegistrationNumber": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "issueDate": {"type": "field"}
        },
    },

    "VAT_TAX_BASE_CERTIFICATE": {
        "label": "부가가치세과세표준증명",
        "group": "INCOME_BUSINESS",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "businessName": f(),
            "businessRegistrationNumber": f(),
            "issueDate": f(),
            "taxableSalesAmount": f(),
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="부가가치세과세표준증명 상단에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인/사업자 정보 영역에서 대표자명 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인/사업자 정보 영역에서 주민등록번호가 명확할 때만 1건 추출하라. 없으면 null.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "businessName": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인/사업자 정보 영역에서 상호 또는 사업자명 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "businessRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인/사업자 정보 영역에서 사업자등록번호 1건만 추출하라.",
                    parser="biz_no",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "issueDate": {
                "source": make_source_crop("issue_date"),
                "extractor": make_extractor_single(
                    prompt="발급일자 영역에서 발급일자 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "taxableSalesAmount": {
                "source": make_source_crop("tax_info"),
                "extractor": make_extractor_single(
                    prompt="세금 정보 영역에서 가장 상단 데이터 행의 과세표준 금액만 추출하라.",
                    parser="amount",
                    postprocess=["trim", "numeric_string"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "name은 대표자명 1건만 반환하라.",
            "residentRegistrationNumber는 주민등록번호가 명확히 있을 때만 반환하고, 없으면 null로 반환하라.",
            "businessName은 상호 또는 사업자명 1건만 반환하라.",
            "businessRegistrationNumber는 사업자등록번호 1건만 반환하라.",
            "issueDate는 발급일자 1건만 반환하라.",
            "taxableSalesAmount는 매출 과세표준 표의 가장 상단 또는 가장 최근 1개 데이터 행의 과세표준 금액만 반환하라.",
            "다른 세액, 납부세액, 합계, 비고 금액은 taxableSalesAmount에 넣지 마라.",
            "서로 다른 기간의 값을 섞지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "businessName": {"type": "field"},
            "businessRegistrationNumber": {"type": "field"},
            "issueDate": {"type": "field"},
            "taxableSalesAmount": {"type": "field"}
        },
    },

    "NATIONAL_TAX_CERTIFICATE": {
        "label": "국세 납세증명서",
        "group": "TAX",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "issueDate": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="국세 납세증명서 상단에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="국세 납세증명서 상단에서 납세자 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="국세 납세증명서 상단에서 납세자 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "issueDate": {
                "source": make_source_crop("issue_date"),
                "extractor": make_extractor_single(
                    prompt="하단 발급일자 영역에서 발급일자 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "issueDate는 발급일자 1건만 반환하라.",
            "name은 납세자 이름 1건만 반환하라.",
            "residentRegistrationNumber는 문서에 표시된 납세자의 주민등록번호 1건만 반환하라.",
            "다른 식별번호나 발급기관 번호는 residentRegistrationNumber에 넣지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "issueDate": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"}
        },
    },

    "LOCAL_TAX_CERTIFICATE": {
        "label": "지방세 납세증명서",
        "group": "TAX",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "issueDate": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="지방세 납세증명서 상단에서 발행번호 또는 문서확인번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 납세자 이름 1건만 추출하라.",
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 납세자 주민등록번호 1건만 추출하라.",
                    parser="rrn",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "issueDate": {
                "source": make_source_crop("issue_date"),
                "extractor": make_extractor_single(
                    prompt="발급일자 영역에서 발급일자 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "issueDate는 발급일자 1건만 반환하라.",
            "name은 납세자 이름 1건만 반환하라.",
            "residentRegistrationNumber는 문서에 표시된 납세자의 주민등록번호 1건만 반환하라.",
            "다른 식별번호나 발급기관 번호는 residentRegistrationNumber에 넣지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "issueDate": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"}
        },
    },

        "LOCAL_TAX_ITEM_CERTIFICATE": {
        "label": "지방세 세목별 과세증명",
        "group": "TAX",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": True,
        "schema": {
            "issueNumber": f(),
            "issueDate": f(),
            "name": f(),
            "residentRegistrationNumber": f(),
            "taxItems": [
                {
                    "taxItemName": f(),
                    "taxAmount": f(),
                    "remark": f(),
                }
            ],
        },
        "fields": {
            "issueNumber": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="header 상단에서 발급번호 1건만 추출하라",
                    parser="text",
                ),
                "outputType": "field",
            },
            "issueDate": {
                "source": make_source_crop("issue_date"),
                "extractor": make_extractor_single(
                    prompt="발급일자 영역에서 발급일자 1건만 추출하라.",
                    parser="date",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "name": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 납세자 성명 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "residentRegistrationNumber": {
                "source": make_source_crop("personal_info"),
                "extractor": make_extractor_single(
                    prompt="개인정보 영역에서 납세자 주민등록번호 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "taxItems": {
                "source": make_source_crop("tax_info"),
                "extractor": make_extractor_list(
                    prompt=(
                        "세목별 표에서 실제 데이터 행만 추출하라. "
                        "세목, 세액, 비고 행만 각각 taxItemName, taxAmount, remark에 매칭하여 추출하라. "
                        "표 헤더, 주석, 안내문은 제외하라. "
                        "taxAmount는 숫자값만 반환하라."
                    ),
                    parser="json",
                    item_schema={
                        "taxItemName": f(),
                        "taxAmount": f(),
                        "remark": f(),
                    },
                    dedup_keys=["taxItemName.value", "taxAmount.value", "remark.value"],
                    postprocess=["dedup"],
                ),
                "outputType": "list",
            },
        },
        "rules": [
            "issueNumber는 발행번호 또는 문서확인번호 1건만 반환하라.",
            "issueDate는 발급일자 1건만 반환하라.",
            "name은 납세자 이름 1건만 반환하라.",
            "residentRegistrationNumber는 문서에 표시된 납세자의 주민등록번호 1건만 반환하라.",
            "다른 식별번호나 발급기관 번호는 residentRegistrationNumber에 넣지 마라.",
            "taxItems에는 세목별 과세 내역 표의 유효한 행만 넣어라.",
            "taxItems에는 taxItemName이 재산세 또는 자동차세로 확인되는 행만 포함하라.",
            "taxItemName이 없거나 비어 있는 행은 taxItems에 넣지 마라.",
            "taxAmount는 해당 taxItemName과 같은 행의 금액만 넣어라.",
            "remark는 같은 행의 비고 또는 참고란이 있을 때만 넣고, 없으면 null로 두어라.",
            "표 헤더, 합계, 총계, 소계, 주석, 안내문은 taxItems에 넣지 마라.",
            "중복되는 세목 행은 한 번만 포함하라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "issueNumber": {"type": "field"},
            "issueDate": {"type": "field"},
            "name": {"type": "field"},
            "residentRegistrationNumber": {"type": "field"},
            "taxItems": {
                "type": "list",
                "dedupKeys": [
                    "taxItemName.value",
                    "taxAmount.value"
                ]
            }
        },
    },

        "TITLE_DEED": {
        "label": "등기사항전부증명서",
        "group": "PROPERTY_HOUSING",
        "extractStrategy": "SECTION_SPLIT",
        "mergeStrategy": "MERGE_TITLE_DEED",
        "useCropTemplate": False,
        "useSectionSplitter": True,
        "schema": {
            "registrationType": f(),   # 구분유형 (집합건물, 일반건물, 토지)
            "buildingType": f(),       # 건물유형
            "hasDongho": f(),          # 구분등기 -> 동호수 구분으로 확인
            "lotAddress": f(),         # 소재지 주소 -> 도로명주소
            "hasLandRightCause": f(),  # 대지권의등기에서 별도 등기 여부 확인
            "hasOwnershipTransferClaim": f(),  # 소유권이전청구가등기 여부 확인
            "hasTrustRegistration": f(),       # 신탁등기 여부 확인
            "ownerName": f(),          # 소유권 확인
            "deposit": {
                "hasDeposit": f(),         # 임차보증금 여부
                "depositAmount": f(),      # 임차보증금 금액, hasDeposit이 false면 55,000,000
            },
            "seniorRights": [
                {
                    "maximumClaimAmount": f(),  # 채권최고액 금액 추출
                }
            ],
        },
        "fields": {
            "registrationType": {
                "description": "등기 구분 유형",
                "source": make_source_split_section("header"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 상단 header 영역에서 문서 구분 유형을 1개만 판단하라. "
                        "반환값은 반드시 집합건물, 일반건물, 토지 중 하나 또는 null이어야 한다. "
                        "집합건물 등기부면 집합건물, 일반건물 등기부면 일반건물, 토지 등기부면 토지로 반환하라."
                    ),
                    parser="enum",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "buildingType": {
                "description": "표제부 기준 건물 종류",
                "source": make_source_split_section("title_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 표제부 영역에서 건물 유형 또는 건물 종류 1건만 추출하라. "
                        "예: 아파트, 연립주택, 다세대주택, 오피스텔, 단독주택 등. "
                        "토지만 있는 문서면 null."
                    ),
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "hasDongho": {
                "description": "집합건물의 동호수 기재 여부",
                "source": make_source_split_section("title_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 header 영역에서 동 또는 호수 기재 여부를 판단하라."
                        "집합건물이고 동 또는 호수 정보가 명확히 기재되어 있으면 true, "
                        "집합건물이지만 동호수 기재가 없으면 false, "
                        "집합건물이 아니면 null."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
            "lotAddress": {
                "description": "표제부의 도로명주소 기준 소재지",
                "source": make_source_split_section("title_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 표제부 영역에서 '소재지번 및 건물명칭,번호' 컬럼의 '도로명주소' 하단의 소재지 전체 주소 1건만 추출하라. "
                        "동, 층, 호가 명확하면 포함하라. 불명확하면 null."
                    ),
                    parser="address",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "hasLandRightCause": {
                "description": "대지권 관련 별도 등기 여부",
                "source": make_source_split_section("title_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 표제부 영역의 대지권 관련 기재사항, 등기원인, 기타사항 등을 보고 "
                        "별도 등기에 대한 대지권 또는 별도 등기 관련 문구가 명확히 있으면 true, "
                        "없으면 false, 불명확하면 null."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
            "hasOwnershipTransferClaim": {
                "description": "갑구의 소유권이전청구가등기 여부",
                "source": make_source_split_section("gap_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 갑구 영역에서 등기목적에 '소유권이전청구가등기'가 현재 유효하게 존재하면 true, "
                        "없으면 false, 불명확하면 null."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
            "hasTrustRegistration": {
                "description": "갑구의 신탁등기 여부",
                "source": make_source_split_section("gap_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 갑구 영역에서 등기목적에 '신탁' 또는 신탁등기가 현재 유효하게 존재하면 true, "
                        "없으면 false, 불명확하면 null."
                    ),
                    parser="bool",
                ),
                "outputType": "field",
            },
            "ownerName": {
                "description": "현재 유효한 소유권자 이름",
                "source": make_source_split_section("gap_section"),
                "extractor": make_extractor_single(
                    prompt=(
                        "등기사항전부증명서 갑구 영역에서 현재 유효한 소유권자 이름 1건만 추출하라. "
                        "등기목적이 소유권 보존 등 현재 유효한 소유권을 나타내는 항목만 사용하라. "
                        "과거 소유자, 말소된 권리자, 참고용 이름은 제외하라. "
                        "명확하지 않으면 null."
                    ),
                    parser="name",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "deposit": {
                "description": "을구의 임차보증금 여부 및 금액",
                "source": make_source_split_section("eul_section"),
                "extractor": make_extractor_object(
                    prompt=(
                        "등기사항전부증명서 을구 영역의 선순위 권리 항목을 보고 "
                        "등기목적, 권리내용, 기타사항, 관리자 및 기타사항 등에서 '임차보증금'이 명확히 확인되면 "
                        "hasDeposit=true로 하고 depositAmount에 해당 금액을 반환하라. "
                        "임차보증금이 확인되지 않으면 hasDeposit=false를 반환하라. "
                        "판단이 불명확하면 hasDeposit=null, depositAmount=null."
                    ),
                    parser="json",
                    fields={
                        "hasDeposit": f(),
                        "depositAmount": f(),
                    },
                ),
                "outputType": "object",
            },
            "seniorRights": {
                "description": "을구의 선순위 권리 중 채권최고액 목록",
                "source": make_source_split_section("eul_section"),
                "extractor": make_extractor_list(
                    prompt=(
                        "등기사항전부증명서 을구 영역의 선순위 권리 항목 중 채권최고액이 명확히 확인되는 권리만 추출하라. "
                        "각 항목은 maximumClaimAmount만 포함하라. "
                        "임차보증금 항목은 제외하라. "
                        "말소되었거나 무효인 항목은 제외하라. "
                        "금액은 숫자만 반환하라."
                    ),
                    parser="json",
                    item_schema={
                        "maximumClaimAmount": f(),
                    },
                    dedup_keys=["maximumClaimAmount.value"],
                    postprocess=["dedup"],
                ),
                "outputType": "list",
            },
        },
        "rules": [
            "registrationType은 일반건물, 집합건물, 토지 중 문서에 명확히 해당하는 1개만 반환하라.",
            "buildingType은 표제부의 건물 종류 1건만 반환하라.",
            "lotAddress는 표제부의 소재지번 및 건물명칭,번호 컬럼의 [도로명주소] 하단의 소재지 전체 주소 1건만 반환하라.",
            "hasDongho는 표제부 상단의 주소에 호수 기재가 명확히 있으면 true, 없으면 false로 반환하라.",
            "집합건물이 아니면 hasDongho는 null로 반환하라.",
            "hasLandRightCause는 표제부의 대지권 관련 등기원인 또는 기타사항에 별도 등기에 대한 대지권 혹은 등기 내용이 명확히 있으면 true, 없으면 false로 반환하라.",
            "판단이 불명확하면 hasLandRightCause는 null로 반환하라.",
            "hasOwnershipTransferClaim는 갑구 등기목적에 소유권이전청구가등기가 명확히 있으면 true, 없으면 false로 반환하라.",
            "hasTrustRegistration는 갑구 등기목적에 신탁등기가 명확히 있으면 true, 없으면 false로 반환하라.",
            "ownerName은 갑구에서 등기목적은 소유권 보존이며, 현재 유효한 소유권자를 명확히 확인할 수 있을 때만 반환하라.",
            "과거 소유자, 말소된 권리자, 참고용 이름은 ownerName에 넣지 마라.",
            "deposit에는 을구의 선순위 권리 항목 중 등기목적 혹은 관리자 및 기타사항에 임차보증금 이 명확히 존재할 때 hasDeposit을 true로 반환하고 해당 금액을 depositAmount에 반환하라.",
            "만약 을구의 선순위권리 항목 중 임차보증금이 확인되지 않으면 hasDeposit은 false, depositAmount는 null을 반환하라.",
            "seniorRights에는 선순위 권리 항목의 채권최고액만 넣어라.",
            "seniorRights에 임차보증금 항목은 포함하지 마라.",
            "채권최고액이 명확히 확인되는 권리만 seniorRights에 포함하라.",
            "권리관계가 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "registrationType": {"type": "field"},
            "buildingType": {"type": "field"},
            "hasDongho": {"type": "bool_field"},
            "lotAddress": {"type": "field"},
            "hasLandRightCause": {"type": "bool_field"},
            "hasOwnershipTransferClaim": {"type": "bool_field"},
            "hasTrustRegistration": {"type": "bool_field"},
            "ownerName": {"type": "field"},
            "deposit": {
                "type": "object",
                "fields": {
                    "hasDeposit": {"type": "bool_field"},
                    "depositAmount": {"type": "field"},
                }
            },
            "seniorRights": {
                "type": "list",
                "dedupKeys": [
                    "maximumClaimAmount.value"
                ]
            }
        },
    },

    
    "BUILDING_REGISTER": {
        "label": "집합건축물대장",
        "group": "PROPERTY_HOUSING",
        "extractStrategy": "PAGE_BY_PAGE",
        "mergeStrategy": "MERGE_BUILDING_REGISTER",
        "useCropTemplate": True,
        "schema": {
            "isViolationBuilding": f(),
            "mainUsage": f(),
            "floorStatusList": [
                {
                    "floor": f(),
                    "usage": f(),
                    "area": f(),
                }
            ],
        },
        "fields": {
            "isViolationBuilding": {
                "source": make_source_crop("header"),
                "extractor": make_extractor_single(
                    prompt="집합건축물대장 상단에서 위반건축물 여부를 추출하라. 있으면 true, 없으면 false.",
                    parser="bool",
                ),
                "outputType": "field",
            },
            "mainUsage": {
                "source": make_source_crop("building_info"),
                "extractor": make_extractor_single(
                    prompt="건물 요약 정보 영역에서 주용도에 해당하는 내용 1건만 추출하라.",
                    parser="text",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "floorStatusList": {
                "source": make_source_crop("building_spec"),
                "extractor": make_extractor_list(
                    prompt=(
                        "층별 현황 표 영역에서 실제 데이터 행만 추출하라. "
                        "층, 용도, 면적 행만 각각 floor, usage, area에 매칭하여 추출하라. "
                        "표 헤더, 주석, 안내문은 제외하라. "
                        "area는 숫자값만 반환하라."
                    ),
                    parser="json",
                    item_schema={
                        "floor": f(),
                        "usage": f(),
                        "area": f(),
                    },
                    dedup_keys=["floor.value", "usage.value", "area.value"],
                    postprocess=["dedup"],
                ),
                "outputType": "list",
            },
        },
        "rules": [
            "isViolationBuilding은 위반건축물 여부가 명시되어 있을 때만 true 또는 false로 반환하라.",
            "위반건축물 여부를 확인할 수 없으면 isViolationBuilding은 null로 반환하라.",
            "mainUsage는 문서 상단 요약 영역의 주용도 1건만 반환하라.",
            "floorStatusList에는 층별 현황 표의 실제 데이터 행만 넣어라.",
            "표 헤더, 주석, 요약 문구, 안내문은 floorStatusList에 넣지 마라.",
            "각 행의 floor는 층별 컬럼의 정보만 반환하라. 구조 정보, 구분, 동호수, 기타 문구는 넣지 마라.",
            "각 행의 usage는 용도 컬럼의 정보만 반환하라. 구조 정보나 비고 문구는 넣지 마라.",
            "각 행의 area는 면적 값만 반환하고 단위는 제거하라.",
            "floor, usage, area 중 하나라도 전혀 식별되지 않는 행은 제외하라.",
            "층별 현황 표가 여러 페이지에 있으면 페이지 순서대로 유효 행을 모두 반환하라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "isViolationBuilding": {"type": "bool_field"},
            "mainUsage": {"type": "field"},
            "floorStatusList": {
                "type": "list",
                "dedupKeys": [
                    "floor.value",
                    "usage.value",
                    "area.value"
                ]
            }
        },
    },

    "SALE_CONTRACT": {
        "label": "매매계약서",
        "group": "PROPERTY_HOUSING",
        "extractStrategy": "MULTI_PAGE_SINGLE_CALL",
        "mergeStrategy": "DEFAULT_SINGLE",
        "useCropTemplate": False,
        "useSectionSplitter": False,
        "schema": {
            "propertyAddress": f(),
            "salePrice": f(),
            "specialTerms": f(),
            "seller": {
                "name": f(),
            },
            "buyer": {
                "name": f(),
            },
        },
        "fields": {
            "propertyAddress": {
                "description": "매매 목적물 주소",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt=(
                        "매매계약서 전체 문서에서 부동산 표시 또는 목적물 주소 1건만 추출하라. "
                        "시/도, 군/구, 동, 층, 호가 있으면 포함하라. 불명확하면 null."
                    ),
                    parser="address",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "salePrice": {
                "description": "총 매매대금",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt=(
                        "매매계약서 전체 문서에서 총 매매대금 1건만 추출하라. "
                        "계약금, 중도금, 잔금은 제외하고 전체 총액만 반환하라. "
                        "숫자만 반환하라. 불명확하면 null."
                    ),
                    parser="amount",
                    postprocess=["trim", "numeric_string"],
                ),
                "outputType": "field",
            },
            "specialTerms": {
                "description": "특약사항 원문",
                "source": make_source_full(),
                "extractor": make_extractor_single(
                    prompt=(
                        "매매계약서 전체 문서에서 특약사항 영역의 원문을 최대한 유지하여 추출하라. "
                        "특약사항이 없거나 식별되지 않으면 null."
                    ),
                    parser="text_block",
                    postprocess=["trim"],
                ),
                "outputType": "field",
            },
            "seller": {
                "description": "매도인 정보",
                "source": make_source_full(),
                "extractor": make_extractor_object(
                    prompt=(
                        "매매계약서 전체 문서에서 매도인 이름을 추출하라. "
                        "결과는 name만 포함하라. "
                        "중개인, 대리인, 참고인 이름은 제외하라. "
                        "불명확하면 name=null."
                    ),
                    parser="json",
                    fields={
                        "name": f(),
                    },
                ),
                "outputType": "object",
            },
            "buyer": {
                "description": "매수인 정보",
                "source": make_source_full(),
                "extractor": make_extractor_object(
                    prompt=(
                        "매매계약서 전체 문서에서 매수인 이름를 추출하라. "
                        "결과는 name만 포함하라. "
                        "중개인, 대리인, 참고인 이름은 제외하라. "
                        "불명확하면 name=null."
                    ),
                    parser="json",
                    fields={
                        "name": f(),
                    },
                ),
                "outputType": "object",
            },
        },
        "rules": [
            "propertyAddress는 부동산 표시 또는 목적물 주소 1건만 반환하라.",
            "salePrice는 총 매매대금 1건만 반환하라.",
            "계약금, 중도금, 잔금은 salePrice에 넣지 마라.",
            "specialTerms는 특약사항 영역의 원문을 최대한 유지하여 반환하라.",
            "특약사항이 없거나 식별되지 않으면 specialTerms는 null로 반환하라.",
            "seller.name은 매도인 이름 1건만 반환하라.",
            "buyer.name은 매수인 이름 1건만 반환하라.",
            "중개인, 대리인, 참고인 이름은 seller.name이나 buyer.name에 넣지 마라.",
            "값이 불명확하면 추정하지 말고 null로 반환하라."
        ],
        "mergeSpec": {
            "propertyAddress": {"type": "field"},
            "salePrice": {"type": "field"},
            "specialTerms": {"type": "field"},
            "seller": {
                "type": "object",
                "fields": {
                    "name": {"type": "field"}
                }
            },
            "buyer": {
                "type": "object",
                "fields": {
                    "name": {"type": "field"}
                }
            }
        }
    }
}


def get_doc_config(doc_type: str) -> dict:
    return deepcopy(DOC_CONFIG[doc_type])


def get_doc_label(doc_type: str) -> Optional[str]:
    config = DOC_CONFIG.get(doc_type)
    if not config:
        return None
    return config.get("label")


def get_field_config(doc_type: str, field_name: str) -> dict:
    config = DOC_CONFIG[doc_type]
    fields = config.get("fields", {})
    if field_name not in fields:
        raise KeyError(f"field config not found: doc_type={doc_type}, field={field_name}")
    return deepcopy(fields[field_name])


def get_all_field_configs(doc_type: str) -> Dict[str, dict]:
    config = DOC_CONFIG[doc_type]
    return deepcopy(config.get("fields", {}))


def build_extraction_plan(doc_type: str) -> List[dict]:
    """
    extractor_service에서 바로 돌릴 수 있도록
    문서별 필드 추출 실행계획을 생성한다.
    """
    config = get_doc_config(doc_type)
    fields = config.get("fields", {})

    plan = []
    for field_name, field_conf in fields.items():
        plan.append({
            "fieldName": field_name,
            "description": field_conf.get("description"),
            "source": field_conf.get("source", {}),
            "extractor": field_conf.get("extractor", {}),
            "required": field_conf.get("required", False),
            "outputType": field_conf.get("outputType", "field"),
        })
    return plan


def build_empty_content_from_schema(schema: Any):
    if isinstance(schema, dict):
        if {"value", "confidence", "evidence"}.issubset(schema.keys()):
            return {
                "value": None,
                "confidence": None,
                "evidence": {
                    "pageNum": None,
                    "bbox": None,
                    "rawText": None,
                    "confidence": None,
                },
            }
        return {key: build_empty_content_from_schema(value) for key, value in schema.items()}

    if isinstance(schema, list):
        return []

    return None


def build_empty_content(doc_type: str) -> dict:
    config = get_doc_config(doc_type)
    return build_empty_content_from_schema(config["schema"])


def validate_doc_registry() -> List[str]:
    """
    최소 정합성 검사용.
    실행 시 에러 리스트 반환.
    """
    errors: List[str] = []

    for doc_type, config in DOC_CONFIG.items():
        if "schema" not in config:
            errors.append(f"{doc_type}: missing schema")
        if "fields" not in config:
            errors.append(f"{doc_type}: missing fields")
            continue

        for field_name, field_conf in config["fields"].items():
            if "source" not in field_conf:
                errors.append(f"{doc_type}.{field_name}: missing source")
            if "extractor" not in field_conf:
                errors.append(f"{doc_type}.{field_name}: missing extractor")

            source = field_conf.get("source", {})
            source_type = source.get("type")
            if source_type not in {"full_document", "crop_section", "split_section"}:
                errors.append(f"{doc_type}.{field_name}: invalid source.type={source_type}")
            
            if source_type == "crop_section" and "cropSection" not in source:
                errors.append(f"{doc_type}.{field_name}: crop_section source missing cropSection")
            
            if source_type == "split_section" and "sectionName" not in source:
                errors.append(f"{doc_type}.{field_name}: split_section source missing sectionName")

            extractor = field_conf.get("extractor", {})
            extractor_type = extractor.get("type")
            if extractor_type not in {"single", "object", "list"}:
                errors.append(f"{doc_type}.{field_name}: invalid extractor.type={extractor_type}")

            if source_type == "crop_section" and "cropSection" not in source:
                errors.append(f"{doc_type}.{field_name}: crop_section source missing cropSection")

    return errors