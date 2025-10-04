<template>
  <div class="input-group search-bar">
    <span class="input-group-text bg-white text-muted">
      <Search size="16" />
    </span>
    <input
      type="search"
      class="form-control"
      :placeholder="placeholder"
      :value="modelValue"
      @input="update(($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next';

const props = defineProps<{ modelValue: string; placeholder?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: string] }>();

const update = (value: string) => emit('update:modelValue', value);
</script>

<style scoped>
.search-bar .input-group-text {
  border-right: 0;
}

.search-bar .form-control {
  border-left: 0;
}
</style>
