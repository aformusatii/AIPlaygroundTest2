import { defineStore } from 'pinia';
import { ref } from 'vue';

export type ToastVariant = 'success' | 'info' | 'warning' | 'danger';

export interface ToastMessage {
  id: number;
  message: string;
  variant: ToastVariant;
  createdAt: number;
}

let counter = 0;

export const useNotificationsStore = defineStore('notifications', () => {
  const toasts = ref<ToastMessage[]>([]);

  const push = (message: string, variant: ToastVariant = 'success') => {
    const id = ++counter;
    toasts.value.push({ id, message, variant, createdAt: Date.now() });
    setTimeout(() => dismiss(id), 3200);
  };

  const dismiss = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  };

  const clear = () => {
    toasts.value = [];
  };

  return { toasts, push, dismiss, clear };
});
