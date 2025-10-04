import fs from 'node:fs';
import path from 'node:path';

process.env.NODE_ENV = 'test';
const testDbPath = path.resolve('backend/data/test-db');
const testUploadDir = path.resolve('backend/public/uploads-test');
process.env.DB_PATH = testDbPath;
process.env.UPLOAD_DIR = testUploadDir;
process.env.CORS_ORIGIN = '*';

if (fs.existsSync(testDbPath)) {
  fs.rmSync(testDbPath, { recursive: true, force: true });
}

if (fs.existsSync(testUploadDir)) {
  fs.rmSync(testUploadDir, { recursive: true, force: true });
}

fs.mkdirSync(testUploadDir, { recursive: true });
