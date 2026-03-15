import { logger } from './utils/logger';
import { SettingsStore } from './store/settingsStore';
import { FolderWatcher } from './watcher/folderWatcher';
import { LocalServer } from './server/localServer';
import fs from 'fs';
import path from 'path';

async function bootstrap() {
  logger.info('Initializing upload-agent...');

  try {
    // 1. Load configuration and settings
    SettingsStore.load();
    const settings = SettingsStore.get();

    // Ensure the watch directory exists before starting watcher
    const watchDir = path.resolve(__dirname, '../', settings.watchPath);
    if (!fs.existsSync(watchDir)) {
      logger.warn(`Watch directory does not exist. Creating it: ${watchDir}`);
      fs.mkdirSync(watchDir, { recursive: true });
    }

    // 2. Start local API server for Frontend
    const localServer = new LocalServer();
    localServer.start();

    // 3. Start folder watcher
    const watcher = new FolderWatcher();
    watcher.start();

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down upload-agent...');
      watcher.stop();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start upload-agent:', error);
    process.exit(1);
  }
}

bootstrap();
