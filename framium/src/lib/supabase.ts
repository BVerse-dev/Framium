import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for frontend use (with RLS enabled)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false
  }
})

export type SupabaseClient = typeof supabase

// Helper functions for authentication
export const auth = {
  // Sign up with email and password
  signUp: async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    return { user: data.user, error }
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback)
  }
}

// Database helper functions
export const db = {
  // User operations
  users: {
    create: async (userData: Database['public']['Tables']['users']['Insert']) => {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      return { data, error }
    },

    getById: async (id: string) => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      return { data, error }
    },

    update: async (id: string, updates: Database['public']['Tables']['users']['Update']) => {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      return { data, error }
    }
  },

  // Subscription operations
  subscriptions: {
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single()
      return { data, error }
    },

    create: async (subData: Database['public']['Tables']['subscriptions']['Insert']) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subData)
        .select()
        .single()
      return { data, error }
    }
  },

  // Token usage operations
  tokenUsage: {
    getUserMonthlyUsage: async (userId: string) => {
      const { data, error } = await supabase
        .rpc('get_user_monthly_usage', { user_uuid: userId })
      return { data, error }
    },

    logUsage: async (userId: string, model: string, tokens: number, cost: number, requestType?: string) => {
      const { data, error } = await supabase
        .rpc('log_token_usage', {
          user_uuid: userId,
          model_name: model,
          tokens,
          cost,
          request_type_param: requestType
        })
      return { data, error }
    }
  },

  // AI tasks operations
  aiTasks: {
    getUserTasks: async (userId: string) => {
      const { data, error } = await supabase
        .from('ai_tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    create: async (taskData: Database['public']['Tables']['ai_tasks']['Insert']) => {
      const { data, error } = await supabase
        .from('ai_tasks')
        .insert(taskData)
        .select()
        .single()
      return { data, error }
    },

    update: async (taskId: string, updates: Database['public']['Tables']['ai_tasks']['Update']) => {
      const { data, error } = await supabase
        .from('ai_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single()
      return { data, error }
    }
  },

  // Saved prompts operations
  savedPrompts: {
    getUserPrompts: async (userId: string) => {
      const { data, error } = await supabase
        .from('saved_prompts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    create: async (promptData: Database['public']['Tables']['saved_prompts']['Insert']) => {
      const { data, error } = await supabase
        .from('saved_prompts')
        .insert(promptData)
        .select()
        .single()
      return { data, error }
    },

    update: async (promptId: string, updates: Database['public']['Tables']['saved_prompts']['Update']) => {
      const { data, error } = await supabase
        .from('saved_prompts')
        .update(updates)
        .eq('id', promptId)
        .select()
        .single()
      return { data, error }
    },

    delete: async (promptId: string) => {
      const { error } = await supabase
        .from('saved_prompts')
        .delete()
        .eq('id', promptId)
      return { error }
    }
  },

  // User preferences operations
  userPreferences: {
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()
      return { data, error }
    },

    upsert: async (prefsData: Database['public']['Tables']['user_preferences']['Insert']) => {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert(prefsData)
        .select()
        .single()
      return { data, error }
    }
  },

  // User stats view
  userStats: {
    getByUserId: async (userId: string) => {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('id', userId)
        .single()
      return { data, error }
    }
  },

  // Plan validation function
  canUserMakeRequest: async (userId: string, requestedTokens: number) => {
    const { data, error } = await supabase
      .rpc('can_user_make_request', {
        user_uuid: userId,
        requested_tokens: requestedTokens
      })
    return { data, error }
  }
}
