<template>
  <div>
    <div class="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
      <SearchBar v-model="search" placeholder="Search by name, username, notes" />
      <button type="button" class="btn btn-primary" @click="toggleForm">{{ showForm ? 'Close' : 'New Secret' }}</button>
    </div>

    <div v-if="showForm" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ editingId ? 'Update Secret' : 'Create Secret' }}</h5>
        <form class="row g-3" @submit.prevent="submit">
          <div class="col-md-4">
            <label class="form-label">Name</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">Username</label>
            <input v-model="form.username" type="text" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">Password</label>
            <input v-model="form.password" type="password" class="form-control" :placeholder="editingId ? 'Leave blank to keep current' : ''" :required="!editingId" />
          </div>
          <div class="col-md-4">
            <label class="form-label">OTP Method</label>
            <select v-model="form.otpMethod" class="form-select" required>
              <option value="TOTP">TOTP</option>
              <option value="SMS">SMS</option>
              <option value="Email">Email</option>
              <option value="NONE">None</option>
            </select>
          </div>
          <div class="col-md-4">
            <label class="form-label">URL</label>
            <input v-model="form.url" type="url" class="form-control" placeholder="https://" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Tags</label>
            <input v-model="tagsInput" type="text" class="form-control" placeholder="comma,separated" />
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea v-model="form.notes" class="form-control" rows="2" placeholder="Optional notes"></textarea>
          </div>
          <div class="col-12">
            <IconUploader v-model="form.iconUrl" />
          </div>
          <div class="col-12 d-flex gap-2">
            <button type="submit" class="btn btn-primary">{{ editingId ? 'Save Changes' : 'Create Secret' }}</button>
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
      <template #cell-updatedAt="{ row }">{{ formatDate(row.updatedAt) }}</template>
      <template #cell-tags="{ row }">
        <div class="d-flex flex-wrap gap-1">
          <span v-for="tag in row.tags" :key="tag" class="badge text-bg-primary">{{ tag }}</span>
          <span v-if="!row.tags?.length" class="text-muted small">—</span>
        </div>
      </template>
      <template #cell-password="{ row }">
        <div class="d-flex align-items-center gap-2">
          <span class="text-monospace">{{ row.password }}</span>
          <CopyButton :copy-fn="() => store.copy(row.id, 'password')" />
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
import { useSecretsStore } from '@/stores/resources';
import { useWorkspaceStore } from '@/stores/workspaces';
import { useNotificationsStore } from '@/stores/notifications';
import type { Secret, SecretForm, SecretUpdateForm } from '@/types/resources';

const store = useSecretsStore();
const workspaceStore = useWorkspaceStore();
const notifications = useNotificationsStore();

const showForm = ref(false);
const editingId = ref<string | null>(null);
const tagsInput = ref('');
const search = ref('');

const form = reactive({
  name: '',
  username: '',
  password: '',
  otpMethod: 'TOTP',
  url: '',
  notes: '',
  iconUrl: undefined as string | undefined,
});

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'username', label: 'Username', sortable: true },
  { key: 'workspace', label: 'Workspace' },
  { key: 'otpMethod', label: 'OTP', sortable: true },
  { key: 'password', label: 'Password' },
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
  form.username = '';
  form.password = '';
  form.otpMethod = 'TOTP';
  form.url = '';
  form.notes = '';
  form.iconUrl = undefined;
  tagsInput.value = '';
  editingId.value = null;
};

const submit = async () => {
  if (!workspaceStore.selectedWorkspaceId) return;
  const basePayload: Omit<SecretForm, "password"> = {
    workspaceId: workspaceStore.selectedWorkspaceId,

    name: form.name,
    username: form.username,
    otpMethod: form.otpMethod as Secret['otpMethod'],
    url: form.url || undefined,
    notes: form.notes || undefined,
    iconUrl: form.iconUrl,
    tags: tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  };

  try {
    if (editingId.value) {
      const payload: SecretUpdateForm = {
      ...basePayload,
    } as SecretUpdateForm;
      if (form.password) {
        payload.password = form.password;
      }
      await store.update(editingId.value, payload);
      notifications.push('Secret updated', 'success');
    } else {
      const createPayload: SecretForm = {
      ...basePayload,
      password: form.password,
    };
      await store.create(createPayload);
      notifications.push('Secret created', 'success');
    }
    resetForm();
    showForm.value = false;
  } catch (error) {
    console.error(error);
    notifications.push('Failed to save secret', 'danger');
  }
};

const edit = (row: Secret) => {
  editingId.value = row.id;
  showForm.value = true;
  form.name = row.name;
  form.username = row.username;
  form.password = '';
  form.otpMethod = row.otpMethod;
  form.url = row.url ?? '';
  form.notes = row.notes ?? '';
  form.iconUrl = row.iconUrl;
  tagsInput.value = (row.tags ?? []).join(', ');
};

const remove = async (id: string) => {
  if (!window.confirm('Delete this secret?')) return;
  await store.remove(id);
  notifications.push('Secret deleted', 'success');
};

const fetch = async () => {
  await store.fetch({ q: search.value });
};

const handleSort = async (value: string) => {
  store.state.sort = value;
  await store.fetch({ sort: value, page: 1, q: search.value });
};

const changePage = async (page: number) => {
  store.setPage(page);
  await store.fetch({ page, q: search.value });
};

watch(
  () => workspaceStore.selectedWorkspaceId,
  async (workspaceId) => {
    if (!workspaceId) return;
    resetForm();
    if (showForm.value) {
      form.password = '';
    }
    await store.fetch({ page: 1 });
  },
  { immediate: true },
);

watch(search, async () => {
  await store.fetch({ page: 1, q: search.value });
});
</script>



