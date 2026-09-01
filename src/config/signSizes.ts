export interface SignSizeDefinition {
  readonly id: string
  readonly heightMm: number
  readonly widthMm: number
  readonly allowedLineCounts: readonly number[]
  readonly backgroundWorkAreaInsetMm: number
}

export const SIGN_SIZES: readonly SignSizeDefinition[] = [
  {
    id: '25x25',
    heightMm: 250,
    widthMm: 250,
    allowedLineCounts: [1, 2, 3],
    backgroundWorkAreaInsetMm: 10,
  },
  {
    id: '20x25',
    heightMm: 200,
    widthMm: 250,
    allowedLineCounts: [1, 2, 3],
    backgroundWorkAreaInsetMm: 10,
  },
  {
    id: '15x25',
    heightMm: 150,
    widthMm: 250,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 10,
  },
  {
    id: '10x25',
    heightMm: 100,
    widthMm: 250,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 5,
  },
  {
    id: '15x15',
    heightMm: 150,
    widthMm: 150,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 5,
  },
  {
    id: '10x15',
    heightMm: 100,
    widthMm: 150,
    allowedLineCounts: [1, 2],
    backgroundWorkAreaInsetMm: 5,
  },
] as const

export function getSignSizeById(sizeId: string): SignSizeDefinition | undefined {
  return SIGN_SIZES.find((size) => size.id === sizeId)
}

export function isSignSizeId(sizeId: string): boolean {
  return getSignSizeById(sizeId) !== undefined
}
