import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getSignSizeById, SIGN_SIZES } from '../config/signSizes'
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
  const customer = ref<OrderMetadata>({ fullName: '', login: '', orderNumber: '' })
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
  }

  function setLineCount(lineCount: number): void {
    if (!selectedSize.value.allowedLineCounts.includes(lineCount)) return

    configuration.value.lineCount = lineCount
    configuration.value.lines = configuration.value.lines.slice(0, lineCount)
    while (configuration.value.lines.length < lineCount) {
      configuration.value.lines.push(createDefaultLine(configuration.value.lines.length))
    }
  }

  function updateLine(index: number, patch: Partial<SignLine>): void {
    const line = configuration.value.lines[index]
    if (!line) return
    configuration.value.lines[index] = { ...line, ...patch }
  }

  function setBackgroundEnabled(enabled: boolean): void {
    configuration.value.backgroundEnabled = enabled
  }

  function setMountingHolesEnabled(enabled: boolean): void {
    configuration.value.mountingHolesEnabled = enabled
  }

  function setCustomerField(field: keyof OrderMetadata, value: string): void {
    customer.value[field] = value
  }

  function toProject(): SignProject {
    return {
      id: projectId.value,
      accessToken: accessToken.value,
      customer: { ...customer.value },
      configuration: structuredClone(configuration.value),
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
    setBackgroundEnabled,
    setMountingHolesEnabled,
    setCustomerField,
    toProject,
    loadProject,
    setProjectIdentity,
  }
})
