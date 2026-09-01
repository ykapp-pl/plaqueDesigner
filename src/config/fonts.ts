export interface FontDefinition {
  readonly id: string
  readonly label: string
  readonly fontFamily: string
}

export const FONT_OPTIONS: readonly FontDefinition[] = [
  { id: 'sans', label: 'Bezszeryfowa', fontFamily: 'Arial, sans-serif' },
  { id: 'serif', label: 'Szeryfowa', fontFamily: 'Georgia, serif' },
  { id: 'mono', label: 'Monospace', fontFamily: 'ui-monospace, monospace' },
] as const

export const DEFAULT_FONT_FAMILY = FONT_OPTIONS[0].fontFamily
