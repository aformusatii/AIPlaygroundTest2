import { db } from '../config/database.js';
import {
  type ApiKeyEntity,
  type ApiKeyCreateInput,
  type ApiKeyUpdateInput,
} from '../types/entities.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, ApiKeyEntity>('apiKeys', { valueEncoding: 'json' });

class ApiKeysService extends BaseService<ApiKeyEntity, ApiKeyCreateInput, ApiKeyUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'API key',
      searchableFields: ['name', 'provider', 'baseUrl', 'notes', 'environment', 'scopes', 'tags'],
      sensitiveFields: ['apiKey'],
      workspaceField: 'workspaceId',
      defaultSort: '-updatedAt,name',
    });
  }
}

export const apiKeysService = new ApiKeysService();
