import {
  MOUNTING_HOLE_CENTER_INSET_MM,
  MOUNTING_HOLE_RADIUS_MM,
  TEXT_SAFE_PADDING_MM,
} from '../config/productConstants'
import type { SignSizeDefinition } from '../config/signSizes'
import type { HorizontalAlign, VerticalAlign } from './signProject'

export interface WorkArea {
  x: number
  y: number
  width: number
  height: number
}

export interface LineZone extends WorkArea {
  index: number
}

export interface MountingHoleCenter {
  x: number
  y: number
}

export interface HorizontalTextPosition {
  x: number
  textAnchor: 'start' | 'middle' | 'end'
}

export function getWorkArea(size: SignSizeDefinition, backgroundEnabled: boolean): WorkArea {
  const inset = backgroundEnabled ? size.backgroundWorkAreaInsetMm : 0

  return {
    x: inset,
    y: inset,
    width: size.widthMm - 2 * inset,
    height: size.heightMm - 2 * inset,
  }
}

export function getLineZones(workArea: WorkArea, lineCount: number): LineZone[] {
  if (!Number.isInteger(lineCount) || lineCount < 1) {
    throw new Error('lineCount musi być dodatnią liczbą całkowitą.')
  }

  const zoneHeight = workArea.height / lineCount

  return Array.from({ length: lineCount }, (_, index) => ({
    index,
    x: workArea.x,
    y: workArea.y + index * zoneHeight,
    width: workArea.width,
    height: zoneHeight,
  }))
}

export function getHorizontalTextPosition(
  zone: WorkArea,
  alignment: HorizontalAlign,
  safePaddingMm = TEXT_SAFE_PADDING_MM,
): HorizontalTextPosition {
  switch (alignment) {
    case 'left':
      return { x: zone.x + safePaddingMm, textAnchor: 'start' }
    case 'right':
      return { x: zone.x + zone.width - safePaddingMm, textAnchor: 'end' }
    case 'center':
      return { x: zone.x + zone.width / 2, textAnchor: 'middle' }
  }
}

export function getVerticalTextPosition(
  zone: WorkArea,
  alignment: VerticalAlign,
  fontSizeMm: number,
  safePaddingMm = TEXT_SAFE_PADDING_MM,
): number {
  const safeFontSizeMm = Math.max(fontSizeMm, 0)

  switch (alignment) {
    case 'top':
      return zone.y + safePaddingMm + safeFontSizeMm
    case 'bottom':
      return zone.y + zone.height - safePaddingMm
    case 'center':
      return zone.y + zone.height / 2 + safeFontSizeMm / 3
  }
}

export function getMountingHoleCenters(
  widthMm: number,
  heightMm: number,
  insetMm = MOUNTING_HOLE_CENTER_INSET_MM,
): MountingHoleCenter[] {
  return [
    { x: insetMm, y: insetMm },
    { x: widthMm - insetMm, y: insetMm },
    { x: insetMm, y: heightMm - insetMm },
    { x: widthMm - insetMm, y: heightMm - insetMm },
  ]
}

export function getMountingHoleRadius(): number {
  return MOUNTING_HOLE_RADIUS_MM
}
