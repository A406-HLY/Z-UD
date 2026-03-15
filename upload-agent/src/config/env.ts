import dotenv from 'dotenv';
import path from 'path';

// Load .env file from the root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

export const config = {
  backendApiUrl: process.env.BACKEND_API_URL || 'http://localhost:3000/api',
};
