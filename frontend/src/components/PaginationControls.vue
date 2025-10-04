<template>
  <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
    <div class="text-muted small">
      Showing
      <strong>{{ from }}</strong>
      –
      <strong>{{ to }}</strong>
      of
      <strong>{{ meta.total }}</strong>
    </div>
    <div class="btn-group">
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="meta.page <= 1" @click="$emit('change', meta.page - 1)">
        Previous
      </button>
      <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="meta.page >= meta.totalPages" @click="$emit('change', meta.page + 1)">
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PaginationMeta } from '@/types/resources';

import { computed } from 'vue';
const props = defineProps<{ meta: PaginationMeta }>();

const from = computed(() => ((props.meta.page - 1) * props.meta.limit) + (props.meta.total === 0 ? 0 : 1));
const to = computed(() => Math.min(props.meta.page * props.meta.limit, props.meta.total));
</script>

