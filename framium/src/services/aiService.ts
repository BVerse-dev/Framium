import { generateText, streamText, CoreMessage } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { z } from 'zod';

// AI Gateway Configuration
const gateway = createGateway({
  apiKey: import.meta.env.VITE_AI_GATEWAY_API_KEY || process.env.VITE_AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1/ai',
});

// Model definitions based on user's plan - Following industry standards like Cursor/GitHub Copilot
export const ModelTiers = {
  Basic: [
    'openai/gpt-3.5-turbo',
    'anthropic/claude-3-haiku',
    'google/gemini-1.5-flash',
  ],
  Max: [
    'openai/gpt-4o-mini',
    'anthropic/claude-3-5-haiku',
    'google/gemini-1.5-flash',
    'openai/gpt-4-turbo',
    'cohere/command-r',
  ],
  Beast: [
    'openai/gpt-4o',
    'anthropic/claude-3-5-sonnet',
    'google/gemini-1.5-pro',
    'xai/grok-beta',
    'cohere/command-r-plus',
    'meta-llama/llama-3.1-70b',
  ],
  Ultimate: [
    'openai/gpt-4o',
    'anthropic/claude-3-5-sonnet',
    'anthropic/claude-3-opus',
    'google/gemini-1.5-pro',
    'xai/grok-beta',
    'meta-llama/llama-3.1-405b',
    'cohere/command-r-plus',
    'mistral/mistral-large',
    'perplexity/llama-3.1-sonar-large',
  ]
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  tier: keyof typeof ModelTiers;
  description?: string;
  pricing?: {
    input: number;
    output: number;
  };
}

// Get available models based on user's plan
export function getAvailableModels(userPlan: keyof typeof ModelTiers): ModelInfo[] {
  const availableModelIds = ModelTiers[userPlan];
  
  return availableModelIds.map(modelId => {
    const [provider] = modelId.split('/');
    
    return {
      id: modelId,
      name: getModelDisplayName(modelId),
      provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      tier: userPlan,
      description: getModelDescription(modelId),
    };
  });
}

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

// Generate text response
export async function generateAIResponse(
  messages: CoreMessage[],
  modelId: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
) {
  try {
    const { temperature = 0.7, systemPrompt } = options;
    
    const messagesWithSystem: CoreMessage[] = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const result = await generateText({
      model: gateway(modelId),
      messages: messagesWithSystem,
      temperature,
    });

    return {
      success: true,
      text: result.text,
      usage: result.usage,
      finishReason: result.finishReason,
    };
  } catch (error) {
    console.error('AI Generation Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Stream text response for real-time chat
export async function streamAIResponse(
  messages: CoreMessage[],
  modelId: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
  } = {}
) {
  try {
    const { temperature = 0.7, systemPrompt } = options;
    
    const messagesWithSystem: CoreMessage[] = systemPrompt 
      ? [{ role: 'system', content: systemPrompt }, ...messages]
      : messages;

    const result = await streamText({
      model: gateway(modelId),
      messages: messagesWithSystem,
      temperature,
    });

    return {
      success: true,
      textStream: result.textStream,
      usage: result.usage,
    };
  } catch (error) {
    console.error('AI Streaming Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Generate structured data
export async function generateStructuredData<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  modelId: string,
  options: {
    temperature?: number;
    systemPrompt?: string;
  } = {}
) {
  try {
    // For now, return a simple text response since generateObject might not be compatible
    const textResult = await generateText({
      model: gateway(modelId),
      prompt: `${prompt}\n\nPlease respond with valid JSON that matches the required schema.`,
      temperature: options.temperature || 0.7,
    });

    try {
      const parsedObject = JSON.parse(textResult.text);
      const validatedObject = schema.parse(parsedObject);
      
      return {
        success: true,
        object: validatedObject,
        usage: textResult.usage,
      };
    } catch (parseError) {
      return {
        success: false,
        error: 'Failed to parse JSON response or validate schema',
      };
    }
  } catch (error) {
    console.error('Structured Generation Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Test AI connection
export async function testAIConnection(modelId?: string): Promise<boolean> {
  try {
    const testModel = modelId || 'openai/gpt-3.5-turbo';
    
    const result = await generateText({
      model: gateway(testModel),
      prompt: 'Hello! Please respond with just "OK" to confirm the connection.',
    });

    return result.text.trim().toLowerCase().includes('ok');
  } catch (error) {
    console.error('AI Connection Test Failed:', error);
    return false;
  }
}

// Get all available models from the gateway
export async function fetchAvailableModels() {
  try {
    const models = await gateway.getAvailableModels();
    return {
      success: true,
      models: models.models,
    };
  } catch (error) {
    console.error('Failed to fetch available models:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
