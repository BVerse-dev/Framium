// api/health.ts - Health check endpoint

import { NextApiRequest, NextApiResponse } from 'next'
import { sql } from '@vercel/postgres'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      openai: 'unknown',
      anthropic: 'unknown',
      stripe: 'unknown'
    },
    version: '1.0.0'
  }

  try {
    // Check database connection
    await sql`SELECT 1`
    healthCheck.services.database = 'healthy'
  } catch (error) {
    healthCheck.services.database = 'unhealthy'
    healthCheck.status = 'unhealthy'
  }

  // Check API keys presence (not actual connectivity for security)
  healthCheck.services.openai = process.env.OPENAI_API_KEY ? 'configured' : 'missing'
  healthCheck.services.anthropic = process.env.ANTHROPIC_API_KEY ? 'configured' : 'missing'
  healthCheck.services.stripe = process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'

  const statusCode = healthCheck.status === 'healthy' ? 200 : 503
  res.status(statusCode).json(healthCheck)
}
