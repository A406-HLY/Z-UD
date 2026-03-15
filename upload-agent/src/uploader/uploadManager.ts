import { FileQueueStore } from '../state/fileQueueStore';
import { BackendApiClient } from '../client/backendApiClient';
import { logger } from '../utils/logger';

export class UploadManager {
  private static isUploading = false;

  public static async startUploading(): Promise<void> {
    if (this.isUploading) {
      logger.info('Upload process is already running.');
      return;
    }

    this.isUploading = true;
    try {
      await this.processQueue();
    } finally {
      this.isUploading = false;
      logger.info('Upload process finished or paused.');
    }
  }

  private static async processQueue(): Promise<void> {
    const pendingFiles = FileQueueStore.getPendingFiles();
    
    if (pendingFiles.length === 0) {
      logger.info('No pending files to upload.');
      return;
    }

    logger.info(`Starting upload for ${pendingFiles.length} files...`);

    for (const file of pendingFiles) {
      try {
        FileQueueStore.updateFileStatus(file.sequenceId, 'UPLOADING');
        
        await BackendApiClient.uploadFile(file.filePath, file.sequenceId);
        
        FileQueueStore.updateFileStatus(file.sequenceId, 'COMPLETED');
      } catch (error: any) {
        logger.error(`Failed to upload file [Seq: ${file.sequenceId}]:`, error);
        FileQueueStore.updateFileStatus(file.sequenceId, 'FAILED', error.message || 'Unknown error');
        // Stop processing further files if order must be strictly maintained
        break; 
      }
    }
  }
}
