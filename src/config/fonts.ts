export interface FontDefinition {
  readonly id: string
  readonly label: string
  readonly fontFamily: string
}

export const FONT_OPTIONS: readonly FontDefinition[] = [
  { id: 'michroma', label: 'Michroma', fontFamily: 'Michroma, sans-serif' },
  { id: 'open-sans', label: 'Open Sans', fontFamily: 'Open Sans, sans-serif' },
  { id: 'baumans', label: 'Baumans', fontFamily: 'Baumans, sans-serif' },
  { id: 'bebas-neue', label: 'Bebas Neue', fontFamily: 'Bebas Neue, sans-serif' },
  { id: 'comic-neue', label: 'Comic Neue', fontFamily: 'Comic Neue, sans-serif' },
  { id: 'tinos', label: 'Tinos', fontFamily: 'Tinos, serif' },
] as const

export const DEFAULT_FONT_FAMILY = FONT_OPTIONS[0].fontFamily
