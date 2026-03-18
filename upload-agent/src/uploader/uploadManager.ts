import { FileQueueStore, QueuedFile } from '../state/fileQueueStore';
import { BackendApiClient } from '../client/backendApiClient';
import { logger } from '../utils/logger';

export class UploadManager {
  private static isUploading = false;

  public static async startUploading(mode: 'all' | 'selected' = 'all', sequenceIds?: number[], counselId?: number): Promise<void> {
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

  private static async processQueue(mode: 'all' | 'selected', sequenceIds: number[] | undefined, counselId: number): Promise<void> {
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

    logger.info(`Starting upload for ${filesToUpload.length} files (mode: ${mode})...`);

    for (const file of filesToUpload) {
      try {
        FileQueueStore.updateFileStatus(file.sequenceId, 'UPLOADING');
        
        await BackendApiClient.uploadFile(file.storedPath, file.sequenceId, counselId);
        
        FileQueueStore.updateFileStatus(file.sequenceId, 'COMPLETED');
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
