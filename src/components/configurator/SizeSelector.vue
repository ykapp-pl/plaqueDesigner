<script setup lang="ts">
import { SIGN_SIZES } from '../../config/signSizes'

defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>

<template>
  <label class="field">
    <span class="field__label">Format tabliczki</span>
    <select
      :value="modelValue"
      class="control"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="size in SIGN_SIZES" :key="size.id" :value="size.id">
        {{ size.id.replace('x', ' × ') }} cm
      </option>
    </select>
    <span class="field__hint">Wysokość × szerokość</span>
  </label>
</template>
