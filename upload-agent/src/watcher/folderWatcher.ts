import chokidar from 'chokidar';
import path from 'path';
import { logger } from '../utils/logger';
import { SettingsStore } from '../store/settingsStore';
import { FileQueueStore } from '../state/fileQueueStore';

export class FolderWatcher {
  private watcher?: any; // avoid chokidar type resolution issues

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
    });

    this.watcher
      .on('add', async (filePath: string) => {
        logger.info(`New file detected: ${filePath}`);
        
        // Check extensions if specified
        const ext = path.extname(filePath).toLowerCase();
        if (settings.allowedExtensions.length > 0 && !settings.allowedExtensions.includes(ext)) {
          logger.info(`Skipping file with unallowed extension: ${filePath}`);
          return;
        }

        // Make sure it's valid
        if (ext) {
           const fileName = path.basename(filePath);
           FileQueueStore.addFile(filePath, fileName);
        }
      })
      .on('error', (error: Error) => logger.error(`Watcher error: ${error}`));
  }

  public stop(): void {
    if (this.watcher) {
        this.watcher.close();
        logger.info('Folder watcher stopped.');
    }
  }
}
