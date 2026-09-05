<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import ColorSelector from '../components/configurator/ColorSelector.vue'
import LineCountSelector from '../components/configurator/LineCountSelector.vue'
import LineEditor from '../components/configurator/LineEditor.vue'
import OptionToggle from '../components/configurator/OptionToggle.vue'
import SignPreview from '../components/preview/SignPreview.vue'
import OrderMetadataForm from '../components/order/OrderMetadataForm.vue'
import { OFFER_LINK_MESSAGE, offerCodeSchema, type Offer } from '../domain/offer'
import { useProjectStore } from '../stores/projectStore'
import { loadLocalDraft, saveLocalDraft } from '../services/localDraftService'
import { createProject, resolveOffer } from '../services/projectService'

const store = useProjectStore()
const route = useRoute()
const router = useRouter()
const project = computed(() => store.toProject())
const savedMessage = ref(false)
const saveError = ref('')
const isSaving = ref(false)
const remoteProjectId = ref('')
const savedProjectUrl = ref('')
const offer = ref<Offer | null>(null)
const isLoadingOffer = ref(false)
const offerError = ref('')
const offerCode = computed(() => offerCodeSchema.safeParse(route.query.k).success ? route.query.k as string : '')

watch(() => route.query.k, async (_value, _oldValue, onCleanup) => {
  let cancelled = false
  onCleanup(() => { cancelled = true })
  offer.value = null
  offerError.value = ''
  savedMessage.value = false
  saveError.value = ''
  const code = offerCode.value
  isLoadingOffer.value = Boolean(code)
  if (!code) {
    offerError.value = OFFER_LINK_MESSAGE
    return
  }
  try {
    const resolved = await resolveOffer(code)
    if (cancelled) return
    store.startOffer(resolved, loadLocalDraft(code))
    offer.value = resolved
  } catch (error) {
    if (!cancelled) offerError.value = error instanceof Error ? error.message : OFFER_LINK_MESSAGE
  } finally {
    if (!cancelled) isLoadingOffer.value = false
  }
}, { immediate: true })

watch(project, (value) => {
  if (offer.value && !isLoadingOffer.value) saveLocalDraft(value, offerCode.value)
}, { deep: true })

async function saveProject(): Promise<void> {
  if (!offer.value || isLoadingOffer.value || isSaving.value) return
  const code = offerCode.value
  store.enforceOffer()
  isSaving.value = true
  saveError.value = ''
  try {
    const reference = await createProject(project.value, code)
    if (code !== offerCode.value || !offer.value) return
    store.setProjectIdentity(reference.id, reference.accessToken)
    saveLocalDraft(store.toProject(), code)
    remoteProjectId.value = reference.id
    savedProjectUrl.value = router.resolve({
      name: 'project',
      params: { id: reference.id },
      query: { token: reference.accessToken },
    }).href
    savedMessage.value = true
    window.setTimeout(() => { savedMessage.value = false }, 3000)
  } catch (error) {
    saveError.value = error instanceof Error ? error.message : 'Nie udało się zapisać projektu.'
  } finally {
    isSaving.value = false
  }
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
      <div v-if="offer" class="product-header__status"><span></span> Projekt roboczy</div>
    </header>

    <section v-if="isLoadingOffer" class="status-card" role="status">
      <h2>Otwieranie kreatora</h2>
      <p>Wczytujemy wariant tabliczki z Twojej oferty.</p>
    </section>
    <section v-else-if="!offer" class="status-card status-card--error" role="alert">
      <h2>Nie można otworzyć kreatora</h2>
      <p>{{ offerError || OFFER_LINK_MESSAGE }}</p>
    </section>
    <div v-else class="workspace">
      <aside class="settings-panel" aria-label="Ustawienia tabliczki">
        <div class="settings-panel__intro">
          <span class="step-badge">1</span>
          <div>
            <h2>Skonfiguruj tabliczkę</h2>
            <p>Dopasuj tekst i kolor. Format oraz tło wynikają z wybranego wariantu oferty.</p>
          </div>
        </div>

        <div class="settings-grid">
          <div class="field">
            <span class="field__label">Format tabliczki</span>
            <strong>{{ offer.sizeId.replace('x', ' × ') }} cm</strong>
            <span class="field__hint">Wysokość × szerokość · wariant z oferty</span>
          </div>
          <LineCountSelector
            :model-value="store.configuration.lineCount"
            :options="store.selectedSize.allowedLineCounts"
            @update:model-value="store.setLineCount"
          />
        </div>

        <div class="option-list">
          <div class="field">
            <span class="field__label">Pełne tło</span>
            <strong>{{ offer.backgroundEnabled ? 'Z tłem' : 'Bez tła' }}</strong>
            <span class="field__hint">Wariant z oferty</span>
          </div>
          <OptionToggle
            :model-value="store.configuration.mountingHolesEnabled"
            title="Otwory montażowe"
            description="4 otwory Ø5 mm w narożnikach"
            @update:model-value="store.setMountingHolesEnabled"
          />
          <OptionToggle
            :model-value="store.configuration.dividersEnabled"
            title="Linie dzielące obszary"
            description="Pasy 4 mm z marginesem 10 mm od boków"
            @update:model-value="store.setDividersEnabled"
          />
        </div>

        <div class="settings-grid">
          <ColorSelector v-model="store.configuration.printColor" label="Kolor wydruku" :premium-available="offer.premiumAvailable" />
          <ColorSelector v-if="store.configuration.backgroundEnabled" v-model="store.configuration.backgroundColor" label="Kolor tła (ramka i litery)" :premium-available="offer.premiumAvailable" />
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
        <p v-if="savedMessage" class="saved-message" role="status">
          Projekt zapisany w Supabase. ID: <code>{{ remoteProjectId }}</code>
          <a :href="savedProjectUrl">Otwórz zapisany projekt</a>
        </p>
        <p v-if="saveError" class="form-error" role="alert">{{ saveError }}</p>
      </div>
    </div>
  </main>
</template>
