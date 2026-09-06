<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

import OrderProjectDetails from '../components/order/OrderProjectDetails.vue'
import type { SignProject } from '../domain/signProject'
import {
  checkPanelAccess,
  deleteOrderProject,
  onPanelSignOut,
  PanelAccessError,
  searchOrderProjects,
  signInToPanel,
  signOutOfPanel,
} from '../services/orderPanelService'

const email = ref('')
const password = ref('')
const orderNumber = ref('')
const projects = ref<SignProject[]>([])
const selectedProjectId = ref('')
const hasMore = ref(false)
const searchedOrderNumber = ref('')
const isLoadingAuth = ref(true)
const isAuthenticated = ref(false)
const isSigningIn = ref(false)
const isSigningOut = ref(false)
const isSearching = ref(false)
const authError = ref('')
const searchError = ref('')
const orderNumberError = ref('')
const deleteCandidate = ref<SignProject | null>(null)
const deleteError = ref('')
const isDeleting = ref(false)
const hasSearched = ref(false)
let unsubscribe = () => undefined
let requestSerial = 0

const selectedProject = computed(() => projects.value.find((project) => project.id === selectedProjectId.value))
const resultLabel = computed(() => {
  const count = projects.value.length
  return `${count} ${count === 1 ? 'zapisany projekt' : count < 5 ? 'zapisane projekty' : 'zapisanych projektów'}`
})

function clearResults(): void {
  requestSerial += 1
  projects.value = []
  selectedProjectId.value = ''
  hasMore.value = false
  searchedOrderNumber.value = ''
  hasSearched.value = false
  searchError.value = ''
  deleteCandidate.value = null
  deleteError.value = ''
}

function handleSignedOut(): void {
  isAuthenticated.value = false
  authError.value = ''
  clearResults()
}

async function restoreSession(): Promise<void> {
  isLoadingAuth.value = true
  try {
    isAuthenticated.value = await checkPanelAccess()
  } catch (error) {
    if (!(error instanceof PanelAccessError)) authError.value = error instanceof Error ? error.message : 'Panel jest chwilowo niedostępny.'
    isAuthenticated.value = false
  } finally {
    isLoadingAuth.value = false
  }
}

async function signIn(): Promise<void> {
  if (isSigningIn.value) return
  isSigningIn.value = true
  authError.value = ''
  try {
    await signInToPanel(email.value, password.value)
    isAuthenticated.value = true
    clearResults()
  } catch (error) {
    isAuthenticated.value = false
    authError.value = error instanceof Error ? error.message : 'Nie udało się zalogować.'
  } finally {
    password.value = ''
    isSigningIn.value = false
  }
}

async function signOut(): Promise<void> {
  if (isSigningOut.value) return
  isSigningOut.value = true
  authError.value = ''
  try {
    await signOutOfPanel()
    handleSignedOut()
  } catch (error) {
    authError.value = error instanceof Error ? error.message : 'Nie udało się zakończyć sesji.'
  } finally {
    isSigningOut.value = false
  }
}

async function search(nextOffset = 0, requestedOrderNumber = orderNumber.value.trim()): Promise<void> {
  const number = requestedOrderNumber.trim()
  if (!number) {
    orderNumberError.value = 'Podaj numer zamówienia.'
    return
  }
  if (number.length > 80) {
    orderNumberError.value = 'Numer zamówienia jest za długi.'
    return
  }

  const serial = ++requestSerial
  isSearching.value = true
  searchError.value = ''
  orderNumberError.value = ''
  hasSearched.value = true

  try {
    const result = await searchOrderProjects(number, nextOffset)
    if (serial !== requestSerial || !isAuthenticated.value) return

    projects.value = nextOffset === 0 ? result.projects : [...projects.value, ...result.projects]
    hasMore.value = result.hasMore
    searchedOrderNumber.value = number
    if (nextOffset === 0) selectedProjectId.value = result.projects[0]?.id ?? ''
  } catch (error) {
    if (serial !== requestSerial) return
    if (error instanceof PanelAccessError) {
      handleSignedOut()
      authError.value = error.message
    } else {
      searchError.value = error instanceof Error ? error.message : 'Nie udało się wyszukać zamówienia.'
    }
  } finally {
    if (serial === requestSerial) isSearching.value = false
  }
}

