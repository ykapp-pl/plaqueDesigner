export interface FontDefinition {
  readonly id: string
  readonly label: string
  readonly fontFamily: string
}

export const FONT_OPTIONS: readonly FontDefinition[] = [
  { id: 'sans', label: 'Nowoczesna', fontFamily: 'Arial, sans-serif' },
  { id: 'serif', label: 'Klasyczna', fontFamily: 'Georgia, serif' },
  { id: 'rounded', label: 'Zaokrąglona', fontFamily: 'Trebuchet MS, sans-serif' },
  { id: 'condensed', label: 'Wąska', fontFamily: 'Arial Narrow, Arial, sans-serif' },
  { id: 'mono', label: 'Techniczna', fontFamily: 'ui-monospace, monospace' },
] as const

export const DEFAULT_FONT_FAMILY = FONT_OPTIONS[0].fontFamily
