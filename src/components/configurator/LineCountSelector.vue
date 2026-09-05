<script setup lang="ts">
defineProps<{ modelValue: number; options: readonly number[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: number] }>()
</script>

<template>
  <fieldset class="field">
    <legend class="field__label">Liczba obszarów</legend>
    <div class="segmented" aria-label="Liczba obszarów tekstu">
      <button
        v-for="count in options"
        :key="count"
        type="button"
        class="segmented__button"
        :class="{ 'segmented__button--active': count === modelValue }"
        :aria-pressed="count === modelValue"
        @click="emit('update:modelValue', count)"
      >
        {{ count }}
      </button>
    </div>
  </fieldset>
</template>
