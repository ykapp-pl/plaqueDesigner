import type { SignProject } from '../domain/signProject'
import { signProjectSchema } from '../domain/validation'
import { supabase } from '../lib/supabase'

export interface ProjectReference {
  id: string
  accessToken: string
}

interface RemoteProject {
  id: string
  access_token: string
  created_at: string
  updated_at: string
  full_name: string
  login: string
  order_number: string
  configuration: SignProject['configuration']
}

function requireClient() {
  if (!supabase) throw new Error('Brak konfiguracji Supabase. Ustaw VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY.')
  return supabase
}

function mapRemoteProject(record: RemoteProject): SignProject {
  const project: SignProject = {
    id: record.id,
    accessToken: record.access_token,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    customer: {
      fullName: record.full_name,
      login: record.login,
      orderNumber: record.order_number,
    },
    configuration: record.configuration,
  }
  const parsed = signProjectSchema.safeParse(project)
  if (!parsed.success) throw new Error('Supabase zwrócił niepoprawną konfigurację projektu.')
  return parsed.data
}

export async function createProject(project: SignProject): Promise<ProjectReference> {
  const client = requireClient()
  const { data, error } = await client.functions.invoke('projects', {
    body: { action: 'create', project },
  })
  if (error) throw new Error(`Nie udało się zapisać projektu: ${error.message}`)
  if (!data?.id || !data?.accessToken) throw new Error('Supabase nie zwrócił identyfikatora projektu.')
  return { id: data.id, accessToken: data.accessToken }
}

export async function getProject(id: string, accessToken: string): Promise<SignProject> {
  const client = requireClient()
  const { data, error } = await client.functions.invoke('projects', {
    body: { action: 'get', id, accessToken },
  })
  if (error) throw new Error(`Nie udało się pobrać projektu: ${error.message}`)
  if (!data?.project) throw new Error('Nie znaleziono projektu.')
  return mapRemoteProject(data.project as RemoteProject)
}
