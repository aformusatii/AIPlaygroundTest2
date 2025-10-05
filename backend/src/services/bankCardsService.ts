import { db } from '../config/database.js';
import {
  type BankCardEntity,
  type BankCardCreateInput,
  type BankCardUpdateInput,
} from '../types/entities.js';
import { MASK_PLACEHOLDER } from '../utils/mask.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, BankCardEntity>('bankCards', { valueEncoding: 'json' });

const maskCardNumber = (value: unknown): string => {
  if (typeof value !== 'string') {
    return MASK_PLACEHOLDER;
  }

  const digits = value.replace(/\D+/g, '');
  if (!digits.length) {
    return MASK_PLACEHOLDER;
  }

  const lastFour = digits.slice(-4);
  const formattedLastFour = lastFour.padStart(4, '*');
  return `**** ${formattedLastFour}`;
};

class BankCardsService extends BaseService<BankCardEntity, BankCardCreateInput, BankCardUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'Bank card',
      searchableFields: ['cardholderName', 'brand', 'billingAddress', 'notes', 'tags'],
      sensitiveFields: [
        { field: 'cardNumber', mask: (value) => maskCardNumber(value) },
        'cvv',
      ],
      workspaceField: 'workspaceId',
      defaultSort: '-updatedAt,cardholderName',
    });
  }
}

export const bankCardsService = new BankCardsService();
