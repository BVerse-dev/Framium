import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend use (with RLS enabled)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Admin client for backend use (bypasses RLS)
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper function to get user ID from JWT token
export const getUserId = async (req: Request) => {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) {
    throw new Error('No authorization token provided')
  }

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) {
    throw new Error('Invalid token')
  }

  return user.id
}

export type SupabaseClient = typeof supabase
export type SupabaseAdminClient = typeof supabaseAdmin
