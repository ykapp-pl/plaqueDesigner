import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SignPreview from '../src/components/preview/SignPreview.vue'
import { SIGN_COLORS } from '../src/config/signColors'
import { signProjectConfigurationSchema } from '../src/domain/validation'
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

  it('renderuje separatory 4 mm z marginesem 10 mm od boków', () => {
    const configuration = createDefaultConfiguration('20x25', 3)
    configuration.dividersEnabled = true
    const wrapper = mount(SignPreview, {
      props: { configuration, size: getSignSizeById('20x25')! },
    })

    const dividers = wrapper.findAll('.area-dividers rect')
    expect(dividers).toHaveLength(2)
    expect(dividers.every((divider) => divider.attributes('x') === '10')).toBe(true)
    expect(dividers.every((divider) => divider.attributes('width') === '230')).toBe(true)
    expect(dividers.every((divider) => divider.attributes('height') === '4')).toBe(true)
  })
})


describe('kolory i ramka', () => {
  it.each(['25x25', '20x25', '15x25', '10x25', '15x15', '10x15'])('dopasowuje ramkę do obszaru tekstu: %s', (sizeId) => {
    const configuration = createDefaultConfiguration(sizeId)
    configuration.backgroundEnabled = true
    const size = getSignSizeById(sizeId)!
    const inset = size.backgroundWorkAreaInsetMm
    const wrapper = mount(SignPreview, { props: { configuration, size } })
    expect(wrapper.get('.sign-frame').attributes('d')).toBe(`M0 0H${size.widthMm}V${size.heightMm}H0Z M${inset} ${inset}h${size.widthMm - 2 * inset}v${size.heightMm - 2 * inset}h${-(size.widthMm - 2 * inset)}Z`)
  })

  it.each(SIGN_COLORS)('dobiera kontrast bez tła dla $id', (color) => {
    const configuration = createDefaultConfiguration()
    configuration.printColor = color.id
    const wrapper = mount(SignPreview, { props: { configuration, size: getSignSizeById(configuration.sizeId)! } })
    expect(wrapper.find('.sign-frame').exists()).toBe(false)
    expect(wrapper.get('.sign-base').attributes('fill')).toBe(color.hex)
    expect(wrapper.get('text').attributes('fill')).toBe(color.id === 'black' ? '#ffffff' : '#161616')
  })

  it.each(SIGN_COLORS)('stosuje kolor $id do ramki i liter niezależnie od wydruku', (background) => {
    for (const print of SIGN_COLORS) {
      const configuration = createDefaultConfiguration()
      configuration.backgroundEnabled = true
      configuration.backgroundColor = background.id
      configuration.printColor = print.id
      const wrapper = mount(SignPreview, { props: { configuration, size: getSignSizeById(configuration.sizeId)! } })
      expect(wrapper.get('.sign-base').attributes('fill')).toBe(print.hex)
      expect(wrapper.get('.sign-frame').attributes('fill')).toBe(background.hex)
      expect(wrapper.get('text').attributes('fill')).toBe(background.hex)
      expect(signProjectConfigurationSchema.parse(configuration)).toEqual(configuration)
    }
  })

  it('uzupełnia kolory starszych projektów i odrzuca nieznany kolor', () => {
    const { backgroundColor, printColor, ...legacy } = createDefaultConfiguration()
    expect(signProjectConfigurationSchema.parse(legacy)).toMatchObject({ backgroundColor, printColor })
    expect(signProjectConfigurationSchema.safeParse({ ...legacy, printColor: 'red' }).success).toBe(false)
  })
})
