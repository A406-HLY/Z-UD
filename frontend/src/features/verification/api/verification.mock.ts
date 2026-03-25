import { VerificationServerResponse } from '@/entities/verification/model/types';

/**
 * @feature verification/api/mock
 * 실제 백엔드 응답 규격을 100% 재현한 13종 서류 풀 스케일 목업 데이터입니다.
 */
export const MOCK_VERIFICATION_RESPONSE: VerificationServerResponse = {
  data: {
    // TODO: 백엔드 협의 결과에 따라 실제 해상도 수치로 교체 필요
    resolution: { width: 1240, height: 1754 },
    documents: [
      {
        fileId: "FILE_001",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/resident_registration_01.pdf",
        fileName: "resident_registration_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "RESIDENT_REGISTRATION",
          documentTypeLabel: "주민등록등본",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueDate: {
              value: "2026-03-13",
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: [420, 120, 560, 150],
                rawText: "2026.03.13",
                confidence: 0.99
              }
            },
            issueNumber: {
              value: "2026-123456-7890",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [410, 160, 620, 190],
                rawText: "2026-123456-7890",
                confidence: 0.97
              }
            },
            householdMembers: [
              {
                name: {
                  value: "홍길동",
                  confidence: 0.98,
                  evidence: {
                    pageNum: 1,
                    bbox: [150, 380, 240, 410],
                    rawText: "홍길동",
                    confidence: 0.98
                  }
                },
                residentRegistrationNumber: {
                  value: "900101-1******",
                  confidence: 0.95,
                  evidence: {
                    pageNum: 1,
                    bbox: [300, 380, 470, 410],
                    rawText: "900101-1******",
                    confidence: 0.95
                  }
                }
              },
              {
                name: {
                  value: "김영희",
                  confidence: 0.97,
                  evidence: {
                    pageNum: 1,
                    bbox: [150, 420, 240, 450],
                    rawText: "김영희",
                    confidence: 0.97
                  }
                },
                residentRegistrationNumber: {
                  value: "920202-2******",
                  confidence: 0.94,
                  evidence: {
                    pageNum: 1,
                    bbox: [300, 420, 470, 450],
                    rawText: "920202-2******",
                    confidence: 0.94
                  }
                }
              }
            ]
          }
        },
        rawText: "주민등록표 등본 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_001_PAGE2",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/resident_registration_01_p2.pdf",
        fileName: "resident_registration_01_p2.pdf",
        fileUrl: "/test-docs/SGR 직무소개서_IT서비스 기획 운영 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "RESIDENT_REGISTRATION",
          documentTypeLabel: "주민등록등본",
          classificationConfidence: 0.99
        },
        extraction: {
          content: {
            additionalInfo: {
              value: "2페이지 하단 추가 정보 확인됨",
              confidence: 0.95,
              evidence: {
                pageNum: 2,
                bbox: [300, 420, 470, 450],
                rawText: "추가 정보",
                confidence: 0.95
              }
            }
          }
        },
        rawText: "주민등록표 등본 2페이지 OCR 원문",
        pages: [
          {
            pageNum: 2
          }
        ]
      },
      {
        fileId: "FILE_002",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/resident_registration_abstract_01.pdf",
        fileName: "resident_registration_abstract_01.pdf",
        fileUrl: "/test-docs/26상_삼성생명_직군소개서.pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "RESIDENT_REGISTRATION_ABSTRACT",
          documentTypeLabel: "주민등록초본",
          classificationConfidence: 0.97
        },
        extraction: {
          content: {
            issueDate: {
              value: "2026-03-13",
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: [415, 118, 558, 149],
                rawText: "2026.03.13",
                confidence: 0.99
              }
            },
            issueNumber: {
              value: "2026-223344-5566",
              confidence: 0.96,
              evidence: {
                pageNum: 1,
                bbox: [410, 158, 612, 188],
                rawText: "2026-223344-5566",
                confidence: 0.96
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [160, 220, 270, 255],
                rawText: "홍길동",
                confidence: 0.98
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 255],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            currentAddress: {
              value: "서울특별시 구로구 디지털로 123, 101동 1001호",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [145, 260, 640, 300],
                rawText: "서울특별시 구로구 디지털로 123, 101동 1001호",
                confidence: 0.95
              }
            },
            moveInDate: {
              value: null,
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: null,
                rawText: "",
                confidence: 0.99
              }
            }
          }
        },
        rawText: "주민등록초본 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_003",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/family_relation_certificate_01.pdf",
        fileName: "family_relation_certificate_01.pdf",
        fileUrl: "/test-docs/SGR 직무소개서_IT서비스 기획 운영.pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "IDENTITY_FAMILY",
          documentType: "FAMILY_RELATION_CERTIFICATE",
          documentTypeLabel: "가족관계증명서",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "2026-FAM-998877",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 110, 610, 145],
                rawText: "2026-FAM-998877",
                confidence: 0.97
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [160, 220, 270, 255],
                rawText: "홍길동",
                confidence: 0.98
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 255],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            spouse: {
              exists: {
                value: true,
                confidence: 0.99,
                evidence: {
                  pageNum: 1,
                  bbox: [100, 320, 165, 350],
                  rawText: "배우자",
                  confidence: 0.99
                }
              },
              name: {
                value: "김영희",
                confidence: 0.97,
                evidence: {
                  pageNum: 1,
                  bbox: [180, 320, 270, 350],
                  rawText: "김영희",
                  confidence: 0.97
                }
              },
              residentRegistrationNumber: {
                value: "920202-2******",
                confidence: 0.94,
                evidence: {
                  pageNum: 1,
                  bbox: [300, 320, 470, 350],
                  rawText: "920202-2******",
                  confidence: 0.94
                }
              }
            }
          }
        },
        rawText: "가족관계증명서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_004",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/employment_certificate_01.pdf",
        fileName: "employment_certificate_01.pdf",
        fileUrl: "/test-docs/SGR 직무소개서_IT서비스 기획 운영 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "EMPLOYMENT_CERTIFICATE",
          documentTypeLabel: "재직증명서",
          classificationConfidence: 0.96
        },
        extraction: {
          content: {
            name: {
              value: "홍길동",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [160, 220, 270, 255],
                rawText: "홍길동",
                confidence: 0.98
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 255],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            hasRepresentativeName: {
              value: true,
              confidence: 0.94,
              evidence: {
                pageNum: 1,
                bbox: [420, 500, 520, 532],
                rawText: "박대표",
                confidence: 0.94
              }
            },
            hasCompanySeal: {
              value: true,
              confidence: 0.91,
              evidence: {
                pageNum: 1,
                bbox: [540, 470, 620, 560],
                rawText: "직인",
                confidence: 0.91
              }
            }
          }
        },
        rawText: "재직증명서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_004_PAGE2",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/employment_certificate_01_p2.pdf",
        fileName: "employment_certificate_01_p2.pdf",
        fileUrl: "/test-docs/SGR 직무소개서_IT서비스 기획 운영 (2).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "EMPLOYMENT_CERTIFICATE",
          documentTypeLabel: "재직증명서",
          classificationConfidence: 0.99
        },
        extraction: {
          content: {
            careerInfo: {
              value: "이전 직장 경력 5년 포함 확인",
              confidence: 0.92,
              evidence: {
                pageNum: 2,
                bbox: [100, 300, 500, 350],
                rawText: "경력 사항",
                confidence: 0.92
              }
            }
          }
        },
        rawText: "재직증명서 2페이지 OCR 원문",
        pages: [
          {
            pageNum: 2
          }
        ]
      },
      {
        fileId: "FILE_005",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/health_insurance_eligibility_01.pdf",
        fileName: "health_insurance_eligibility_01.pdf",
        fileUrl: "/test-docs/SGR 직무소개서_IT서비스 기획 운영 (2).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "HEALTH_INSURANCE_ELIGIBILITY",
          documentTypeLabel: "건강보험 자격득실 확인서",
          classificationConfidence: 0.99
        },
        extraction: {
          content: {
            issueNumber: {
              value: "NHIS-2026-001122",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [380, 120, 610, 150],
                rawText: "NHIS-2026-001122",
                confidence: 0.98
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: [180, 220, 270, 250],
                rawText: "홍길동",
                confidence: 0.99
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 250],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            subscriberType: {
              value: "직장가입자",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [180, 280, 320, 310],
                rawText: "직장가입자",
                confidence: 0.97
              }
            },
            latestAcquisitionDate: {
              value: "2023-01-02",
              confidence: 0.94,
              evidence: {
                pageNum: 1,
                bbox: [430, 440, 570, 470],
                rawText: "2023.01.02",
                confidence: 0.94
              }
            },
            latestLossDate: {
              value: null,
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: null,
                rawText: "",
                confidence: 0.99
              }
            }
          }
        },
        rawText: "건강보험 자격득실 확인서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_006",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/withholding_tax_certificate_01.pdf",
        fileName: "withholding_tax_certificate_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "WITHHOLDING_TAX_CERTIFICATE",
          documentTypeLabel: "근로소득 원천징수영수증",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            name: {
              value: "홍길동",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [150, 210, 240, 242],
                rawText: "홍길동",
                confidence: 0.98
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [270, 210, 440, 242],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            workPeriod: {
              value: "2025-01-01~2025-12-31",
              confidence: 0.94,
              evidence: {
                pageNum: 1,
                bbox: [360, 270, 560, 300],
                rawText: "2025.01.01~2025.12.31",
                confidence: 0.94
              }
            },
            annualIncomeTotal: {
              value: 68500000,
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [430, 520, 590, 552],
                rawText: "68,500,000",
                confidence: 0.95
              }
            }
          }
        },
        rawText: "근로소득 원천징수영수증 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_007",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/salary_account_statement_01.pdf",
        fileName: "salary_account_statement_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "PARTIAL_SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_EMPLOYEE",
          documentType: "SALARY_ACCOUNT_STATEMENT",
          documentTypeLabel: "급여통장거래내역서",
          classificationConfidence: 0.95
        },
        extraction: {
          content: {
            manualReviewRequired: {
              value: true,
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: null,
                rawText: "비정형 거래내역서 후처리 기준",
                confidence: 0.99
              }
            }
          }
        },
        rawText: "급여통장거래내역서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_008",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/income_amount_certificate_01.pdf",
        fileName: "income_amount_certificate_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_BUSINESS",
          documentType: "INCOME_AMOUNT_CERTIFICATE",
          documentTypeLabel: "소득금액증명원",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "TAX-2026-445566",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 100, 610, 135],
                rawText: "TAX-2026-445566",
                confidence: 0.97
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [170, 210, 260, 245],
                rawText: "홍길동",
                confidence: 0.98
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [290, 210, 460, 245],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            issueDate: {
              value: "2026-03-13",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 140, 560, 170],
                rawText: "2026.03.13",
                confidence: 0.98
              }
            },
            incomeYear: {
              value: "2025",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [170, 340, 250, 372],
                rawText: "2025",
                confidence: 0.97
              }
            },
            incomeAmount: {
              value: 68500000,
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [320, 340, 500, 372],
                rawText: "68,500,000",
                confidence: 0.95
              }
            }
          }
        },
        rawText: "소득금액증명원 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_009",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/business_registration_certificate_01.pdf",
        fileName: "business_registration_certificate_01.pdf",
        fileUrl: "/test-docs/[삼성화재해상보험]사업보고서(2026.03.12).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_BUSINESS",
          documentType: "BUSINESS_REGISTRATION_CERTIFICATE",
          documentTypeLabel: "사업자등록증명원",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "BR-2026-889900",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 108, 600, 140],
                rawText: "BR-2026-889900",
                confidence: 0.97
              }
            },
            businessName: {
              value: "제민상사",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [180, 210, 320, 242],
                rawText: "제민상사",
                confidence: 0.97
              }
            },
            businessRegistrationNumber: {
              value: "123-45-67890",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [340, 210, 510, 242],
                rawText: "123-45-67890",
                confidence: 0.98
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.96,
              evidence: {
                pageNum: 1,
                bbox: [180, 260, 260, 292],
                rawText: "홍길동",
                confidence: 0.96
              }
            },
            residentRegistrationNumber: {
              value: null,
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: null,
                rawText: "",
                confidence: 0.99
              }
            },
            issueDate: {
              value: "2026-03-13",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 145, 560, 175],
                rawText: "2026.03.13",
                confidence: 0.98
              }
            }
          }
        },
        rawText: "사업자등록증명원 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_010",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/vat_tax_base_certificate_01.pdf",
        fileName: "vat_tax_base_certificate_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "INCOME_BUSINESS",
          documentType: "VAT_TAX_BASE_CERTIFICATE",
          documentTypeLabel: "부가가치세과세표준증명",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "VAT-2026-778899",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 108, 610, 142],
                rawText: "VAT-2026-778899",
                confidence: 0.97
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.96,
              evidence: {
                pageNum: 1,
                bbox: [180, 210, 260, 242],
                rawText: "홍길동",
                confidence: 0.96
              }
            },
            residentRegistrationNumber: {
              value: null,
              confidence: 0.99,
              evidence: {
                pageNum: 1,
                bbox: null,
                rawText: "",
                confidence: 0.99
              }
            },
            businessName: {
              value: "제민상사",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [180, 255, 320, 287],
                rawText: "제민상사",
                confidence: 0.97
              }
            },
            businessRegistrationNumber: {
              value: "123-45-67890",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [340, 255, 510, 287],
                rawText: "123-45-67890",
                confidence: 0.97
              }
            },
            issueDate: {
              value: "2026-03-13",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 145, 560, 175],
                rawText: "2026.03.13",
                confidence: 0.98
              }
            },
            taxableSalesAmount: {
              value: 120500000,
              confidence: 0.94,
              evidence: {
                pageNum: 1,
                bbox: [390, 450, 590, 484],
                rawText: "120,500,000",
                confidence: 0.94
              }
            }
          }
        },
        rawText: "부가가치세과세표준증명 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_011",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/national_tax_certificate_01.pdf",
        fileName: "national_tax_certificate_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "TAX",
          documentType: "NATIONAL_TAX_CERTIFICATE",
          documentTypeLabel: "납세증명서(국세완납증명)",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "NTX-2026-111222",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 108, 600, 142],
                rawText: "NTX-2026-111222",
                confidence: 0.97
              }
            },
            issueDate: {
              value: "2026-03-13",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 145, 560, 175],
                rawText: "2026.03.13",
                confidence: 0.98
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [180, 220, 260, 252],
                rawText: "홍길동",
                confidence: 0.97
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 252],
                rawText: "900101-1******",
                confidence: 0.95
              }
            }
          }
        },
        rawText: "국세 납세증명서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_012",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/local_tax_certificate_01.pdf",
        fileName: "local_tax_certificate_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "TAX",
          documentType: "LOCAL_TAX_CERTIFICATE",
          documentTypeLabel: "지방세 납세증명서",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "LTX-2026-333444",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 108, 600, 142],
                rawText: "LTX-2026-333444",
                confidence: 0.97
              }
            },
            issueDate: {
              value: "2026-03-13",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 145, 560, 175],
                rawText: "2026.03.13",
                confidence: 0.98
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [180, 220, 260, 252],
                rawText: "홍길동",
                confidence: 0.97
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 252],
                rawText: "900101-1******",
                confidence: 0.95
              }
            }
          }
        },
        rawText: "지방세 납세증명서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_013",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/local_tax_item_certificate_01.pdf",
        fileName: "local_tax_item_certificate_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "TAX",
          documentType: "LOCAL_TAX_ITEM_CERTIFICATE",
          documentTypeLabel: "지방세 세목별 과세증명",
          classificationConfidence: 0.98
        },
        extraction: {
          content: {
            issueNumber: {
              value: "LTI-2026-555666",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [390, 108, 600, 142],
                rawText: "LTI-2026-555666",
                confidence: 0.97
              }
            },
            issueDate: {
              value: "2026-03-13",
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 145, 560, 175],
                rawText: "2026.03.13",
                confidence: 0.98
              }
            },
            name: {
              value: "홍길동",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [180, 220, 260, 252],
                rawText: "홍길동",
                confidence: 0.97
              }
            },
            residentRegistrationNumber: {
              value: "900101-1******",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [300, 220, 470, 252],
                rawText: "900101-1******",
                confidence: 0.95
              }
            },
            taxItems: [
              {
                taxItemName: {
                  value: "재산세",
                  confidence: 0.96,
                  evidence: {
                    pageNum: 1,
                    bbox: [180, 360, 260, 390],
                    rawText: "재산세",
                    confidence: 0.96
                  }
                },
                taxAmount: {
                  value: 320000,
                  confidence: 0.95,
                  evidence: {
                    pageNum: 1,
                    bbox: [420, 360, 520, 390],
                    rawText: "320,000",
                    confidence: 0.95
                  }
                },
                remark: {
                  value: "2025년 정기분",
                  confidence: 0.92,
                  evidence: {
                    pageNum: 1,
                    bbox: [540, 360, 650, 390],
                    rawText: "2025년 정기분",
                    confidence: 0.92
                  }
                }
              }
            ]
          }
        },
        rawText: "지방세 세목별 과세증명 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_014",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/title_deed_01.pdf",
        fileName: "title_deed_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "PARTIAL_SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "TITLE_DEED",
          documentTypeLabel: "등기권리증",
          classificationConfidence: 0.95
        },
        extraction: {
          content: {
            registrationType: {
              value: "집합건물",
              confidence: 0.93,
              evidence: {
                pageNum: 1,
                bbox: [170, 180, 280, 210],
                rawText: "집합건물",
                confidence: 0.93
              }
            },
            buildingType: {
              value: "아파트",
              confidence: 0.9,
              evidence: {
                pageNum: 1,
                bbox: [310, 180, 390, 210],
                rawText: "아파트",
                confidence: 0.9
              }
            },
            hasDongho: {
              value: true,
              confidence: 0.98,
              evidence: {
                pageNum: 1,
                bbox: [420, 180, 560, 210],
                rawText: "101동 1001호",
                confidence: 0.98
              }
            },
            lotAddress: {
              value: "서울특별시 구로구 구로동 123-45",
              confidence: 0.94,
              evidence: {
                pageNum: 1,
                bbox: [150, 240, 600, 275],
                rawText: "서울특별시 구로구 구로동 123-45",
                confidence: 0.94
              }
            },
            hasLandRightCause: {
              value: false,
              confidence: 0.9,
              evidence: {
                pageNum: 1,
                bbox: [420, 340, 530, 370],
                rawText: "없음",
                confidence: 0.9
              }
            },
            hasOwnershipTransferClaim: {
              value: false,
              confidence: 0.9,
              evidence: {
                pageNum: 1,
                bbox: [150, 390, 260, 420],
                rawText: "없음",
                confidence: 0.9
              }
            },
            hasTrustRegistration: {
              value: false,
              confidence: 0.9,
              evidence: {
                pageNum: 1,
                bbox: [420, 390, 530, 420],
                rawText: "없음",
                confidence: 0.9
              }
            },
            ownerName: {
              value: "김철수",
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [150, 450, 240, 480],
                rawText: "김철수",
                confidence: 0.95
              }
            },
            deposit: {
              hasDeposit: {
                value: false,
                confidence: 0.95,
                evidence: {
                  pageNum: 1,
                  bbox: null,
                  rawText: "해당없음",
                  confidence: 0.95
                }
              },
              depositAmount: {
                value: 55000000,
                confidence: 0.9,
                evidence: {
                  pageNum: 1,
                  bbox: null,
                  rawText: "",
                  confidence: 0.9
                }
              }
            },
            seniorRights: [
              {
                maximumClaimAmount: {
                  value: 150000000,
                  confidence: 0.93,
                  evidence: {
                    pageNum: 1,
                    bbox: [400, 520, 570, 552],
                    rawText: "150,000,000",
                    confidence: 0.93
                  }
                }
              }
            ]
          }
        },
        rawText: "등기권리증 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_015",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/building_register_01.pdf",
        fileName: "building_register_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "BUILDING_REGISTER",
          documentTypeLabel: "집합건축물대장",
          classificationConfidence: 0.97
        },
        extraction: {
          content: {
            isViolationBuilding: {
              value: false,
              confidence: 0.96,
              evidence: {
                pageNum: 1,
                bbox: [420, 180, 510, 210],
                rawText: "해당없음",
                confidence: 0.96
              }
            },
            mainUsage: {
              value: "공동주택(아파트)",
              confidence: 0.97,
              evidence: {
                pageNum: 1,
                bbox: [150, 240, 350, 270],
                rawText: "공동주택(아파트)",
                confidence: 0.97
              }
            },
            floorStatusList: [
              {
                floor: {
                  value: "10층",
                  confidence: 0.96,
                  evidence: {
                    pageNum: 1,
                    bbox: [150, 360, 220, 390],
                    rawText: "10층",
                    confidence: 0.96
                  }
                },
                usage: {
                  value: "주택",
                  confidence: 0.95,
                  evidence: {
                    pageNum: 1,
                    bbox: [280, 360, 340, 390],
                    rawText: "주택",
                    confidence: 0.95
                  }
                },
                area: {
                  value: 84.97,
                  confidence: 0.94,
                  evidence: {
                    pageNum: 1,
                    bbox: [420, 360, 520, 390],
                    rawText: "84.97",
                    confidence: 0.94
                  }
                }
              }
            ]
          }
        },
        rawText: "집합건축물대장 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
      },
      {
        fileId: "FILE_016",
        storageType: "OBJECT_STORAGE",
        bucket: "loan-docs",
        fileKey: "cases/CASE_001/raw/sale_contract_01.pdf",
        fileName: "sale_contract_01.pdf",
        fileUrl: "/test-docs/교육필증 (1).pdf",
        mimeType: "application/pdf",
        status: "PARTIAL_SUCCESS",
        errorCode: null,
        errorMessage: null,
        documentClassification: {
          documentGroup: "PROPERTY_HOUSING",
          documentType: "SALE_CONTRACT",
          documentTypeLabel: "매매계약서",
          classificationConfidence: 0.96
        },
        extraction: {
          content: {
            propertyAddress: {
              value: "서울특별시 구로구 디지털로 123, 101동 1001호",
              confidence: 0.94,
              evidence: {
                pageNum: 1,
                bbox: [140, 250, 620, 290],
                rawText: "서울특별시 구로구 디지털로 123, 101동 1001호",
                confidence: 0.94
              }
            },
            salePrice: {
              value: 850000000,
              confidence: 0.95,
              evidence: {
                pageNum: 1,
                bbox: [390, 360, 580, 395],
                rawText: "850,000,000",
                confidence: 0.95
              }
            },
            specialTerms: {
              value: "잔금일 이전 근저당 말소 조건",
              confidence: 0.73,
              evidence: {
                pageNum: 1,
                bbox: [120, 560, 650, 680],
                rawText: "잔금일 이전 근저당 말소 조건",
                confidence: 0.73
              }
            },
            seller: {
              name: {
                value: "김철수",
                confidence: 0.95,
                evidence: {
                  pageNum: 1,
                  bbox: [180, 430, 260, 460],
                  rawText: "김철수",
                  confidence: 0.95
                }
              }
            },
            buyer: {
              name: {
                value: "홍길동",
                confidence: 0.96,
                evidence: {
                  pageNum: 1,
                  bbox: [430, 430, 510, 460],
                  rawText: "홍길동",
                  confidence: 0.96
                }
              }
            }
          }
        },
        rawText: "매매계약서 전체 OCR 원문",
        pages: [
          {
            pageNum: 1
          }
        ]
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
