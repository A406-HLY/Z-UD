import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import fs from 'fs';

const apiClient = axios.create({
  baseURL: config.backendApiUrl,
  timeout: 30000,
});

export class BackendApiClient {
  public static async uploadFile(storedPath: string, sequenceId: number): Promise<void> {
    logger.info(`Sending STAGED file to backend: [Seq: ${sequenceId}] ${storedPath}`);
    
    // TODO: Implement actual multipart/form-data upload when backend API is ready
    // const formData = new FormData();
    // formData.append('file', fs.createReadStream(filePath));
    // formData.append('sequenceId', sequenceId.toString());
    // await apiClient.post('/upload', formData, { ... });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    logger.info(`Backend successfully received: [Seq: ${sequenceId}]`);
  }
}
