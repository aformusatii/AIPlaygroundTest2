import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { Workspace } from '@/types/resources';
import {
  listResource,
  createResource,
  updateResource,
  deleteResource,
} from '@/services/resources';

const STORAGE_KEY = 'secretarium_active_workspace';

type WorkspacePayload = Partial<Pick<Workspace, 'name' | 'description'>> & { name: string };

export const useWorkspaceStore = defineStore('workspaces', () => {
  const items = ref<Workspace[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const selectedWorkspaceId = ref<string>('');

  const currentWorkspace = computed(() => items.value.find((workspace) => workspace.id === selectedWorkspaceId.value) ?? null);

  const ensureSelection = () => {
    if (items.value.length === 0) {
      selectedWorkspaceId.value = '';
      return;
    }
    if (selectedWorkspaceId.value && items.value.some((workspace) => workspace.id === selectedWorkspaceId.value)) {
      return;
    }
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
    if (stored && items.value.some((workspace) => workspace.id === stored)) {
      selectedWorkspaceId.value = stored;
      return;
    }
    selectedWorkspaceId.value = items.value[0].id;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, selectedWorkspaceId.value);
    }
  };

  const fetchWorkspaces = async () => {
    loading.value = true;
    try {
      const response = await listResource<Workspace>('workspaces', { limit: 200 });
      items.value = response.data;
      ensureSelection();
      error.value = null;
    } catch (err) {
      error.value = 'Failed to load workspaces';
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  const setCurrentWorkspace = (id: string) => {
    selectedWorkspaceId.value = id;
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, id);
    }
  };

  const createWorkspace = async (payload: WorkspacePayload) => {
    const response = await createResource<typeof payload, Workspace>('workspaces', payload);
    items.value.unshift(response.data);
    setCurrentWorkspace(response.data.id);
    return response.data;
  };

  const updateWorkspace = async (id: string, payload: Partial<WorkspacePayload>) => {
    const response = await updateResource<typeof payload, Workspace>('workspaces', id, payload);
    items.value = items.value.map((workspace) => (workspace.id === id ? response.data : workspace));
    return response.data;
  };

  const removeWorkspace = async (id: string) => {
    await deleteResource('workspaces', id);
    items.value = items.value.filter((workspace) => workspace.id !== id);
    if (selectedWorkspaceId.value === id) {
      selectedWorkspaceId.value = '';
      ensureSelection();
    }
  };

  return {
    items,
    loading,
    error,
    selectedWorkspaceId,
    currentWorkspace,
    fetchWorkspaces,
    setCurrentWorkspace,
    createWorkspace,
    updateWorkspace,
    removeWorkspace,
  };
});
