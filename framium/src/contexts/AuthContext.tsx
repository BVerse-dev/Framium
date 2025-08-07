import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

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

  useEffect(() => {
    // Check for existing session on startup
    const checkAuth = async () => {
      try {
        // Check localStorage for persisted session
        const savedUser = localStorage.getItem('framium-user')
        const sessionToken = localStorage.getItem('framium-session')
        
        if (savedUser && sessionToken) {
          // Validate session token (in production, check with API)
          const user = JSON.parse(savedUser)
          
          // TODO: Validate session with backend API
          // const isValidSession = await api.validateSession(sessionToken)
          const isValidSession = true // Mock validation
          
          if (isValidSession) {
            setUser(user)
          } else {
            // Invalid session, clear localStorage
            localStorage.removeItem('framium-user')
            localStorage.removeItem('framium-session')
          }
        } else {
          // For demo purposes, create a demo user
          const mockUser: User = {
            id: 'demo-user-1',
            email: 'demo@framium.dev',
            name: 'Demo User',
            plan: 'MAX',
            tokensUsed: 45000,
            tokensLimit: 250000,
            avatar: undefined,
            usage: {
              requests: 1247,
              tokens: 45000,
              maxRequests: 10000,
              maxTokens: 250000
            }
          }
          setUser(mockUser)
          
          // Persist demo user
          localStorage.setItem('framium-user', JSON.stringify(mockUser))
          localStorage.setItem('framium-session', 'demo-session-token')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear any corrupted data
        localStorage.removeItem('framium-user')
        localStorage.removeItem('framium-session')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, _password: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with real API call
      // const response = await api.login(email, password)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user: User = {
        id: 'user-' + Date.now(),
        email,
        name: email.split('@')[0],
        plan: 'BASIC',
        tokensUsed: 0,
        tokensLimit: 50000,
        usage: {
          requests: 0,
          tokens: 0,
          maxRequests: 1000,
          maxTokens: 50000
        }
      }
      
      // Persist user session
      localStorage.setItem('framium-user', JSON.stringify(user))
      localStorage.setItem('framium-session', 'session-' + Date.now())
      
      setUser(user)
    } catch (error) {
      throw new Error('Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (email: string, _password: string, name: string) => {
    setIsLoading(true)
    try {
      // TODO: Replace with real API call
      // const response = await api.signup(email, password, name)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const user: User = {
        id: 'user-' + Date.now(),
        email,
        name,
        plan: 'BASIC',
        tokensUsed: 0,
        tokensLimit: 50000,
        usage: {
          requests: 0,
          tokens: 0,
          maxRequests: 1000,
          maxTokens: 50000
        }
      }
      
      // Persist user session
      localStorage.setItem('framium-user', JSON.stringify(user))
      localStorage.setItem('framium-session', 'session-' + Date.now())
      
      setUser(user)
    } catch (error) {
      throw new Error('Signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    // Clear persisted session
    localStorage.removeItem('framium-user')
    localStorage.removeItem('framium-session')
  }

  const updatePlan = async (plan: 'BASIC' | 'MAX' | 'BEAST') => {
    if (!user) return
    
    const tokenLimits = {
      BASIC: 50000,
      MAX: 250000,
      BEAST: 1000000
    }
    
    const updatedUser = {
      ...user,
      plan,
      tokensLimit: tokenLimits[plan]
    }
    
    setUser(updatedUser)
    
    // Persist updated user
    localStorage.setItem('framium-user', JSON.stringify(updatedUser))
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
