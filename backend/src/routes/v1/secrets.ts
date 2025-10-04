import { Router } from 'express';
import {
  secretCreateSchema,
  secretUpdateSchema,
} from '../../types/entities.js';
import { secretsService } from '../../services/secretsService.js';
import { createResourceRouter } from './resourceRouter.js';

export const secretsRouter = (): Router =>
  createResourceRouter(secretsService, {
    createSchema: secretCreateSchema,
    updateSchema: secretUpdateSchema,
    copyableFields: [
      { path: 'password', field: 'password' },
    ],
  });
