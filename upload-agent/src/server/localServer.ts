import express, { Request, Response } from 'express';
import cors from 'cors';
import { logger } from '../utils/logger';
import { FileQueueStore } from '../state/fileQueueStore';
import { UploadManager } from '../uploader/uploadManager';

export class LocalServer {
  private app = express();
  private port = 4000; // default local port

  constructor() {
    this.app.use(cors()); // Enable CORS for all routes
    this.app.use(express.json());
    this.setupRoutes();
  }

  private setupRoutes() {
    // 1. Get queue status
    this.app.get('/api/files', (req: Request, res: Response) => {
      res.json(FileQueueStore.getFiles());
    });

    // 2. Trigger upload
    this.app.post('/api/upload/start', async (req: Request, res: Response) => {
      logger.info('Frontend requested to start upload process.');
      
      // Start upload process asynchronously
      UploadManager.startUploading()
        .catch((err: Error) => logger.error('Upload process failed:', err.message));

      res.json({ message: 'Upload process started' });
    });
  }

  public start() {
    this.app.listen(this.port, '127.0.0.1', () => {
      logger.info(`Local API Server listening on http://127.0.0.1:${this.port}`);
    });
  }
}
