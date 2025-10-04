<template>
  <div>
    <div class="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-3">
      <SearchBar v-model="search" placeholder="Search by bank, account holder, notes" />
      <button type="button" class="btn btn-primary" @click="toggleForm">{{ showForm ? 'Close' : 'New Account' }}</button>
    </div>

    <div v-if="showForm" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ editingId ? 'Update Account' : 'Create Account' }}</h5>
        <form class="row g-3" @submit.prevent="submit">
          <div class="col-md-4">
            <label class="form-label">Bank Name</label>
            <input v-model="form.bankName" type="text" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">Account Holder</label>
            <input v-model="form.accountHolder" type="text" class="form-control" required />
          </div>
          <div class="col-md-4">
            <label class="form-label">Account Number</label>
            <input v-model="form.accountNumber" type="text" class="form-control" :placeholder="editingId ? 'Leave blank to keep current' : ''" :required="!editingId" />
          </div>
          <div class="col-md-4">
            <label class="form-label">IBAN</label>
            <input v-model="form.iban" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">SWIFT/BIC</label>
            <input v-model="form.swiftBic" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Routing Number</label>
            <input v-model="form.routingNumber" type="text" class="form-control" />
          </div>
          <div class="col-md-4">
            <label class="form-label">Currency</label>
            <input v-model="form.currency" type="text" class="form-control" placeholder="USD" />
          </div>
          <div class="col-md-4">
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
            <button type="submit" class="btn btn-primary">{{ editingId ? 'Save Changes' : 'Create Account' }}</button>
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
      <template #cell-accountNumber="{ row }">
        <div class="d-flex align-items-center gap-2">
          <span class="text-monospace">{{ row.accountNumber }}</span>
          <CopyButton :copy-fn="() => store.copy(row.id, 'accountNumber')" />
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
import { useBankAccountsStore } from '@/stores/resources';
import { useWorkspaceStore } from '@/stores/workspaces';
import { useNotificationsStore } from '@/stores/notifications';
import type { BankAccount, BankAccountForm, BankAccountUpdateForm } from '@/types/resources';

const store = useBankAccountsStore();
const workspaceStore = useWorkspaceStore();
const notifications = useNotificationsStore();

const showForm = ref(false);
const editingId = ref<string | null>(null);
const search = ref('');
const tagsInput = ref('');

const form = reactive({
  bankName: '',
  accountHolder: '',
  accountNumber: '',
  iban: '',
  swiftBic: '',
  routingNumber: '',
  currency: '',
  notes: '',
  iconUrl: undefined as string | undefined,
});

const columns: DataTableColumn[] = [
  { key: 'bankName', label: 'Bank', sortable: true },
  { key: 'accountHolder', label: 'Holder', sortable: true },
  { key: 'workspace', label: 'Workspace' },
  { key: 'accountNumber', label: 'Account Number' },
  { key: 'currency', label: 'Currency', sortable: true },
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
  form.bankName = '';
  form.accountHolder = '';
  form.accountNumber = '';
  form.iban = '';
  form.swiftBic = '';
  form.routingNumber = '';
  form.currency = '';
  form.notes = '';
  form.iconUrl = undefined;
  tagsInput.value = '';
  editingId.value = null;
};

const submit = async () => {
  if (!workspaceStore.selectedWorkspaceId) return;
  const basePayload = {
    workspaceId: workspaceStore.selectedWorkspaceId,
    bankName: form.bankName,
    accountHolder: form.accountHolder,
    iban: form.iban || undefined,
    swiftBic: form.swiftBic || undefined,
    routingNumber: form.routingNumber || undefined,
    currency: form.currency || undefined,
    notes: form.notes || undefined,
    iconUrl: form.iconUrl,
    tags: tagsInput.value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  } satisfies Omit<BankAccountForm, 'accountNumber'>;

  try {
    if (editingId.value) {
      const payload: BankAccountUpdateForm = {
        ...basePayload,
      };
      if (form.accountNumber) {
        payload.accountNumber = form.accountNumber;
      }
      await store.update(editingId.value, payload);
      notifications.push('Account updated', 'success');
    } else {
      const payload: BankAccountForm = {
        ...basePayload,
        accountNumber: form.accountNumber,
      };
      await store.create(payload);
      notifications.push('Account created', 'success');
    }
    resetForm();
    showForm.value = false;
  } catch (error) {
    console.error(error);
    notifications.push('Failed to save account', 'danger');
  }
};

const edit = (row: BankAccount) => {
  editingId.value = row.id;
  showForm.value = true;
  form.bankName = row.bankName;
  form.accountHolder = row.accountHolder;
  form.accountNumber = '';
  form.iban = row.iban ?? '';
  form.swiftBic = row.swiftBic ?? '';
  form.routingNumber = row.routingNumber ?? '';
  form.currency = row.currency ?? '';
  form.notes = row.notes ?? '';
  form.iconUrl = row.iconUrl;
  tagsInput.value = (row.tags ?? []).join(', ');
};

const remove = async (id: string) => {
  if (!window.confirm('Delete this bank account?')) return;
  await store.remove(id);
  notifications.push('Account deleted', 'success');
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
