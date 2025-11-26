import { createClient } from '@supabase/supabase-js'

// Singleton admin client for server-side jobs (webhooks, CRON, etc.)
// Uses service role key (never expose to client).
let adminClient: ReturnType<typeof createClient> | null = null

export function getAdminSupabase() {
  if (adminClient) return adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error('Supabase admin client missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  adminClient = createClient(url, serviceRole, {
    auth: { persistSession: false },
  })

  return adminClient
}

export type AdminSupabaseClient = ReturnType<typeof getAdminSupabase>
