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
})
