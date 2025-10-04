<template>
  <div class="app-shell d-flex">
    <aside class="sidebar border-end bg-white">
      <div class="px-4 py-4 border-bottom">
        <RouterLink to="/" class="d-flex align-items-center text-decoration-none">
          <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style="width: 42px; height: 42px;">
            <Shield size="22" />
          </div>
          <div>
            <h1 class="h5 mb-0 text-dark">Secretarium</h1>
            <p class="text-muted small mb-0">Fast, searchable, workspace-scoped secrets &amp; keys.</p>
          </div>
        </RouterLink>
      </div>
      <nav class="p-4">
        <p class="text-uppercase text-muted fw-semibold small mb-3">Vaults</p>
        <ul class="nav nav-pills flex-column gap-1">
          <li v-for="item in primaryNav" :key="item.path" class="nav-item">
            <RouterLink :to="item.path" class="nav-link d-flex align-items-center" :class="{ active: route.path === item.path }">
              <component :is="item.icon" size="18" class="me-2" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
        <p class="text-uppercase text-muted fw-semibold small mt-4 mb-3">Bank &amp; Cards</p>
        <ul class="nav nav-pills flex-column gap-1">
          <li v-for="item in bankNav" :key="item.path" class="nav-item">
            <RouterLink :to="item.path" class="nav-link d-flex align-items-center" :class="{ active: route.path === item.path }">
              <component :is="item.icon" size="18" class="me-2" />
              <span>{{ item.label }}</span>
            </RouterLink>
          </li>
        </ul>
        <p class="text-uppercase text-muted fw-semibold small mt-4 mb-3">Admin</p>
        <ul class="nav nav-pills flex-column gap-1">
          <li class="nav-item">
            <RouterLink to="/workspaces" class="nav-link d-flex align-items-center" :class="{ active: route.path.startsWith('/workspaces') }">
              <Layers size="18" class="me-2" />
              <span>Workspaces</span>
            </RouterLink>
          </li>
        </ul>
      </nav>
    </aside>
    <div class="flex-grow-1 d-flex flex-column">
      <header class="border-bottom bg-white">
        <div class="container-fluid py-3 px-4 d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div>
            <h2 class="h4 mb-1 text-dark">{{ currentTitle }}</h2>
            <p class="text-muted small mb-0">Manage credentials without exposing secrets on screen.</p>
          </div>
          <WorkspaceSwitcher />
        </div>
      </header>
      <main class="flex-grow-1">
        <div class="container-fluid py-4 px-4">
          <RouterView />
        </div>
      </main>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import { Shield, KeyRound, Server, CreditCard, Wallet, Layers } from 'lucide-vue-next';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher.vue';
import ToastContainer from '@/components/ToastContainer.vue';

const route = useRoute();

const primaryNav = [
  { path: '/secrets', label: 'Secrets', icon: KeyRound },
  { path: '/api-keys', label: 'API Keys', icon: Server },
  { path: '/ssh-keys', label: 'SSH Keys', icon: Server },
];

const bankNav = [
  { path: '/bank-cards', label: 'Bank Cards', icon: CreditCard },
  { path: '/bank-accounts', label: 'Bank Accounts', icon: Wallet },
];

const titles = new Map([
  ['/', 'Overview'],
  ['/secrets', 'Secrets'],
  ['/api-keys', 'API Keys'],
  ['/ssh-keys', 'SSH Keys'],
  ['/bank-cards', 'Bank Cards'],
  ['/bank-accounts', 'Bank Accounts'],
  ['/workspaces', 'Workspaces'],
]);

const currentTitle = computed(() => titles.get(route.path) ?? 'Secretarium');
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.nav-link {
  font-weight: 500;
  color: #475569;
}

.nav-link.active {
  background-color: #0d6efd;
  color: #fff;
}

.nav-link:hover {
  background-color: #e2e8f0;
  color: #0d6efd;
}

@media (max-width: 992px) {
  .sidebar {
    display: none;
  }
}
</style>
