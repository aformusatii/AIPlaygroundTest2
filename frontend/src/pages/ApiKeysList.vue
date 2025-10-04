<template>
  <div>
    <div class="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
      <SearchBar v-model="search" placeholder="Search by name, provider, notes" />
      <button type="button" class="btn btn-primary" @click="toggleForm">{{ showForm ? 'Close' : 'New API Key' }}</button>
    </div>

    <div v-if="showForm" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ editingId ? 'Update API Key' : 'Create API Key' }}</h5>
        <form class="row g-3" @submit.prevent="submit">
          <div class="col-md-4">
            <label class="form-label">Name</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">Provider</label>
            <input v-model="form.provider" type="text" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">API Key</label>
            <input v-model="form.apiKey" type="text" class="form-control" :placeholder="editingId ? 'Leave blank to keep current' : ''" :required="!editingId" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Environment</label>
            <select v-model="form.environment" class="form-select" required>
              <option value="dev">Development</option>
              <option value="stage">Staging</option>
              <option value="prod">Production</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">Base URL</label>
            <input v-model="form.baseUrl" type="url" class="form-control" placeholder="https://" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Scopes</label>
            <input v-model="scopesInput" type="text" class="form-control" placeholder="scope:read,scope:write" />
          </div>
          <div class="col-md-12">
            <label class="form-label">Tags</label>
            <input v-model="tagsInput" type="text" class="form-control" placeholder="comma,separated" />
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea v-model="form.notes" class="form-control" rows="2"></textarea>
          </div>
          <div class="col-12">
            <IconUploader v-model="form.iconUrl" />
          </div>
          <div class="col-12 d-flex gap-2">
            <button type="submit" class="btn btn-primary">{{ editingId ? 'Save Changes' : 'Create API Key' }}</button>
            <button type="button" class="btn btn-outline-secondary" @click="resetForm">Reset</button>
          </div>
        </form>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :rows="rows"
      :loading="store.state.loading"
      v-model:sort="store.state.sort"
      show-actions
      @sort="handleSort"
    >
      <template #cell-workspace="{ row }">
        <span class="badge text-bg-light">{{ row.workspaceName }}</span>
      </template>
      <template #cell-apiKey="{ row }">
        <div class="d-flex align-items-center gap-2">
          <span class="text-monospace">{{ row.apiKey }}</span>
          <CopyButton :copy-fn="() => store.copy(row.id, 'apiKey')" />
        </div>
      </template>
      <template #cell-updatedAt="{ row }">{{ formatDate(row.updatedAt) }}</template>
      <template #cell-tags="{ row }">
        <div class="d-flex flex-wrap gap-1">
          <span v-for="tag in row.tags" :key="tag" class="badge text-bg-primary">{{ tag }}</span>
          <span v-if="!row.tags?.length" class="text-muted small">—</span>
        </div>
      </template>
      <template #actions="{ row }">
        <div class="d-inline-flex gap-2">
          <button type="button" class="btn btn-link btn-sm" @click="edit(row)">Edit</button>
          <button type="button" class="btn btn-link text-danger btn-sm" @click="remove(row.id)">Delete</button>
        </div>
      </template>
    </DataTable>

    <PaginationControls :meta="store.state.meta" class="mt-3" @change="changePage" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import DataTable, { type DataTableColumn } from '@/components/DataTable.vue';
import SearchBar from '@/components/SearchBar.vue';
import IconUploader from '@/components/IconUploader.vue';
import CopyButton from '@/components/CopyButton.vue';
import PaginationControls from '@/components/PaginationControls.vue';
import { useApiKeysStore } from '@/stores/resources';
import { useWorkspaceStore } from '@/stores/workspaces';
import { useNotificationsStore } from '@/stores/notifications';
import type { ApiKey, ApiKeyForm, ApiKeyUpdateForm } from '@/types/resources';

const store = useApiKeysStore();
const workspaceStore = useWorkspaceStore();
const notifications = useNotificationsStore();

const showForm = ref(false);
const editingId = ref<string | null>(null);
const search = ref('');
const tagsInput = ref('');
const scopesInput = ref('');

const form = reactive({
  name: '',
  provider: '',
  apiKey: '',
  environment: 'dev',
  baseUrl: '',
  notes: '',
  iconUrl: undefined as string | undefined,
});

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'provider', label: 'Provider', sortable: true },
  { key: 'environment', label: 'Env', sortable: true },
  { key: 'workspace', label: 'Workspace' },
  { key: 'apiKey', label: 'Key' },
  { key: 'tags', label: 'Tags' },
  { key: 'updatedAt', label: 'Updated', sortable: true },
];
const formatDate = (value: string) => new Date(value).toLocaleString();

const rows = computed(() =>
  store.state.items.map((item) => ({
    ...item,
    workspaceName: workspaceStore.items.find((workspace) => workspace.id === item.workspaceId)?.name ?? '—',
    workspace: workspaceStore.items.find((workspace) => workspace.id === item.workspaceId)?.name ?? '—',
  })),
);

const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    resetForm();
  }
};

const resetForm = () => {
  form.name = '';
  form.provider = '';
  form.apiKey = '';
  form.environment = 'dev';
  form.baseUrl = '';
  form.notes = '';
  form.iconUrl = undefined;
  tagsInput.value = '';
  scopesInput.value = '';
  editingId.value = null;
};

const submit = async () => {
  if (!workspaceStore.selectedWorkspaceId) return;
  const basePayload = {
    workspaceId: workspaceStore.selectedWorkspaceId,
    name: form.name,
    provider: form.provider,
    environment: form.environment as ApiKey['environment'],
    baseUrl: form.baseUrl || undefined,
    notes: form.notes || undefined,
    iconUrl: form.iconUrl,
    scopes: scopesInput.value
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean),
    tags: tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  } satisfies Omit<ApiKeyForm, 'apiKey'>;

  try {
    if (editingId.value) {
      const payload: ApiKeyUpdateForm = {
        ...basePayload,
      };
      if (form.apiKey) {
        payload.apiKey = form.apiKey;
      }
      await store.update(editingId.value, payload);
      notifications.push('API key updated', 'success');
    } else {
      const payload: ApiKeyForm = {
        ...basePayload,
        apiKey: form.apiKey,
      };
      await store.create(payload);
      notifications.push('API key created', 'success');
    }
    resetForm();
    showForm.value = false;
  } catch (error) {
    console.error(error);
    notifications.push('Failed to save API key', 'danger');
  }
};

const edit = (row: ApiKey) => {
  editingId.value = row.id;
  showForm.value = true;
  form.name = row.name;
  form.provider = row.provider;
  form.apiKey = '';
  form.environment = row.environment;
  form.baseUrl = row.baseUrl ?? '';
  form.notes = row.notes ?? '';
  form.iconUrl = row.iconUrl;
  tagsInput.value = (row.tags ?? []).join(', ');
  scopesInput.value = (row.scopes ?? []).join(', ');
};

const remove = async (id: string) => {
  if (!window.confirm('Delete this API key?')) return;
  await store.remove(id);
  notifications.push('API key deleted', 'success');
};

const changePage = async (page: number) => {
  store.setPage(page);
  await store.fetch({ page, q: search.value });
};

const handleSort = async (value: string) => {
  store.state.sort = value;
  await store.fetch({ sort: value, page: 1, q: search.value });
};

watch(
  () => workspaceStore.selectedWorkspaceId,
  async (workspaceId) => {
    if (!workspaceId) return;
    resetForm();
    await store.fetch({ page: 1 });
  },
  { immediate: true },
);

watch(search, async () => {
  await store.fetch({ page: 1, q: search.value });
});
</script>
