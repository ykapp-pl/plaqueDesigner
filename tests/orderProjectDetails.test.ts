import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import OrderProjectDetails from '../src/components/order/OrderProjectDetails.vue'
import { createDefaultConfiguration } from '../src/domain/signProject'

describe('szczegóły zapisanego projektu', () => {
  it('pokazuje komplet danych i nie udostępnia kontrolek edycji', () => {
    const configuration = createDefaultConfiguration('20x25', 2)
    configuration.lines[0].text = 'KOWALSCY'
    configuration.lines[1].text = '18'

    const wrapper = mount(OrderProjectDetails, {
      props: {
        project: {
          id: '00000000-0000-0000-0000-000000000001',
          createdAt: '2026-09-06T10:00:00.000Z',
          updatedAt: '2026-09-06T10:05:00.000Z',
          customer: { login: 'allegro-login', orderNumber: '1234567890' },
          configuration,
        },
      },
    })

    expect(wrapper.text()).toContain('allegro-login')
    expect(wrapper.text()).toContain('1234567890')
    expect(wrapper.text()).toContain('KOWALSCY')
    expect(wrapper.text()).toContain('18')
    expect(wrapper.find('.sign-preview').exists()).toBe(true)
    expect(wrapper.findAll('input, select, textarea, button')).toHaveLength(0)
  })
})