function requestDelete(project: SignProject): void {
  if (!project.id || isDeleting.value) return
  deleteError.value = ''
  deleteCandidate.value = project
}

function cancelDelete(): void {
  if (!isDeleting.value) deleteCandidate.value = null
}

async function confirmDelete(): Promise<void> {
  const project = deleteCandidate.value
  if (!project?.id || isDeleting.value) return

  isDeleting.value = true
  deleteError.value = ''
  try {
    await deleteOrderProject(project.id)
    projects.value = projects.value.filter((item) => item.id !== project.id)
    selectedProjectId.value = projects.value[0]?.id ?? ''
    deleteCandidate.value = null
  } catch (error) {
    if (error instanceof PanelAccessError) {
      handleSignedOut()
      authError.value = error.message
    } else {
      deleteError.value = error instanceof Error ? error.message : 'Nie udało się usunąć projektu.'
    }
  } finally {
    isDeleting.value = false
  }
}

onMounted(async () => {
  unsubscribe = onPanelSignOut(handleSignedOut)
  await restoreSession()
})

onUnmounted(() => {
  requestSerial += 1
  unsubscribe()
})
</script>

<template>
  <main class="configurator-page order-panel-page">
    <header class="product-header">
      <div class="brand-mark" aria-hidden="true">PD</div>
      <div>
        <p class="eyebrow">Panel właściciela</p>
        <h1>Historia zamówień</h1>
      </div>
      <RouterLink class="product-header__status" to="/">← Kreator</RouterLink>
    </header>

    <section v-if="isLoadingAuth" class="status-card order-panel-card" role="status" aria-live="polite">
      <h2>Sprawdzanie dostępu</h2>
      <p>Przygotowuję bezpieczny panel zamówień.</p>
    </section>

    <section v-else-if="!isAuthenticated" class="order-panel-card settings-panel" aria-labelledby="panel-login-title">
      <div class="settings-panel__intro">
        <span class="step-badge">🔒</span>
        <div>
          <p class="eyebrow">Dostęp prywatny</p>
          <h2 id="panel-login-title">Zaloguj się do panelu zamówień</h2>
          <p>Dane zapisanych projektów są dostępne wyłącznie dla autoryzowanego konta właściciela.</p>
        </div>
      </div>

      <form class="order-form order-panel-login" novalidate @submit.prevent="signIn">
        <label class="field">
          <span class="field__label">Adres e-mail</span>
          <input v-model="email" class="control" type="email" autocomplete="username" required />
        </label>
        <label class="field">
          <span class="field__label">Hasło</span>
          <input v-model="password" class="control" type="password" autocomplete="current-password" required />
        </label>
        <p v-if="authError" class="form-error" role="alert">{{ authError }}</p>
        <button class="primary-button" type="submit" :disabled="isSigningIn || !email || !password">
          {{ isSigningIn ? 'Logowanie…' : 'Zaloguj się' }}
        </button>
      </form>
    </section>

    <template v-else>
      <section class="order-panel-card settings-panel" aria-labelledby="panel-search-title">
        <div class="settings-panel__intro">
          <span class="step-badge">1</span>
          <div>
            <p class="eyebrow">Tylko odczyt</p>
            <h2 id="panel-search-title">Odtwórz zamówienie</h2>
            <p>Wpisz numer zamówienia, aby wyświetlić wszystkie zapisane projekty bez możliwości edycji.</p>
          </div>
          <button class="secondary-button order-panel-logout" type="button" :disabled="isSigningOut" @click="signOut">
            {{ isSigningOut ? 'Wylogowanie…' : 'Wyloguj' }}
          </button>
        </div>

        <form class="order-form order-panel-search" novalidate @submit.prevent="search()">
          <label class="field">
            <span class="field__label">Numer zamówienia</span>
            <input
              v-model="orderNumber"
              class="control"
              inputmode="numeric"
              maxlength="80"
              :aria-invalid="Boolean(orderNumberError)"
              aria-describedby="order-panel-search-hint"
            />
            <span id="order-panel-search-hint" class="field__hint">Wyszukiwanie obejmuje tylko dokładnie ten numer.</span>
            <span v-if="orderNumberError" class="field__error">{{ orderNumberError }}</span>
          </label>
          <button class="primary-button" type="submit" :disabled="isSearching">
            {{ isSearching ? 'Wyszukiwanie…' : 'Pokaż zamówienie' }}
          </button>
        </form>
        <p v-if="authError" class="form-error" role="alert">{{ authError }}</p>
        <p v-if="searchError" class="form-error" role="alert">{{ searchError }}</p>
      </section>

      <section v-if="hasSearched && !isSearching && !searchError && !projects.length" class="status-card order-panel-card" role="status">
        <h2>Nie znaleziono projektu</h2>
        <p>Nie ma jeszcze zapisanego projektu dla numeru {{ searchedOrderNumber || orderNumber.trim() }}.</p>
      </section>

      <section v-else-if="projects.length" class="order-panel-results" aria-labelledby="order-panel-results-title">
        <div class="order-panel-results__header">
          <div>
            <p class="eyebrow">Wyniki wyszukiwania</p>
            <h2 id="order-panel-results-title">Zamówienie {{ searchedOrderNumber }}</h2>
            <p>{{ resultLabel }}<span v-if="hasMore"> · dostępne są kolejne wyniki</span></p>
          </div>
          <button v-if="hasMore" class="secondary-button" type="button" :disabled="isSearching" @click="search(projects.length, searchedOrderNumber)">
            {{ isSearching ? 'Ładowanie…' : 'Pokaż kolejne' }}
          </button>
        </div>

        <div class="order-panel-results__content">
          <nav class="order-panel-project-list" aria-label="Zapisane projekty zamówienia">
            <button
              v-for="(project, index) in projects"
              :key="project.id"
              class="order-panel-project-list__item"
              :class="{ 'order-panel-project-list__item--active': project.id === selectedProjectId }"
              type="button"
              @click="selectedProjectId = project.id ?? ''"
            >
              <span><strong>Projekt {{ index + 1 }}</strong><small>{{ project.createdAt ? new Date(project.createdAt).toLocaleString('pl-PL') : 'Brak daty' }}</small></span>
              <span aria-hidden="true">→</span>
            </button>
          </nav>
          <OrderProjectDetails
            v-if="selectedProject"
            :project="selectedProject"
            :deleting="Boolean(deleteCandidate)"
            @delete="requestDelete(selectedProject)"
          />
          <div v-if="deleteCandidate" class="order-panel-delete-confirmation" role="alertdialog" aria-labelledby="delete-project-title" aria-describedby="delete-project-description">
            <strong id="delete-project-title">Usunąć zapisany projekt?</strong>
            <p id="delete-project-description">Projekt {{ deleteCandidate.customer.orderNumber }} oraz jego wizualizacja zostaną trwale usunięte. Tej operacji nie można cofnąć.</p>
            <div class="order-panel-delete-confirmation__actions">
              <button class="secondary-button" type="button" :disabled="isDeleting" @click="cancelDelete">Anuluj</button>
              <button class="danger-button" type="button" :disabled="isDeleting" @click="confirmDelete">
                {{ isDeleting ? 'Usuwanie…' : 'Usuń trwale' }}
              </button>
            </div>
          </div>
          <p v-if="deleteError" class="form-error" role="alert">{{ deleteError }}</p>
        </div>
      </section>
    </template>
  </main>
</template>
