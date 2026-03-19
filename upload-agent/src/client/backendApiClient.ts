import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path'; // 파일명 추출을 위해 추가
import { config } from '../config/env';
import { logger } from '../utils/logger';

const apiClient = axios.create({
  baseURL: config.backendApiUrl,
  timeout: 60000,
});

export class BackendApiClient {
  /**
   * 파일을 실제 백엔드 서버로 업로드합니다.
   * (Why) 백엔드 규격 변경에 따라 counselId를 string(UUID) 타입으로 전송합니다.
   */
  public static async uploadFile(storedPath: string, sequenceId: number, counselId: string): Promise<void> {
    logger.info(`Starting ACTUAL upload to backend: [Seq: ${sequenceId}] for Counsel: ${counselId}`);
    
    try {
      // 전송 전 파일 상태 최종 확인
      const stats = fs.statSync(storedPath);
      logger.info(`Staged file check: ${path.basename(storedPath)} (${stats.size} bytes)`);

      const formData = new FormData();
      /**
       * 스프링 백엔드에서 파일을 정확히 인식하도록 
       * filename과 contentType을 명시적으로 지정합니다.
       */
      formData.append('multipartFile', fs.createReadStream(storedPath), {
        filename: path.basename(storedPath),
        contentType: 'application/pdf', // 명세서상 PDF 권장이므로 명시
      });

      /**
       * 명세서에 따라 counselId를 Query Parameter로 전달합니다.
       * (Why) 백엔드가 문자열 규격의 UUID를 기대하므로 string 타입으로 전송됩니다.
       * POST /api/v1/documents?counselId=550e8400-e29b-41d4-a716...
       */
      const url = '/documents';
      await apiClient.post(url, formData, {
        params: { counselId },
        headers: {
          ...formData.getHeaders(),
        },
      });

      logger.info(`Backend successfully received and accepted file: [Seq: ${sequenceId}]`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;
        const errorMessage = error.message;
        const errorCode = error.code;
        
        logger.error(`Backend upload failed [Status: ${status}] [Code: ${errorCode}]:`, errorMessage);
        if (responseData) {
          logger.error('Response Data:', JSON.stringify(responseData));
        }
        
        throw new Error(`Backend Error (${status || errorCode}): ${errorMessage}`);
      }
      logger.error('Unexpected error during upload:', error);
      throw error;
    }
  }
}
