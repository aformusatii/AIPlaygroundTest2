import { Router } from 'express';
import {
  bankAccountCreateSchema,
  bankAccountUpdateSchema,
} from '../../types/entities.js';
import { bankAccountsService } from '../../services/bankAccountsService.js';
import { createResourceRouter } from './resourceRouter.js';

export const bankAccountsRouter = (): Router =>
  createResourceRouter(bankAccountsService, {
    createSchema: bankAccountCreateSchema,
    updateSchema: bankAccountUpdateSchema,
    copyableFields: [
      { path: 'accountNumber', field: 'accountNumber' },
    ],
  });
