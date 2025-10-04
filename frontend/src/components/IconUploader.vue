<template>
  <div class="icon-uploader">
    <label class="form-label text-muted">Icon</label>
    <div class="d-flex align-items-center gap-3">
      <div class="icon-preview border rounded d-flex align-items-center justify-content-center">
        <img v-if="modelValue" :src="modelValue" alt="Icon" class="img-fluid" />
        <ImageOff v-else size="24" class="text-muted" />
      </div>
      <div class="d-flex flex-column gap-1">
        <input type="file" accept="image/png,image/jpeg,image/svg+xml" @change="onFileChange" />
        <button v-if="modelValue" type="button" class="btn btn-outline-secondary btn-sm" @click="clear">Remove</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ImageOff } from 'lucide-vue-next';
import { uploadIcon } from '@/services/resources';
import { useNotificationsStore } from '@/stores/notifications';

const props = defineProps<{ modelValue?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>();
const notifications = useNotificationsStore();

const onFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;
  const file = input.files[0];
  try {
    const url = await uploadIcon(file);
    emit('update:modelValue', url);
    notifications.push('Icon uploaded', 'success');
  } catch (error) {
    console.error(error);
    notifications.push('Failed to upload icon', 'danger');
  } finally {
    input.value = '';
  }
};

const clear = () => emit('update:modelValue', undefined);
</script>

<style scoped>
.icon-preview {
  width: 56px;
  height: 56px;
  background-color: #f8fafc;
}

.icon-preview img {
  max-width: 100%;
  max-height: 100%;
}
</style>

