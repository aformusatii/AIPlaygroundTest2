console.log('Hello !!!');

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import { env } from './config/env.js';
import { v1Router } from './routes/v1/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openApiPath = path.resolve(__dirname, '../openapi.yaml');
const openApiDocument = YAML.parse(fs.readFileSync(openApiPath, 'utf8'));

export const app = express();

try {
  // app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === '*' ? undefined : env.corsOrigin.split(',').map((origin) => origin.trim()),
    }),
  );
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.logFormat));
  }
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  const uploadsDir = env.uploadDir;
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
  });

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.use('/api/v1', v1Router());

  app.use(notFoundHandler);
  app.use(errorHandler);

  if (env.nodeEnv !== 'test') {
    app.listen(env.port, env.host, () => {
      // eslint-disable-next-line no-console
      console.log(`Secretarium backend listening on http://${env.host}:${env.port}`);
    });
  }
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', error);
  process.exit(1);
}
