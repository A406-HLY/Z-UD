import chokidar from 'chokidar';
import path from 'path';
import fs from 'fs'; // fs/promises 대신 fs 임포트
import { logger } from '../utils/logger';
import { SettingsStore } from '../store/settingsStore';
import { FileQueueStore } from '../state/fileQueueStore';
import { FileStager } from '../utils/fileStager';

interface ChokidarWatcher {
  on(event: string, callback: (...args: any[]) => void): this;
  close(): Promise<void>;
}

export class FolderWatcher {
  /** chokidar 타입 임포트 시 발생할 수 있는 의존성 문제를 방지하기 위해 최소 인터페이스 사용 */
  private watcher?: ChokidarWatcher; 

  public start(): void {
    const settings = SettingsStore.get();
    
    // Resolve absolute path starting from the project root
    const watchDir = path.resolve(__dirname, '../../', settings.watchPath);
    
    logger.info(`Starting folder watcher on: ${watchDir}`);

    this.watcher = chokidar.watch(watchDir, {
      ignored: /(^|[\/\\])\../, // ignore dotfiles
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000, // wait 2s to ensure file is completely written
        pollInterval: 100,
      },
    }) as unknown as ChokidarWatcher;

    this.watcher
      .on('add', async (filePath: string) => {
        logger.info(`New file detected and stabilized: ${filePath}`);
        
        // Check extensions if specified
        const ext = path.extname(filePath).toLowerCase();
        if (settings.allowedExtensions.length > 0 && !settings.allowedExtensions.includes(ext)) {
          logger.info(`Skipping file with unallowed extension: ${filePath}`);
          return;
        }

        // Make sure it's valid
        if (ext) {
           const fileName = path.basename(filePath);
           
           try {
             // 파일이 안정화된(Write 완료) 시점의 실제 크기를 수집함
             const stats = await fs.promises.stat(filePath);
             const size = stats.size;

             // 1. Move file to staging directory
             const storedPath = await FileStager.stageFile(filePath, fileName);
             
             // 2. Add to Queue using the stored path and collected size
             FileQueueStore.addFile(filePath, storedPath, fileName, size);
           } catch (stagingError: unknown) {
             const message = stagingError instanceof Error ? stagingError.message : 'Unknown staging error';
             logger.error(`Error during file staging/queuing for ${fileName}:`, message);
           }
        }
      })
      .on('error', (error: Error) => logger.error(`Watcher error: ${error}`));
  }

  public stop(): void {
    // watcher가 존재하고 close 메서드를 가지고 있는지 확인하여 안전하게 종료합니다.
    if (this.watcher) {
        this.watcher.close();
        logger.info('Folder watcher stopped.');
    }
  }
}
