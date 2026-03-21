import { ExtractedField, DocumentStatus } from '@/entities/verification/model/types';

/**
 * @feature verification
 * 서류 검증 도메인에서 공통으로 사용되는 비즈니스 연산 로직 모음입니다.
 */

/**
 * [Why: 배열 형태나 중첩된 키 구조에서도 일관된 필드명을 추출하기 위해 정규화를 수행합니다.]
 * 예: householdMembers[0]_name -> name
 */
export const getNormalizedKey = (key: string): string => {
  return key.replace(/\[\d+\]/g, '').split('_').pop() || key;
};

/**
 * [Why: 입력된 값이 원장(Redux) 데이터 혹은 타 서류 데이터와 일치하는지(정합성) 판정합니다.]
 */
export const checkIsResolved = (
  key: string,
  value: string,
  customerInfo: any,
  errorTargetDict: Record<string, Set<string>>,
  documentFields: Record<string, ExtractedField[]>,
  selectedId: string
): boolean => {
  const baseKey = getNormalizedKey(key);

  // 1. 고객 정보(원장) 대조 그룹 정의
  const nameGroup = ['name', 'buyer', 'ownerName', 'headOfHouseholdName', 'incomeRecipientName', 'representativeName'];
  const isNameField = nameGroup.includes(baseKey) || key.includes('name'); 
  const isIdField = baseKey === 'residentRegistrationNumber' || baseKey === 'identifierNumber';
  const isPhoneField = baseKey === 'phoneNumber';

  // 분기 A: 고객 정보와 대조
  if (isNameField || isIdField || isPhoneField) {
    const customerValue = 
      isNameField ? customerInfo.name : 
      isIdField ? customerInfo.personalId : 
      customerInfo.phoneNumber;
    
    return customerValue === value;
  } 

  // 분기 B: 서류 간 상호 대조 (고객 정보가 아닌 일반 데이터)
  const targetDocIds = errorTargetDict[key] || new Set();
  const collectedValues = new Set<string>();
  
  targetDocIds.forEach(docId => {
     if (docId === selectedId) {
       collectedValues.add(value);
     } else {
       const field = documentFields[docId]?.find(f => f.key === key);
       if (field && field.value !== null) collectedValues.add(String(field.value));
     }
  });

  return collectedValues.size === 1 && !collectedValues.has("");
};

/**
 * [Why: 필드들의 상태 변화에 따라 해당 문서(File)의 최종 검수 상태를 재계산합니다.]
 */
export const calculateDocumentStatus = (
  fields: ExtractedField[],
  documentType: string,
  missingSet: Set<string>
): { status: DocumentStatus; isRisk: boolean } => {
  const hasMismatch = fields.some(f => !f.isMatch);
  const hasRiskField = fields.some(f => f.isRiskTarget);
  
  if (missingSet.has(documentType)) {
    return { status: 'MISSING', isRisk: hasRiskField };
  } 
  
  if (hasMismatch) {
    return { status: 'REVIEW_NEEDED', isRisk: hasRiskField };
  } 
  
  if (hasRiskField) {
    return { status: 'RISK', isRisk: true };
  }

  return { status: 'APPROVED', isRisk: false };
};
