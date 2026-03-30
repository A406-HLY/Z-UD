

export type DocumentStatus = 'VERIFIED' | 'PENDING' | 'PROCESSING' | 'FAILED' | 'UPLOADING';

export interface Document {
  id: string;
  no: number;
  fileName: string;
  status: DocumentStatus;
}