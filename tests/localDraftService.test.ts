import { beforeEach, describe, expect, it } from 'vitest'

import { createDefaultConfiguration } from '../src/domain/signProject'
import { deserializeProject, loadLocalDraft, saveLocalDraft, serializeProject } from '../src/services/localDraftService'

describe('localDraftService', () => {
  beforeEach(() => localStorage.clear())

  it('zachowuje pełną konfigurację w round-trip JSON', () => {
    const project = {
      customer: { login: 'jkowalski', orderNumber: '123' },
      configuration: createDefaultConfiguration('20x25', 2),
    }
    project.configuration.lines[0].text = 'KOWALSCY'
    project.configuration.lines[1].text = '18'

    const restored = deserializeProject(serializeProject(project))

    expect(restored).toEqual(project)
  })

  it('odrzuca uszkodzony lub niezgodny zapis', () => {
    expect(deserializeProject('{"configuration":')).toBeNull()
    expect(deserializeProject(JSON.stringify({ nope: true }))).toBeNull()
  })

  it('zapisuje i odczytuje szkic z localStorage', () => {
    const project = {
      customer: { login: '', orderNumber: '' },
      configuration: createDefaultConfiguration(),
    }

    expect(saveLocalDraft(project)).toBe(true)
    expect(loadLocalDraft()).toEqual(project)
  })
})
