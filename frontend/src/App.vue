<template>
  <div class="app-shell d-flex flex-column flex-lg-row">
    <aside class="sidebar border-end bg-white d-none d-lg-flex flex-column">
      <div class="px-4 py-4 border-bottom">
        <AppBrand />
      </div>
      <SidebarNav class="p-4 flex-grow-1 overflow-auto" :primary-nav="primaryNav" :bank-nav="bankNav" />
    </aside>
    <div class="flex-grow-1 d-flex flex-column min-vh-100">
      <header>
        <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
          <div class="container-fluid px-3 px-lg-4 py-3 gap-3">
            <div class="d-flex align-items-start gap-3">
              <button
                class="navbar-toggler d-lg-none"
                type="button"
                data-bs-toggle="offcanvas"
                data-bs-target="#mobileSidebar"
                aria-controls="mobileSidebar"
                aria-label="Toggle navigation"
              >
                <span class="navbar-toggler-icon"></span>
              </button>
              <div>
                <h2 class="h4 mb-1 text-dark">{{ currentTitle }}</h2>
                <p class="text-muted small mb-0">Manage credentials without exposing secrets on screen.</p>
              </div>
            </div>
            <div class="ms-auto">
              <WorkspaceSwitcher />
            </div>
          </div>
        </nav>
      </header>
      <main class="flex-grow-1">
        <div class="container-fluid py-4 px-3 px-lg-4">
          <RouterView />
        </div>
      </main>
    </div>
    <div
      ref="mobileSidebarRef"
      class="offcanvas offcanvas-start"
      tabindex="-1"
      id="mobileSidebar"
      aria-labelledby="mobileSidebarLabel"
    >
      <div class="offcanvas-header border-bottom">
        <AppBrand
          title-tag="h5"
          title-class="offcanvas-title mb-0"
          description-class="text-muted small mb-0"
          @click="handleNavClick"
        />
        <button ref="mobileSidebarCloseBtnRef" 
                type="button" 
                class="btn-close text-reset" 
                data-bs-dismiss="offcanvas" 
                aria-label="Close"></button>
      </div>
      <div class="offcanvas-body p-0">
        <SidebarNav
          class="p-4"
          :primary-nav="primaryNav"
          :bank-nav="bankNav"
          @navigate="handleNavClick"
        />
      </div>
    </div>
    <ToastContainer />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import Offcanvas from 'bootstrap/js/dist/offcanvas';
import { KeyRound, Server, CreditCard, Wallet } from 'lucide-vue-next';
import AppBrand from '@/components/AppBrand.vue';
import SidebarNav, { type NavItem } from '@/components/SidebarNav.vue';
import WorkspaceSwitcher from '@/components/WorkspaceSwitcher.vue';
import ToastContainer from '@/components/ToastContainer.vue';

const route = useRoute();

const primaryNav: NavItem[] = [
  { path: '/secrets', label: 'Secrets', icon: KeyRound },
  { path: '/api-keys', label: 'API Keys', icon: Server },
  { path: '/ssh-keys', label: 'SSH Keys', icon: Server },
];

const bankNav: NavItem[] = [
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

const mobileSidebarRef = ref<HTMLElement | null>(null);
const mobileSidebarCloseBtnRef = ref<HTMLElement | null>(null);
let mobileSidebarInstance: Offcanvas | null = null;

const ensureMobileSidebarInstance = () => {
  if (mobileSidebarInstance) return mobileSidebarInstance;
  if (!mobileSidebarRef.value) return null;
  mobileSidebarInstance = Offcanvas.getOrCreateInstance(mobileSidebarRef.value);
  return mobileSidebarInstance;
};

onMounted(() => {
  ensureMobileSidebarInstance();
});

onBeforeUnmount(() => {
  mobileSidebarInstance?.dispose();
  mobileSidebarInstance = null;
});

const hideMobileSidebar = () => {
  (mobileSidebarCloseBtnRef.value as HTMLElement).click();
};

const handleNavClick = () => {
  hideMobileSidebar();
};

const currentTitle = computed(() => titles.get(route.path) ?? 'Secretarium');
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-color: #f8fafc;
}

.sidebar {
  width: 280px;
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar :deep(.sidebar-nav) {
  flex-grow: 1;
}

.navbar-toggler {
  border: 1px solid rgba(148, 163, 184, 0.5);
}
</style>
