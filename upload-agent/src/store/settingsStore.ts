import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface Settings {
  watchPath: string;
  allowedExtensions: string[];
}

export class SettingsStore {
  private static settings: Settings;
  // (Why) 패키징 시 실행 파일(.exe)과 동일한 위치의 settings.json을 참조합니다.
  private static isPkg = typeof (process as any).pkg !== 'undefined';
  private static settingsPath = SettingsStore.isPkg 
    ? path.join(path.dirname(process.execPath), 'settings.json')
    : path.join(__dirname, '../../data/settings.json');

  public static load(): void {
    try {
      if (!fs.existsSync(this.settingsPath)) {
        logger.warn(`Settings file not found at ${this.settingsPath}. Using defaults.`);
        this.settings = { watchPath: './', allowedExtensions: [] };
        return;
      }

      const fileContent = fs.readFileSync(this.settingsPath, 'utf8');
      this.settings = JSON.parse(fileContent);
      logger.info('Settings loaded successfully.');
    } catch (error) {
      logger.error('Failed to load settings from JSON:', error);
      throw error;
    }
  }

  public static get(): Settings {
    if (!this.settings) {
      this.load();
    }
    return this.settings;
  }
}
