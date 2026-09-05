<script setup lang="ts">
import { SIGN_COLORS, type SignColor } from '../../config/signColors'

defineProps<{ modelValue: SignColor; label: string; premiumAvailable?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: SignColor] }>()
</script>

<template>
  <label class="field">
    <span class="field__label">{{ label }}</span>
    <select class="control" :value="modelValue" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value as SignColor)">
      <option v-for="color in SIGN_COLORS.filter(option => option.id !== 'wood' || premiumAvailable)" :key="color.id" :value="color.id">{{ color.label }}{{ color.id === 'wood' ? ' — Premium' : '' }}</option>
    </select>
  </label>
</template>
