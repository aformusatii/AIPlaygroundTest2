import { db } from '../config/database.js';
import {
  type WorkspaceEntity,
  type WorkspaceCreateInput,
  type WorkspaceUpdateInput,
} from '../types/entities.js';
import { BaseService } from './baseService.js';

const store = db.sublevel<string, WorkspaceEntity>('workspaces', { valueEncoding: 'json' });

class WorkspacesService extends BaseService<WorkspaceEntity, WorkspaceCreateInput, WorkspaceUpdateInput> {
  constructor() {
    super(store, {
      resourceName: 'Workspace',
      searchableFields: ['name', 'description'],
      sensitiveFields: [],
      defaultSort: 'name',
    });
  }
}

export const workspacesService = new WorkspacesService();
