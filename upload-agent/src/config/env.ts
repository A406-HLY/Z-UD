import dotenv from 'dotenv';
import path from 'path';

// (Why) 패키징(pkg) 시 실행 파일(.exe)과 동일한 위치의 .env를 참조하도록 경로를 보정합니다.
const isPkg = typeof (process as any).pkg !== 'undefined';
const envPath = isPkg 
  ? path.join(path.dirname(process.execPath), '.env')
  : path.join(__dirname, '../../.env');

dotenv.config({ path: envPath });

export const config = {
  backendApiUrl: process.env.BACKEND_API_URL || 'https://j14a406.p.ssafy.io/api',
};

