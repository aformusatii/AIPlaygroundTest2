import { db } from '../config/database.js';
import {
  type BankAccountEntity,
  type BankAccountCreateInput,
  type BankAccountUpdateInput,
} from '../types/entities.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, BankAccountEntity>('bankAccounts', { valueEncoding: 'json' });

class BankAccountsService extends BaseService<BankAccountEntity, BankAccountCreateInput, BankAccountUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'Bank account',
      searchableFields: ['bankName', 'accountHolder', 'notes', 'iban', 'swiftBic', 'routingNumber', 'tags'],
      sensitiveFields: ['accountNumber'],
      workspaceField: 'workspaceId',
      defaultSort: '-updatedAt,bankName',
    });
  }
}

export const bankAccountsService = new BankAccountsService();
