import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/services/resources', () => ({
  listResource: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
  uploadIcon: vi.fn(),
  copySecretField: vi.fn(),
}));

import { listResource } from '@/services/resources';
import { useWorkspaceStore } from '@/stores/workspaces';
import type { Workspace } from '@/types/resources';

describe('Workspace Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    $(("const mockedListResource = listResource as unknown as vi.Mock;\n  mockedListResource.mockResolvedValue"))({
      data: [
        { id: 'w1', name: 'Primary', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'w2', name: 'Backup', description: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ] satisfies Workspace[],
      meta: { total: 2, page: 1, limit: 25, totalPages: 1, hasMore: false },
    });
  });

  it('fetches and selects first workspace when none selected', async () => {
    const store = useWorkspaceStore();
    await store.fetchWorkspaces();
    expect(store.items).toHaveLength(2);
    expect(store.selectedWorkspaceId).toBe('w1');
  });
});

