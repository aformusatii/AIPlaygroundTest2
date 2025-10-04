import { Router } from 'express';
import {
  sshKeyCreateSchema,
  sshKeyUpdateSchema,
} from '../../types/entities.js';
import { sshKeysService } from '../../services/sshKeysService.js';
import { createResourceRouter } from './resourceRouter.js';

export const sshKeysRouter = (): Router =>
  createResourceRouter(sshKeysService, {
    createSchema: sshKeyCreateSchema,
    updateSchema: sshKeyUpdateSchema,
    copyableFields: [
      { path: 'privateKey', field: 'privateKey' },
    ],
  });
