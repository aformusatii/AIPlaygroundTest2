import { Router } from 'express';
import {
  workspaceCreateSchema,
  workspaceUpdateSchema,
} from '../../types/entities.js';
import { workspacesService } from '../../services/workspacesService.js';
import { createResourceRouter } from './resourceRouter.js';

export const workspacesRouter = (): Router =>
  createResourceRouter(workspacesService, {
    createSchema: workspaceCreateSchema,
    updateSchema: workspaceUpdateSchema,
    copyableFields: [],
  });
