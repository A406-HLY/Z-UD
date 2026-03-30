import { ExtractedField, DocumentStatus, DocItem, DocCategory } from '@/entities/verification/model/types';
import { Customer } from '@/entities/customer/model/types';

export const getNextDocumentId = (
  currentId: string | null,
  categories: DocCategory[],
  documents: Record<string, DocItem>
): string | null => {
  if (!currentId) return null;
  const allIds = categories.flatMap(cat => cat.itemIds);
  const currentIndex = allIds.indexOf(currentId);
  if (currentIndex === -1) return null;

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

  for (let i = currentIndex - 1; i >= 0; i--) {
    const prevId = allIds[i];
    if (documents[prevId]?.status !== 'MISSING') {
      return prevId;
    }
  }
  return null;
};

export const getNormalizedKey = (key: string): string => {
  return key.replace(/\[\d+\]/g, '').split('.').pop() || key;
};

export const isCustomerInfoField = (key: string): boolean => {
  const baseKey = getNormalizedKey(key);

  return baseKey === 'name' ||
         baseKey === 'residentRegistrationNumber' ||
         baseKey === 'phoneNumber';
};

export const checkIsResolved = (
  key: string,
  value: string,
  customerInfo: Customer,
  errorTargetDict: Record<string, Set<string>>,
  documentFields: Record<string, ExtractedField[]>,
  selectedId: string
): boolean => {
  const baseKey = getNormalizedKey(key);

  if (isCustomerInfoField(key)) {
    const isIdField = baseKey === 'residentRegistrationNumber' || baseKey === 'identifierNumber';
    const isNameField = !isIdField && baseKey !== 'phoneNumber';

    const customerValue =
      isNameField ? customerInfo.name :
      isIdField ? customerInfo.residentRegistrationNumber :
      customerInfo.phoneNumber;

    return customerValue === value;
  }

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

export const calculateCategoryStatus = (
  itemIds: string[],
  documents: Record<string, DocItem>
): { hasError: boolean; hasRisk: boolean; folderColor: string } => {
  const catItems = itemIds.map(id => documents[id]).filter(Boolean);
  const hasError = catItems.some(i => i.status === 'REVIEW_NEEDED');
  const hasRisk = catItems.some(i => i.status === 'RISK');

  const folderColor = hasError ? 'text-red-600' : hasRisk ? 'text-yellow-600' : 'text-[#00529B]';

  return { hasError, hasRisk, folderColor };
};