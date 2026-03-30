import {
  VerificationServerResponse,
  VerificationResult,
  DocCategory,
  DocumentStatus,
  ExtractedField,
  DocItem,
  ServerDocItem
} from './types';

const ARRAY_INDEX_REGEX = /\[\d+\]/g;

export const DOCUMENT_GROUP_LABELS: Record<string, string> = {
  IDENTITY_FAMILY: '본인 및 가족관계',
  INCOME_EMPLOYEE: '소득 및 재직증빙',
  INCOME_BUSINESS: '사업자 소득증빙',
  TAX: '세금 납부 증빙',
  PROPERTY_HOUSING: '주택 및 권리관계',
};

const flattenContent = (content: unknown, prefix = '', labelPrefix = ''): ExtractedField[] => {
  const fields: ExtractedField[] = [];
  if (!content || typeof content !== 'object') return fields;

  const obj = content as Record<string, unknown>;
  for (const key in obj) {
    const item = obj[key];
    const fieldKey = prefix ? `${prefix}.${key}` : key;
    const displayLabel = labelPrefix ? `${labelPrefix} > ${key}` : key;

    const isFieldObject = (val: unknown): val is { value: string | number | boolean | null; confidence?: number; evidence?: unknown } => {
      return typeof val === 'object' && val !== null && 'value' in val;
    };

    if (isFieldObject(item)) {
      fields.push({
        id: fieldKey,
        key: fieldKey,
        label: displayLabel,
        value: item.value,
        confidence: item.confidence ?? 0,
        isMatch: true,
        isViolationTarget: false,
        isRiskTarget: false,
        isModified: false,
        evidence: item.evidence as ExtractedField['evidence']
      });
    } else if (Array.isArray(item)) {
      item.forEach((subItem, index) => {
        fields.push(...flattenContent(subItem, `${fieldKey}[${index}]`, `${displayLabel}[${index + 1}]`));
      });
    } else if (item && typeof item === 'object') {
      fields.push(...flattenContent(item, fieldKey, displayLabel));
    }
  }
  return fields;
};

export const mapServerResponseToVerificationResult = (
  response: VerificationServerResponse,
  id: string
): VerificationResult => {

  const { documents: serverDocs, validationResult = { documentMissings: [], violations: [] }, resolution } = response;

  const missingSet = new Set((validationResult.documentMissings || []).map(m => m.documentType));

  const violationMap: Record<string, Set<string>> = {};
  (validationResult.violations || []).forEach(v => {
    if (!violationMap[v.documentType]) violationMap[v.documentType] = new Set();
    (v.fields || []).forEach(f => violationMap[v.documentType].add(f));
  });

  const initialErrorTargetDict: Record<string, Set<string>> = {};
  (validationResult.violations || []).forEach(v => {
    (v.fields || []).forEach(field => {
      if (!initialErrorTargetDict[field]) initialErrorTargetDict[field] = new Set<string>();
    });
  });

  const groupedDocs: Record<string, ServerDocItem[]> = {};
  serverDocs.forEach(doc => {
    const docType = doc.documentClassification.documentType;
    if (!groupedDocs[docType]) groupedDocs[docType] = [];
    groupedDocs[docType].push(doc);
  });

  const initialData = {
    processedDocs: [] as DocItem[],
    documentFields: {} as Record<string, ExtractedField[]>,
    documentsMap: {} as Record<string, DocItem>,
    errorTargetDict: initialErrorTargetDict
  };

  const { processedDocs, documentFields, documentsMap, errorTargetDict } = Object.entries(groupedDocs).reduce((acc, [docType, docs]) => {
    const sortedDocs = [...docs].sort((a, b) => {
      const pA = a.pageNums?.[0] ?? a.pages?.[0]?.pageNum ?? 1;
      const pB = b.pageNums?.[0] ?? b.pages?.[0]?.pageNum ?? 1;
      return pA - pB;
    });

    let combinedRawText = '';
    const mergedFields: ExtractedField[] = [];
    const firstDoc = sortedDocs[0];

    sortedDocs.forEach(doc => {

      const contentData = doc.content || {};
      const flattened = flattenContent(contentData);

      mergedFields.push(...flattened.map(field => ({
        ...field,
        id: `field-${doc.fileId}-${field.id}`
      })));
      combinedRawText += (doc.rawText || '') + '\n';
    });

    const docViolationFields = violationMap[docType] || new Set<string>();

    const markedFields = mergedFields.map(field => {
      const parts = field.key.replace(ARRAY_INDEX_REGEX, '').split('.');
      const baseKey = parts[parts.length - 1];

      const isViolation = docViolationFields.has(baseKey) || docViolationFields.has(field.key);

      if (isViolation) {
        if (!acc.errorTargetDict[field.key]) acc.errorTargetDict[field.key] = new Set();
        acc.errorTargetDict[field.key].add(docType);
      }

      return {
        ...field,
        isViolationTarget: !!isViolation,
        isRiskTarget: false,
        isMatch: !isViolation
      };
    });

    const hasViolation = markedFields.some(f => f.isViolationTarget);

    let status: DocumentStatus = 'APPROVED';
    if (missingSet.has(docType)) {
      status = 'MISSING';
    } else if (hasViolation) {
      status = 'REVIEW_NEEDED';
    }

    const docItem: DocItem = {
      ...firstDoc,
      id: docType,
      status,
      isRisk: false,

      resolution: firstDoc.resolution || resolution,
      rawText: combinedRawText.trim(),
      files: sortedDocs.map(d => ({
        fileId: d.fileId,
        fileUrl: d.fileUrl,

        pageNum: d.pageNums?.[0] ?? d.pages?.[0]?.pageNum ?? 1
      }))
    };

    acc.documentFields[docType] = markedFields;
    acc.documentsMap[docType] = docItem;
    acc.processedDocs.push(docItem);

    return acc;
  }, initialData);

  const ORDERED_GROUPS = [
    'IDENTITY_FAMILY',
    'INCOME_EMPLOYEE',
    'INCOME_BUSINESS',
    'PROPERTY_HOUSING',
    'TAX'
  ];

  const categories: DocCategory[] = [];
  ORDERED_GROUPS.forEach(group => {
    const itemIds = processedDocs
      .filter(d => d.documentClassification.documentGroup === group)
      .map(d => d.id);

    if (itemIds.length > 0) {
      categories.push({
        id: `cat-${group}`,
        name: DOCUMENT_GROUP_LABELS[group] || '주택 및 권리관계',
        itemIds
      });
    }
  });

  return {
    id,
    selectedDocId: processedDocs[0]?.id || '',
    categories,
    documents: documentsMap,
    documentFields,
    errorTargetDict,
    violationMap,
    missingSet
  };
};