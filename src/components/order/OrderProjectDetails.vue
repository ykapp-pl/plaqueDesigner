<script setup lang="ts">
import { computed } from 'vue'
import SignPreview from '../preview/SignPreview.vue'
import { SIGN_COLORS } from '../../config/signColors'
import { FONT_OPTIONS } from '../../config/fonts'
import { getSignSizeById } from '../../config/signSizes'
import type { SignProject } from '../../domain/signProject'

const props = defineProps<{ project: SignProject; deleting?: boolean }>()
const emit = defineEmits<{ delete: [] }>()
const size = computed(() => getSignSizeById(props.project.configuration.sizeId)!)
const yesNo = (value: boolean) => value ? 'Tak' : 'Nie'
const colorName = (id: string) => SIGN_COLORS.find(color => color.id === id)?.label ?? id
const fontName = (font: string) => FONT_OPTIONS.find(option => option.fontFamily === font)?.label ?? font
const alignments: Record<string, string> = { left: 'Lewo', center: 'Środek', right: 'Prawo', top: 'Góra', bottom: 'Dół' }
const number = (value: number) => new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 3 }).format(value)
function date(value?: string): string {
  return value ? new Intl.DateTimeFormat('pl-PL', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Europe/Warsaw' }).format(new Date(value)) : 'Brak danych'
}
</script>

<template>
  <article class="order-details" aria-label="Zapisany projekt — tylko do odczytu">
    <div class="workspace">
      <section class="settings-panel">
        <div class="project-card__header">
          <div>
            <p class="eyebrow">Tylko do odczytu</p>
            <h2>Zamówienie {{ project.customer.orderNumber }}</h2>
          </div>
          <button class="danger-button order-details__delete" type="button" :disabled="deleting" @click="emit('delete')">
            {{ deleting ? 'Usuwanie…' : 'Usuń projekt' }}
          </button>
        </div>
        <dl class="project-meta order-details__meta">
          <div><dt>Nick zamawiającego</dt><dd>{{ project.customer.login }}</dd></div>
          <div><dt>Numer zamówienia</dt><dd>{{ project.customer.orderNumber }}</dd></div>
          <div><dt>ID projektu</dt><dd>{{ project.id }}</dd></div>
          <div><dt>Utworzono (czas polski)</dt><dd>{{ date(project.createdAt) }}</dd></div>
          <div><dt>Ostatni zapis (czas polski)</dt><dd>{{ date(project.updatedAt) }}</dd></div>
          <div><dt>Format: wysokość × szerokość</dt><dd>{{ number(project.configuration.heightMm) }} × {{ number(project.configuration.widthMm) }} mm</dd></div>
          <div><dt>Pełne tło</dt><dd>{{ yesNo(project.configuration.backgroundEnabled) }}</dd></div>
          <div><dt>Kolor wydruku</dt><dd>{{ colorName(project.configuration.printColor) }}</dd></div>
          <div><dt>Kolor tła (ramka i litery)</dt><dd>{{ colorName(project.configuration.backgroundColor) }}{{ project.configuration.backgroundEnabled ? '' : ' (tło wyłączone)' }}</dd></div>
          <div><dt>Otwory montażowe</dt><dd>{{ yesNo(project.configuration.mountingHolesEnabled) }}</dd></div>
          <div><dt>Linie dzielące obszary</dt><dd>{{ yesNo(project.configuration.dividersEnabled) }}</dd></div>
          <div><dt>Liczba obszarów</dt><dd>{{ project.configuration.lineCount }}</dd></div>
          <div><dt>Wersja formatu zapisu</dt><dd>{{ project.configuration.schemaVersion }}</dd></div>
        </dl>
        <section v-for="(line, index) in project.configuration.lines" :key="line.id" class="line-card order-details__line" :aria-label="`Obszar ${index + 1}`">
          <h3>Obszar {{ index + 1 }}</h3>
          <p class="order-details__text">{{ line.text || '(brak tekstu)' }}</p>
          <dl class="project-meta order-details__meta">
            <div><dt>ID obszaru</dt><dd>{{ line.id }}</dd></div>
            <div><dt>Krój pisma</dt><dd>{{ fontName(line.fontFamily) }}</dd></div>
            <div><dt>Wysokość tekstu</dt><dd>{{ number(line.fontSizeMm) }} mm</dd></div>
            <div><dt>Wysokość obszaru</dt><dd>{{ line.areaHeightMm ? `${number(line.areaHeightMm)} mm` : 'Automatyczna' }}</dd></div>
            <div><dt>Wyrównanie poziome</dt><dd>{{ alignments[line.horizontalAlign] }}</dd></div>
            <div><dt>Wyrównanie pionowe</dt><dd>{{ alignments[line.verticalAlign] }}</dd></div>
            <div><dt>Zapisane przesunięcie X</dt><dd>{{ number(line.offsetXMm) }} mm</dd></div>
            <div><dt>Zapisane przesunięcie Y</dt><dd>{{ number(line.offsetYMm) }} mm</dd></div>
          </dl>
        </section>
      </section>
      <div class="order-details__preview"><SignPreview :configuration="project.configuration" :size="size" readonly /></div>
    </div>
  </article>
</template>
