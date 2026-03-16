import { logger } from '../utils/logger';

export type FileStatus = 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

export interface QueuedFile {
  sequenceId: number;
  originalPath: string;
  storedPath: string;
  fileName: string;
  status: FileStatus;
  detectedAt: Date;
  uploadedAt?: Date;
  error?: string;
}

export interface FileResponseDto {
  sequenceId: number;
  fileName: string;
  status: FileStatus;
  detectedAt: Date;
  uploadedAt?: Date | undefined;
  error?: string | undefined;
}

export class FileQueueStore {
  private static files: QueuedFile[] = [];
  private static currentSequence = 1;

  public static addFile(originalPath: string, storedPath: string, fileName: string): QueuedFile {
    const newFile: QueuedFile = {
      sequenceId: this.currentSequence++,
      originalPath,
      storedPath,
      fileName,
      status: 'PENDING',
      detectedAt: new Date(),
    };
    
    this.files.push(newFile);
    logger.info(`File added to queue: [Seq: ${newFile.sequenceId}] ${newFile.fileName}`);
    return newFile;
  }

  public static getFiles(): FileResponseDto[] {
    return this.files
      .map(f => ({
        sequenceId: f.sequenceId,
        fileName: f.fileName,
        status: f.status,
        detectedAt: f.detectedAt,
        uploadedAt: f.uploadedAt,
        error: f.error,
      }))
      .sort((a, b) => a.sequenceId - b.sequenceId);
  }

  public static getPendingFiles(): QueuedFile[] {
    return this.files.filter(f => f.status === 'PENDING').sort((a, b) => a.sequenceId - b.sequenceId);
  }

  public static updateFileStatus(sequenceId: number, status: FileStatus, error?: string): void {
    const file = this.files.find(f => f.sequenceId === sequenceId);
    if (file) {
      file.status = status;
      if (status === 'COMPLETED') file.uploadedAt = new Date();
      if (error) file.error = error;
      logger.info(`File status updated: [Seq: ${sequenceId}] -> ${status}`);
    }
  }
}
