<script setup lang="ts">
import { computed } from 'vue'
import { getSignSizeById } from '../../config/signSizes'

const props = defineProps<{ modelValue: string; sizeIds: readonly string[] }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const sizes = computed(() => props.sizeIds.map(getSignSizeById).filter((size) => size !== undefined))
</script>

<template>
  <label class="field">
    <span class="field__label">Format tabliczki</span>
    <select
      :value="modelValue"
      class="control"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="size in sizes" :key="size.id" :value="size.id">
        {{ size.id.replace('x', ' × ') }} cm
      </option>
    </select>
    <span class="field__hint">Wysokość × szerokość</span>
  </label>
</template>
