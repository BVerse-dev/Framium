// lib/models.ts - AI Model Integration Layer
// Handles OpenAI, Anthropic, and Google Gemini APIs

import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export interface ModelResponse {
  text: string
  tokenUsage: number
  model: string
  cost: number
}

export interface ModelRequest {
  model: string
  prompt: string
  context?: any
  mode?: 'ask' | 'agent'
  maxTokens?: number
}

// =============================================
// OPENAI INTEGRATION
// =============================================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function callOpenAI(model: string, prompt: string, context?: any): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt('openai', context?.mode || 'ask')
    
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: getMaxTokensForModel(model),
      temperature: 0.7,
    })

    const usage = completion.usage
    const responseText = completion.choices[0]?.message?.content || ''
    
    return {
      text: responseText,
      tokenUsage: usage?.total_tokens || 0,
      model: model,
      cost: calculateCost(model, usage?.total_tokens || 0)
    }
  } catch (error) {
    console.error('OpenAI API Error:', error)
    throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// =============================================
// ANTHROPIC CLAUDE INTEGRATION
// =============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function callClaude(model: string, prompt: string, context?: any): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt('anthropic', context?.mode || 'ask')
    
    const message = await anthropic.messages.create({
      model: model,
      max_tokens: getMaxTokensForModel(model),
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : ''
    const tokenUsage = message.usage.input_tokens + message.usage.output_tokens
    
    return {
      text: responseText,
      tokenUsage: tokenUsage,
      model: model,
      cost: calculateCost(model, tokenUsage)
    }
  } catch (error) {
    console.error('Claude API Error:', error)
    throw new Error(`Claude API Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// =============================================
// GOOGLE GEMINI INTEGRATION
// =============================================

export async function callGemini(model: string, prompt: string, context?: any): Promise<ModelResponse> {
  try {
    const systemPrompt = getSystemPrompt('google', context?.mode || 'ask')
    const fullPrompt = `${systemPrompt}\n\nUser: ${prompt}`
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: fullPrompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: getMaxTokensForModel(model),
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Estimate token usage (Gemini doesn't always provide exact counts)
    const estimatedTokens = Math.ceil((prompt.length + responseText.length) / 4)
    
    return {
      text: responseText,
      tokenUsage: estimatedTokens,
      model: model,
      cost: calculateCost(model, estimatedTokens)
    }
  } catch (error) {
    console.error('Gemini API Error:', error)
    throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// =============================================
// SYSTEM PROMPTS
// =============================================

function getSystemPrompt(provider: string, mode: 'ask' | 'agent'): string {
  const basePrompt = `You are Framium AI, an intelligent design and development assistant integrated with Framer. You help users create beautiful, functional UI components and automate design workflows.

Key capabilities:
- Generate React/TypeScript components optimized for Framer
- Create responsive layouts and modern UI designs
- Provide step-by-step guidance for complex tasks
- Generate production-ready code with best practices

Design principles:
- Modern, clean aesthetics with attention to detail
- Responsive design that works across devices
- Accessibility-first approach
- Performance optimization
- User experience focus`

  if (mode === 'agent') {
    return `${basePrompt}

AGENT MODE: You are in autonomous agent mode. Break down complex requests into actionable steps and execute them systematically. For each step:
1. Explain what you're doing
2. Show the implementation
3. Verify the result
4. Move to the next step

You can create multiple components, set up workflows, and handle multi-step processes automatically.`
  }

  return `${basePrompt}

ASK MODE: Provide helpful, detailed responses to user questions. When generating code or components, include:
- Clear explanations of the approach
- Complete, working code examples
- Best practices and optimization tips
- Responsive design considerations`
}

// =============================================
// MODEL CONFIGURATION
// =============================================

function getMaxTokensForModel(model: string): number {
  const tokenLimits: { [key: string]: number } = {
    // OpenAI models
    'gpt-4': 4096,
    'gpt-4-turbo': 4096,
    'gpt-4o': 4096,
    'gpt-4.1': 8192,
    'gpt-3.5-turbo': 4096,
    
    // Anthropic models
    'claude-3-opus-20240229': 4096,
    'claude-3-sonnet-20240229': 4096,
    'claude-3-haiku-20240307': 4096,
    'claude-3.5-sonnet': 4096,
    'claude-4-sonnet': 8192,
    'claude-4.1-opus': 8192,
    'claude-3.7-sonnet': 8192,
    
    // Google models
    'gemini-pro': 2048,
    'gemini-1.5-pro': 8192,
    'gemini-2.5-pro': 8192,
  }
  
  return tokenLimits[model] || 4096
}

// =============================================
// COST CALCULATION
// =============================================

function calculateCost(model: string, tokens: number): number {
  // Cost per 1000 tokens (as of 2025)
  const costPer1k: { [key: string]: number } = {
    // OpenAI models
    'gpt-4': 0.03,
    'gpt-4-turbo': 0.01,
    'gpt-4o': 0.025,
    'gpt-4.1': 0.003,
    'gpt-3.5-turbo': 0.001,
    
    // Anthropic models
    'claude-3-opus-20240229': 0.075,
    'claude-3-sonnet-20240229': 0.015,
    'claude-3-haiku-20240307': 0.0025,
    'claude-3.5-sonnet': 0.015,
    'claude-4-sonnet': 0.03,
    'claude-4.1-opus': 0.06,
    'claude-3.7-sonnet': 0.0025,
    
    // Google models
    'gemini-pro': 0.005,
    'gemini-1.5-pro': 0.0025,
    'gemini-2.5-pro': 0.05,
  }
  
  const rate = costPer1k[model] || 0.01
  return (tokens / 1000) * rate
}

// =============================================
// MODEL ACCESS CONTROL
// =============================================

export function isModelAllowed(plan: string, model: string): boolean {
  const rules: { [key: string]: string[] } = {
    BASIC: [
      'gpt-4.1',
      'claude-3.7-sonnet',
      'claude-3-haiku-20240307',
      'gpt-3.5-turbo'
    ],
    MAX: [
      'gpt-4.1',
      'gpt-4o',
      'gpt-4-turbo',
      'claude-3.7-sonnet',
      'claude-3.5-sonnet',
      'claude-4-sonnet',
      'claude-3-sonnet-20240229',
      'gemini-pro',
      'gemini-1.5-pro'
    ],
    BEAST: [
      'gpt-4.1',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-4',
      'claude-3.7-sonnet',
      'claude-3.5-sonnet',
      'claude-4-sonnet',
      'claude-4.1-opus',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-2.5-pro'
    ]
  }
  
  return rules[plan]?.includes(model) || false
}

// =============================================
// ROUTE REQUEST TO APPROPRIATE MODEL
// =============================================

export async function routeModelRequest(request: ModelRequest): Promise<ModelResponse> {
  const { model, prompt, context } = request
  
  try {
    // Determine provider from model name
    if (model.startsWith('gpt') || model.includes('gpt')) {
      return await callOpenAI(model, prompt, context)
    } else if (model.startsWith('claude') || model.includes('claude')) {
      return await callClaude(model, prompt, context)
    } else if (model.startsWith('gemini') || model.includes('gemini')) {
      return await callGemini(model, prompt, context)
    } else {
      throw new Error(`Unsupported model: ${model}`)
    }
  } catch (error) {
    console.error('Model routing error:', error)
    throw error
  }
}

// =============================================
// ENHANCED CONTEXT PROCESSING
// =============================================

export function processContext(context: any): string {
  if (!context) return ''
  
  let contextString = ''
  
  if (context.selectedFrames?.length > 0) {
    contextString += `\nSelected Frames: ${context.selectedFrames.map((f: any) => f.name).join(', ')}`
  }
  
  if (context.currentProject) {
    contextString += `\nProject Context: ${context.currentProject.name}`
  }
  
  if (context.designTokens) {
    contextString += `\nDesign Tokens: ${JSON.stringify(context.designTokens)}`
  }
  
  if (context.componentLibrary?.length > 0) {
    contextString += `\nAvailable Components: ${context.componentLibrary.join(', ')}`
  }
  
  return contextString
}
