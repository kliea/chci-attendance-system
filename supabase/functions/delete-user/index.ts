// Delete an auth user (and thus their profile via ON DELETE CASCADE). Caller must be a manager.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const MANAGER_ROLES = ['admin', 'manager', 'supervisor']
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

function jsonResponse(body: object, status: number) {
  return Response.json(body, { status, headers: CORS })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS })
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Missing or invalid Authorization header' }, 401)
  }
  const token = authHeader.slice(7)

  let body: { user_id?: string }
  try {
    body = await req.json()
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400)
  }
  const targetUserId = body?.user_id
  if (!targetUserId || typeof targetUserId !== 'string') {
    return jsonResponse({ error: 'Body must include user_id (UUID)' }, 400)
  }

  const url = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  if (!serviceKey) {
    return jsonResponse({ error: 'Server misconfiguration' }, 500)
  }

  const clientAsCaller = createClient(url, anonKey, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: { user }, error: userError } = await clientAsCaller.auth.getUser(token)
  if (userError || !user?.id) {
    return jsonResponse({ error: 'Invalid or expired token' }, 401)
  }
  const callerId = user.id

  const admin = createClient(url, serviceKey)
  const { data: profile, error: profileError } = await admin
    .from('profiles')
    .select('role')
    .eq('id', callerId)
    .single()
  if (profileError || !profile?.role || !MANAGER_ROLES.includes(profile.role)) {
    return jsonResponse({ error: 'Only managers can delete users' }, 403)
  }
  if (callerId === targetUserId) {
    return jsonResponse({ error: 'You cannot delete your own account' }, 400)
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId)
  if (deleteError) {
    return jsonResponse(
      { error: deleteError.message || 'Failed to delete user' },
      400
    )
  }

  return jsonResponse({ ok: true }, 200)
})
