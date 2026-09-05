import type { SignColor } from '../config/signColors'
import {
  DEFAULT_FONT_SIZE_MM,
  MAX_FONT_SIZE_MM,
  MIN_FONT_SIZE_MM,
} from '../config/productConstants'
import { DEFAULT_FONT_FAMILY } from '../config/fonts'
import { getSignSizeById, type SignSizeDefinition } from '../config/signSizes'

export type HorizontalAlign = 'left' | 'center' | 'right'
export type VerticalAlign = 'top' | 'center' | 'bottom'

export interface SignLine {
  id: string
  text: string
  fontFamily: string
  areaHeightMm: number
  offsetXMm: number
  offsetYMm: number
  fontSizeMm: number
  horizontalAlign: HorizontalAlign
  verticalAlign: VerticalAlign
}

export interface SignProjectConfiguration {
  schemaVersion: 1
  sizeId: string
  widthMm: number
  heightMm: number
  lineCount: number
  lines: SignLine[]
  backgroundColor: SignColor
  printColor: SignColor
  backgroundEnabled: boolean
  dividersEnabled: boolean
  mountingHolesEnabled: boolean
}

export interface OrderMetadata {
  login: string
  orderNumber: string
}

export interface SignProject {
  id?: string
  accessToken?: string
  createdAt?: string
  updatedAt?: string
  customer: OrderMetadata
  configuration: SignProjectConfiguration
}

export function createDefaultLine(index: number): SignLine {
  return {
    id: `line-${index + 1}`,
    text: '',
    areaHeightMm: 0,
    offsetXMm: 0,
    offsetYMm: 0,
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSizeMm: DEFAULT_FONT_SIZE_MM,
    horizontalAlign: 'center',
    verticalAlign: 'center',
  }
}

export function getAllowedLineCountAfterSizeChange(
  currentLineCount: number,
  nextSize: SignSizeDefinition,
): number {
  const allowed = nextSize.allowedLineCounts
  if (allowed.includes(currentLineCount)) {
    return currentLineCount
  }

  return [...allowed].reverse().find((count) => count <= currentLineCount) ?? allowed[0]
}

export function createDefaultConfiguration(sizeId = '25x25', lineCount = 1): SignProjectConfiguration {
  const size = getSignSizeById(sizeId) ?? getSignSizeById('25x25')!
  const resolvedLineCount = getAllowedLineCountAfterSizeChange(lineCount, size)

  return {
    schemaVersion: 1,
    sizeId: size.id,
    widthMm: size.widthMm,
    heightMm: size.heightMm,
    lineCount: resolvedLineCount,
    lines: Array.from({ length: resolvedLineCount }, (_, index) => ({
      ...createDefaultLine(index),
      areaHeightMm: size.heightMm / resolvedLineCount,
    })),
    backgroundColor: 'black',
    printColor: 'white',
    backgroundEnabled: false,
    dividersEnabled: false,
    mountingHolesEnabled: false,
  }
}

export const FONT_SIZE_LIMITS = {
  min: MIN_FONT_SIZE_MM,
  max: MAX_FONT_SIZE_MM,
} as const
