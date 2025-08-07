// lib/auth.ts - Authentication middleware and utilities

import { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { getUserById } from './db'

export interface AuthenticatedRequest extends NextApiRequest {
  user: {
    id: string
    email: string
    plan: string
  }
}

export async function authenticateUser(req: NextApiRequest): Promise<{ user: any } | { error: string }> {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header' }
    }

    // Extract and verify JWT token
    const token = authHeader.split(' ')[1]
    const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev'
    
    let decoded: any
    try {
      decoded = jwt.verify(token, secret)
    } catch (jwtError) {
      return { error: 'Invalid or expired token' }
    }

    // Get user from database
    const user = await getUserById(decoded.userId)
    if (!user) {
      return { error: 'User not found' }
    }

    return { user }
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: 'Authentication failed' }
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const auth = await authenticateUser(req)
    
    if ('error' in auth) {
      return res.status(401).json({ error: auth.error })
    }

    // Add user to request object
    ;(req as AuthenticatedRequest).user = auth.user

    return handler(req, res)
  }
}

export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret-for-dev'
  return jwt.sign(
    { userId },
    secret,
    { expiresIn: '30d' }
  )
}

// Rate limiting middleware
export function rateLimit(windowMs: number = 60000, max: number = 100) {
  const requests = new Map()

  return (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs

    if (!requests.has(ip)) {
      requests.set(ip, [])
    }

    const userRequests = requests.get(ip)
    const recentRequests = userRequests.filter((time: number) => time > windowStart)
    
    if (recentRequests.length >= max) {
      return res.status(429).json({ 
        error: 'Too many requests',
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }

    recentRequests.push(now)
    requests.set(ip, recentRequests)
    
    return next()
  }
}
