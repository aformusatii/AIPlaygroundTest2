import { Router } from 'express';
import { secretsRouter } from './secrets.js';
import { apiKeysRouter } from './apiKeys.js';
import { sshKeysRouter } from './sshKeys.js';
import { bankCardsRouter } from './bankCards.js';
import { bankAccountsRouter } from './bankAccounts.js';
import { workspacesRouter } from './workspaces.js';
import { uploadsRouter } from './uploads.js';

export const v1Router = (): Router => {
  const router = Router();
  router.use('/workspaces', workspacesRouter());
  router.use('/secrets', secretsRouter());
  router.use('/api-keys', apiKeysRouter());
  router.use('/ssh-keys', sshKeysRouter());
  router.use('/bank-cards', bankCardsRouter());
  router.use('/bank-accounts', bankAccountsRouter());
  router.use('/uploads', uploadsRouter());
  return router;
};
