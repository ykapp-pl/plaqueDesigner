import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useProjectStore } from '../src/stores/projectStore'

describe('projectStore', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('udostępnia tylko dozwolone liczby linii dla formatu', () => {
    const store = useProjectStore()

    store.setSize('15x25')

    expect(store.selectedSize.allowedLineCounts).toEqual([1, 2])
    expect(store.configuration.lineCount).toBe(1)
  })

  it('redukuje liczbę linii po zmianie formatu i zachowuje aktywne dane', () => {
    const store = useProjectStore()

    store.setLineCount(3)
    store.updateLine(0, { text: 'Pierwsza' })
    store.updateLine(1, { text: 'Druga' })
    store.updateLine(2, { text: 'Trzecia' })
    store.setSize('15x25')

    expect(store.configuration.lineCount).toBe(2)
    expect(store.configuration.lines.map((line) => line.text)).toEqual(['Pierwsza', 'Druga'])
  })

  it('dodaje nowe linie z wartościami domyślnymi', () => {
    const store = useProjectStore()

    store.setLineCount(3)

    expect(store.configuration.lines).toHaveLength(3)
    expect(store.configuration.lines[2]).toMatchObject({ id: 'line-3', text: '', horizontalAlign: 'center' })
  })

  it('tworzy serializowalny snapshot reaktywnej konfiguracji', () => {
    const store = useProjectStore()
    store.updateLine(0, { text: 'KOWALSCY' })

    const project = store.toProject()

    expect(project.configuration.lines[0].text).toBe('KOWALSCY')
    expect(project.configuration).not.toBe(store.configuration)
  })

  it('zmienia wysokość wybranego obszaru i zachowuje sumę pola roboczego', () => {
    const store = useProjectStore()
    store.setLineCount(3)

    store.updateLine(0, { areaHeightMm: 120 })

    store.configuration.lines.forEach((line, index) => {
      expect(line.areaHeightMm).toBeCloseTo([120, 65, 65][index])
    })
    expect(store.configuration.lines.reduce((sum, line) => sum + line.areaHeightMm, 0)).toBe(250)
  })

  it('włącza i wyłącza linie dzielące obszary', () => {
    const store = useProjectStore()
    store.setDividersEnabled(true)
    expect(store.configuration.dividersEnabled).toBe(true)
    store.setDividersEnabled(false)
    expect(store.configuration.dividersEnabled).toBe(false)
  })
})
