import express, { Request, Response } from 'express';
import cors from 'cors';
import { logger } from '../utils/logger';
import { FileQueueStore } from '../state/fileQueueStore';
import { UploadManager } from '../uploader/uploadManager';
import { ApiResponseWrapper } from '../utils/apiResponse';

const DEFAULT_PORT = 4000;

export class LocalServer {
  private app = express();
  private port = DEFAULT_PORT; 

  constructor() {
    // (Why) 웹 상용서버(HTTPS)에서 로컬 에이전트(127.0.0.1:4000) 접근 시 Chrome의 PNA(Private Network Access) 차단을 방지하기 위한 보안 헤더 설정
    this.app.use((req: Request, res: Response, next: express.NextFunction) => {
      res.header('Access-Control-Allow-Private-Network', 'true');
      next();
    });
    this.app.use(cors()); // Enable CORS for all routes
    this.app.use(express.json());
    this.setupRoutes();
  }

  private setupRoutes() {
    /** 
     * React 웹이 에이전트의 구동 상태를 확인하기 위한 헬스 체크 엔드포인트.
     * Polling 기반의 연결 상태 확인에 사용됨.
     */
    this.app.get('/health', (req: Request, res: Response) => {
      const statusData = {
        status: 'UP',
        agentName: 'upload-agent',
        timestamp: new Date().toISOString(),
      };
      res.json(ApiResponseWrapper.success(statusData, 'Agent is running'));
    });

    /** 
     * 프론트엔드 목록 화면 상의 렌더링을 위해 최적화된 파일 목록 조회 엔드포인트.
     * items/count 구조를 제공하여 React 상태 관리를 용이하게 함.
     */
    this.app.get('/api/files', (req: Request, res: Response) => {
      const files = FileQueueStore.getFiles();
      const responseData = {
        items: files,
        count: files.length,
      };
      res.json(ApiResponseWrapper.success(responseData, '감지 파일 목록 조회 성공'));
    });

    /**
     * 특정 파일을 선택하여 전송 프로세스를 시작하기 위한 트리거 엔드포인트.
     * 백엔드 API 명세에 따른 필수 파라미터(counselId)를 요구함.
     * (Why) 백엔드 규격 변경에 따라 counselId를 string(UUID)으로 수용하도록 수정되었습니다.
     */
    this.app.post('/api/upload/start', async (req: Request, res: Response): Promise<any> => {
      const { mode = 'all', sequenceIds, counselId, accessToken } = req.body;
      
      // (Debug) 프론트엔드에서 보낸 요청 데이터 확인
      logger.info(`Upload start requested: mode=${mode}, counselId=${counselId}, tokenPresent=${!!accessToken}, sequenceIds=${JSON.stringify(sequenceIds)}`);
      if (!counselId || typeof counselId !== 'string') {
        return res.status(400).json(ApiResponseWrapper.error('MISSING_COUNSEL_ID', null, 'counselId is required and must be a string (UUID).'));
      }

      if (mode !== 'all' && mode !== 'selected') {
        return res.status(400).json(ApiResponseWrapper.error('INVALID_MODE', null, 'Invalid mode. Use "all" or "selected".'));
      }

      if (mode === 'selected') {
        if (!Array.isArray(sequenceIds) || sequenceIds.length === 0) {
          return res.status(400).json(ApiResponseWrapper.error('EMPTY_SELECTION', null, 'sequenceIds must be a non-empty array for mode="selected".'));
        }
        if (!sequenceIds.every(id => typeof id === 'number')) {
          return res.status(400).json(ApiResponseWrapper.error('INVALID_ID_TYPE', null, 'sequenceIds must contain only numbers.'));
        }
      }

      logger.info(`Frontend requested to start upload process (mode: ${mode}, counselId: ${counselId}).`);
      
      try {
        /**
         * 업로드 유효성 검사를 시작 단계에서 수행하여 프론트에 즉각적인 피드백을 제공함.
         * 실제 업로드 프로세스는 내부적으로 비동기 순차 처리를 수행함.
         */
        await UploadManager.startUploading(mode, sequenceIds, counselId, accessToken);
        res.json(ApiResponseWrapper.success(null, 'Upload process completed or started successfully'));
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error during upload start';
        logger.error('Upload process failed to start:', errorMessage);
        res.status(400).json(ApiResponseWrapper.error('UPLOAD_START_FAILED', { details: errorMessage }, errorMessage));
      }
    });
  }

  public start() {
    this.app.listen(this.port, '127.0.0.1', () => {
      logger.info(`Local API Server listening on http://127.0.0.1:${this.port}`);
    });
  }
}
