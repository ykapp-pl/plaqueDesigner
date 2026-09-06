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

  it('wymaga potwierdzenia przed pierwszym zapisem', async () => {
    const configuration = createDefaultConfiguration()
    configuration.lines[0].text = 'TEST'
    const wrapper = mount(OrderMetadataForm, {
      props: {
        customer: { login: 'nick', orderNumber: '123' },
        project: { customer: { login: 'nick', orderNumber: '123' }, configuration },
      },
    })

    await wrapper.get('form').trigger('submit')

    expect(wrapper.emitted('save')).toBeUndefined()
    expect(wrapper.get('[role="alertdialog"]').text()).toContain('Po zapisaniu projektu nie będzie można zapisać go ponownie.')
    await wrapper.get('.save-confirmation .primary-button').trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  it('ukrywa przycisk zapisu dla wcześniej zapisanego projektu', () => {
    const wrapper = mount(OrderMetadataForm, {
      props: {
        customer: { login: 'nick', orderNumber: '123' },
        project: {
          id: '00000000-0000-4000-8000-000000000001',
          accessToken: '00000000-0000-4000-8000-000000000002',
          customer: { login: 'nick', orderNumber: '123' },
          configuration: createDefaultConfiguration(),
        },
      },
    })

    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Ponowne zapisanie projektu nie jest możliwe.')
    expect(wrapper.get('input').element).toHaveProperty('disabled', true)
  })
})
