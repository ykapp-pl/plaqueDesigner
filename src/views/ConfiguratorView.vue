<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import LineCountSelector from '../components/configurator/LineCountSelector.vue'
import LineEditor from '../components/configurator/LineEditor.vue'
import OptionToggle from '../components/configurator/OptionToggle.vue'
import SizeSelector from '../components/configurator/SizeSelector.vue'
import SignPreview from '../components/preview/SignPreview.vue'
import OrderMetadataForm from '../components/order/OrderMetadataForm.vue'
import { isSignSizeId } from '../config/signSizes'
import { useProjectStore } from '../stores/projectStore'
import { loadLocalDraft, saveLocalDraft } from '../services/localDraftService'

const store = useProjectStore()
const route = useRoute()
const router = useRouter()
const project = computed(() => store.toProject())
const savedMessage = ref(false)

onMounted(() => {
  const draft = loadLocalDraft()
  if (draft) store.loadProject(draft)
  const initialSize = typeof route.query.size === 'string' ? route.query.size : ''
  if (isSignSizeId(initialSize)) store.setSize(initialSize)
})

watch(project, (value) => { saveLocalDraft(value) }, { deep: true })

function setSize(sizeId: string): void {
  store.setSize(sizeId)
  void router.replace({ query: { ...route.query, size: sizeId } })
}

function saveProject(): void {
  saveLocalDraft(project.value)
  savedMessage.value = true
  window.setTimeout(() => { savedMessage.value = false }, 2400)
}
</script>

<template>
  <main class="configurator-page">
    <header class="product-header">
      <div class="brand-mark" aria-hidden="true">PD</div>
      <div>
        <p class="eyebrow">Projekt do druku 3D</p>
        <h1>Plaque Designer</h1>
      </div>
      <div class="product-header__status"><span></span> Projekt roboczy</div>
    </header>

    <div class="workspace">
      <aside class="settings-panel" aria-label="Ustawienia tabliczki">
        <div class="settings-panel__intro">
          <span class="step-badge">1</span>
          <div>
            <h2>Skonfiguruj tabliczkę</h2>
            <p>Wybierz format i dopasuj tekst. Wszystkie wymiary podajemy w milimetrach.</p>
          </div>
        </div>

        <div class="settings-grid">
          <SizeSelector :model-value="store.configuration.sizeId" @update:model-value="setSize" />
          <LineCountSelector
            :model-value="store.configuration.lineCount"
            :options="store.selectedSize.allowedLineCounts"
            @update:model-value="store.setLineCount"
          />
        </div>

        <div class="option-list">
          <OptionToggle
            :model-value="store.configuration.backgroundEnabled"
            title="Pełne tło"
            description="Zmniejsza obszar roboczy tekstu"
            @update:model-value="store.setBackgroundEnabled"
          />
          <OptionToggle
            :model-value="store.configuration.mountingHolesEnabled"
            title="Otwory montażowe"
            description="4 otwory Ø5 mm w narożnikach"
            @update:model-value="store.setMountingHolesEnabled"
          />
        </div>

        <div class="line-list">
          <LineEditor
            v-for="(line, index) in store.configuration.lines"
            :key="line.id"
            :line="line"
            :index="index"
            @change="store.updateLine(index, $event)"
          />
        </div>
      </aside>

      <div class="preview-column">
        <SignPreview :configuration="store.configuration" :size="store.selectedSize" />
        <OrderMetadataForm :customer="store.customer" :project="project" @change="store.setCustomerField" @save="saveProject" />
        <p v-if="savedMessage" class="saved-message" role="status">Projekt zapisany lokalnie w tej przeglądarce.</p>
      </div>
    </div>
  </main>
</template>
