import { describe, expect, it } from 'vitest'

import { getSignSizeById } from '../src/config/signSizes'
import {
  getHorizontalTextPosition,
  getLineZones,
  getPositionedLineZones,
  getMountingHoleCenters,
  getMountingHoleRadius,
  getVerticalTextPosition,
  getWorkArea,
} from '../src/domain/geometry'

describe('geometria tabliczki', () => {
  it('zwraca pełny obszar roboczy bez tła', () => {
    const size = getSignSizeById('20x25')!

    expect(getWorkArea(size, false)).toEqual({ x: 0, y: 0, width: 250, height: 200 })
  })

  it('stosuje inset 10 mm dla formatów z dużym tłem', () => {
    const size = getSignSizeById('25x25')!

    expect(getWorkArea(size, true)).toEqual({ x: 10, y: 10, width: 230, height: 230 })
  })

  it('stosuje inset 5 mm dla małych formatów', () => {
    const size = getSignSizeById('10x15')!

    expect(getWorkArea(size, true)).toEqual({ x: 5, y: 5, width: 140, height: 90 })
  })

  it('dzieli obszar na równe strefy linii', () => {
    const zones = getLineZones({ x: 10, y: 10, width: 230, height: 230 }, 3)

    expect(zones).toEqual([
      { index: 0, x: 10, y: 10, width: 230, height: 230 / 3 },
      { index: 1, x: 10, y: 10 + 230 / 3, width: 230, height: 230 / 3 },
      { index: 2, x: 10, y: 10 + (2 * 230) / 3, width: 230, height: 230 / 3 },
    ])
  })

  it('wyznacza cztery otwory o promieniu 2.5 mm', () => {
    expect(getMountingHoleCenters(250, 200)).toEqual([
      { x: 7.5, y: 7.5 },
      { x: 242.5, y: 7.5 },
      { x: 7.5, y: 192.5 },
      { x: 242.5, y: 192.5 },
    ])
    expect(getMountingHoleRadius()).toBe(2.5)
  })

  it('pozycjonuje tekst zgodnie z osiami X i Y strefy', () => {
    const zone = { x: 10, y: 20, width: 100, height: 50 }

    expect(getHorizontalTextPosition(zone, 'left')).toEqual({ x: 12, textAnchor: 'start' })
    expect(getHorizontalTextPosition(zone, 'center')).toEqual({ x: 60, textAnchor: 'middle' })
    expect(getHorizontalTextPosition(zone, 'right')).toEqual({ x: 108, textAnchor: 'end' })
    expect(getVerticalTextPosition(zone, 'top', 10)).toBe(32)
    expect(getVerticalTextPosition(zone, 'center', 10)).toBeCloseTo(48.333333)
    expect(getVerticalTextPosition(zone, 'bottom', 10)).toBe(68)
  })

  it('buduje obszary o zadanych wysokościach, sumujące się do pola roboczego', () => {
    const lines = getLineZones({ x: 10, y: 10, width: 230, height: 230 }, 3).map((_, index) => ({
      areaHeightMm: [120, 55, 55][index], offsetXMm: 0, offsetYMm: 0,
    }))
    const zones = getPositionedLineZones(
      { x: 10, y: 10, width: 230, height: 230 },
      lines as any,
    )
    expect(zones.map((zone) => zone.height)).toEqual([120, 55, 55])
    expect(zones.at(-1)!.y + zones.at(-1)!.height).toBe(240)
  })
})
