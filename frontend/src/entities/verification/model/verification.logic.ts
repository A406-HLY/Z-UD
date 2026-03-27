import { ExtractedField, DocumentStatus, DocItem, DocCategory } from '@/entities/verification/model/types';
import { Customer } from '@/entities/customer/model/types';

/**
 * @feature verification
 * 서류 검증 도메인에서 공통으로 사용되는 비즈니스 연산 로직 모음입니다.
 */

export const getNextDocumentId = (
  currentId: string | null, 
  categories: DocCategory[],
  documents: Record<string, DocItem>
): string | null => {
  if (!currentId) return null;
  const allIds = categories.flatMap(cat => cat.itemIds);
  const currentIndex = allIds.indexOf(currentId);
  if (currentIndex === -1) return null;

  // 다음 문서들 중 'MISSING'이 아닌 첫 번째 아이템 찾기
  for (let i = currentIndex + 1; i < allIds.length; i++) {
    const nextId = allIds[i];
    if (documents[nextId]?.status !== 'MISSING') {
      return nextId;
    }
  }
  return null;
};

export const getPrevDocumentId = (
  currentId: string | null, 
  categories: DocCategory[],
  documents: Record<string, DocItem>
): string | null => {
  if (!currentId) return null;
  const allIds = categories.flatMap(cat => cat.itemIds);
  const currentIndex = allIds.indexOf(currentId);
  if (currentIndex <= 0) return null;

  // 이전 문서들 중 'MISSING'이 아닌 첫 번째 아이템 찾기 (역순 탐색)
  for (let i = currentIndex - 1; i >= 0; i--) {
    const prevId = allIds[i];
    if (documents[prevId]?.status !== 'MISSING') {
      return prevId;
    }
  }
  return null;
};

/**
 * [Why: 배열 형태나 중첩된 키 구조에서도 일관된 필드명을 추출하기 위해 정규화를 수행합니다.]
 * 예: householdMembers[0]_name -> name
 */
export const getNormalizedKey = (key: string): string => {
  return key.replace(/\[\d+\]/g, '').split('.').pop() || key;
};

/**
 * [Why: 필드가 신청자 본인의 정보(고객 원장) 대조용인지 판별합니다.]
 * 'name', 'residentRegistrationNumber', 'phoneNumber' 등 신청자 본인의 고유 정보만 
 * 고객 정보 대조군(Branch A)으로 분류하고, 나머지는 서류 간 상호 대조(Branch B)로 처리합니다.
 */
export const isCustomerInfoField = (key: string): boolean => {
  const baseKey = getNormalizedKey(key);
  
  // (Note: 오직 신청자 본인을 지칭하는 'name' 필드만 원장 데이터와 직접 대조합니다.
  // ownerName, headOfHouseholdName 등은 서류 간 일치 여부만 확인하도록 Branch B로 보냅니다.)
  return baseKey === 'name' || 
         baseKey === 'residentRegistrationNumber' || 
         baseKey === 'phoneNumber';
};

/**
 * [Why: 입력된 값이 원장(Redux) 데이터 혹은 타 서류 데이터와 일치하는지(정합성) 판정합니다.]
 */
export const checkIsResolved = (
  key: string,
  value: string,
  customerInfo: Customer,
  errorTargetDict: Record<string, Set<string>>,
  documentFields: Record<string, ExtractedField[]>,
  selectedId: string
): boolean => {
  const baseKey = getNormalizedKey(key);

  // 분기 A: 고객 정보와 대조
  if (isCustomerInfoField(key)) {
    const isIdField = baseKey === 'residentRegistrationNumber' || baseKey === 'identifierNumber';
    const isNameField = !isIdField && baseKey !== 'phoneNumber';

    const customerValue = 
      isNameField ? customerInfo.name : 
      isIdField ? customerInfo.residentRegistrationNumber : 
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

/**
 * [Why: 여러 문서(DocItem)들의 상태를 취합하여 해당 카테고리(폴더)의 대표 상태를 결정합니다.]
 */
export const calculateCategoryStatus = (
  itemIds: string[], 
  documents: Record<string, DocItem>
): { hasError: boolean; hasRisk: boolean; folderColor: string } => {
  const catItems = itemIds.map(id => documents[id]).filter(Boolean);
  const hasError = catItems.some(i => i.status === 'REVIEW_NEEDED');
  const hasRisk = catItems.some(i => i.status === 'RISK');
  
  // (Why: 에러가 최우선 순위이며, 정합성 위반 시 빨간색, 잠재적 위험 시 노란색을 반환합니다.)
  const folderColor = hasError ? 'text-red-600' : hasRisk ? 'text-yellow-600' : 'text-[#00529B]';

  return { hasError, hasRisk, folderColor };
};
