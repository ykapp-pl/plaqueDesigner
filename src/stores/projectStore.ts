import { computed, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'

import { getSignSizeById, SIGN_SIZES } from '../config/signSizes'
import { getNormalizedAreaHeights, getWorkArea } from '../domain/geometry'
import {
  createDefaultConfiguration,
  createDefaultLine,
  getAllowedLineCountAfterSizeChange,
  type SignLine,
  type OrderMetadata,
  type SignProject,
  type SignProjectConfiguration,
} from '../domain/signProject'

export const useProjectStore = defineStore('project', () => {
  const configuration = ref<SignProjectConfiguration>(createDefaultConfiguration())
  const customer = ref<OrderMetadata>({ login: '', orderNumber: '' })
  const projectId = ref<string>()
  const accessToken = ref<string>()
  const selectedSize = computed(() => getSignSizeById(configuration.value.sizeId) ?? SIGN_SIZES[0])

  function setSize(sizeId: string): void {
    const nextSize = getSignSizeById(sizeId)
    if (!nextSize) return

    const lineCount = getAllowedLineCountAfterSizeChange(configuration.value.lineCount, nextSize)
    configuration.value = {
      ...configuration.value,
      sizeId: nextSize.id,
      widthMm: nextSize.widthMm,
      heightMm: nextSize.heightMm,
      lineCount,
      lines: configuration.value.lines.slice(0, lineCount),
    }

    while (configuration.value.lines.length < lineCount) {
      configuration.value.lines.push(createDefaultLine(configuration.value.lines.length))
    }
    configuration.value.lines.forEach((line) => { line.areaHeightMm = getWorkArea(nextSize, configuration.value.backgroundEnabled).height / lineCount })
  }

  function setLineCount(lineCount: number): void {
    if (!selectedSize.value.allowedLineCounts.includes(lineCount)) return

    configuration.value.lineCount = lineCount
    configuration.value.lines = configuration.value.lines.slice(0, lineCount)
    while (configuration.value.lines.length < lineCount) {
      configuration.value.lines.push(createDefaultLine(configuration.value.lines.length))
    }
    configuration.value.lines.forEach((line) => { line.areaHeightMm = getWorkArea(selectedSize.value, configuration.value.backgroundEnabled).height / lineCount })
  }

  function updateLine(index: number, patch: Partial<SignLine>): void {
    const line = configuration.value.lines[index]
    if (!line) return
    if (patch.areaHeightMm !== undefined) {
      setAreaHeight(index, patch.areaHeightMm)
      const { areaHeightMm: _areaHeightMm, ...remaining } = patch
      configuration.value.lines[index] = { ...configuration.value.lines[index], ...remaining }
      return
    }
    configuration.value.lines[index] = { ...line, ...patch }
  }

  function setAreaHeight(index: number, requestedHeightMm: number): void {
    const lines = configuration.value.lines
    if (!lines[index] || lines.length < 2) return
    const workArea = getWorkArea(selectedSize.value, configuration.value.backgroundEnabled)
    const current = getNormalizedAreaHeights(workArea, lines)
    const minimum = Math.min(1, workArea.height / lines.length / 2)
    const requested = Number.isFinite(requestedHeightMm) ? requestedHeightMm : current[index]
    const max = workArea.height - minimum * (lines.length - 1)
    const next = Math.min(max, Math.max(minimum, requested))
    const otherTotal = workArea.height - next
    const oldOtherTotal = workArea.height - current[index]
    lines.forEach((line, lineIndex) => {
      line.areaHeightMm = lineIndex === index
        ? next
        : oldOtherTotal > 0 ? current[lineIndex] * otherTotal / oldOtherTotal : otherTotal / (lines.length - 1)
    })
  }

  function setBackgroundEnabled(enabled: boolean): void {
    const previousHeight = getWorkArea(selectedSize.value, configuration.value.backgroundEnabled).height
    configuration.value.backgroundEnabled = enabled
    const nextHeight = getWorkArea(selectedSize.value, enabled).height
    if (previousHeight !== nextHeight && configuration.value.lines.every((line) => line.areaHeightMm > 0)) {
      const scale = nextHeight / previousHeight
      configuration.value.lines.forEach((line) => { line.areaHeightMm *= scale })
    }
  }

  function setMountingHolesEnabled(enabled: boolean): void {
    configuration.value.mountingHolesEnabled = enabled
  }

  function setDividersEnabled(enabled: boolean): void {
    configuration.value.dividersEnabled = enabled
  }

  function setCustomerField(field: keyof OrderMetadata, value: string): void {
    customer.value[field] = value
  }

  function toProject(): SignProject {
    return {
      id: projectId.value,
      accessToken: accessToken.value,
      customer: { ...customer.value },
      configuration: structuredClone(toRaw(configuration.value)),
    }
  }

  function loadProject(project: SignProject): void {
    projectId.value = project.id
    accessToken.value = project.accessToken
    customer.value = { ...project.customer }
    configuration.value = structuredClone(project.configuration)
  }

  function setProjectIdentity(id: string, token: string): void {
    projectId.value = id
    accessToken.value = token
  }

  return {
    configuration,
    customer,
    selectedSize,
    setSize,
    setLineCount,
    updateLine,
    setAreaHeight,
    setBackgroundEnabled,
    setMountingHolesEnabled,
    setDividersEnabled,
    setCustomerField,
    toProject,
    loadProject,
    setProjectIdentity,
  }
})
