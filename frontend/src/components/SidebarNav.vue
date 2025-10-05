<template>
  <nav class="sidebar-nav">
    <p class="text-uppercase text-muted fw-semibold small mb-3">Vaults</p>
    <ul class="nav nav-pills flex-column gap-1">
      <li v-for="item in primaryNav" :key="item.path" class="nav-item">
        <RouterLink
          :to="item.path"
          class="nav-link d-flex align-items-center"
          :class="{ active: isActive(item.path) }"
          @click="emitNavigate"
        >
          <component :is="item.icon" size="18" class="me-2" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <p class="text-uppercase text-muted fw-semibold small mt-4 mb-3">Bank &amp; Cards</p>
    <ul class="nav nav-pills flex-column gap-1">
      <li v-for="item in bankNav" :key="item.path" class="nav-item">
        <RouterLink
          :to="item.path"
          class="nav-link d-flex align-items-center"
          :class="{ active: isActive(item.path) }"
          @click="emitNavigate"
        >
          <component :is="item.icon" size="18" class="me-2" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <p class="text-uppercase text-muted fw-semibold small mt-4 mb-3">Admin</p>
    <ul class="nav nav-pills flex-column gap-1">
      <li class="nav-item">
        <RouterLink
          to="/workspaces"
          class="nav-link d-flex align-items-center"
          :class="{ active: route.path.startsWith('/workspaces') }"
          @click="emitNavigate"
        >
          <Layers size="18" class="me-2" />
          <span>Workspaces</span>
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { Layers } from 'lucide-vue-next';

export interface NavItem {
  path: string;
  label: string;
  icon: Component;
}

const props = defineProps<{
  primaryNav: NavItem[];
  bankNav: NavItem[];
}>();

const emit = defineEmits<{ navigate: [] }>();

const route = useRoute();

const emitNavigate = () => {
  emit('navigate');
};

const isActive = (path: string) => route.path === path || route.path.startsWith(`${path}/`);
</script>

<style scoped>
.sidebar-nav .text-muted {
  color: #94a3b8 !important;
}

.sidebar-nav .nav-link {
  font-weight: 500;
  color: #475569;
}

.sidebar-nav .nav-link.active {
  background-color: #0d6efd;
  color: #fff;
}

.sidebar-nav .nav-link:hover {
  background-color: #e2e8f0;
  color: #0d6efd;
}

:deep(.offcanvas .sidebar-nav .nav-link.active) {
  background-color: rgba(13, 110, 253, 0.1);
  color: #0d6efd;
}
</style>
