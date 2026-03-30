

export type DocumentStatus = 'MISSING' | 'REVIEW_NEEDED' | 'RISK' | 'APPROVED';

export interface ValidationViolation {
  documentType: string;
  documentTypeLabel: string;
  fields: string[];
}

export interface ValidationMissing {
  documentType: string;
  documentTypeLabel: string;
}

export interface ValidationRisk {
  documentType: string;
  documentTypeLabel: string;
  fields: string[];
}

export interface VerificationServerResponse {

  resolution?: { width: number; height: number };
  documents: ServerDocItem[];
  validationResult: {
    documentMissings: ValidationMissing[];
    violations: ValidationViolation[];
  };
}

export interface DocumentClassification {
  documentGroup: string;
  documentType: string;
  documentTypeLabel: string;
  classificationConfidence?: number;
}

export interface ExtractedField {
  id: string;
  key: string;
  label: string;
  value: string | number | boolean | null;
  confidence: number;
  isMatch: boolean;
  isViolationTarget: boolean;
  isRiskTarget: boolean;
  isModified: boolean;
  evidence?: {
    pageNum: number;
    bbox: number[] | null;
    rawText: string;
    confidence?: number;
  };
}

export interface ServerDocItem {
  fileId: string;
  storageType?: string;
  bucket?: string;
  fileKey?: string;
  fileName: string;
  fileUrl?: string;
  mimeType?: string;
  documentClassification: DocumentClassification;
  status: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  error?: string | null;

  content: Record<string, unknown>;

  resolution?: { width: number; height: number };
  rawText?: string;

  pageNums?: number[];
  pages?: Array<{ pageNum: number }>;
}

export interface DocItem extends ServerDocItem {
  id: string;
  status: DocumentStatus;
  isRisk: boolean;

  files: Array<{
    fileId: string;
    fileUrl?: string;
    pageNum: number;
  }>;
}

export interface DocCategory {
  id: string;
  name: string;
  itemIds: string[];
}

export interface VerificationResult {
  id: string;
  selectedDocId: string;
  categories: DocCategory[];
  documents: Record<string, DocItem>;
  documentFields: Record<string, ExtractedField[]>;
  errorTargetDict: Record<string, Set<string>>;
  violationMap: Record<string, Set<string>>;
  missingSet: Set<string>;
}

export interface VerificationEdits {

  values: Record<string, unknown>;

  lastModified: string;
}

export interface VerificationState {

  edits: Record<string, VerificationEdits>;

  activeDocumentId: string | null;
}