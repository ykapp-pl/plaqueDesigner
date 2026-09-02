import { describe, expect, it } from 'vitest'

import { createDefaultConfiguration } from '../src/domain/signProject'
import { orderMetadataSchema, projectLookupSchema, signProjectConfigurationSchema } from '../src/domain/validation'

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

  it('wymaga UUID projektu i tokenu przy odczycie', () => {
    expect(projectLookupSchema.safeParse({ id: 'not-an-id', accessToken: 'not-a-token' }).success).toBe(false)
    expect(projectLookupSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000001',
      accessToken: '00000000-0000-0000-0000-000000000002',
    }).success).toBe(true)
  })
})
