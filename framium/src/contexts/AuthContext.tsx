import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { auth, db } from '../lib/supabase'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  plan: 'BASIC' | 'MAX' | 'BEAST'
  tokensUsed: number
  tokensLimit: number
  avatar?: string
  usage: {
    requests: number
    tokens: number
    maxRequests: number
    maxTokens: number
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  signup: (email: string, password: string, name: string) => Promise<void>
  updatePlan: (plan: 'BASIC' | 'MAX' | 'BEAST') => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data from Supabase user profile
  const loadUserData = async (supabaseUser: SupabaseUser) => {
    try {
      // Get user profile from database
      const { data: userProfile, error: profileError } = await db.users.getById(supabaseUser.id)
      
      if (profileError || !userProfile) {
        console.error('Failed to load user profile:', profileError)
        return null
      }

      // Get user usage stats
      const { data: usageData } = await db.tokenUsage.getUserMonthlyUsage(supabaseUser.id)
      const usage = usageData?.[0] || { total_tokens: 0, total_cost: 0, current_plan: 'BASIC' }

      // Map plan limits
      const planLimits = {
        BASIC: { maxTokens: 50000, maxRequests: 1000 },
        MAX: { maxTokens: 250000, maxRequests: 10000 },
        BEAST: { maxTokens: 1000000, maxRequests: 50000 }
      }

      const plan = (userProfile.plan?.toUpperCase() || 'BASIC') as 'BASIC' | 'MAX' | 'BEAST'
      const limits = planLimits[plan]

      const mappedUser: User = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        plan,
        tokensUsed: usage.total_tokens || 0,
        tokensLimit: limits.maxTokens,
        avatar: userProfile.avatar_url || undefined,
        usage: {
          requests: 0, // Would need to track this separately
          tokens: usage.total_tokens || 0,
          maxRequests: limits.maxRequests,
          maxTokens: limits.maxTokens
        }
      }

      return mappedUser
    } catch (error) {
      console.error('Error loading user data:', error)
      return null
    }
  }

  useEffect(() => {
    // Check for existing session on startup
    const checkAuth = async () => {
      try {
        const { session } = await auth.getSession()
        
        if (session?.user) {
          const userData = await loadUserData(session.user)
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await loadUserData(session.user)
        setUser(userData)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await auth.signIn(email, password)
      
      if (error) {
        throw new Error(error.message)
      }

      if (data.user) {
        const userData = await loadUserData(data.user)
        setUser(userData)
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const { error } = await auth.signUp(email, password, name)
      
      if (error) {
        throw new Error(error.message)
      }

      // User will be created automatically via the database trigger
      // Just set loading to false, the auth state change will handle the rest
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    console.log('Logout function called')
    try {
      // Clear user state immediately
      setUser(null)
      
      // Then handle Supabase logout asynchronously
      auth.signOut().then(({ error }) => {
        if (error) {
          console.error('Supabase logout error:', error)
        } else {
          console.log('Supabase logout successful')
        }
      }).catch(err => {
        console.error('Logout promise failed:', err)
      })
      
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const updatePlan = async (plan: 'BASIC' | 'MAX' | 'BEAST') => {
    if (!user) return
    
    try {
      // Update plan in database
      const { error } = await db.users.update(user.id, { plan: plan.toLowerCase() })
      
      if (error) {
        throw new Error(error.message)
      }

      // Update local user state
      const tokenLimits = {
        BASIC: 50000,
        MAX: 250000,
        BEAST: 1000000
      }
      
      const requestLimits = {
        BASIC: 1000,
        MAX: 10000,
        BEAST: 50000
      }

      const updatedUser = {
        ...user,
        plan,
        tokensLimit: tokenLimits[plan],
        usage: {
          ...user.usage,
          maxTokens: tokenLimits[plan],
          maxRequests: requestLimits[plan]
        }
      }
      
      setUser(updatedUser)
    } catch (error) {
      console.error('Failed to update plan:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      signup,
      updatePlan
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
