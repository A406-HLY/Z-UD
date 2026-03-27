import { ReportRequestPayload, ReportInput } from '@/entities/verification/model/report.types';
import { Customer } from '@/entities/customer/model/types';
import { EMPLOYMENT_TYPE_MAP, EmploymentType } from '@/entities/customer/model/customer.constants';
import { mergeDotNotation } from '@/shared/lib/utils/merge-utils';

/**
 * Redux의 여러 데이터 소스를 취합하여 최종 API 요청 DTO를 생성합니다.
 * 
 * @param consultationId 상담 ID
 * @param originalReportInput 서버에서 받은 원본 reportInput (OCR 결과 수준)
 * @param documentEdits 각 문서별 수정 내역 (Record<docId, { values: Record<string, any> }>)
 * @param customerData 사용자가 직접 입력한 고객 정보 (최종 우선순위)
 */
export const assembleReportPayload = (
  consultationId: string,
  originalReportInput: any,
  documentEdits: Record<string, { values: Record<string, any> }>,
  customerData: Customer
): ReportRequestPayload => {
  // 1. 모든 문서의 수정 내역을 하나로 병합 (평탄화된 키-값 쌍)
  const aggregatedEdits: Record<string, any> = {};
  Object.values(documentEdits).forEach((doc) => {
    Object.assign(aggregatedEdits, doc.values);
  });

  // 2. 원본 데이터에 수정 내역 주입 (Deep Merge)
  const mergedInput = mergeDotNotation(originalReportInput || {}, aggregatedEdits) as any;

  // 3. 사용자가 폼에서 직접 입력한 6가지 필수 정보로 최종 덮어씌움 (Source of Truth)
  // (Note: 금액이나 횟수 등은 규격에 맞게 숫자 타입으로 변환)
  const finalInput: ReportInput = {
    ...mergedInput,
    name: customerData.name,
    residentRegistrationNumber: customerData.residentRegistrationNumber,
    phoneNumber: customerData.phoneNumber,
    targetLoanAmount: parseInt(customerData.targetLoanAmount.replace(/,/g, ''), 10) || 0,
    loanPurpose: customerData.loanPurpose,
    ownedHouseCount: parseInt(customerData.ownedHouseCount, 10) || 0,
    employmentType: (EMPLOYMENT_TYPE_MAP[customerData.employmentType as EmploymentType] || 'EMPLOYEE') as any,
  };

  // 4. (Opitonal) 추가적인 타입 보정 (예: 다른 숫자 필드들)
  // 만약 mergedInput 내부에 string으로 들어온 숫자 필드들이 있다면 여기서 추가 보정이 필요할 수 있습니다.
  
  return {
    consultationId,
    reportInput: finalInput,
  };
};
