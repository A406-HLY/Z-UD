import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

export interface Settings {
  watchPath: string;
  allowedExtensions: string[];
}

export class SettingsStore {
  private static settings: Settings;
  private static settingsPath = path.join(__dirname, '../../data/settings.json');

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
