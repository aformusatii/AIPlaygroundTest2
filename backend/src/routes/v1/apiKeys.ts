import { Router } from 'express';
import {
  apiKeyCreateSchema,
  apiKeyUpdateSchema,
} from '../../types/entities.js';
import { apiKeysService } from '../../services/apiKeysService.js';
import { createResourceRouter } from './resourceRouter.js';

export const apiKeysRouter = (): Router =>
  createResourceRouter(apiKeysService, {
    createSchema: apiKeyCreateSchema,
    updateSchema: apiKeyUpdateSchema,
    copyableFields: [
      { path: 'apiKey', field: 'apiKey' },
    ],
  });
