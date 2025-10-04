import { db } from '../config/database.js';
import {
  type SecretEntity,
  type SecretCreateInput,
  type SecretUpdateInput,
} from '../types/entities.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, SecretEntity>('secrets', { valueEncoding: 'json' });

class SecretsService extends BaseService<SecretEntity, SecretCreateInput, SecretUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'Secret',
      searchableFields: ['name', 'username', 'notes', 'url', 'tags'],
      sensitiveFields: ['password'],
      workspaceField: 'workspaceId',
      defaultSort: '-updatedAt,name',
    });
  }
}

export const secretsService = new SecretsService();
