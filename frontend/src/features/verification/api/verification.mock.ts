import { VerificationServerResponse } from '@/entities/verification/model/types';

/**
 * @feature verification/api/mock
 * 실제 백엔드 응답 규격을 100% 재현한 13종 서류 풀 스케일 목업 데이터입니다.
 */
export const MOCK_VERIFICATION_RESPONSE: VerificationServerResponse = {
  data: {
    documents: [
      /* --- 1. 본인 확인 및 가족 관계 (IDENTITY_FAMILY) --- */
      {
        fileId: "FILE_001",
        fileName: "주민등록등본_01.pdf",
        fileUrl: "/test-docs/이선휘 주민등록 초 본.pdf",
        // TODO: 백엔드 협의 결과에 따라 실제 해상도 수치로 교체 필요
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "RESIDENT_REGISTRATION",
          documentTypeLabel: "주민등록등본"
        },
        extraction: {
          content: {
            issueDate: { value: "2026-03-13", confidence: 0.99, evidence: { pageNum: 1, bbox: [420, 120, 560, 150], rawText: "2026.03.13" } },
            issueNumber: { value: "2026-123456-7890", confidence: 0.97, evidence: { pageNum: 1, bbox: [410, 160, 620, 190], rawText: "2026-123456-7890" } },
            headOfHouseholdName: { value: "홍길동", confidence: 0.98, evidence: { pageNum: 1, bbox: [160, 250, 280, 280], rawText: "홍길동" } },
            householdMembers: [
              {
                name: { value: "홍길동", confidence: 0.98, evidence: { pageNum: 1, bbox: [150, 380, 240, 410], rawText: "홍길동" } },
                residentRegistrationNumber: { value: "900101-1******", confidence: 0.95, evidence: { pageNum: 1, bbox: [300, 380, 470, 410], rawText: "900101-1******" } }
              },
              {
                name: { value: "김영희", confidence: 0.97, evidence: { pageNum: 1, bbox: [150, 420, 240, 450], rawText: "김영희" } },
                residentRegistrationNumber: { value: "920202-2******", confidence: 0.94, evidence: { pageNum: 1, bbox: [300, 420, 470, 450], rawText: "920202-2******" } }
              }
            ]
          }
        }
      },
      {
        fileId: "FILE_002",
        fileName: "주민등록초본_01.pdf",
        fileUrl: "/test-docs/이선휘 주민등록 초 본.pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "RESIDENT_REGISTRATION_ABSTRACT",
          documentTypeLabel: "주민등록초본"
        },
        extraction: {
          content: {
            issueDate: { value: "2026-03-13", confidence: 0.99, evidence: { pageNum: 1, bbox: [415, 118, 558, 149], rawText: "2026.03.13" } },
            address: { value: "서울특별시 구로구 디지털로 123, 101동 1001호", confidence: 0.95, evidence: { pageNum: 1, bbox: [145, 260, 640, 300], rawText: "서울특별시 구로구 디지털로 123, 101동 1001호" } }
          }
        }
      },
      {
        fileId: "FILE_003",
        fileName: "가족관계증명서_01.pdf",
        fileUrl: "/test-docs/(참고) 13기 멘티 활동 일지_금융특화(핀테크).pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "FAMILY_RELATION_CERTIFICATE",
          documentTypeLabel: "가족관계증명서"
        },
        extraction: {
          content: {
            name: { value: "홍길동", confidence: 0.98, evidence: { pageNum: 1, bbox: [160, 220, 270, 255], rawText: "홍길동" } },
            residentRegistrationNumber: { value: "900101-1******", confidence: 0.95, evidence: { pageNum: 1, bbox: [300, 220, 470, 255], rawText: "900101-1******" } },
            spouse: {
              name: { value: "김영희", confidence: 0.97, evidence: { pageNum: 1, bbox: [180, 320, 270, 350], rawText: "김영희" } }
            }
          }
        }
      },

      /* --- 2. 소득 및 재직증빙 (INCOME_EMPLOYEE) --- */
      {
        fileId: "FILE_004",
        fileName: "재직증명서_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "EMPLOYMENT_CERTIFICATE",
          documentTypeLabel: "재직증명서"
        },
        extraction: {
          content: {
            name: { value: "홍길동", confidence: 0.98, evidence: { pageNum: 1, bbox: [160, 220, 270, 255], rawText: "홍길동" } },
            companyName: { value: "(주)에이든테크", confidence: 0.96, evidence: { pageNum: 1, bbox: [160, 300, 400, 330], rawText: "(주)에이든테크" } }
          }
        }
      },
      {
        fileId: "FILE_005",
        fileName: "건강보험_자격득실_01.pdf",
        fileUrl: "/test-docs/교육필증 (2).pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "HEALTH_INSURANCE_ELIGIBILITY",
          documentTypeLabel: "건강보험 자격득실 확인서"
        },
        extraction: {
          content: {
            name: { value: "홍길동", confidence: 0.99, evidence: { pageNum: 1, bbox: [180, 220, 270, 250], rawText: "홍길동" } },
            residentRegistrationNumber: { value: "900101-1******", confidence: 0.95, evidence: { pageNum: 1, bbox: [300, 220, 470, 250], rawText: "900101-1******" } }
          }
        }
      },

      /* --- 3. 세금 납부 증빙 (TAX) --- */
      {
        fileId: "FILE_006",
        fileName: "국세_완납증명서_01.pdf",
        fileUrl: "/test-docs/명세서.pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "TAX",
          documentType: "NATIONAL_TAX_CERTIFICATE",
          documentTypeLabel: "납세증명서(국세완납)"
        },
        extraction: {
          content: {
            name: { value: "홍길동", confidence: 0.97, evidence: { pageNum: 1, bbox: [180, 220, 260, 252], rawText: "홍길동" } }
          }
        }
      },
      {
        fileId: "FILE_007",
        fileName: "지방세_납세증명서_01.pdf",
        fileUrl: "/test-docs/A406_GPU_서버_신청서.pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "TAX",
          documentType: "LOCAL_TAX_CERTIFICATE",
          documentTypeLabel: "지방세 납세증명서"
        },
        extraction: {
          content: {
            name: { value: "홍길동", confidence: 0.97, evidence: { pageNum: 1, bbox: [180, 220, 260, 252], rawText: "홍길동" } }
          }
        }
      },
      {
        fileId: "FILE_008",
        fileName: "지방세_세목별_과세증명_01.pdf",
        fileUrl: "/test-docs/260304_예비군교육필증_이선휘[서울_4반].pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "TAX",
          documentType: "LOCAL_TAX_ITEM_CERTIFICATE",
          documentTypeLabel: "지방세 세목별 과세증명"
        },
        extraction: {
          content: {
            name: { value: "홍길동", confidence: 0.97, evidence: { pageNum: 1, bbox: [180, 220, 260, 252], rawText: "홍길동" } }
          }
        }
      },

      /* --- 4. 주택 및 권리관계 (PROPERTY_HOUSING) --- */
      {
        fileId: "FILE_009",
        fileName: "등기권리증_01.pdf",
        fileUrl: "/test-docs/[별표 8] 주택관련 담보대출 등에 대한 리스크관리 세부기준(제3조의2관련)(여신전문금융업감독업무시행세칙).pdf",
        resolution: { width: 1240, height: 1754 },
        status: "PARTIAL_SUCCESS",
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "TITLE_DEED",
          documentTypeLabel: "등기권리증"
        },
        extraction: {
          content: {
            ownerName: { value: "김철수", confidence: 0.95, evidence: { pageNum: 1, bbox: [150, 450, 240, 480], rawText: "김철수" } },
            lotAddress: { value: "서울특별시 구로구 구로동 123-45", confidence: 0.94, evidence: { pageNum: 1, bbox: [150, 240, 600, 275], rawText: "서울특별시 구로구 구로동 123-45" } }
          }
        }
      },
      {
        fileId: "FILE_010",
        fileName: "집합건축물대장_01.pdf",
        fileUrl: "/test-docs/sub01_sub01_02_01_250101.pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "BUILDING_REGISTER",
          documentTypeLabel: "집합건축물대장"
        },
        extraction: {
          content: {
            mainUsage: { value: "공동주택(아파트)", confidence: 0.97, evidence: { pageNum: 1, bbox: [150, 240, 350, 270], rawText: "공동주택(아파트)" } }
          }
        }
      },
      {
        fileId: "FILE_011",
        fileName: "매매계약서_01.pdf",
        fileUrl: "/test-docs/[삼성화재해상보험]사업보고서(2026.03.12).pdf",
        resolution: { width: 1240, height: 1754 },
        status: "PARTIAL_SUCCESS",
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "SALE_CONTRACT",
          documentTypeLabel: "매매계약서"
        },
        extraction: {
          content: {
            buyer: {
              name: { value: "홍길순", confidence: 0.96, evidence: { pageNum: 1, bbox: [430, 430, 510, 460], rawText: "홍길순" } } // 🔴 [정합성 오류]
            },
            address: { value: "울특별시 구로구 디지털로 123, 101동 1001호", confidence: 0.94, evidence: { pageNum: 1, bbox: [140, 250, 620, 290], rawText: "서울특별시 구로구 디지털로 123, 101동 1001호" } }
          }
        }
      },
      {
        fileId: "FILE_012",
        fileName: "전입세대열람내역서_01.pdf",
        fileUrl: "/test-docs/A403_중간발표자료.pdf",
        resolution: { width: 1240, height: 1754 },
        status: "SUCCESS",
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "MOVE_IN_HOUSEHOLD_REPORT",
          documentTypeLabel: "전입세대열람내역서"
        },
        extraction: {
          content: {
            printedAt: { value: "2025-12-01T09:42:18+09:00", confidence: 0.97, evidence: { pageNum: 1, bbox: [390, 108, 620, 142], rawText: "2025.12.01 09:42:18" } }, // 🟡 [위험 요소]
            address: { value: "서울특별시 구로구 디지털로 123, 101동 1001호", confidence: 0.95, evidence: { pageNum: 1, bbox: [150, 220, 640, 255], rawText: "서울특별시 구로구 디지털로 123, 101동 1001호" } }
          }
        }
      }
    ],
    validationResult: {
      documentMissings: [
        { documentType: "WITHHOLDING_TAX_CERTIFICATE", documentTypeLabel: "근로소득 원천징수영수증" }
      ],
      violations: [
        { documentType: "SALE_CONTRACT", documentTypeLabel: "매매계약서", fields: ["buyer_name"] }, 
        { documentType: "MOVE_IN_HOUSEHOLD_REPORT", documentTypeLabel: "전입세대열람내역서", fields: ["address"] },
        { documentType: "SALE_CONTRACT", documentTypeLabel: "매매계약서", fields: ["address"] },
        { documentType: "RESIDENT_REGISTRATION_ABSTRACT", documentTypeLabel: "주민등록초본", fields: ["address"] }
      ],
      risks: [
        { documentType: "BUILDING_REGISTER", documentTypeLabel: "집합건축물대장", fields: ["mainUsage"] }
      ]
    }
  }
};
