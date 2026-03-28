import fs from 'fs';
import path from 'path';
import { logger } from './logger';

export class FileStager {
  private static stagingDir = path.resolve(__dirname, '../../temp/staging');

  public static initialize(): void {
    if (!fs.existsSync(this.stagingDir)) {
      logger.info(`Creating staging directory at: ${this.stagingDir}`);
      fs.mkdirSync(this.stagingDir, { recursive: true });
    }
  }

  /**
   * Moves a file from the original path to the internal staging directory.
   * @param originalPath The absolute path of the detected file.
   * @param fileName The name of the file
   * @returns The new stored path of the file in the staging directory
   */
  public static async stageFile(originalPath: string, fileName: string): Promise<string> {
    this.initialize();

    // To prevent naming collisions or overwriting on identical names,
    // we prefix the filename with a timestamp.
    const timestamp = Date.now();
    const storedFileName = `${timestamp}-${fileName}`;
    const storedPath = path.join(this.stagingDir, storedFileName);

    try {
      // Move the file
      await fs.promises.rename(originalPath, storedPath);
      logger.info(`Successfully staged file to: ${storedPath}`);
      return storedPath;
    } catch (error) {
      logger.error(`Failed to stage file ${originalPath} to ${storedPath}`, error);
      throw error;
    }
  }
}
