
export interface AgentFile {
  sequenceId: number;
  fileName: string;
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  detectedAt: string;
}