<script setup lang="ts">
import { FONT_OPTIONS } from '../../config/fonts'
import { FONT_SIZE_LIMITS, type SignLine } from '../../domain/signProject'

defineProps<{ line: SignLine; index: number }>()
const emit = defineEmits<{ change: [patch: Partial<SignLine>] }>()

function updateFontSize(event: Event): void {
  const input = event.target as HTMLInputElement
  const value = Number(input.value)
  const safeValue = Number.isFinite(value)
    ? Math.min(FONT_SIZE_LIMITS.max, Math.max(FONT_SIZE_LIMITS.min, value))
    : FONT_SIZE_LIMITS.min

  input.value = String(safeValue)
  emit('change', { fontSizeMm: safeValue })
}
</script>

<template>
  <section class="line-card" :aria-labelledby="`line-title-${line.id}`">
    <div class="line-card__heading">
      <h3 :id="`line-title-${line.id}`">Linia {{ index + 1 }}</h3>
      <span>{{ line.fontSizeMm }} mm</span>
    </div>

    <label class="field">
      <span class="field__label">Tekst</span>
      <input
        class="control"
        type="text"
        maxlength="200"
        :value="line.text"
        :placeholder="index === 0 ? 'np. KOWALSCY' : 'np. 18'"
        @input="emit('change', { text: ($event.target as HTMLInputElement).value })"
      />
    </label>

    <div class="line-card__row">
      <label class="field">
        <span class="field__label">Krój pisma</span>
        <select
          class="control"
          :value="line.fontFamily"
          @change="emit('change', { fontFamily: ($event.target as HTMLSelectElement).value })"
        >
          <option v-for="font in FONT_OPTIONS" :key="font.id" :value="font.fontFamily">
            {{ font.label }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="field__label">Wysokość tekstu</span>
        <input
          class="control"
          type="number"
          inputmode="decimal"
          :min="FONT_SIZE_LIMITS.min"
          :max="FONT_SIZE_LIMITS.max"
          step="1"
          :value="line.fontSizeMm"
          @change="updateFontSize"
        />
      </label>
    </div>

    <div class="line-card__row">
      <fieldset class="field">
        <legend class="field__label">Poziomo</legend>
        <div class="segmented segmented--compact">
          <button
            v-for="option in ([['left', 'Lewo'], ['center', 'Środek'], ['right', 'Prawo']] as const)"
            :key="option[0]"
            type="button"
            class="segmented__button"
            :class="{ 'segmented__button--active': line.horizontalAlign === option[0] }"
            :aria-label="option[1]"
            :aria-pressed="line.horizontalAlign === option[0]"
            @click="emit('change', { horizontalAlign: option[0] })"
          >
            {{ option[0] === 'left' ? 'L' : option[0] === 'center' ? 'C' : 'P' }}
          </button>
        </div>
      </fieldset>

      <fieldset class="field">
        <legend class="field__label">Pionowo</legend>
        <div class="segmented segmented--compact">
          <button
            v-for="option in ([['top', 'Góra'], ['center', 'Środek'], ['bottom', 'Dół']] as const)"
            :key="option[0]"
            type="button"
            class="segmented__button"
            :class="{ 'segmented__button--active': line.verticalAlign === option[0] }"
            :aria-label="option[1]"
            :aria-pressed="line.verticalAlign === option[0]"
            @click="emit('change', { verticalAlign: option[0] })"
          >
            {{ option[0] === 'top' ? 'G' : option[0] === 'center' ? 'C' : 'D' }}
          </button>
        </div>
      </fieldset>
    </div>
  </section>
</template>
