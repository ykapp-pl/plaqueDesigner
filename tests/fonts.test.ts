import { describe, expect, it } from 'vitest'

import { FONT_OPTIONS } from '../src/config/fonts'

describe('fonty dostępne w Onshape', () => {
  it('udostępnia wszystkie wskazane kroje w tej samej kolejności', () => {
    expect(FONT_OPTIONS.map((font) => font.label)).toEqual([
      'Michroma',
      'Open Sans',
      'Baumans',
      'Bebas Neue',
      'Comic Neue',
      'Tinos',
    ])
    expect(FONT_OPTIONS.every((font) => font.fontFamily.includes(font.label))).toBe(true)
  })
})
