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
  },

  // Custom Rules operations
  customRules: {
    getUserRules: async (userId: string) => {
      const { data, error } = await supabase
        .from('custom_rules')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: true })
      return { data, error }
    },

    create: async (ruleData: Database['public']['Tables']['custom_rules']['Insert']) => {
      const { data, error } = await supabase
        .from('custom_rules')
        .insert(ruleData)
        .select()
        .single()
      return { data, error }
    },

    update: async (ruleId: string, updates: Database['public']['Tables']['custom_rules']['Update']) => {
      const { data, error } = await supabase
        .from('custom_rules')
        .update(updates)
        .eq('id', ruleId)
        .select()
        .single()
      return { data, error }
    },

    delete: async (ruleId: string) => {
      const { error } = await supabase
        .from('custom_rules')
        .delete()
        .eq('id', ruleId)
      return { error }
    },

    toggle: async (ruleId: string, enabled: boolean) => {
      const { data, error } = await supabase
        .from('custom_rules')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', ruleId)
        .select()
        .single()
      return { data, error }
    }
  },

  // Workflow Templates operations
  workflowTemplates: {
    getUserWorkflows: async (userId: string) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    getPublicWorkflows: async () => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('is_public', true)
        .order('usage_count', { ascending: false })
      return { data, error }
    },

    create: async (workflowData: Database['public']['Tables']['workflow_templates']['Insert']) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert(workflowData)
        .select()
        .single()
      return { data, error }
    },

    update: async (workflowId: string, updates: Database['public']['Tables']['workflow_templates']['Update']) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .update(updates)
        .eq('id', workflowId)
        .select()
        .single()
      return { data, error }
    },

    delete: async (workflowId: string) => {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', workflowId)
      return { error }
    },

    toggle: async (workflowId: string, enabled: boolean) => {
      const { data, error } = await supabase
        .from('workflow_templates')
        .update({ enabled, updated_at: new Date().toISOString() })
        .eq('id', workflowId)
        .select()
        .single()
      return { data, error }
    }
  },

  // Fine-tuning Projects operations (Ultimate plan only)
  fineTuningProjects: {
    getUserProjects: async (userId: string) => {
      // Check if user has Ultimate plan first
      const { data: user } = await supabase
        .from('users')
        .select('plan')
        .eq('id', userId)
        .single()
      
      if (!user || user.plan !== 'Ultimate') {
        return { data: null, error: { message: 'Ultimate plan required for fine-tuning access' } }
      }

      const { data, error } = await supabase
        .from('finetuning_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      return { data, error }
    },

    create: async (projectData: Database['public']['Tables']['finetuning_projects']['Insert']) => {
      const { data, error } = await supabase
        .from('finetuning_projects')
        .insert(projectData)
        .select()
        .single()
      return { data, error }
    },

    update: async (projectId: string, updates: Database['public']['Tables']['finetuning_projects']['Update']) => {
      const { data, error } = await supabase
        .from('finetuning_projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()
      return { data, error }
    },

    delete: async (projectId: string) => {
      const { error } = await supabase
        .from('finetuning_projects')
        .delete()
        .eq('id', projectId)
      return { error }
    },

    updateStatus: async (projectId: string, status: string, progress?: number) => {
      const updates: any = { status, updated_at: new Date().toISOString() }
      if (progress !== undefined) {
        updates.progress = progress
      }
      if (status === 'training' && !updates.training_started_at) {
        updates.training_started_at = new Date().toISOString()
      }
      if (status === 'completed' || status === 'failed') {
        updates.completed_at = new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('finetuning_projects')
        .update(updates)
        .eq('id', projectId)
        .select()
        .single()
      return { data, error }
    }
  },

  // Rule Executions logging
  ruleExecutions: {
    log: async (
      userId: string,
      ruleId: string,
      context: any,
      inputPrompt: string,
      outputResult: string,
      tokensUsed: number = 0,
      executionTimeMs: number = 0,
      success: boolean = true,
      errorMessage?: string
    ) => {
      const { data, error } = await supabase
        .from('rule_executions')
        .insert({
          user_id: userId,
          rule_id: ruleId,
          context: context,
          input_prompt: inputPrompt,
          output_result: outputResult,
          tokens_used: tokensUsed,
          execution_time_ms: executionTimeMs,
          success: success,
          error_message: errorMessage
        })
        .select()
        .single()
      return { data, error }
    },

    getUserExecutions: async (userId: string, limit: number = 50) => {
      const { data, error } = await supabase
        .from('rule_executions')
        .select(`
          *,
          custom_rules (name, category)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      return { data, error }
    }
  },

  // Workflow Executions
  workflowExecutions: {
    create: async (executionData: Database['public']['Tables']['workflow_executions']['Insert']) => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .insert(executionData)
        .select()
        .single()
      return { data, error }
    },

    update: async (executionId: string, updates: Database['public']['Tables']['workflow_executions']['Update']) => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .update(updates)
        .eq('id', executionId)
        .select()
        .single()
      return { data, error }
    },

    getUserExecutions: async (userId: string, limit: number = 50) => {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select(`
          *,
          workflow_templates (name, category)
        `)
        .eq('user_id', userId)
        .order('started_at', { ascending: false })
        .limit(limit)
      return { data, error }
    }
  }
}
