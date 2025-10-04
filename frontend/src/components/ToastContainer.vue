<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1080;">
    <div
      v-for="toast in notifications.toasts"
      :key="toast.id"
      class="toast align-items-center text-bg-dark border-0 show mb-2"
      role="status"
    >
      <div class="d-flex">
        <div class="toast-body text-white">{{ toast.message }}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" @click="notifications.dismiss(toast.id)"></button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications';

const notifications = useNotificationsStore();
</script>
