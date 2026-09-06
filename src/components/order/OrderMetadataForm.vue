<script setup lang="ts">
import { computed, ref } from 'vue'

import type { OrderMetadata, SignProject } from '../../domain/signProject'
import { signProjectSchema } from '../../domain/validation'

const props = defineProps<{ customer: OrderMetadata; project: SignProject }>()
const emit = defineEmits<{
  change: [field: keyof OrderMetadata, value: string]
  save: []
}>()

const submitted = ref(false)
const result = computed(() => signProjectSchema.safeParse(props.project))

function fieldError(field: keyof OrderMetadata): string {
  if (!submitted.value || result.value.success) return ''
  const issue = result.value.error.issues.find((item) => item.path.join('.') === `customer.${field}`)
  return issue?.message ?? ''
}

function submit(): void {
  submitted.value = true
  if (result.value.success) emit('save')
}
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
      <button type="submit" class="primary-button">Zapisz projekt</button>
    </form>
  </section>
</template>
