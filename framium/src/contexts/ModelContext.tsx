import { createContext, useContext, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'mistral'
  tier: 'BASIC' | 'MAX' | 'BEAST'
  description: string
  maxTokens: number
  costPer1kTokens: number
  capabilities: string[]
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4.1',
    name: 'gpt-4.1',
    provider: 'openai',
    tier: 'BASIC',
    description: 'Latest GPT-4 model with improved capabilities',
    maxTokens: 8192,
    costPer1kTokens: 0.003,
    capabilities: ['text-generation', 'code-basic']
  },
  {
    id: 'claude-3.7-sonnet',
    name: 'claude-3.7-sonnet',
    provider: 'anthropic',
    tier: 'BASIC',
    description: 'Enhanced Claude model for better performance',
    maxTokens: 8192,
    costPer1kTokens: 0.0025,
    capabilities: ['text-generation', 'ui-design', 'layout']
  },
  {
    id: 'claude-3.7-sonnet-icon',
    name: '🧠 claude-3.7-sonnet',
    provider: 'anthropic',
    tier: 'BASIC',
    description: 'Enhanced Claude model with brain icon',
    maxTokens: 8192,
    costPer1kTokens: 0.0025,
    capabilities: ['text-generation', 'ui-design', 'layout']
  },
  {
    id: 'gpt-4o',
    name: 'gpt-4o',
    provider: 'openai',
    tier: 'MAX',
    description: 'Optimized GPT-4 for faster responses',
    maxTokens: 8192,
    costPer1kTokens: 0.025,
    capabilities: ['text-generation', 'code-advanced', 'reasoning', 'tool-use']
  },
  {
    id: 'claude-4-sonnet',
    name: 'claude-4-sonnet',
    provider: 'anthropic',
    tier: 'MAX',
    description: 'Latest Claude model with enhanced capabilities',
    maxTokens: 12288,
    costPer1kTokens: 0.03,
    capabilities: ['text-generation', 'code-advanced', 'reasoning', 'tool-use']
  },
  {
    id: 'claude-4.1-opus-max',
    name: '🧠 claude-4.1-opus',
    provider: 'anthropic',
    tier: 'BEAST',
    description: 'MAX Only version with extended context',
    maxTokens: 32768,
    costPer1kTokens: 0.075,
    capabilities: ['text-generation', 'code-expert', 'reasoning', 'multi-step', 'agent-mode', 'extended-context']
  },
  {
    id: 'claude-4.1-opus',
    name: 'claude-4.1-opus',
    provider: 'anthropic',
    tier: 'BEAST',
    description: 'Most advanced Claude model available',
    maxTokens: 16384,
    costPer1kTokens: 0.06,
    capabilities: ['text-generation', 'code-expert', 'reasoning', 'multi-step', 'agent-mode']
  },
  {
    id: 'claude-3.5-sonnet',
    name: 'claude-3.5-sonnet',
    provider: 'anthropic',
    tier: 'MAX',
    description: 'Balanced performance for design and code',
    maxTokens: 8192,
    costPer1kTokens: 0.015,
    capabilities: ['text-generation', 'code-advanced', 'ui-design', 'animations']
  },
  {
    id: 'o3',
    name: '🧠 o3',
    provider: 'openai',
    tier: 'BEAST',
    description: 'OpenAI\'s latest reasoning model',
    maxTokens: 16384,
    costPer1kTokens: 0.08,
    capabilities: ['text-generation', 'reasoning', 'code-expert', 'multi-step']
  },
  {
    id: 'gemini-2.5-pro',
    name: '🧠 gemini-2.5-pro',
    provider: 'google',
    tier: 'BEAST',
    description: 'Advanced multimodal capabilities with latest improvements',
    maxTokens: 16384,
    costPer1kTokens: 0.05,
    capabilities: ['text-generation', 'multimodal', 'code-expert', 'vision']
  }
]

export type AIMode = 'ask' | 'agent'

interface ModelContextType {
  selectedModel: AIModel
  availableModels: AIModel[]
  mode: AIMode
  setSelectedModel: (model: AIModel) => void
  setMode: (mode: AIMode) => void
  canUseModel: (model: AIModel) => boolean
  getTokenCost: (tokens: number, model: AIModel) => number
}

const ModelContext = createContext<ModelContextType | undefined>(undefined)

export function ModelProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [mode, setMode] = useState<AIMode>('ask')
  
  // Get models available for user's plan - temporarily show all models
  const availableModels = AI_MODELS
  
  const [selectedModel, setSelectedModel] = useState<AIModel>(
    availableModels[0] || AI_MODELS[0]
  )

  const canUseModel = (model: AIModel): boolean => {
    if (!user) return model.tier === 'BASIC'
    
    const tierOrder = { BASIC: 0, MAX: 1, BEAST: 2 }
    const userTierLevel = tierOrder[user.plan]
    const modelTierLevel = tierOrder[model.tier]
    
    return modelTierLevel <= userTierLevel
  }

  const getTokenCost = (tokens: number, model: AIModel): number => {
    return (tokens / 1000) * model.costPer1kTokens
  }

  return (
    <ModelContext.Provider value={{
      selectedModel,
      availableModels,
      mode,
      setSelectedModel,
      setMode,
      canUseModel,
      getTokenCost
    }}>
      {children}
    </ModelContext.Provider>
  )
}

export function useModel() {
  const context = useContext(ModelContext)
  if (context === undefined) {
    throw new Error('useModel must be used within a ModelProvider')
  }
  return context
}
