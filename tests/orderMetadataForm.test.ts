import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrderMetadataForm from '../src/components/order/OrderMetadataForm.vue'
import { createDefaultConfiguration } from '../src/domain/signProject'

describe('formularz danych zamówienia', () => {
  it('używa neutralnych nazw i pokazuje informację o odpowiedzialności za projekt', () => {
    const wrapper = mount(OrderMetadataForm, {
      props: {
        customer: { login: '', orderNumber: '' },
        project: { customer: { login: '', orderNumber: '' }, configuration: createDefaultConfiguration() },
      },
    })

    expect(wrapper.text()).toContain('Nick zamawiającego')
    expect(wrapper.text()).not.toContain('Login Allegro')
    expect(wrapper.text()).toContain('Numer zamówienia')
    expect(wrapper.text()).not.toContain('Numer zamówienia Allegro')
    expect(wrapper.text()).toContain('Kreator nie weryfikuje poprawności tekstu ani projektu')
    expect(wrapper.get('a[href="mailto:ykapp.pl@gmail.com"]').text()).toBe('ykapp.pl@gmail.com')
  })
})
