import path from 'node:path';
import { fileURLToPath } from 'node:url';
import 'dotenv/config';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const projectRoot = path.resolve(dirname, '../../..');

const resolvePath = (relative: string) => path.resolve(projectRoot, relative);

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0',
  dbPath: resolvePath(process.env.DB_PATH ?? 'backend/data/secretarium-db'),
  uploadDir: resolvePath(process.env.UPLOAD_DIR ?? 'backend/public/uploads'),
  logFormat: process.env.LOG_FORMAT ?? 'dev',
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
};
