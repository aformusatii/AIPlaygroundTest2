<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h3 class="h5 mb-0">Workspaces</h3>
      <button type="button" class="btn btn-primary" @click="toggleForm">{{ showForm ? 'Close' : 'New Workspace' }}</button>
    </div>

    <div v-if="showForm" class="card mb-4">
      <div class="card-body">
        <h5 class="card-title">{{ editingId ? 'Update Workspace' : 'Create Workspace' }}</h5>
        <form class="row g-3" @submit.prevent="submit">
          <div class="col-md-6">
            <label class="form-label">Name</label>
            <input v-model="form.name" type="text" class="form-control" required />
          </div>
          <div class="col-12">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-control" rows="2"></textarea>
          </div>
          <div class="col-12 d-flex gap-2">
            <button type="submit" class="btn btn-primary">{{ editingId ? 'Save Changes' : 'Create Workspace' }}</button>
            <button type="button" class="btn btn-outline-secondary" @click="resetForm">Reset</button>
          </div>
        </form>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Description</th>
              <th scope="col">Created</th>
              <th scope="col">Updated</th>
              <th scope="col" class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="store.loading">
              <td colspan="5" class="text-center py-4">
                <div class="spinner-border text-primary" role="status"></div>
              </td>
            </tr>
            <tr v-else-if="!store.items.length">
              <td colspan="5" class="text-center text-muted py-4">No workspaces available</td>
            </tr>
            <tr v-for="workspace in store.items" :key="workspace.id">
              <td>
                <span class="fw-semibold">{{ workspace.name }}</span>
                <span v-if="workspace.id === store.selectedWorkspaceId" class="badge text-bg-primary ms-2">Active</span>
              </td>
              <td>{{ workspace.description || '—' }}</td>
              <td>{{ formatDate(workspace.createdAt) }}</td>
              <td>{{ formatDate(workspace.updatedAt) }}</td>
              <td class="text-end">
                <div class="btn-group btn-group-sm">
                  <button type="button" class="btn btn-outline-secondary" @click="edit(workspace)">Edit</button>
                  <button
                    type="button"
                    class="btn btn-outline-danger"
                    :disabled="store.selectedWorkspaceId === workspace.id"
                    @click="remove(workspace.id)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useWorkspaceStore } from '@/stores/workspaces';
import { useNotificationsStore } from '@/stores/notifications';
import type { Workspace } from '@/types/resources';

const store = useWorkspaceStore();
const notifications = useNotificationsStore();

const showForm = ref(false);
const editingId = ref<string | null>(null);
const form = reactive({
  name: '',
  description: '',
});

const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) {
    resetForm();
  }
};

const resetForm = () => {
  form.name = '';
  form.description = '';
  editingId.value = null;
};

const submit = async () => {
  try {
    if (editingId.value) {
      await store.updateWorkspace(editingId.value, { name: form.name, description: form.description });
      notifications.push('Workspace updated', 'success');
    } else {
      await store.createWorkspace({ name: form.name, description: form.description });
      notifications.push('Workspace created', 'success');
    }
    resetForm();
    showForm.value = false;
  } catch (error) {
    console.error(error);
    notifications.push('Failed to save workspace', 'danger');
  }
};

const edit = (workspace: Workspace) => {
  editingId.value = workspace.id;
  showForm.value = true;
  form.name = workspace.name;
  form.description = workspace.description ?? '';
};

const remove = async (id: string) => {
  if (!window.confirm('Delete this workspace? Related records must be moved first.')) return;
  await store.removeWorkspace(id);
  notifications.push('Workspace removed', 'success');
};

const formatDate = (value: string) => new Date(value).toLocaleString();

onMounted(() => {
  if (!store.items.length) {
    store.fetchWorkspaces();
  }
});
</script>
