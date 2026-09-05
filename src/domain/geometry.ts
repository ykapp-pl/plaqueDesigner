import {
  MOUNTING_HOLE_CENTER_INSET_MM,
  MOUNTING_HOLE_RADIUS_MM,
  TEXT_SAFE_PADDING_MM,
  AREA_DIVIDER_HEIGHT_MM,
  AREA_DIVIDER_SIDE_MARGIN_MM,
} from '../config/productConstants'
import type { SignSizeDefinition } from '../config/signSizes'
import type { HorizontalAlign, VerticalAlign, SignLine } from './signProject'

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

export function getPositionedLineZones(workArea: WorkArea, lines: SignLine[]): LineZone[] {
  const hasCustomHeights = lines.some((line) => line.areaHeightMm > 0)
  if (!hasCustomHeights) {
    return getLineZones(workArea, lines.length).map((zone, index) => ({
      ...zone,
      // Compatibility for drafts created before vertical resizing was added.
      x: zone.x + lines[index].offsetXMm,
      y: zone.y + lines[index].offsetYMm,
    }))
  }

  const total = lines.reduce((sum, line) => sum + Math.max(0, line.areaHeightMm), 0)
  let y = workArea.y
  return lines.map((line, index) => {
    const height = total > 0 ? workArea.height * Math.max(0, line.areaHeightMm) / total : workArea.height / lines.length
    const zone = {
      index,
      x: workArea.x + (lines[index].offsetXMm || 0),
      y: y + (lines[index].offsetYMm || 0),
      width: workArea.width,
      height,
    }
    y += height
    return zone
  })
}

export interface AreaDivider {
  x: number
  y: number
  width: number
  height: number
}

export const getAreaZones = getPositionedLineZones

export function getNormalizedAreaHeights(workArea: WorkArea, lines: SignLine[]): number[] {
  const total = lines.reduce((sum, line) => sum + Math.max(0, line.areaHeightMm), 0)
  if (total <= 0) return lines.map(() => workArea.height / lines.length)
  return lines.map((line) => workArea.height * Math.max(0, line.areaHeightMm) / total)
}

export function getAreaDividerRects(workArea: WorkArea, zones: LineZone[], plaqueWidthMm: number): AreaDivider[] {
  const width = Math.max(0, plaqueWidthMm - 2 * AREA_DIVIDER_SIDE_MARGIN_MM)
  const x = AREA_DIVIDER_SIDE_MARGIN_MM
  return zones.slice(0, -1).map((zone) => ({
    x,
    y: zone.y + zone.height - AREA_DIVIDER_HEIGHT_MM / 2,
    width,
    height: AREA_DIVIDER_HEIGHT_MM,
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
