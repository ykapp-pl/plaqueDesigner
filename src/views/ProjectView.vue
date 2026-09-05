<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import SignPreview from '../components/preview/SignPreview.vue'
import { projectLookupSchema } from '../domain/validation'
import { getProject } from '../services/projectService'
import { useProjectStore } from '../stores/projectStore'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const isLoading = ref(true)
const errorMessage = ref('')

async function loadProject(): Promise<void> {
  const parsed = projectLookupSchema.safeParse({
    id: route.params.id,
    accessToken: route.query.token,
  })

  if (!parsed.success) {
    errorMessage.value = 'Nieprawidłowy adres projektu. Potrzebujesz identyfikatora i tokenu dostępu.'
    isLoading.value = false
    return
  }

  try {
    const project = await getProject(parsed.data.id, parsed.data.accessToken)
    store.loadProject(project)
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Nie udało się pobrać projektu.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadProject()
})
</script>

<template>
  <main class="configurator-page">
    <header class="product-header">
      <div class="brand-mark" aria-hidden="true">PD</div>
      <div>
        <p class="eyebrow">Projekt do druku 3D</p>
        <h1>Plaque Designer</h1>
      </div>
      <RouterLink class="product-header__status" to="/">← Nowy projekt</RouterLink>
    </header>

    <section v-if="isLoading" class="status-card project-card" role="status" aria-live="polite">
      <h2>Ładowanie projektu</h2>
      <p>Pobieram zapisane ustawienia i przygotowuję podgląd.</p>
    </section>

    <section v-else-if="errorMessage" class="status-card status-card--error project-card" role="alert">
      <h2>Nie udało się otworzyć projektu</h2>
      <p>{{ errorMessage }}</p>
      <RouterLink to="/">Wróć do konfiguratora</RouterLink>
    </section>

    <div v-else class="workspace">
      <section class="settings-panel project-card" aria-labelledby="project-details-title">
        <div class="project-card__header">
          <span class="step-badge">✓</span>
          <div>
            <h2 id="project-details-title">Zapisany projekt</h2>
            <p>Projekt został odtworzony z bezpiecznego identyfikatora i tokenu dostępu.</p>
          </div>
        </div>

        <dl class="project-meta">
          <div>
            <dt>Format</dt>
            <dd>{{ store.selectedSize.id.replace('x', ' × ') }} cm</dd>
          </div>
          <div>
            <dt>Obszary tekstu</dt>
            <dd>{{ store.configuration.lineCount }}</dd>
          </div>
          <div>
            <dt>Numer zamówienia</dt>
            <dd>{{ store.customer.orderNumber }}</dd>
          </div>
        </dl>
      </section>

      <SignPreview :configuration="store.configuration" :size="store.selectedSize" />
    </div>
  </main>
</template>
