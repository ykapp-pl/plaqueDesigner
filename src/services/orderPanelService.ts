import { z } from 'zod'

import type { SignProject } from '../domain/signProject'
import { signProjectSchema } from '../domain/validation'
import { supabase } from '../lib/supabase'

const orderNumberSchema = z.string().trim().min(1, 'Podaj numer zamówienia.').max(80, 'Numer zamówienia jest za długi.')

const remoteProjectSchema = z.object({
  id: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }),
  updated_at: z.string().datetime({ offset: true }),
  login: z.string().max(80),
  order_number: z.string().max(80),
  configuration: z.unknown(),
})

const searchResponseSchema = z.object({
  projects: z.array(remoteProjectSchema),
  hasMore: z.boolean(),
})

export class PanelAccessError extends Error {
  constructor(message = 'To konto nie ma dostępu do panelu zamówień.') {
    super(message)
    this.name = 'PanelAccessError'
  }
}

function requireClient() {
  if (!supabase) throw new Error('Panel jest chwilowo niedostępny. Spróbuj ponownie później.')
  return supabase
}

async function invoke(body: unknown): Promise<unknown> {
  const client = requireClient()
  const endpoint = import.meta.env.VITE_SUPABASE_URL
  const { data: sessionData } = await client.auth.getSession()
  const accessToken = sessionData.session?.access_token

  if (!endpoint || !accessToken) {
    throw new PanelAccessError('Sesja wygasła. Zaloguj się ponownie do panelu.')
  }

  let response: Response
  try {
    response = await fetch(`${endpoint.replace(/\/$/, '')}/functions/v1/order-panel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Nie udało się połączyć z panelem. Spróbuj ponownie.')
  }

  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    // Keep the generic error below for non-JSON responses from the gateway.
  }

  if (!response.ok) {
    if ([401, 403].includes(response.status)) {
      throw new PanelAccessError('Sesja wygasła lub to konto nie ma dostępu do panelu. Zaloguj się kontem właściciela.')
    }
    throw new Error('Nie udało się połączyć z panelem. Spróbuj ponownie.')
  }

  return data
}

export async function checkPanelAccess(): Promise<boolean> {
  const client = requireClient()
  const { data: sessionData } = await client.auth.getSession()
  if (!sessionData.session) return false

  const data = await invoke({ action: 'checkAccess' })
  return typeof data === 'object' && data !== null && 'allowed' in data && data.allowed === true
}

export async function signInToPanel(email: string, password: string): Promise<void> {
  const client = requireClient()
  const { error } = await client.auth.signInWithPassword({ email: email.trim(), password })

  if (error) throw new Error('Nie udało się zalogować. Sprawdź adres e-mail, hasło i potwierdzenie adresu.')

  try {
    if (!await checkPanelAccess()) throw new PanelAccessError()
  } catch (accessError) {
    await client.auth.signOut({ scope: 'local' })
    throw accessError
  }
}

export async function signOutOfPanel(): Promise<void> {
  const { error } = await requireClient().auth.signOut({ scope: 'local' })
  if (error) throw new Error('Nie udało się zakończyć sesji. Spróbuj ponownie.')
}

export function onPanelSignOut(callback: () => void): () => void {
  if (!supabase) return () => undefined
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') callback()
  })
  return () => subscription.unsubscribe()
}

function normalizeTimestamp(value: string): string {
  return new Date(value).toISOString()
}

function mapRemoteProject(record: z.infer<typeof remoteProjectSchema>): SignProject {
  const parsed = signProjectSchema.safeParse({
    id: record.id,
    createdAt: normalizeTimestamp(record.created_at),
    updatedAt: normalizeTimestamp(record.updated_at),
    customer: {
      login: record.login,
      orderNumber: record.order_number,
    },
    configuration: record.configuration,
  })

  if (!parsed.success) throw new Error('Supabase zwrócił niepoprawną konfigurację projektu.')
  return parsed.data
}

export async function searchOrderProjects(orderNumber: string, offset = 0): Promise<{ projects: SignProject[]; hasMore: boolean }> {
  const number = orderNumberSchema.parse(orderNumber)
  if (!Number.isInteger(offset) || offset < 0 || offset > 100000) throw new Error('Niepoprawna strona wyników.')

  const data = searchResponseSchema.parse(await invoke({ action: 'search', orderNumber: number, offset }))
  return {
    projects: data.projects.map(mapRemoteProject),
    hasMore: data.hasMore,
  }
}
