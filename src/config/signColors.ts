export const SIGN_COLOR_IDS = ['black', 'white', 'wood'] as const
export type SignColor = typeof SIGN_COLOR_IDS[number]

export const SIGN_COLORS = [
  { id: 'black', label: 'Czarny', hex: '#161616' },
  { id: 'white', label: 'Biały', hex: '#ffffff' },
  { id: 'wood', label: 'Jasnobrązowy (drewno)', hex: '#c9a475' },
] as const

export function getSignColorHex(color: SignColor): string {
  return SIGN_COLORS.find((option) => option.id === color)!.hex
}

export function getLetterColor(backgroundEnabled: boolean, backgroundColor: SignColor, printColor: SignColor): string {
  return getSignColorHex(backgroundEnabled ? backgroundColor : printColor === 'black' ? 'white' : 'black')
}
