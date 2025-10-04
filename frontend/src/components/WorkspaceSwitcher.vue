<template>
  <div class="workspace-switcher d-flex align-items-center gap-2">
    <label class="text-muted small mb-0" for="workspaceSelect">Workspace</label>
    <select
      id="workspaceSelect"
      class="form-select form-select-sm"
      :disabled="workspaces.loading || workspaces.items.length === 0"
      v-model="selected"
    >
      <option v-for="workspace in workspaces.items" :key="workspace.id" :value="workspace.id">
        {{ workspace.name }}
      </option>
    </select>
    <RouterLink to="/workspaces" class="btn btn-outline-primary btn-sm">Manage</RouterLink>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useWorkspaceStore } from '@/stores/workspaces';

const workspaces = useWorkspaceStore();

const selected = computed({
  get: () => workspaces.selectedWorkspaceId,
  set: (value: string) => workspaces.setCurrentWorkspace(value),
});

onMounted(() => {
  if (!workspaces.items.length) {
    workspaces.fetchWorkspaces();
  }
});
</script>

<style scoped>
.workspace-switcher select {
  min-width: 180px;
}
</style>
