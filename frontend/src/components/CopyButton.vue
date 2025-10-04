<template>
  <button type="button" class="btn btn-outline-secondary btn-sm" :disabled="isCopying" @click="copy">
    <Loader2 v-if="isCopying" class="me-1" size="16" />
    <ClipboardCheck v-else class="me-1" size="16" />
    Copy
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ClipboardCheck, Loader2 } from 'lucide-vue-next';
import { useNotificationsStore } from '@/stores/notifications';

const props = defineProps<{ copyFn: () => Promise<string> }>();
const notifications = useNotificationsStore();
const isCopying = ref(false);

const copy = async () => {
  if (isCopying.value) return;
  isCopying.value = true;
  try {
    const value = await props.copyFn();
    await navigator.clipboard.writeText(value);
    notifications.push('Copied to clipboard', 'success');
  } catch (error) {
    console.error(error);
    notifications.push('Unable to copy secret', 'danger');
  } finally {
    isCopying.value = false;
  }
};
</script>
