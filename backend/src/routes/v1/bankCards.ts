import { Router } from 'express';
import {
  bankCardCreateSchema,
  bankCardUpdateSchema,
} from '../../types/entities.js';
import { bankCardsService } from '../../services/bankCardsService.js';
import { createResourceRouter } from './resourceRouter.js';

export const bankCardsRouter = (): Router =>
  createResourceRouter(bankCardsService, {
    createSchema: bankCardCreateSchema,
    updateSchema: bankCardUpdateSchema,
    copyableFields: [
      { path: 'cardNumber', field: 'cardNumber' },
      { path: 'cvv', field: 'cvv' },
    ],
  });
