import { describe, expect, it } from 'vitest'

import { createDefaultConfiguration } from '../src/domain/signProject'
import { orderMetadataSchema, signProjectConfigurationSchema } from '../src/domain/validation'

describe('walidacja projektu', () => {
  it('wymaga kompletnych danych zamówienia', () => {
    const result = orderMetadataSchema.safeParse({ fullName: ' ', login: 'jan', orderNumber: '' })

    expect(result.success).toBe(false)
  })

  it('odrzuca niepoprawny sizeId', () => {
    const configuration = { ...createDefaultConfiguration(), sizeId: 'custom' }

    expect(signProjectConfigurationSchema.safeParse(configuration).success).toBe(false)
  })

  it('odrzuca lineCount niedozwolony dla wybranego formatu', () => {
    const configuration = { ...createDefaultConfiguration('10x15'), lineCount: 3, lines: [] }

    expect(signProjectConfigurationSchema.safeParse(configuration).success).toBe(false)
  })

  it('wymaga liczby linii zgodnej z konfiguracją', () => {
    const configuration = { ...createDefaultConfiguration('25x25', 2), lines: [createDefaultConfiguration().lines[0]] }

    expect(signProjectConfigurationSchema.safeParse(configuration).success).toBe(false)
  })

  it('akceptuje poprawną konfigurację', () => {
    const configuration = createDefaultConfiguration('20x25', 3)

    expect(signProjectConfigurationSchema.safeParse(configuration).success).toBe(true)
  })
})
