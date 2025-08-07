// lib/api.ts - Frontend API client for Framium backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-framium-backend.vercel.app/api'
  : 'http://localhost:3000/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  details?: any
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor() {
    this.baseUrl = API_BASE_URL
    this.token = localStorage.getItem('framium-auth-token')
  }

  setToken(token: string) {
    this.token = token
    localStorage.setItem('framium-auth-token', token)
  }

  clearToken() {
    this.token = null
    localStorage.removeItem('framium-auth-token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      }

      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`
      }

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.error || 'Request failed', details: data }
      }

      return { data }
    } catch (error) {
      console.error('API request failed:', error)
      return { error: 'Network error occurred' }
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async signup(email: string, password: string, name: string): Promise<ApiResponse<{ token: string; user: any }>> {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async getProfile(): Promise<ApiResponse<any>> {
    return this.request('/user/profile')
  }

  // AI Chat
  async chat(params: {
    model: string
    prompt: string
    mode?: 'ask' | 'agent'
    context?: any
  }): Promise<ApiResponse<{
    result: string
    tokenUsage: number
    cost: number
    model: string
  }>> {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  }

  // User Preferences
  async getPreferences(): Promise<ApiResponse<any>> {
    return this.request('/user/preferences')
  }

  async updatePreferences(preferences: any): Promise<ApiResponse<any>> {
    return this.request('/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    })
  }

  // Usage Tracking
  async getUsage(): Promise<ApiResponse<{
    totalTokens: number
    totalCost: number
    monthlyLimit: number
  }>> {
    return this.request('/user/usage')
  }

  // Tasks
  async createTask(task: {
    title: string
    description: string
    model: string
  }): Promise<ApiResponse<any>> {
    return this.request('/tasks/create', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  }

  async getTasks(): Promise<ApiResponse<any[]>> {
    return this.request('/tasks/list')
  }

  async updateTaskStatus(taskId: string, status: string, progress?: number): Promise<ApiResponse<any>> {
    return this.request(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, progress }),
    })
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health')
  }

  // Stripe
  async createCheckoutSession(planId: string): Promise<ApiResponse<{ url: string }>> {
    return this.request('/stripe/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    })
  }

  async getCustomerPortalUrl(): Promise<ApiResponse<{ url: string }>> {
    return this.request('/stripe/customer-portal', {
      method: 'POST',
    })
  }
}

export const apiClient = new ApiClient()

// Hook for easy API integration in React components
export function useApi() {
  return {
    client: apiClient,
    
    // Helper methods for common operations
    async authenticateUser(email: string, password: string) {
      const response = await apiClient.login(email, password)
      if (response.data?.token) {
        apiClient.setToken(response.data.token)
      }
      return response
    },

    async sendChatMessage(model: string, prompt: string, context?: any) {
      return apiClient.chat({ model, prompt, context })
    },

    async checkHealth() {
      return apiClient.healthCheck()
    },

    logout() {
      apiClient.clearToken()
    },
  }
}

// Environment detection
export const isProduction = process.env.NODE_ENV === 'production'
export const isDevelopment = !isProduction

// Backend feature flags
export const FEATURES = {
  REAL_API: process.env.VITE_USE_REAL_API === 'true',
  STRIPE_ENABLED: process.env.VITE_STRIPE_ENABLED === 'true',
  ANALYTICS: process.env.VITE_ANALYTICS_ENABLED === 'true',
}
