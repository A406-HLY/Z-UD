import { VerificationServerResponse } from '@/entities/verification/model/types';

/**
 * @feature verification/api/mock
 * 신규 도메인 모델 규격(래퍼 제거, 도메인 필드 직접 노출)에 맞춘 Mock 데이터입니다.
 */
export const MOCK_VERIFICATION_RESPONSE: VerificationServerResponse = {
  // (Why) VerificationServerResponse가 도메인 객체로 재정의됨에 따라 success, data 래퍼를 제거합니다.
  resolution: { width: 1240, height: 1754 },
  documents: [
    {
      fileId: "FILE_001",
      fileName: "주민등록등본_김민수.pdf",
      fileUrl: "https://zud.mock.storage/resident_registration.pdf",
      documentClassification: {
        documentGroup: "IDENTITY_FAMILY",
        documentType: "RESIDENT_REGISTRATION",
        documentTypeLabel: "주민등록등본",
        classificationConfidence: 0.92
      },
      status: "SUCCESS",
      content: {
        issueDate: {
          value: "2025-06-16",
          confidence: 0.9,
          evidence: {
            pageNum: 1,
            bbox: [59, 42, 1428, 315],
            rawText: "2025-06-16",
            confidence: 0.9
          }
        },
        issueNumber: {
          value: "1750-0603-3882-3312",
          confidence: 0.9,
          evidence: {
            pageNum: 1,
            bbox: [59, 42, 1428, 315],
            rawText: "1750-0603-3882-3312",
            confidence: 0.9
          }
        }
      },
      rawText: "주민등록표(등본) OCR 원문...",
      pageNums: [1]
    },
    {
      fileId: "FILE_002",
      fileName: "가족관계증명서_박소연.pdf",
      fileUrl: "https://zud.mock.storage/family_relation.pdf",
      documentClassification: {
        documentGroup: "IDENTITY_FAMILY",
        documentType: "FAMILY_RELATION_CERTIFICATE",
        documentTypeLabel: "가족관계증명서",
        classificationConfidence: 0.98
      },
      status: "SUCCESS",
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
        }
      },
      rawText: "가족관계증명서 OCR 원문...",
      pageNums: [1]
    }
  ],
  validationResult: {
    documentMissings: [
      {
        documentType: "RESIDENT_REGISTRATION_ABSTRACT",
        documentTypeLabel: "주민등록초본"
      }
    ],
    violations: []
  }
};
