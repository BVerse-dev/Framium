// api/chat.ts - Main chat API endpoint
// Handles AI model routing, usage tracking, and plan enforcement

import { NextApiRequest, NextApiResponse } from 'next'
import { getUserById, getUserPlan, canUserMakeRequest, logTokenUsage } from '@/lib/db'
import { routeModelRequest, isModelAllowed } from '@/lib/models'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { userId, model, prompt, mode = 'ask', context } = req.body

    // Validate required fields
    if (!userId || !model || !prompt) {
      return res.status(400).json({ 
        error: 'Missing required fields: userId, model, prompt' 
      })
    }

    // Step 1: Validate user exists
    const user = await getUserById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Step 2: Check user plan and model access
    const userPlan = await getUserPlan(userId)
    if (!isModelAllowed(userPlan, model)) {
      return res.status(403).json({ 
        error: 'Plan upgrade required for this model',
        requiredPlan: getRequiredPlan(model),
        currentPlan: userPlan
      })
    }

    // Step 3: Estimate token usage and check limits
    const estimatedTokens = estimateTokenUsage(prompt, context)
    const canMakeRequest = await canUserMakeRequest(userId, estimatedTokens)
    
    if (!canMakeRequest) {
      return res.status(429).json({ 
        error: 'Token limit exceeded for current plan',
        suggestion: 'Upgrade your plan or wait for next billing cycle'
      })
    }

    // Step 4: Route to appropriate AI model
    const modelResponse = await routeModelRequest({
      model,
      prompt,
      context: { 
        ...context, 
        mode,
        userId,
        userPlan 
      }
    })

    // Step 5: Log token usage for billing
    await logTokenUsage(
      userId,
      model,
      modelResponse.tokenUsage,
      modelResponse.cost,
      mode
    )

    // Step 6: Return response
    return res.status(200).json({
      result: modelResponse.text,
      model: modelResponse.model,
      tokenUsage: modelResponse.tokenUsage,
      cost: modelResponse.cost,
      mode
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('API Error')) {
        return res.status(502).json({ 
          error: 'AI service temporarily unavailable',
          details: error.message
        })
      }
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    })
  }
}

// =============================================
// HELPER FUNCTIONS
// =============================================

function estimateTokenUsage(prompt: string, context?: any): number {
  // Rough estimation: ~4 characters per token
  let totalText = prompt
  
  if (context?.selectedFrames) {
    totalText += JSON.stringify(context.selectedFrames)
  }
  
  if (context?.projectContext) {
    totalText += JSON.stringify(context.projectContext)
  }
  
  // Add response estimation (usually 1.5x the input)
  return Math.ceil((totalText.length / 4) * 1.5)
}

function getRequiredPlan(model: string): string {
  // Map models to minimum required plan
  const beastModels = ['claude-4.1-opus', 'gemini-2.5-pro', 'gpt-4o']
  const maxModels = ['claude-3.5-sonnet', 'gpt-4-turbo', 'claude-4-sonnet']
  
  if (beastModels.some(m => model.includes(m.split('-')[0]))) {
    return 'BEAST'
  }
  
  if (maxModels.some(m => model.includes(m.split('-')[0]))) {
    return 'MAX'
  }
  
  return 'BASIC'
}
