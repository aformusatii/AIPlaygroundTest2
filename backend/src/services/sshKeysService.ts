import { db } from '../config/database.js';
import {
  type SshKeyEntity,
  type SshKeyCreateInput,
  type SshKeyUpdateInput,
} from '../types/entities.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, SshKeyEntity>('sshKeys', { valueEncoding: 'json' });

class SshKeysService extends BaseService<SshKeyEntity, SshKeyCreateInput, SshKeyUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'SSH key',
      searchableFields: ['name', 'publicKey', 'comment', 'notes', 'tags'],
      sensitiveFields: ['privateKey'],
      workspaceField: 'workspaceId',
      defaultSort: '-updatedAt,name',
    });
  }
}

export const sshKeysService = new SshKeysService();
