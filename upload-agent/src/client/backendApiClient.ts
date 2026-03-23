import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const apiClient = axios.create({
  baseURL: config.backendApiUrl,
  timeout: 60000,
});

export interface FileMetaDto {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface PresignedUrlDto {
  fileName: string;
  presignedUrl: string;
  expiresIn: number;
}

interface PresignedUrlResponse {
  success: boolean;
  data: {
    files: PresignedUrlDto[];
  };
}

export class BackendApiClient {
  /**
   * 백엔드 API를 호출하여 파일별 Presigned URL 목록을 발급받습니다.
   * (Why) 백엔드의 파일 I/O 부하를 줄이기 위해 메타데이터만으로 스토리지 접근용 서명된 URL을 선발급받습니다.
   */
  public static async getPresignedUrls(counselId: string, files: FileMetaDto[]): Promise<PresignedUrlDto[]> {
    logger.info(`Requesting presigned URLs for ${files.length} files (Counsel: ${counselId})`);
    
    try {
      const url = '/v1/documents/presigned-urls';
      const response = await apiClient.post<PresignedUrlResponse>(url, {
        consultationId: counselId, // (Why) 명세서에 맞게 변수명을 매핑합니다.
        files,
      });

      if (!response.data.success) {
         throw new Error('API reported failure without explicit HTTP error.');
      }

      logger.info(`Successfully received ${response.data.data.files.length} presigned URLs.`);
      return response.data.data.files;
    } catch (error: any) {
       this.handleAxiosError(error, 'getPresignedUrls');
       throw error; 
    }
  }

  /**
   * 발급받은 Presigned URL을 사용하여 R2 스토리지(S3 호환)로 파일을 직접 PUT 업로드합니다.
   * (Why) 클라우드 스토리지는 청크 기반 전송을 거절할 수 있으므로, Content-Length와 지정된 Content-Type을 필수적으로 헤더에 포함합니다.
   */
  public static async uploadToR2(url: string, filePath: string, contentType: string, fileSize: number): Promise<void> {
    logger.info(`Starting ACTUAL upload to R2 for file: ${path.basename(filePath)}`);
    
    try {
      const fileStream = fs.createReadStream(filePath);
      
      await axios.put(url, fileStream, {
        headers: {
          'Content-Type': contentType,
          'Content-Length': fileSize, // (Why) Node.js 환경에서 stream PUT 시 411 Length Required 예외 방지
        },
        maxBodyLength: Infinity,
        timeout: 9 * 60 * 1000, // (Why) 대용량 전송을 위한 9분 타임아웃
      });
      
      logger.info(`Successfully direct-uploaded file to R2: ${path.basename(filePath)}`);
    } catch (error: any) {
       logger.error(`R2 Direct Upload failed for ${path.basename(filePath)}:`, error.message);
       if (axios.isAxiosError(error) && error.response?.status === 403) {
         throw new Error('PRESIGNED_URL_EXPIRED');
       }
       throw error;
    }
  }

  private static handleAxiosError(error: unknown, context: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      const errorMessage = error.message;
      const errorCode = error.code;
      
      logger.error(`[${context}] Backend API failed [Status: ${status}] [Code: ${errorCode}]:`, errorMessage);
      if (responseData) {
        logger.error('Response Data:', JSON.stringify(responseData));
      }
      
      throw new Error(`Backend Error (${status || errorCode}): ${errorMessage}`);
    }
    logger.error(`[${context}] Unexpected error:`, error);
    throw error as Error;
  }
}
