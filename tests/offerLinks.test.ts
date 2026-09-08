import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia } from 'pinia'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import ConfiguratorView from '../src/views/ConfiguratorView.vue'
import { useProjectStore } from '../src/stores/projectStore'
import { createDefaultConfiguration } from '../src/domain/signProject'
import { OFFER_LINK_MESSAGE } from '../src/domain/offer'
import { loadLocalDraft, saveLocalDraft } from '../src/services/localDraftService'
import { isOfferCode, matchesOffer } from '../supabase/functions/projects/offerPolicy'

const api = vi.hoisted(() => ({ resolveOffer: vi.fn(), createProject: vi.fn() }))
vi.mock('../src/services/projectService', () => api)
const standardCode = 'a'.repeat(32)
const premiumCode = 'b'.repeat(32)
const standard = { defaultSizeId: '10x15', allowedSizeIds: ['10x15'], backgroundDefaultEnabled: false, backgroundEditable: false, premiumAvailable: false }
const premium = { defaultSizeId: '20x25', allowedSizeIds: ['20x25', '25x20'], backgroundDefaultEnabled: true, backgroundEditable: true, premiumAvailable: true }
const savedProjectId = '00000000-0000-4000-8000-000000000001'
const savedAccessToken = '00000000-0000-4000-8000-000000000002'

async function open(url: string) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: ConfiguratorView }] })
  const pinia = createPinia()
  await router.push(url)
  await router.isReady()
  const wrapper = mount(ConfiguratorView, { global: { plugins: [router, pinia] } })
  await flushPromises()
  return { wrapper, router, store: useProjectStore(pinia) }
}

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  api.resolveOffer.mockImplementation(async code => code === standardCode ? standard : premium)
})

