import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SignPreview from '../src/components/preview/SignPreview.vue'
import { getSignSizeById } from '../src/config/signSizes'
import { createDefaultConfiguration } from '../src/domain/signProject'

describe('SignPreview', () => {
  it('odwzorowuje wymiary w viewBox i wyświetla tekst', () => {
    const configuration = createDefaultConfiguration('20x25', 2)
    configuration.lines[0].text = 'KOWALSCY'
    configuration.lines[1].text = '18'

    const wrapper = mount(SignPreview, {
      props: { configuration, size: getSignSizeById('20x25')! },
    })

    expect(wrapper.get('svg').attributes('viewBox')).toBe('0 0 250 200')
    expect(wrapper.findAll('text').map((node) => node.text())).toEqual(['KOWALSCY', '18'])
  })

  it('renderuje dokładnie cztery otwory montażowe Ø5 mm', () => {
    const configuration = createDefaultConfiguration('25x25')
    configuration.mountingHolesEnabled = true

    const wrapper = mount(SignPreview, {
      props: { configuration, size: getSignSizeById('25x25')! },
    })

    const holes = wrapper.findAll('.mounting-holes circle')
    expect(holes).toHaveLength(4)
    expect(holes.every((hole) => hole.attributes('r') === '2.5')).toBe(true)
  })

  it('zmniejsza obszar roboczy po włączeniu tła', () => {
    const configuration = createDefaultConfiguration('10x15')
    configuration.backgroundEnabled = true

    const wrapper = mount(SignPreview, {
      props: { configuration, size: getSignSizeById('10x15')! },
    })

    expect(wrapper.text()).toContain('Obszar tekstu: 140 × 90 mm')
  })
})
