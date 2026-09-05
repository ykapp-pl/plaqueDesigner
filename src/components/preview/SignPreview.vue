<script setup lang="ts">
import { computed, ref } from 'vue'

import { getLetterColor, getSignColorHex } from '../../config/signColors'
import type { SignSizeDefinition } from '../../config/signSizes'
import {
  getHorizontalTextPosition,
  getAreaZones,
  getAreaDividerRects,
  getMountingHoleCenters,
  getMountingHoleRadius,
  getVerticalTextPosition,
  getWorkArea,
} from '../../domain/geometry'
import type { SignProjectConfiguration } from '../../domain/signProject'

const props = defineProps<{
  configuration: SignProjectConfiguration
  size: SignSizeDefinition
}>()

const showGuides = ref(false)
const workArea = computed(() => getWorkArea(props.size, props.configuration.backgroundEnabled))
const zones = computed(() => getAreaZones(workArea.value, props.configuration.lines))
const dividers = computed(() => getAreaDividerRects(workArea.value, zones.value, props.size.widthMm))
const holes = computed(() => getMountingHoleCenters(props.size.widthMm, props.size.heightMm))
</script>

<template>
  <section class="preview-panel" aria-labelledby="preview-title">
    <div class="preview-panel__header">
      <div>
        <p class="eyebrow">Podgląd na żywo</p>
        <h2 id="preview-title">{{ size.id.replace('x', ' × ') }} cm</h2>
      </div>
      <label class="guide-toggle">
        <input v-model="showGuides" type="checkbox" />
        Obszary pomocnicze
      </label>
    </div>

    <div class="preview-stage">
      <svg
        class="sign-preview"
        :viewBox="`0 0 ${size.widthMm} ${size.heightMm}`"
        role="img"
        :aria-label="`Podgląd tabliczki ${size.id.replace('x', ' na ')} centymetrów`"
      >
        <rect
          x="0"
          y="0"
          :width="size.widthMm"
          :height="size.heightMm"
          class="sign-base"
          :fill="getSignColorHex(configuration.printColor)"
        />
        <path
          v-if="configuration.backgroundEnabled"
          class="sign-frame"
          :fill="getSignColorHex(configuration.backgroundColor)"
          fill-rule="evenodd"
          :d="`M0 0H${size.widthMm}V${size.heightMm}H0Z M${workArea.x} ${workArea.y}h${workArea.width}v${workArea.height}h${-workArea.width}Z`"
        />
        <g v-if="configuration.dividersEnabled" class="area-dividers" aria-label="Linie dzielące obszary">
          <rect
            v-for="(divider, index) in dividers"
            :key="index"
            :x="divider.x"
            :y="divider.y"
            :width="divider.width"
            :height="divider.height"
            :fill="getLetterColor(configuration.backgroundEnabled, configuration.backgroundColor, configuration.printColor)"
          />
        </g>

        <g v-if="showGuides" class="guides" aria-hidden="true">
          <rect
            :x="workArea.x"
            :y="workArea.y"
            :width="workArea.width"
            :height="workArea.height"
          />
          <rect
            v-for="zone in zones"
            :key="zone.index"
            :x="zone.x"
            :y="zone.y"
            :width="zone.width"
            :height="zone.height"
          />
        </g>

        <text
          v-for="(line, index) in configuration.lines"
          :key="line.id"
          :x="getHorizontalTextPosition(zones[index], line.horizontalAlign).x"
          :y="getVerticalTextPosition(zones[index], line.verticalAlign, line.fontSizeMm)"
          :text-anchor="getHorizontalTextPosition(zones[index], line.horizontalAlign).textAnchor"
          :font-family="line.fontFamily"
          :font-size="line.fontSizeMm"
          class="sign-text"
          :fill="getLetterColor(configuration.backgroundEnabled, configuration.backgroundColor, configuration.printColor)"
        >
          {{ line.text || `Obszar ${index + 1}` }}
        </text>

        <g v-if="configuration.mountingHolesEnabled" class="mounting-holes">
          <circle v-for="(hole, index) in holes" :key="index" :cx="hole.x" :cy="hole.y" :r="getMountingHoleRadius()" />
        </g>
      </svg>
    </div>

    <div class="preview-panel__meta">
      <span>Obszar tekstu: {{ workArea.width }} × {{ workArea.height }} mm</span>
      <span v-if="configuration.mountingHolesEnabled">4 otwory Ø5 mm</span>
    </div>
  </section>
</template>
