import { createServerClient } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

/**
 * Creates a Supabase client for Server Components, Server Actions, or Route Handlers.
 * Uses cookies for authentication and includes schema 'folio_app'.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database, 'folio_app'>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: 'folio_app' },
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // ignore in Server Components
          }
        },
      },
    }
  )
}

/**
 * Creates a Supabase admin client using the service role key.
 * Used for administrative tasks that bypass RLS, includes schema 'folio_app'.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing Supabase admin configuration')
  }

  return createSupabaseClient<Database, 'folio_app'>(url, serviceRoleKey, {
    db: { schema: 'folio_app' },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
