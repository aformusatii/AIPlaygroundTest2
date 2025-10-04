<template>
  <div class="data-table position-relative">
    <table class="table table-hover align-middle table-sm">
      <thead class="table-light">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :style="{ width: column.width ?? 'auto' }"
            @click="column.sortable ? toggleSort(column.key) : undefined"
            :class="{ 'sortable': column.sortable }"
          >
            <span class="d-inline-flex align-items-center gap-1">
              {{ column.label }}
              <SortAsc v-if="column.sortable && isAsc(column.key)" size="14" />
              <SortDesc v-else-if="column.sortable && isDesc(column.key)" size="14" />
            </span>
          </th>
          <th v-if="showActions" class="text-end">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!loading && rows.length === 0">
          <td :colspan="columns.length + (showActions ? 1 : 0)" class="text-center text-muted py-4">
            {{ emptyMessage }}
          </td>
        </tr>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell-${column.key}`" :row="row">{{ row[column.key] }}</slot>
          </td>
          <td v-if="showActions" class="text-end">
            <slot name="actions" :row="row"></slot>
          </td>
        </tr>
      </tbody>
    </table>
    <div v-if="loading" class="loading-overlay d-flex align-items-center justify-content-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SortAsc, SortDesc } from 'lucide-vue-next';

export interface DataTableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

const props = withDefaults(
  defineProps<{
    columns: DataTableColumn[];
    rows: Record<string, unknown>[];
    loading?: boolean;
    sort?: string;
    emptyMessage?: string;
    showActions?: boolean;
  }>(),
  {
    loading: false,
    emptyMessage: 'No results found',
    showActions: false,
    sort: '',
  },
);

const emit = defineEmits<{ sort: [value: string]; 'update:sort': [value: string] }>();

const sortField = computed(() => {
  if (!props.sort) return '';
  const [field] = props.sort.split(',');
  return field?.replace(/^[-+]/, '') ?? '';
});

const sortDirection = computed(() => {
  if (!props.sort) return 'desc';
  const [field] = props.sort.split(',');
  if (!field) return 'desc';
  return field.startsWith('-') ? 'desc' : 'asc';
});

const isAsc = (key: string) => sortField.value === key && sortDirection.value === 'asc';
const isDesc = (key: string) => sortField.value === key && sortDirection.value === 'desc';

const toggleSort = (key: string) => {
  let value = `-${key}`;
  if (sortField.value === key) {
    value = sortDirection.value === 'asc' ? `-${key}` : key;
  }
  emit('update:sort', value);
  emit('sort', value);
};
</script>

<style scoped>
.data-table {
  position: relative;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.6);
}

th.sortable {
  cursor: pointer;
}

th.sortable:hover {
  background-color: rgba(13, 110, 253, 0.05);
}
</style>
