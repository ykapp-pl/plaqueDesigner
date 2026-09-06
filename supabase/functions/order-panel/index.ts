import { withSupabase } from 'npm:@supabase/server'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}

function bearerToken(request: Request): string {
  return request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') ?? ''
}

function isValidSearchOffset(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 100000
}

function isUuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export default {
  fetch: withSupabase({ auth: 'user' }, async (request, context) => {
    if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    if (request.method !== 'POST') return response({ error: 'Method not allowed' }, 405)

    const token = bearerToken(request)
    const { data: authData, error: authError } = await context.supabaseAdmin.auth.getUser(token)
    const email = authData.user?.email?.trim().toLowerCase()

    if (authError || !email || !authData.user?.email_confirmed_at) {
      return response({ error: 'Unauthorized' }, 401)
    }

    const { data: access, error: accessError } = await context.supabaseAdmin
      .from('order_panel_access')
      .select('email')
      .eq('email', email)
      .eq('active', true)
      .maybeSingle()

    if (accessError) return response({ error: 'Access check failed' }, 503)
    if (!access) return response({ error: 'Forbidden' }, 403)

    try {
      const body = await request.json()

      if (body.action === 'checkAccess') return response({ allowed: true })
      if (body.action === 'delete') {
        if (!isUuid(body.projectId)) return response({ error: 'Invalid project' }, 400)

        const { data, error } = await context.supabaseAdmin
          .from('projects')
          .delete()
          .eq('id', body.projectId)
          .select('id')
          .maybeSingle()

        if (error) return response({ error: 'Delete failed' }, 503)
        if (!data) return response({ error: 'Project not found' }, 404)
        return response({ deleted: true })
      }
      if (body.action !== 'search') return response({ error: 'Unknown action' }, 400)

      const orderNumber = typeof body.orderNumber === 'string' ? body.orderNumber.trim() : ''
      const offset = body.offset ?? 0

      if (!orderNumber || orderNumber.length > 80 || !isValidSearchOffset(offset)) {
        return response({ error: 'Invalid search' }, 400)
      }

      const { data, error } = await context.supabaseAdmin.rpc('order_panel_search', {
        p_order_number: orderNumber,
        p_offset: offset,
      })

      if (error) return response({ error: 'Search failed' }, 503)

      const projects = data ?? []
      return response({ projects: projects.slice(0, 20), hasMore: projects.length > 20 })
    } catch {
      return response({ error: 'Invalid request' }, 400)
    }
  }),
}
