<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SignPreview from '../components/preview/SignPreview.vue'
import { getSignSizeById } from '../config/signSizes'
import type { SignProject } from '../domain/signProject'
import { getProject } from '../services/projectService'
import { loadLocalDraft } from '../services/localDraftService'
import { useProjectStore } from '../stores/projectStore'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const project = ref<SignProject | null>(null)
const isLoading = ref(true)
const errorMessage = ref('')

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

async function load(): Promise<void> {
  const id = stringValue(route.params.id)
  const queryToken = stringValue(route.query.token)
  const localDraft = loadLocalDraft()
  const accessToken = queryToken || (localDraft?.id === id ? localDraft.accessToken ?? '' : '')

  if (!id || !accessToken) {
    errorMessage.value = 'Brak tokenu dostępu do projektu.'
    isLoading.value = false
    return
  }

  try {
    project.value = await getProject(id, accessToken)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nie udało się pobrać projektu.'
  } finally {
    isLoading.value = false
  }
}

function goToConfigurator(): void {
  void router.push({ name: 'configurator' })
}

function editProject(): void {
  if (!project.value) return
  store.loadProject(project.value)
  void router.push({ name: 'configurator', query: { size: project.value.configuration.sizeId } })
}

onMounted(() => { void load() })
</script>

<template>
  <main class="configurator-page">
    <header class="product-header">
      <div class="brand-mark" aria-hidden="true">PD</div>
      <div>
        <p class="eyebrow">Zapisany projekt</p>
        <h1>Plaque Designer</h1>
      </div>
      <button class="secondary-button" type="button" @click="goToConfigurator">Nowy projekt</button>
    </header>

    <section v-if="isLoading" class="state-card" aria-live="polite">Pobieranie projektu…</section>

    <section v-else-if="errorMessage" class="state-card state-card--error" role="alert">
      <h2>Nie udało się otworzyć projektu</h2>
      <p>{{ errorMessage }}</p>
      <button class="primary-button" type="button" @click="goToConfigurator">Wróć do konfiguratora</button>
    </section>

    <div v-else-if="project" class="project-layout">
      <section class="preview-column">
        <div class="preview-card">
          <div class="settings-panel__intro">
            <span class="step-badge">✓</span>
            <div>
              <h2>Projekt {{ project.id }}</h2>
              <p>{{ project.configuration.widthMm }} × {{ project.configuration.heightMm }} mm · {{ project.configuration.lineCount }} linii</p>
            </div>
          </div>
          <SignPreview :configuration="project.configuration" :size="getSignSizeById(project.configuration.sizeId)!" />
        </div>
      </section>

      <aside class="settings-panel project-details">
        <h2>Dane projektu</h2>
        <dl class="project-details__list">
          <div><dt>Imię i nazwisko</dt><dd>{{ project.customer.fullName }}</dd></div>
          <div><dt>Login</dt><dd>{{ project.customer.login }}</dd></div>
          <div><dt>Numer zamówienia</dt><dd>{{ project.customer.orderNumber }}</dd></div>
          <div><dt>Format</dt><dd>{{ project.configuration.widthMm }} × {{ project.configuration.heightMm }} mm</dd></div>
          <div><dt>Tło</dt><dd>{{ project.configuration.backgroundEnabled ? 'włączone' : 'wyłączone' }}</dd></div>
          <div><dt>Otwory montażowe</dt><dd>{{ project.configuration.mountingHolesEnabled ? 'włączone' : 'wyłączone' }}</dd></div>
        </dl>

        <div class="project-lines">
          <h3>Linie tekstu</h3>
          <ol>
            <li v-for="line in project.configuration.lines" :key="line.id">
              <strong>{{ line.text }}</strong>
              <span>{{ line.fontFamily }} · {{ line.fontSizeMm }} mm · {{ line.horizontalAlign }}/{{ line.verticalAlign }}</span>
            </li>
          </ol>
        </div>

        <button class="primary-button" type="button" @click="editProject">Edytuj projekt</button>
      </aside>
    </div>
  </main>
</template>
