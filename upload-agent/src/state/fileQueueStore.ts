import fs from 'fs';
import { logger } from '../utils/logger';

export type FileStatus = 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';

export interface QueuedFile {
  sequenceId: number;
  originalPath: string;
  storedPath: string;
  fileName: string;
  size: number; // [NEW] 파일 크기(bytes)
  status: FileStatus;
  detectedAt: Date;
  uploadedAt?: Date;
  error?: string;
}

export interface FileResponseDto {
  sequenceId: number;
  fileName: string;
  size: number; // [NEW] 파일 크기(bytes)
  status: FileStatus;
  detectedAt: string; // API 응답 시 ISO String으로 변환됨을 보장
  uploadedAt?: string | undefined;
  error?: string | undefined;
}

export class FileQueueStore {
  private static files: QueuedFile[] = [];
  private static currentSequence = 1;

  public static addFile(originalPath: string, storedPath: string, fileName: string, size: number): QueuedFile {
    const newFile: QueuedFile = {
      sequenceId: this.currentSequence++,
      originalPath,
      storedPath,
      fileName,
      size,
      status: 'PENDING',
      detectedAt: new Date(),
    };
    
    this.files.push(newFile);
    logger.info(`File added to queue: [Seq: ${newFile.sequenceId}] ${newFile.fileName}`);
    return newFile;
  }

  public static getFiles(): FileResponseDto[] {
    // (Why) 물리적 파일이 삭제되었는데 메모리에만 남아있는 '유령 서류'를 방지하기 위해 실시간 싱크를 수행합니다.
    this.files = this.files.filter(f => {
      if (f.status === 'COMPLETED') return false; // 이미 보낸 파일은 즉시 제거 (사용자 요청 반영)
      return fs.existsSync(f.storedPath);
    });

    return this.files
      .map(f => ({
        sequenceId: f.sequenceId,
        fileName: f.fileName,
        size: f.size,
        status: f.status,
        detectedAt: f.detectedAt.toISOString(), // ISO 문자열 명시
        uploadedAt: f.uploadedAt?.toISOString(),
        error: f.error,
      }))
      .sort((a, b) => a.sequenceId - b.sequenceId);
  }

  public static getPendingFiles(): QueuedFile[] {
    return this.files.filter(f => f.status === 'PENDING').sort((a, b) => a.sequenceId - b.sequenceId);
  }

  public static getFileBySequenceId(sequenceId: number): QueuedFile | undefined {
    return this.files.find(f => f.sequenceId === sequenceId);
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

  public static removeFile(sequenceId: number): void {
    const file = this.files.find(f => f.sequenceId === sequenceId);
    if (file) {
      const fileName = file.fileName;
      this.files = this.files.filter(f => f.sequenceId !== sequenceId);
      logger.info(`File removed from queue: [Seq: ${sequenceId}] ${fileName}`);
    } else {
      logger.warn(`Tried to remove non-existent file from queue: [Seq: ${sequenceId}]`);
    }
  }
}
