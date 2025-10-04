import { db } from '../config/database.js';
import {
  type BankCardEntity,
  type BankCardCreateInput,
  type BankCardUpdateInput,
} from '../types/entities.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, BankCardEntity>('bankCards', { valueEncoding: 'json' });

class BankCardsService extends BaseService<BankCardEntity, BankCardCreateInput, BankCardUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'Bank card',
      searchableFields: ['cardholderName', 'brand', 'billingAddress', 'notes', 'tags'],
      sensitiveFields: ['cardNumber', 'cvv'],
      workspaceField: 'workspaceId',
      defaultSort: '-updatedAt,cardholderName',
    });
  }
}

export const bankCardsService = new BankCardsService();
