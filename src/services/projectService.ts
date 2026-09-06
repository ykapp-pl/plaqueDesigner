import type { SignProject } from '../domain/signProject'
import { signProjectSchema } from '../domain/validation'
import { supabase } from '../lib/supabase'
import { OFFER_LINK_MESSAGE, offerCodeSchema, offerSchema, type Offer } from '../domain/offer'

export interface ProjectReference {
  id: string
  accessToken: string
}

interface RemoteProject {
  id: string
  access_token: string
  created_at: string
  updated_at: string
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
      login: record.login,
      orderNumber: record.order_number,
    },
    configuration: record.configuration,
  }
  const parsed = signProjectSchema.safeParse(project)
  if (!parsed.success) throw new Error('Supabase zwrócił niepoprawną konfigurację projektu.')
  return parsed.data
}

export async function resolveOffer(offerCode: string): Promise<Offer> {
  if (!offerCodeSchema.safeParse(offerCode).success) throw new Error(OFFER_LINK_MESSAGE)
  const { data, error } = await requireClient().functions.invoke('projects', {
    body: { action: 'resolveOffer', offerCode },
  })
  if (error) {
    if (error.context instanceof Response && error.context.status === 403) throw new Error(OFFER_LINK_MESSAGE)
    throw new Error('Nie udało się sprawdzić linku. Sprawdź połączenie i spróbuj ponownie.')
  }
  return offerSchema.parse(data?.offer)
}

export async function createProject(project: SignProject, offerCode: string): Promise<ProjectReference> {
  if (!offerCodeSchema.safeParse(offerCode).success) throw new Error(OFFER_LINK_MESSAGE)
  const client = requireClient()
  const { data, error } = await client.functions.invoke('projects', {
    body: { action: 'create', project, offerCode },
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