describe('wymagany link oferty', () => {
  it.each(['/', '/?size=10x15', '/?k=wrong', `/?k=${standardCode}&k=${premiumCode}`])('blokuje nieprawidłowy adres %s', async url => {
    const { wrapper } = await open(url)
    expect(wrapper.get('[role="alert"]').text()).toContain(OFFER_LINK_MESSAGE)
    expect(wrapper.find('form').exists()).toBe(false)
    expect(api.resolveOffer).not.toHaveBeenCalled()
    wrapper.unmount()
  })

  it('blokuje nieznany lub wyłączony kod odrzucony przez serwer', async () => {
    api.resolveOffer.mockRejectedValueOnce(new Error(OFFER_LINK_MESSAGE))
    const { wrapper } = await open(`/?k=${standardCode}`)
    expect(wrapper.text()).toContain(OFFER_LINK_MESSAGE)
    expect(wrapper.find('form').exists()).toBe(false)
    wrapper.unmount()
  })

  it('stosuje ograniczenia oferty, ignoruje jawne parametry i usuwa niedostępne premium ze szkicu', async () => {
    const configuration = createDefaultConfiguration('25x25', 3)
    configuration.backgroundEnabled = true
    configuration.printColor = configuration.backgroundColor = 'wood'
    saveLocalDraft({ configuration, customer: { login: '', orderNumber: '' } }, standardCode)
    const { wrapper, store } = await open(`/?k=${standardCode}&size=25x25&background=true&premium=true`)
    expect(store.configuration).toMatchObject({ sizeId: '10x15', widthMm: 150, heightMm: 100, lineCount: 2, backgroundEnabled: false, printColor: 'white', backgroundColor: 'black' })
    expect(wrapper.find('option[value="wood"]').exists()).toBe(false)
    expect(wrapper.findAll('select').some(select => select.find('option[value="25x25"]').exists())).toBe(false)
    store.setSize('25x25')
    store.setBackgroundEnabled(true)
    expect(store.configuration.sizeId).toBe('10x15')
    expect(store.configuration.backgroundEnabled).toBe(false)
    wrapper.unmount()
  })

  it('pozwala wybrać wyłącznie formaty oraz tło przypisane do wariantu grupowego', async () => {
    const { wrapper, store } = await open(`/?k=${premiumCode}`)

    expect(wrapper.find('option[value="20x25"]').exists()).toBe(true)
    expect(wrapper.find('option[value="25x20"]').exists()).toBe(true)
    expect(wrapper.find('option[value="25x25"]').exists()).toBe(false)
    expect(store.configuration.backgroundEnabled).toBe(true)

    store.setSize('25x20')
    store.setBackgroundEnabled(false)
    expect(store.configuration).toMatchObject({ sizeId: '25x20', widthMm: 200, heightMm: 250, backgroundEnabled: false })
    wrapper.unmount()
  })

  it('udostępnia premium w obu selektorach i zachowuje dozwolony szkic po odświeżeniu', async () => {
    const { wrapper, store } = await open(`/?k=${premiumCode}`)
    expect(wrapper.findAll('option[value="wood"]')).toHaveLength(2)
    store.configuration.printColor = 'wood'
    store.updateLine(0, { text: 'MÓJ PROJEKT' })
    await flushPromises()
    wrapper.unmount()
    const reopened = await open(`/?k=${premiumCode}`)
    expect(reopened.store.configuration.printColor).toBe('wood')
    expect(reopened.store.configuration.lines[0].text).toBe('MÓJ PROJEKT')
    expect(loadLocalDraft(standardCode)).toBeNull()
    reopened.wrapper.unmount()
  })

  it('przekazuje kod przy zapisie i ukrywa formularz po usunięciu kodu bez przeładowania', async () => {
    api.createProject.mockResolvedValue({ id: savedProjectId, accessToken: savedAccessToken })
    const { wrapper, router, store } = await open(`/?k=${standardCode}`)
    // The save API must receive the offer code, never only the editable project.
    store.setCustomerField('login', 'test')
    store.setCustomerField('orderNumber', 'test')
    store.updateLine(0, { text: 'TEST' })
    await flushPromises()
    wrapper.findComponent({ name: 'OrderMetadataForm' }).vm.$emit('save')
    await flushPromises()
    expect(api.createProject).toHaveBeenCalledWith(expect.objectContaining({ configuration: expect.objectContaining({ sizeId: '10x15' }) }), standardCode)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('Ponowne zapisanie projektu nie jest możliwe.')
    await router.push('/')
    await flushPromises()
    expect(wrapper.find('form').exists()).toBe(false)
    expect(wrapper.text()).toContain(OFFER_LINK_MESSAGE)
    wrapper.unmount()
  })

  it('zachowuje status zapisanego projektu po ponownym otwarciu kreatora', async () => {
    api.createProject.mockResolvedValue({ id: savedProjectId, accessToken: savedAccessToken })
    const { wrapper, store } = await open(`/?k=${standardCode}`)
    store.setCustomerField('login', 'nick')
    store.setCustomerField('orderNumber', '123')
    store.updateLine(0, { text: 'TEST' })
    await flushPromises()

    wrapper.findComponent({ name: 'OrderMetadataForm' }).vm.$emit('save')
    await flushPromises()
    wrapper.unmount()

    const reopened = await open(`/?k=${standardCode}`)
    expect(reopened.store.toProject()).toMatchObject({ id: savedProjectId, accessToken: savedAccessToken })
    expect(reopened.wrapper.find('button[type="submit"]').exists()).toBe(false)
    expect(reopened.wrapper.text()).toContain('Ten projekt został już zapisany.')
    expect(api.createProject).toHaveBeenCalledTimes(1)
    reopened.wrapper.unmount()
  })

  it('ignoruje spóźnioną odpowiedź poprzedniej oferty', async () => {
    let finish!: (value: typeof standard) => void
    api.resolveOffer.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
    const { wrapper, router, store } = await open(`/?k=${standardCode}`)
    expect(wrapper.find('form').exists()).toBe(false)
    await router.push(`/?k=${premiumCode}`)
    await flushPromises()
    finish(standard)
    await flushPromises()
    expect(store.configuration.sizeId).toBe('20x25')
    expect(wrapper.findAll('option[value="wood"]')).toHaveLength(2)
    wrapper.unmount()
  })
})

describe('walidacja serwerowa wariantu', () => {
  const policy = { size_id: '10x15', allowed_size_ids: ['10x15'], background_enabled: false, background_editable: false, premium_available: false }
  it('odrzuca brak kodu, dowolny tekst i tablice parametrów', () => {
    for (const code of [undefined, '', 'size=10x15', [standardCode], 'g'.repeat(32)]) expect(isOfferCode(code)).toBe(false)
    expect(isOfferCode(standardCode)).toBe(true)
  })
  it('odrzuca zmianę rozmiaru, tła i obu kolorów mimo poprawnego kodu', () => {
    const configuration = createDefaultConfiguration('10x15')
    expect(matchesOffer(configuration, policy)).toBe(true)
    for (const patch of [{ sizeId: '25x25' }, { backgroundEnabled: true }, { printColor: 'wood' }, { backgroundColor: 'wood' }, { printColor: 'red' }]) {
      expect(matchesOffer({ ...configuration, ...patch }, policy)).toBe(false)
    }
    expect(matchesOffer({ ...configuration, printColor: 'wood' }, { ...policy, premium_available: true })).toBe(true)
    expect(matchesOffer({ ...configuration, sizeId: '15x10' }, { ...policy, allowed_size_ids: ['10x15', '15x10'] })).toBe(true)
    expect(matchesOffer({ ...configuration, backgroundEnabled: true }, { ...policy, background_editable: true })).toBe(true)
  })
})
