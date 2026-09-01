import { describe, expect, it, vi } from 'vitest'

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }))

vi.mock('../src/lib/supabase', () => ({
  supabase: { functions: { invoke } },
}))

import { createDefaultConfiguration } from '../src/domain/signProject'
import { createProject, getProject } from '../src/services/projectService'

function validProject() {
  const configuration = createDefaultConfiguration('20x25', 2)
  configuration.lines[0].text = 'KOWALSCY'
  configuration.lines[1].text = '18'
  return {
    customer: { fullName: 'Jan Kowalski', login: 'jkowalski', orderNumber: '123' },
    configuration,
  }
}

describe('projectService', () => {
  it('tworzy projekt i zwraca identyfikator z tokenem', async () => {
    invoke.mockResolvedValueOnce({ data: { id: '11111111-1111-4111-8111-111111111111', accessToken: '22222222-2222-4222-8222-222222222222' }, error: null })

    const project = validProject()
    await expect(createProject(project)).resolves.toEqual({
      id: '11111111-1111-4111-8111-111111111111',
      accessToken: '22222222-2222-4222-8222-222222222222',
    })
    expect(invoke).toHaveBeenCalledWith('projects', { body: { action: 'create', project } })
  })

  it('mapuje zapis Supabase na model domenowy', async () => {
    const source = validProject()
    invoke.mockResolvedValueOnce({
      data: {
        project: {
          id: '11111111-1111-4111-8111-111111111111',
          access_token: '22222222-2222-4222-8222-222222222222',
          created_at: '2026-09-01T20:00:00.000Z',
          updated_at: '2026-09-01T20:00:00.000Z',
          full_name: source.customer.fullName,
          login: source.customer.login,
          order_number: source.customer.orderNumber,
          configuration: source.configuration,
        },
      },
      error: null,
    })

    await expect(getProject('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222')).resolves.toMatchObject({
      id: '11111111-1111-4111-8111-111111111111',
      accessToken: '22222222-2222-4222-8222-222222222222',
      customer: source.customer,
      configuration: source.configuration,
    })
  })
})
