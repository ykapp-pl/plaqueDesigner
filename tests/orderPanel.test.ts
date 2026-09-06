import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createDefaultConfiguration, type SignProject } from '../src/domain/signProject'

const api = vi.hoisted(() => ({
  checkPanelAccess: vi.fn(),
  deleteOrderProject: vi.fn(),
  onPanelSignOut: vi.fn(() => () => undefined),
  searchOrderProjects: vi.fn(),
  signInToPanel: vi.fn(),
  signOutOfPanel: vi.fn(),
}))

vi.mock('../src/services/orderPanelService', () => ({
  ...api,
  PanelAccessError: class PanelAccessError extends Error {},
}))

import OrderPanelView from '../src/views/OrderPanelView.vue'

const project = (id: string, text: string): SignProject => ({
  id,
  createdAt: '2026-09-06T10:00:00.000Z',
  updatedAt: '2026-09-06T10:05:00.000Z',
  customer: { login: 'nick-zamawiajacego', orderNumber: '1234567890' },
  configuration: {
    ...createDefaultConfiguration('20x25'),
    lines: [{ ...createDefaultConfiguration('20x25').lines[0], text }],
  },
})

function open() {
  return mount(OrderPanelView, {
    global: {
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  api.checkPanelAccess.mockResolvedValue(false)
})

describe('panel zamówień', () => {
  it('loguje właściciela, wyszukuje numer i pokazuje projekty tylko do odczytu', async () => {
    api.searchOrderProjects.mockResolvedValue({ projects: [project('00000000-0000-0000-0000-000000000001', 'KOWALSCY'), project('00000000-0000-0000-0000-000000000002', '18')], hasMore: false })
    const wrapper = open()
    await flushPromises()

    await wrapper.find('input[type="email"]').setValue('owner@example.com')
    await wrapper.find('input[type="password"]').setValue('secret')
    await wrapper.find('.order-panel-login').trigger('submit')
    await flushPromises()

    await wrapper.find('.order-panel-search input').setValue(' 1234567890 ')
    await wrapper.find('.order-panel-search').trigger('submit')
    await flushPromises()

    expect(api.signInToPanel).toHaveBeenCalledWith('owner@example.com', 'secret')
    expect(api.searchOrderProjects).toHaveBeenCalledWith('1234567890', 0)
    expect(wrapper.findAll('.order-panel-project-list__item')).toHaveLength(2)
    expect(wrapper.text()).toContain('KOWALSCY')
    expect(wrapper.findAll('input, select, textarea')).toHaveLength(1)
    expect(wrapper.find('.order-details__delete').exists()).toBe(true)
  })

  it('pobiera kolejną stronę dla pierwotnie wyszukanego numeru', async () => {
    api.searchOrderProjects
      .mockResolvedValueOnce({ projects: [project('00000000-0000-0000-0000-000000000001', 'KOWALSCY')], hasMore: true })
      .mockResolvedValueOnce({ projects: [project('00000000-0000-0000-0000-000000000002', '18')], hasMore: false })
    const wrapper = open()
    await flushPromises()
    api.signInToPanel.mockResolvedValue(undefined)
    await wrapper.find('input[type="email"]').setValue('owner@example.com')
    await wrapper.find('input[type="password"]').setValue('secret')
    await wrapper.find('.order-panel-login').trigger('submit')
    await flushPromises()
    await wrapper.find('.order-panel-search input').setValue('1234567890')
    await wrapper.find('.order-panel-search').trigger('submit')
    await flushPromises()
    await wrapper.find('.order-panel-results__header .secondary-button').trigger('click')
    await flushPromises()
    await wrapper.findAll('.order-panel-project-list__item')[1].trigger('click')

    expect(api.searchOrderProjects).toHaveBeenNthCalledWith(2, '1234567890', 1)
    expect(wrapper.text()).toContain('18')
  })

  it('wymaga potwierdzenia i usuwa wybrany projekt z wyników', async () => {
    const firstId = '00000000-0000-0000-0000-000000000001'
    const secondId = '00000000-0000-0000-0000-000000000002'
    api.searchOrderProjects.mockResolvedValue({ projects: [project(firstId, 'KOWALSCY'), project(secondId, '18')], hasMore: false })
    api.deleteOrderProject.mockResolvedValue(undefined)
    const wrapper = open()
    await flushPromises()
    api.signInToPanel.mockResolvedValue(undefined)
    await wrapper.find('input[type="email"]').setValue('owner@example.com')
    await wrapper.find('input[type="password"]').setValue('secret')
    await wrapper.find('.order-panel-login').trigger('submit')
    await flushPromises()
    await wrapper.find('.order-panel-search input').setValue('1234567890')
    await wrapper.find('.order-panel-search').trigger('submit')
    await flushPromises()
    await wrapper.findAll('.order-panel-project-list__item')[1].trigger('click')

    await wrapper.find('.order-details__delete').trigger('click')
    expect(wrapper.get('[role="alertdialog"]').text()).toContain('Tej operacji nie można cofnąć.')
    expect(api.deleteOrderProject).not.toHaveBeenCalled()
    await wrapper.get('.order-panel-delete-confirmation .danger-button').trigger('click')
    await flushPromises()

    expect(api.deleteOrderProject).toHaveBeenCalledWith(secondId)
    expect(wrapper.findAll('.order-panel-project-list__item')).toHaveLength(1)
    expect(wrapper.find('.order-details__delete').exists()).toBe(true)
  })
})
