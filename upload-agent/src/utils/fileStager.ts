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

    let attempt = 0;
    const maxRetries = 5;
    const retryDelayMs = 500;

    while (attempt < maxRetries) {
      try {
        // Move the file
        await fs.promises.rename(originalPath, storedPath);
        logger.info(`Successfully staged file to: ${storedPath}`);
        return storedPath;
      } catch (error: any) {
        if (error.code === 'EBUSY' && attempt < maxRetries - 1) {
          attempt++;
          logger.warn(`File ${fileName} is busy. Retrying (${attempt}/${maxRetries}) in ${retryDelayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryDelayMs));
        } else {
          logger.error(`Failed to stage file ${originalPath} to ${storedPath}`, error);
          throw error;
        }
      }
    }
    throw new Error('Unreachable code');
  }
}
