<script setup lang="ts">
defineProps<{ modelValue: boolean; title: string; description: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<template>
  <label class="toggle-row">
    <span>
      <strong>{{ title }}</strong>
      <small>{{ description }}</small>
    </span>
    <input
      class="toggle-row__input"
      type="checkbox"
      :checked="modelValue"
      @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
    />
  </label>
</template>
