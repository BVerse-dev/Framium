import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { ModelTiers, ModelInfo } from '../services/aiService'

export interface AIModel {
  id: string
  name: string
  provider: string
  tier: 'Basic' | 'Max' | 'Beast' | 'Ultimate'
  description: string
  maxTokens?: number
  costPer1kTokens?: number
  capabilities: string[]
}

// Helper functions for model info (copied from aiService since they're not exported)
function getModelDisplayName(modelId: string): string {
  const displayNames: Record<string, string> = {
    'openai/gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'openai/gpt-4o-mini': 'GPT-4o Mini',
    'openai/gpt-4o': 'GPT-4o',
    'openai/gpt-4-turbo': 'GPT-4 Turbo',
    'anthropic/claude-3-haiku': 'Claude 3 Haiku',
    'anthropic/claude-3-5-haiku': 'Claude 3.5 Haiku',
    'anthropic/claude-3-5-sonnet': 'Claude 3.5 Sonnet',
    'anthropic/claude-3-opus': 'Claude 3 Opus',
    'google/gemini-1.5-flash': 'Gemini 1.5 Flash',
    'google/gemini-1.5-pro': 'Gemini 1.5 Pro',
    'xai/grok-beta': 'Grok Beta',
    'meta-llama/llama-3.1-70b': 'Llama 3.1 70B',
    'meta-llama/llama-3.1-405b': 'Llama 3.1 405B',
    'cohere/command-r': 'Command R',
    'cohere/command-r-plus': 'Command R+',
    'mistral/mistral-large': 'Mistral Large',
    'perplexity/llama-3.1-sonar-large': 'Sonar Large',
  };
  
  return displayNames[modelId] || modelId;
}

function getModelDescription(modelId: string): string {
  const descriptions: Record<string, string> = {
    'openai/gpt-3.5-turbo': 'Fast and cost-effective for basic tasks',
    'openai/gpt-4o-mini': 'Balanced performance and cost-efficiency',
    'openai/gpt-4o': 'Most capable OpenAI model for complex reasoning',
    'openai/gpt-4-turbo': 'High-performance model with enhanced speed',
    'anthropic/claude-3-haiku': 'Quick responses for simple coding tasks',
    'anthropic/claude-3-5-haiku': 'Enhanced speed with improved accuracy',
    'anthropic/claude-3-5-sonnet': 'Best balance of intelligence and speed',
    'anthropic/claude-3-opus': 'Most powerful Claude model for complex tasks',
    'google/gemini-1.5-flash': 'Lightning-fast with multimodal capabilities',
    'google/gemini-1.5-pro': 'Advanced reasoning with extended context',
    'xai/grok-beta': 'Real-time knowledge with conversational AI',
    'meta-llama/llama-3.1-70b': 'Open-source powerhouse for development',
    'meta-llama/llama-3.1-405b': 'Largest open model for enterprise tasks',
    'cohere/command-r': 'Specialized for retrieval and summarization',
    'cohere/command-r-plus': 'Advanced RAG and enterprise applications',
    'mistral/mistral-large': 'European AI excellence for coding',
    'perplexity/llama-3.1-sonar-large': 'Search-augmented generation specialist',
  };
  
  return descriptions[modelId] || 'AI model for various tasks';
}

// Convert ModelInfo from aiService to AIModel format
function convertModelInfo(modelInfo: ModelInfo): AIModel {
  const capabilities = getModelCapabilities(modelInfo.id)
  
  return {
    id: modelInfo.id,
    name: modelInfo.name,
    provider: modelInfo.provider,
    tier: modelInfo.tier,
    description: modelInfo.description || 'AI model for various tasks',
    maxTokens: getModelMaxTokens(modelInfo.id),
    costPer1kTokens: modelInfo.pricing?.input || 0.001,
    capabilities
  }
}

function getModelCapabilities(modelId: string): string[] {
  // Enhanced capability mapping based on actual model strengths
  const capabilityMap: Record<string, string[]> = {
    'openai/gpt-3.5-turbo': ['text-generation', 'basic-coding', 'quick-responses'],
    'openai/gpt-4o-mini': ['text-generation', 'coding', 'reasoning', 'ui-design'],
    'openai/gpt-4o': ['advanced-coding', 'complex-reasoning', 'ui-design', 'multimodal', 'function-calling'],
    'openai/gpt-4-turbo': ['advanced-coding', 'reasoning', 'ui-design', 'long-context'],
    'anthropic/claude-3-haiku': ['text-generation', 'basic-coding', 'fast-responses'],
    'anthropic/claude-3-5-haiku': ['coding', 'reasoning', 'ui-design', 'fast-responses'],
    'anthropic/claude-3-5-sonnet': ['expert-coding', 'complex-reasoning', 'ui-design', 'analysis'],
    'anthropic/claude-3-opus': ['expert-coding', 'complex-reasoning', 'creative-writing', 'analysis', 'planning'],
    'google/gemini-1.5-flash': ['multimodal', 'fast-processing', 'coding', 'vision'],
    'google/gemini-1.5-pro': ['multimodal', 'long-context', 'advanced-reasoning', 'vision', 'coding'],
    'xai/grok-beta': ['real-time-data', 'conversational', 'coding', 'reasoning'],
    'meta-llama/llama-3.1-70b': ['open-source', 'coding', 'reasoning', 'customizable'],
    'meta-llama/llama-3.1-405b': ['enterprise-grade', 'expert-coding', 'complex-reasoning', 'customizable'],
    'cohere/command-r': ['retrieval', 'summarization', 'enterprise', 'rag'],
    'cohere/command-r-plus': ['advanced-rag', 'enterprise', 'reasoning', 'search'],
    'mistral/mistral-large': ['european-ai', 'coding', 'reasoning', 'multilingual'],
    'perplexity/llama-3.1-sonar-large': ['search-augmented', 'real-time-data', 'research', 'analysis'],
  };

  return capabilityMap[modelId] || ['text-generation'];
}

