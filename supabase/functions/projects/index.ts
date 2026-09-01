import { withSupabase } from 'npm:@supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function isValidProject(project: any): boolean {
  const customer = project?.customer
  const configuration = project?.configuration
  const sizes: Record<string, { width: number; height: number; lines: number[] }> = {
    '25x25': { width: 250, height: 250, lines: [1, 2, 3] },
    '20x25': { width: 250, height: 200, lines: [1, 2, 3] },
    '15x25': { width: 250, height: 150, lines: [1, 2] },
    '10x25': { width: 250, height: 100, lines: [1, 2] },
    '15x15': { width: 150, height: 150, lines: [1, 2] },
    '10x15': { width: 150, height: 100, lines: [1, 2] },
  }
  const size = sizes[configuration?.sizeId]
  if (!customer || !configuration || !size) return false
  if (typeof customer.fullName !== 'string' || customer.fullName.trim().length === 0 || customer.fullName.length > 120) return false
  if (typeof customer.login !== 'string' || customer.login.trim().length === 0 || customer.login.length > 80) return false
  if (typeof customer.orderNumber !== 'string' || customer.orderNumber.trim().length === 0 || customer.orderNumber.length > 80) return false
  if (configuration.schemaVersion !== 1 || configuration.widthMm !== size.width || configuration.heightMm !== size.height) return false
  if (!size.lines.includes(configuration.lineCount) || !Array.isArray(configuration.lines) || configuration.lines.length !== configuration.lineCount) return false
  if (typeof configuration.backgroundEnabled !== 'boolean' || typeof configuration.mountingHolesEnabled !== 'boolean') return false
  return configuration.lines.every((line: any) =>
    typeof line?.id === 'string' && line.id.length > 0 && line.id.length <= 80 &&
    typeof line.text === 'string' && line.text.length <= 200 &&
    typeof line.fontFamily === 'string' && line.fontFamily.length > 0 && line.fontFamily.length <= 120 &&
    typeof line.fontSizeMm === 'number' && line.fontSizeMm >= 4 && line.fontSizeMm <= 80 &&
    ['left', 'center', 'right'].includes(line.horizontalAlign) &&
    ['top', 'center', 'bottom'].includes(line.verticalAlign),
  )
}

export default {
  fetch: withSupabase({ auth: 'publishable' }, async (request, context) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405)

  try {
    const body = await request.json()
    if (body.action === 'create') {
      const project = body.project
      if (!isValidProject(project)) return response({ error: 'Invalid project' }, 400)

      const { data, error } = await context.supabaseAdmin
        .from('projects')
        .insert({
          full_name: project.customer.fullName,
          login: project.customer.login,
          order_number: project.customer.orderNumber,
          size_id: project.configuration.sizeId,
          configuration: project.configuration,
        })
        .select('id, access_token')
        .single()

      if (error) return response({ error: 'Could not save project' }, 400)
      return response({ id: data.id, accessToken: data.access_token })
    }

    if (body.action === 'get') {
      if (!isUuid(body.id) || !isUuid(body.accessToken)) return response({ error: 'Invalid project reference' }, 400)
      const { data, error } = await context.supabaseAdmin
        .from('projects')
        .select('id, access_token, created_at, updated_at, full_name, login, order_number, configuration')
        .eq('id', body.id)
        .eq('access_token', body.accessToken)
        .maybeSingle()

      if (error || !data) return response({ error: 'Project not found' }, 404)
      return response({ project: data })
    }

    return response({ error: 'Unknown action' }, 400)
  } catch {
    return response({ error: 'Invalid request' }, 400)
  }
  }),
}
