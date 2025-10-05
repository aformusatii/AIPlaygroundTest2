<template>
  <RouterLink to="/" class="app-brand d-flex align-items-center text-decoration-none text-reset">
    <div class="app-brand-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
      <Shield size="22" />
    </div>
    <div>
      <component :is="titleTag" :class="titleClass">Secretarium</component>
      <p :class="descriptionClass">Fast, searchable, workspace-scoped secrets &amp; keys.</p>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { Shield } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    titleTag?: keyof HTMLElementTagNameMap;
    titleClass?: string;
    descriptionClass?: string;
  }>(),
  {
    titleTag: 'h1',
    titleClass: 'h5 mb-0 text-dark',
    descriptionClass: 'text-muted small mb-0',
  },
);

const titleTag = computed(() => props.titleTag ?? 'h1');
const titleClass = computed(() => props.titleClass);
const descriptionClass = computed(() => props.descriptionClass);
</script>

<style scoped>
.app-brand-icon {
  width: 42px;
  height: 42px;
}
</style>
