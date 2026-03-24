import { FileQueueStore, QueuedFile } from '../state/fileQueueStore';
import { BackendApiClient, FileMetaDto, PresignedUrlDto, UploadCompletionResult } from '../client/backendApiClient';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';

// (Why) 마스터 규칙에 따라 엄격한 타입 안정성을 확보하기 위해 허용 확장자에 대한 MIME 매핑을 정의합니다.
// 사전 검증을 원활히 통과시키고, Direct Upload 시 서명이 거부되지 않도록 정확한 타입을 주입합니다.
const getContentType = (filename: string): string => {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf': return 'application/pdf';
    case '.jpg':
    case '.jpeg': return 'image/jpeg';
    case '.png': return 'image/png';
    case '.csv': return 'text/csv';
    case '.txt': return 'text/plain';
    default: return 'application/octet-stream';
  }
};

/**
 * 지수 백오프 기반 재시도 로직이 포함된 직접 R2 업로드 실행기입니다.
 * (Why) 클라우드 스토리지 네트워킹은 간헐적 지연이나 연결 끊김이 발생할 수 있어, 견고성을 높이기 위해 재시도 래퍼를 사용합니다.
 */
const executeUploadWithRetry = async (url: string, filePath: string, contentType: string, fileSize: number, maxRetries = 3): Promise<void> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await BackendApiClient.uploadToR2(url, filePath, contentType, fileSize);
      return;
    } catch (error: any) {
      if (error.message === 'PRESIGNED_URL_EXPIRED') {
         throw error; // 서명 완전 만료 시 재시도 포기
      }
      if (attempt === maxRetries) throw error;
      const delay = 1000 * attempt;
      logger.warn(`Upload failed, retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

export class UploadManager {
  private static isUploading = false;

  /**
   * 업로드 프로세스를 시작합니다.
   * (Why) counselId는 백엔드 업로드 시 필수 식별자이며, 신규 규격에 따라 string 타입을 사용합니다.
   */
  public static async startUploading(mode: 'all' | 'selected' = 'all', sequenceIds?: number[], counselId?: string, accessToken?: string): Promise<void> {
    if (!counselId) {
      throw new Error('counselId is required for backend upload.');
    }

    if (this.isUploading) {
      logger.info('Upload process is already running.');
      return;
    }

    this.isUploading = true;
    try {
      await this.processQueue(mode, sequenceIds, counselId, accessToken);
    } finally {
      this.isUploading = false;
      logger.info('Upload process finished or paused.');
    }
  }

  /**
   * 큐를 순차적으로 처리하며 파일을 직접 업로드합니다.
   * (Why) 백엔드의 사전 메타데이터 검증을 통해 Presigned URL을 대량 발급받은 뒤, 
   * 스토리지에 클라이언트(에이전트)가 순차 직접 전송(Direct Upload)하는 구조입니다.
   */
  private static async processQueue(mode: 'all' | 'selected', sequenceIds: number[] | undefined, counselId: string, accessToken?: string): Promise<void> {
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
      
      filesToUpload.sort((a, b) => a.sequenceId - b.sequenceId);
    }
    
    if (filesToUpload.length === 0) {
      logger.info('No files to upload.');
      return;
    }

    logger.info(`Starting upload process for ${filesToUpload.length} files (mode: ${mode}, counselId: ${counselId})...`);

    // 1. API 명세서에 맞는 FileMetaDto 구성 및 즉각적인 상태 전이
    const fileMetas: FileMetaDto[] = filesToUpload.map(file => {
       FileQueueStore.updateFileStatus(file.sequenceId, 'UPLOADING');
       return {
         fileName: file.fileName,
         contentType: getContentType(file.fileName),
         fileSize: file.size,
       };
    });

    // 2. Presigned URL 대량 발급 요청
    let presignedUrls: PresignedUrlDto[];
    try {
       presignedUrls = await BackendApiClient.getPresignedUrls(counselId, fileMetas, accessToken);
    } catch (error) {
       logger.error('Failed to get Presigned URLs. Halting upload process.');
       filesToUpload.forEach(f => FileQueueStore.updateFileStatus(f.sequenceId, 'FAILED', 'URL 발급 실패'));
       return;
    }

    // 3. 발급받은 URL을 순회하며 R2(스토리지)로 직접 물리적 업로드 (Sequential 진행)
    const uploadResults: UploadCompletionResult[] = [];

    for (const file of filesToUpload) {
      try {
         const urlInfo = presignedUrls.find(u => u.fileName === file.fileName);
         if (!urlInfo) {
            throw new Error(`No presigned URL returned for file ${file.fileName}`);
         }

         const contentType = getContentType(file.fileName);
         
         // Direct PUT 
         await executeUploadWithRetry(urlInfo.presignedUrl, file.storedPath, contentType, file.size);
         
         FileQueueStore.updateFileStatus(file.sequenceId, 'COMPLETED');
         uploadResults.push({ fileName: file.fileName, success: true });

         // 4. 업로드 완료된 스캔본의 하드디스크 정리 (Cleanup) 및 프론트엔드 동기화
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
         uploadResults.push({ fileName: file.fileName, success: false });
         // (Why) 순서 보장이나 안정성이 중요한 큐 구조상, 파일 1개가 완전히 실패하면 즉시 전체 일시 정지(break)합니다.
         break; 
      }
    }

    // 5. 업로드 결과를 백엔드에 이벤트 단위로 통보 (Upload Completions API)
    // (Why) 에이전트 내 이벤트 처리의 마지막 단계로, 백엔드가 OCR 처리를 시작할 수 있도록 종료 시점을 명확히 알려줍니다.
    if (uploadResults.length > 0) {
      try {
        await BackendApiClient.notifyUploadCompletions(counselId, uploadResults, accessToken);
      } catch (notifyError) {
        logger.error(`Failed to notify backend of upload completions for counselId: ${counselId}`, notifyError);
      }
    }
  }
}
