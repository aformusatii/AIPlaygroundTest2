import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/secrets' },
    { path: '/secrets', component: () => import('@/pages/SecretsList.vue') },
    { path: '/api-keys', component: () => import('@/pages/ApiKeysList.vue') },
    { path: '/ssh-keys', component: () => import('@/pages/SshKeysList.vue') },
    { path: '/bank-cards', component: () => import('@/pages/BankCardsList.vue') },
    { path: '/bank-accounts', component: () => import('@/pages/BankAccountsList.vue') },
    { path: '/workspaces', component: () => import('@/pages/WorkspacesList.vue') },
  ],
});

export default router;
