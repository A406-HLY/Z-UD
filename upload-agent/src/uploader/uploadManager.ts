import { FileQueueStore, QueuedFile } from '../state/fileQueueStore';
import { BackendApiClient } from '../client/backendApiClient';
import { logger } from '../utils/logger';
import fs from 'fs';


export class UploadManager {
  private static isUploading = false;

  /**
   * 업로드 프로세스를 시작합니다.
   * (Why) counselId는 백엔드 업로드 시 필수 식별자이며, 신규 규격에 따라 string 타입을 사용합니다.
   */
  public static async startUploading(mode: 'all' | 'selected' = 'all', sequenceIds?: number[], counselId?: string): Promise<void> {
    if (!counselId) {
      throw new Error('counselId is required for backend upload.');
    }

    if (this.isUploading) {
      logger.info('Upload process is already running.');
      return;
    }

    this.isUploading = true;
    try {
      await this.processQueue(mode, sequenceIds, counselId);
    } finally {
      this.isUploading = false;
      logger.info('Upload process finished or paused.');
    }
  }

  /**
   * 큐를 순차적으로 처리하며 파일을 업로드합니다.
   */
  private static async processQueue(mode: 'all' | 'selected', sequenceIds: number[] | undefined, counselId: string): Promise<void> {
    let filesToUpload: QueuedFile[] = [];

    if (mode === 'all') {
      filesToUpload = FileQueueStore.getPendingFiles();
    } else {
      if (!sequenceIds || sequenceIds.length === 0) {
        throw new Error('No sequence IDs provided for selected upload.');
      }

      for (const id of sequenceIds) {
        const file = FileQueueStore.getFileBySequenceId(id);
        if (!file) {
          throw new Error(`File with sequence ID ${id} not found.`);
        }
        if (file.status !== 'PENDING') {
          throw new Error(`File with sequence ID ${id} is not in PENDING state (current: ${file.status}).`);
        }
        filesToUpload.push(file);
      }
      
      // Sort by sequenceId as requested
      filesToUpload.sort((a, b) => a.sequenceId - b.sequenceId);
    }
    
    if (filesToUpload.length === 0) {
      logger.info('No files to upload.');
      return;
    }

    logger.info(`Starting upload for ${filesToUpload.length} files (mode: ${mode}, counselId: ${counselId})...`);

    for (const file of filesToUpload) {
      try {
        FileQueueStore.updateFileStatus(file.sequenceId, 'UPLOADING');
        
        // (Why) 백엔드 규격에 맞춰 string 타입의 counselId를 전달합니다.
        await BackendApiClient.uploadFile(file.storedPath, file.sequenceId, counselId);
        
        FileQueueStore.updateFileStatus(file.sequenceId, 'COMPLETED');

        // (Why) 보안 및 저장 공간 관리를 위해 업로드 성공 시 스테이징 폴더에서 파일을 삭제합니다.
        try {
          if (fs.existsSync(file.storedPath)) {
            fs.unlinkSync(file.storedPath);
            logger.info(`Successfully cleaned up staged file: ${file.storedPath}`);
            
            // (Why) 물리적 파일 삭제 후, 프론트엔드 UI에서도 즉시 제거하기 위해 큐에서 삭제합니다.
            FileQueueStore.removeFile(file.sequenceId);
          }
        } catch (cleanupError) {
          logger.warn(`Failed to clean up staged file: ${file.storedPath}`, cleanupError);
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error(`Failed to upload file [Seq: ${file.sequenceId}]:`, errorMessage);
        FileQueueStore.updateFileStatus(file.sequenceId, 'FAILED', errorMessage);
        // 순환 참조나 순서 보장이 중요한 도메인 특성상 업로드 실패 시 프로세스를 중단함
        break; 
      }
    }
  }
}
