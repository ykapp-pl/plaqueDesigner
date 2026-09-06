<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import type { OrderMetadata, SignProject } from '../../domain/signProject'
import { signProjectSchema } from '../../domain/validation'

const props = defineProps<{ customer: OrderMetadata; project: SignProject; isSaving?: boolean }>()
const emit = defineEmits<{
  change: [field: keyof OrderMetadata, value: string]
  save: []
}>()

const submitted = ref(false)
const saveConfirmationVisible = ref(false)
const result = computed(() => signProjectSchema.safeParse(props.project))
const isSaved = computed(() => Boolean(props.project.id))

function fieldError(field: keyof OrderMetadata): string {
  if (!submitted.value || result.value.success) return ''
  const issue = result.value.error.issues.find((item) => item.path.join('.') === `customer.${field}`)
  return issue?.message ?? ''
}

function submit(): void {
  submitted.value = true
  if (result.value.success && !isSaved.value && !props.isSaving) saveConfirmationVisible.value = true
}

function cancelSave(): void {
  saveConfirmationVisible.value = false
}

function confirmSave(): void {
  if (isSaved.value || props.isSaving) return
  saveConfirmationVisible.value = false
  emit('save')
}

watch(isSaved, (saved) => {
  if (saved) saveConfirmationVisible.value = false
})
</script>

<template>
  <section class="order-card" aria-labelledby="order-title">
    <div class="settings-panel__intro">
      <span class="step-badge">2</span>
      <div>
        <h2 id="order-title">Dane zamówienia</h2>
      <p>Podaj dane potrzebne do przypisania projektu do zamówienia.</p>
      </div>
    </div>

    <form class="order-form" novalidate @submit.prevent="submit">
      <div class="order-form__row order-form__row--required-data">
        <label class="field">
          <span class="field__label">Nick zamawiającego</span>
          <input
            class="control"
            autocomplete="username"
            maxlength="80"
            :value="customer.login"
            :disabled="isSaved || isSaving"
            :aria-invalid="Boolean(fieldError('login'))"
            @input="emit('change', 'login', ($event.target as HTMLInputElement).value)"
          />
          <span v-if="fieldError('login')" class="field__error">{{ fieldError('login') }}</span>
        </label>

        <label class="field">
          <span class="field__label">Numer zamówienia</span>
          <input
            class="control"
            inputmode="numeric"
            maxlength="80"
            :value="customer.orderNumber"
            :disabled="isSaved || isSaving"
            :aria-invalid="Boolean(fieldError('orderNumber'))"
            @input="emit('change', 'orderNumber', ($event.target as HTMLInputElement).value)"
          />
          <span v-if="fieldError('orderNumber')" class="field__error">{{ fieldError('orderNumber') }}</span>
        </label>
      </div>

      <p v-if="submitted && !result.success" class="form-error" role="alert">
        Uzupełnij dane zamówienia i tekst wszystkich wybranych obszarów.
      </p>
      <p class="order-form__notice">
        Przed zapisaniem projektu dokładnie sprawdź wpisane treści i wybrane ustawienia. Kreator nie weryfikuje poprawności tekstu ani projektu — za ich treść i zgodność z zamówieniem odpowiada zamawiający. Jeśli potrzebujesz projektu przygotowanego na zamówienie lub tabliczki w niestandardowym rozmiarze, skontaktuj się z nami pod adresem <a href="mailto:ykapp.pl@gmail.com">ykapp.pl@gmail.com</a>, korzystając z danych kontaktowych podanych w ofercie.
      </p>
      <div v-if="saveConfirmationVisible" class="save-confirmation" role="alertdialog" aria-labelledby="save-confirmation-title" aria-describedby="save-confirmation-description">
        <strong id="save-confirmation-title">Potwierdź zapis projektu</strong>
        <p id="save-confirmation-description">Po zapisaniu projektu nie będzie można zapisać go ponownie. Sprawdź dokładnie tekst, ustawienia i dane zamówienia przed kontynuowaniem.</p>
        <div class="save-confirmation__actions">
          <button type="button" class="secondary-button" @click="cancelSave">Anuluj</button>
          <button type="button" class="primary-button" @click="confirmSave">Zapisz ostatecznie</button>
        </div>
      </div>
      <p v-else-if="isSaved" class="order-form__saved" role="status">
        Ten projekt został już zapisany. Ponowne zapisanie projektu nie jest możliwe.
      </p>
      <button v-else type="submit" class="primary-button" :disabled="isSaving">Zapisz projekt</button>
    </form>
  </section>
</template>