function getModelMaxTokens(modelId: string): number {
  // Updated with accurate token limits from AI Gateway
  const tokenLimits: Record<string, number> = {
    'openai/gpt-3.5-turbo': 16385,
    'openai/gpt-4o-mini': 128000,
    'openai/gpt-4o': 128000,
    'openai/gpt-4-turbo': 128000,
    'anthropic/claude-3-haiku': 200000,
    'anthropic/claude-3-5-haiku': 200000,
    'anthropic/claude-3-5-sonnet': 200000,
    'anthropic/claude-3-opus': 200000,
    'google/gemini-1.5-flash': 1000000,
    'google/gemini-1.5-pro': 2000000,
    'xai/grok-beta': 131072,
    'meta-llama/llama-3.1-70b': 131072,
    'meta-llama/llama-3.1-405b': 131072,
    'cohere/command-r': 128000,
    'cohere/command-r-plus': 128000,
    'mistral/mistral-large': 128000,
    'perplexity/llama-3.1-sonar-large': 127072,
  };
  
  return tokenLimits[modelId] || 8192; // default fallback
}

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
  const [availableModels, setAvailableModels] = useState<AIModel[]>([])
  
  // Initialize models - show ALL models from all tiers, not just user's plan
  useEffect(() => {
    // Get all unique models from all tiers for display
    const uniqueModelInfos = new Map<string, ModelInfo>()
    
    // Define tier order for proper tier assignment (lowest tier wins for duplicates)
    const tierOrder = ['Basic', 'Max', 'Beast', 'Ultimate']
    
    // Iterate through tiers in order so lowest tier wins for duplicates
    tierOrder.forEach(tierName => {
      const modelIds = ModelTiers[tierName as keyof typeof ModelTiers]
      console.log(`Processing tier ${tierName} with ${modelIds.length} models:`, modelIds)
      
      modelIds.forEach(modelId => {
        // Only add if not already exists (first tier wins = lowest tier for duplicates)
        if (!uniqueModelInfos.has(modelId)) {
          const [provider] = modelId.split('/');
          
          uniqueModelInfos.set(modelId, {
            id: modelId,
            name: getModelDisplayName(modelId),
            provider: provider.charAt(0).toUpperCase() + provider.slice(1),
            tier: tierName as keyof typeof ModelTiers,
            description: getModelDescription(modelId),
          });
        }
      });
    });
    
    const allModelInfos = Array.from(uniqueModelInfos.values())
    
    console.log(`Total unique models loaded: ${allModelInfos.length}`)
    console.log('Models by tier breakdown:', 
      allModelInfos.reduce((acc, model) => {
        acc[model.tier] = (acc[model.tier] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    );
    
    // Convert to AIModel format
    const aiModels = allModelInfos.map(convertModelInfo)
    setAvailableModels(aiModels)
  }, []) // Remove user?.plan dependency to show all models
  
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)

  // Set default model when available models change - pick first available model for user's plan
  useEffect(() => {
    if (availableModels.length > 0 && !selectedModel) {
      // Find the first model the user can actually use
      const userPlan = user?.plan || 'Basic'
      const availableModel = availableModels.find(model => {
        const tierOrder = { Basic: 0, Max: 1, Beast: 2, Ultimate: 3 }
        const userTierLevel = tierOrder[userPlan as keyof typeof tierOrder] || 0
        const modelTierLevel = tierOrder[model.tier]
        return modelTierLevel <= userTierLevel
      })
      
      // If user can't use any models, just pick the first one (they'll see upgrade prompt)
      setSelectedModel(availableModel || availableModels[0])
    }
  }, [availableModels, selectedModel, user?.plan])

  const canUseModel = (model: AIModel): boolean => {
    if (!user) return model.tier === 'Basic'
    
    const tierOrder = { Basic: 0, Max: 1, Beast: 2, Ultimate: 3 }
    const userTierLevel = tierOrder[user.plan as keyof typeof tierOrder] || 0
    const modelTierLevel = tierOrder[model.tier]
    
    return modelTierLevel <= userTierLevel
  }

  const getTokenCost = (tokens: number, model: AIModel): number => {
    return (tokens / 1000) * (model.costPer1kTokens || 0.001)
  }

  // Return early if models are still loading
  if (!selectedModel || availableModels.length === 0) {
    return (
      <ModelContext.Provider value={{
        selectedModel: {
          id: 'loading',
          name: 'Loading...',
          provider: 'System',
          tier: 'Basic',
          description: 'Loading models...',
          capabilities: []
        },
        availableModels: [],
        mode,
        setSelectedModel: () => {},
        setMode,
        canUseModel: () => false,
        getTokenCost: () => 0
      }}>
        {children}
      </ModelContext.Provider>
    )
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
