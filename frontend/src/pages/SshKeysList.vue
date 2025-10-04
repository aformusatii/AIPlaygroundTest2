<template>
  <div>
    <div class="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
      <SearchBar v-model="search" placeholder="Search by name, comment, notes" />
      <button type="button" class="btn btn-primary" @click="toggleForm">{{ showForm ? 'Close' : 'New SSH Key' }}</button>
    </div>

    <div v-if="showForm" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ editingId ? 'Update SSH Key' : 'Create SSH Key' }}</h5>
        <form class="row g-3" @submit.prevent="submit">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>
          <div class="col-md-6">
            <label class="form-label">Comment</label>
            <input v-model="form.comment" type="text" class="form-control" placeholder="Optional" />
          </div>
          <div class="col-12">
            <label class="form-label">Public Key</label>
            <textarea v-model="form.publicKey" class="form-control" rows="2" required></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Private Key</label>
            <textarea
              v-model="form.privateKey"
              class="form-control"
              rows="4"
              :placeholder="editingId ? 'Paste new private key (leave blank to keep current)' : ''"
              :required="!editingId"
            ></textarea>
          </div>
          <div class="col-12">
            <label class="form-label">Notes</label>
            <textarea v-model="form.notes" class="form-control" rows="2"></textarea>
          </div>
          <div class="col-md-6">
            <label class="form-label">Tags</label>
            <input v-model="tagsInput" type="text" class="form-control" placeholder="comma,separated" />
          </div>
          <div class="col-12">
            <IconUploader v-model="form.iconUrl" />
          </div>
          <div class="col-12 d-flex gap-2">
            <button type="submit" class="btn btn-primary">{{ editingId ? 'Save Changes' : 'Create SSH Key' }}</button>
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
      <template #cell-privateKey="{ row }">
        <div class="d-flex align-items-center gap-2">
          <span class="text-monospace">{{ row.privateKey }}</span>
          <CopyButton :copy-fn="() => store.copy(row.id, 'privateKey')" />
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
import { useSshKeysStore } from '@/stores/resources';
import { useWorkspaceStore } from '@/stores/workspaces';
import { useNotificationsStore } from '@/stores/notifications';
import type { SshKey, SshKeyForm, SshKeyUpdateForm } from '@/types/resources';

const store = useSshKeysStore();
const workspaceStore = useWorkspaceStore();
const notifications = useNotificationsStore();

const showForm = ref(false);
const editingId = ref<string | null>(null);
const search = ref('');
const tagsInput = ref('');

const form = reactive({
  name: '',
  publicKey: '',
  privateKey: '',
  comment: '',
  notes: '',
  iconUrl: undefined as string | undefined,
});

const columns: DataTableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'comment', label: 'Comment', sortable: true },
  { key: 'workspace', label: 'Workspace' },
  { key: 'privateKey', label: 'Private Key' },
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
  form.publicKey = '';
  form.privateKey = '';
  form.comment = '';
  form.notes = '';
  form.iconUrl = undefined;
  tagsInput.value = '';
  editingId.value = null;
};

const submit = async () => {
  if (!workspaceStore.selectedWorkspaceId) return;
  const basePayload = {
    workspaceId: workspaceStore.selectedWorkspaceId,
    name: form.name,
    publicKey: form.publicKey,
    comment: form.comment || undefined,
    notes: form.notes || undefined,
    iconUrl: form.iconUrl,
    tags: tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  } satisfies Omit<SshKeyForm, 'privateKey'>;

  try {
    if (editingId.value) {
      const payload: SshKeyUpdateForm = {
        ...basePayload,
      };
      if (form.privateKey) {
        payload.privateKey = form.privateKey;
      }
      await store.update(editingId.value, payload);
      notifications.push('SSH key updated', 'success');
    } else {
      const payload: SshKeyForm = {
        ...basePayload,
        privateKey: form.privateKey,
      };
      await store.create(payload);
      notifications.push('SSH key created', 'success');
    }
    resetForm();
    showForm.value = false;
  } catch (error) {
    console.error(error);
    notifications.push('Failed to save SSH key', 'danger');
  }
};

const edit = (row: SshKey) => {
  editingId.value = row.id;
  showForm.value = true;
  form.name = row.name;
  form.publicKey = row.publicKey;
  form.privateKey = '';
  form.comment = row.comment ?? '';
  form.notes = row.notes ?? '';
  form.iconUrl = row.iconUrl;
  tagsInput.value = (row.tags ?? []).join(', ');
};

const remove = async (id: string) => {
  if (!window.confirm('Delete this SSH key?')) return;
  await store.remove(id);
  notifications.push('SSH key deleted', 'success');
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
