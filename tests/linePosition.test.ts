import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import LineEditor from '../src/components/configurator/LineEditor.vue'
import SignPreview from '../src/components/preview/SignPreview.vue'
import { createDefaultConfiguration } from '../src/domain/signProject'
import { signProjectConfigurationSchema } from '../src/domain/validation'
import { getSignSizeById } from '../src/config/signSizes'

describe('przesuwanie obszarów linii', () => {
  it('przesuwa tekst i obszar tylko wybranej linii', async () => {
    const configuration = createDefaultConfiguration('20x25', 2)
    configuration.backgroundEnabled = true
    const wrapper = mount(SignPreview, { props: { configuration, size: getSignSizeById('20x25')! } })
    await wrapper.get('input').setValue(true)
    const before = wrapper.findAll('text').map(node => ({ x: Number(node.attributes('x')), y: Number(node.attributes('y')) }))
    const moved = structuredClone(configuration)
    moved.lines[0].offsetXMm = -12.5
    moved.lines[0].offsetYMm = 18
    await wrapper.setProps({ configuration: moved })
    const texts = wrapper.findAll('text')
    expect(Number(texts[0].attributes('x'))).toBe(before[0].x - 12.5)
    expect(Number(texts[0].attributes('y'))).toBeCloseTo(before[0].y + 18)
    expect(Number(texts[1].attributes('x'))).toBe(before[1].x)
    expect(Number(texts[1].attributes('y'))).toBe(before[1].y)
    const zone = wrapper.findAll('.guides rect')[1]
    expect(zone.attributes('x')).toBe('-2.5')
    expect(zone.attributes('y')).toBe('28')
    expect(signProjectConfigurationSchema.parse(moved)).toEqual(moved)
  })

  it('obsługuje edycję przesunięcia i przywracanie pozycji', async () => {
    const line = createDefaultConfiguration().lines[0]
    const wrapper = mount(LineEditor, { props: { line, index: 0 } })
    const inputs = wrapper.findAll('input[type="number"]')
    await inputs[1].setValue('-7.5')
    await inputs[2].setValue('14')
    expect(wrapper.emitted('change')).toEqual([[{ offsetXMm: -7.5 }], [{ offsetYMm: 14 }]])
    await wrapper.setProps({ line: { ...line, offsetXMm: -7.5, offsetYMm: 14 } })
    await wrapper.get('.line-position button').trigger('click')
    expect(wrapper.emitted('change')?.at(-1)).toEqual([{ offsetXMm: 0, offsetYMm: 0 }])
  })

  it('odczytuje stare projekty bez przesunięcia i odrzuca nieskończone wartości', () => {
    const configuration = createDefaultConfiguration()
    const legacy = JSON.parse(JSON.stringify(configuration))
    delete legacy.lines[0].offsetXMm
    delete legacy.lines[0].offsetYMm
    expect(signProjectConfigurationSchema.parse(legacy)).toEqual(configuration)
    configuration.lines[0].offsetXMm = Infinity
    expect(signProjectConfigurationSchema.safeParse(configuration).success).toBe(false)
  })
})
