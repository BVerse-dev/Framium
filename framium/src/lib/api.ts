import { auth, db } from './supabase'

interface AIRequestData {
  prompt: string
  model: string
  selection?: any[]
  mode?: string
}

interface AIResponse {
  content: string
  tokens: number
  cost: number
  canApplyToCanvas: boolean
  code?: string
}

export class APIService {
  private static getAuthToken = async () => {
    const { session } = await auth.getSession()
    return session?.access_token
  }

  private static async makeRequest(endpoint: string, data: any) {
    const token = await this.getAuthToken()
    if (!token) {
      throw new Error('User not authenticated')
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'https://framium.vercel.app'
    
    const response = await fetch(`${apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  static async sendChatMessage(data: AIRequestData): Promise<AIResponse> {
    try {
      // Check if user can make request before sending
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Estimate tokens (rough approximation)
      const estimatedTokens = Math.ceil(data.prompt.length / 4)
      
      // Check if user can make this request
      const { data: canMakeRequest, error } = await db.canUserMakeRequest(user.id, estimatedTokens)
      
      if (error || !canMakeRequest) {
        throw new Error('Token limit exceeded for your current plan')
      }

      const response = await this.makeRequest('/api/chat', {
        message: data.prompt,
        model: data.model,
        selection: data.selection,
        mode: data.mode
      })

      // Log token usage
      if (response.tokens) {
        await db.tokenUsage.logUsage(
          user.id,
          data.model,
          response.tokens,
          response.cost || 0,
          'chat'
        )
      }

      return response
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  static async createAITask(title: string, description: string, model: string) {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await db.aiTasks.create({
        user_id: user.id,
        title,
        description,
        model,
        status: 'pending',
        progress: 0
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to create AI task:', error)
      throw error
    }
  }

  static async updateAITask(taskId: string, updates: any) {
    try {
      const { data, error } = await db.aiTasks.update(taskId, updates)
      
      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to update AI task:', error)
      throw error
    }
  }

  static async getUserTasks() {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await db.aiTasks.getUserTasks(user.id)
      
      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Failed to get user tasks:', error)
      throw error
    }
  }

  static async savePrompt(title: string, content: string, category?: string) {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await db.savedPrompts.create({
        user_id: user.id,
        title,
        content,
        category,
        is_public: false,
        usage_count: 0
      })

      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to save prompt:', error)
      throw error
    }
  }

  static async getUserPrompts() {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await db.savedPrompts.getUserPrompts(user.id)
      
      if (error) {
        throw new Error(error.message)
      }

      return data || []
    } catch (error) {
      console.error('Failed to get user prompts:', error)
      throw error
    }
  }

  static async getUserStats() {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await db.userStats.getByUserId(user.id)
      
      if (error) {
        throw new Error(error.message)
      }

      return data
    } catch (error) {
      console.error('Failed to get user stats:', error)
      throw error
    }
  }

  static async getUserMonthlyUsage() {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await db.tokenUsage.getUserMonthlyUsage(user.id)
      
      if (error) {
        throw new Error(error.message)
      }

      return data?.[0] || { total_tokens: 0, total_cost: 0, current_plan: 'BASIC' }
    } catch (error) {
      console.error('Failed to get user usage:', error)
      throw error
    }
  }
}

// Hook for easy API integration in React components
export function useAPI() {
  return {
    sendChatMessage: APIService.sendChatMessage,
    createAITask: APIService.createAITask,
    updateAITask: APIService.updateAITask,
    getUserTasks: APIService.getUserTasks,
    savePrompt: APIService.savePrompt,
    getUserPrompts: APIService.getUserPrompts,
    getUserStats: APIService.getUserStats,
    getUserMonthlyUsage: APIService.getUserMonthlyUsage
  }
}

// Environment detection
export const isProduction = import.meta.env.PROD
export const isDevelopment = !isProduction

// Backend feature flags
export const FEATURES = {
  REAL_API: import.meta.env.VITE_USE_REAL_API === 'true',
  STRIPE_ENABLED: import.meta.env.VITE_STRIPE_ENABLED === 'true',
  ANALYTICS: import.meta.env.VITE_ANALYTICS_ENABLED === 'true',
}
