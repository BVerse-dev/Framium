import { useState, useRef, useEffect } from 'react'
import { Send, Check, Edit3, RotateCcw, Save, Sparkles, Image, Target, Box, Layers, ChevronDown, Lock, CheckCircle } from 'lucide-react'
import { framer, CanvasNode } from 'framer-plugin'
import { useAuth } from '../contexts/AuthContext'
import { useModel } from '../contexts/ModelContext'
import { generateAIResponse } from '../services/aiService'
import { FramerService } from '../services/framerService'
import type { CoreMessage } from 'ai'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  tokens?: number
  cost?: number
  canApplyToCanvas?: boolean
  code?: string
}

interface FrameItem {
  id: string
  name: string
  type: string
}

interface ChatInterfaceProps {
  selection: CanvasNode[]
}

export function ChatInterface({ selection }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { selectedModel, availableModels, mode, setMode, setSelectedModel, canUseModel } = useModel()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'ai',
      content: `🚀 **Framium Pro** is ready to build anything!

I'm an AI design agent that creates professional layouts, components, and applications directly on your Framer canvas. Like Cursor and GitHub Copilot, I understand your vision and build it instantly.

⚡ **I automatically build:**
• Complete landing pages and marketing sites
• E-commerce stores with product grids and checkout flows
• Admin dashboards and analytics interfaces
• Blog layouts and content management systems
• Mobile app interfaces and components
• Custom design systems and component libraries

🎨 **Professional features:**
• Auto-detects and creates responsive breakpoints (Desktop/Tablet/Phone)
• Uses root vertical stack architecture (no overlapping elements)
• Implements 8px spacing system and modern design tokens
• Generates semantic component names with [Framium] prefix
• Works whether you have a canvas selected or not

💫 **Just describe what you want to build - I'll create it instantly on your canvas.**

🔧 **Mode: Agent** - I automatically build on canvas
💡 Switch to **Ask** mode if you only want design advice

Ready to create something amazing?`,
      timestamp: new Date(),
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showFramesDropdown, setShowFramesDropdown] = useState(false)
  const [availableFrames, setAvailableFrames] = useState<FrameItem[]>([])
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedLockedModel, setSelectedLockedModel] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const framesDropdownRef = useRef<HTMLDivElement>(null)
  const modelDropdownRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Fetch available frames from canvas
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const allNodes: FrameItem[] = []
        
        // Get current selection and add it to available frames
        if (selection && selection.length > 0) {
          selection.forEach((node, index) => {
            allNodes.push({
              id: node.id || `selected-${index}`,
              name: (node as any).name || `Selected Item ${index + 1}`,
              type: 'Selected'
            })
          })
        }

        // TODO: Replace with real Framer API calls when available
        // const canvasNodes = await framer.getCanvasNodes()
        // Process real canvas nodes here...
        
        // Enhanced mock frames with more realistic data
        const mockFrames = [
          { id: 'frame-hero', name: 'Hero Section', type: 'Frame' },
          { id: 'frame-nav', name: 'Navigation Bar', type: 'Frame' },
          { id: 'frame-pricing', name: 'Pricing Cards', type: 'Frame' },
          { id: 'frame-testimonials', name: 'Testimonials', type: 'Frame' },
          { id: 'frame-contact', name: 'Contact Form', type: 'Frame' },
          { id: 'frame-footer', name: 'Footer', type: 'Frame' },
          { id: 'comp-button', name: 'CTA Button', type: 'Component' },
          { id: 'comp-card', name: 'Feature Card', type: 'Component' },
          { id: 'comp-modal', name: 'Modal Dialog', type: 'Component' }
        ]

        allNodes.push(...mockFrames)
        setAvailableFrames(allNodes)
      } catch (error) {
        console.error('Error fetching frames:', error)
        // Fallback with enhanced mock frames
        setAvailableFrames([
          { id: 'frame-hero', name: 'Hero Section', type: 'Frame' },
          { id: 'frame-nav', name: 'Navigation Bar', type: 'Frame' },
          { id: 'frame-pricing', name: 'Pricing Cards', type: 'Frame' },
          { id: 'comp-button', name: 'CTA Button', type: 'Component' }
        ])
      }
    }
    fetchFrames()
  }, [selection])

  // Close frames dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (framesDropdownRef.current && !framesDropdownRef.current.contains(event.target as Node)) {
        setShowFramesDropdown(false)
      }
    }

    if (showFramesDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFramesDropdown])

  const handleFrameSelect = (frame: FrameItem) => {
    const frameContext = `[Context: ${frame.name} (${frame.type})] `
    setInputValue(prev => frameContext + prev)
    setShowFramesDropdown(false)
    textareaRef.current?.focus()
  }

  // Group models by tier for the dropdown
  const getModelsByTier = () => {
    const tiers = ['Basic', 'Max', 'Beast', 'Ultimate'] as const
    return tiers.map(tier => ({
      tier,
      models: availableModels.filter(model => model.tier === tier)
    })).filter(group => group.models.length > 0)
  }

  // Handle model selection with upgrade check
  const handleModelSelect = (model: any) => {
    if (canUseModel(model)) {
      setSelectedModel(model)
      setShowModelDropdown(false)
    } else {
      setSelectedLockedModel(model)
      setShowUpgradeModal(true)
      setShowModelDropdown(false)
    }
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    if (showModelDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showModelDropdown])

  const handleImageUpload = () => {
    // Create hidden file input for image upload
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Create a File URL for the image (local state solution)
        const imageUrl = URL.createObjectURL(file)
        const imageContext = `[Image: ${file.name}] `
        setInputValue(prev => imageContext + prev)
        framer.notify(`📷 Image "${file.name}" attached to message`)
        
        // TODO: In production, upload to cloud storage and get URL
        console.log('Image selected:', file.name, imageUrl)
      }
    }
    input.click()
  }

  const handleQuickAction = (actionType: 'wireframe' | 'website' | 'store') => {
    const actionPrompts = {
      wireframe: 'Create a wireframe layout with placeholder content for a modern web application',
      website: 'Design a complete website with header, hero section, features, and footer',
      store: 'Build an e-commerce store layout with product grid, cart, and checkout flow'
    }
    
    setInputValue(actionPrompts[actionType])
    // Auto-send the quick action
    setTimeout(() => {
      handleSendMessage()
    }, 100)
  }

  const getFramesWithHeaders = () => {
    const result: (FrameItem & { isHeader?: boolean })[] = []
    
    // Selected items section
    const selectedFrames = availableFrames.filter(frame => frame.type === 'Selected')
    if (selectedFrames.length > 0) {
      result.push({ id: 'header-selected', name: 'Selected Items', type: 'header', isHeader: true })
      result.push(...selectedFrames)
    }
    
    // Frames section
    const frames = availableFrames.filter(frame => frame.type === 'Frame')
    if (frames.length > 0) {
      result.push({ id: 'header-frames', name: 'Canvas Frames', type: 'header', isHeader: true })
      result.push(...frames)
    }
    
    // Components section
    const components = availableFrames.filter(frame => frame.type === 'Component')
    if (components.length > 0) {
      result.push({ id: 'header-components', name: 'Components', type: 'header', isHeader: true })
      result.push(...components)
    }
    
    return result
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Convert chat message to CoreMessage format
      const coreMessages: CoreMessage[] = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }))
      
      // Add the new user message
      coreMessages.push({
        role: 'user',
        content: inputValue
      })

      // Call the real AI service
      const aiResponse = await generateAIResponse(
        coreMessages,
        selectedModel.id,
        {
          temperature: 0.7,
          maxTokens: 1000,
          systemPrompt: `You are Framium, an AI design and coding agent built for Framer. You're not just an assistant - you're a powerful creative partner that can build anything, just like Cursor and GitHub Copilot.

Your capabilities include:
- Instantly creating professional layouts, components, and designs on the Framer canvas
- Building complete applications (landing pages, e-commerce stores, dashboards, blogs)
- Generating sophisticated UI components with modern design systems
- Understanding context and creating intelligent, beautiful designs
- Managing canvas height and layout automatically as you build

When users make requests, you:
1. Act immediately - no asking for permission or explaining limitations
2. Create professional, pixel-perfect designs with proper typography, spacing, and color
3. Use modern design principles (gradients, shadows, proper hierarchy)
4. Build complete solutions, not just basic wireframes
5. Adapt design systems based on the project context (minimal, modern, vibrant)
6. Think like a senior designer and developer combined

Current context:
- User Plan: ${user?.plan || 'Pro'}
- Selected Model: ${selectedModel.name}
- Mode: ${mode}
- Canvas Selection: ${selection.length > 0 ? `${selection.length} items selected` : 'Clean canvas ready'}

You never say "I'm an AI assistant" or mention limitations. You're a design agent that builds beautiful things instantly.`
        }
      )
      
      if (aiResponse.success && aiResponse.text) {
        // Mode-specific logic for canvas generation
        let shouldCreateComponents = false
        
        if (mode === 'agent') {
          // In Agent mode, automatically create components for ANY design-related request
          const designKeywords = [
            'create', 'generate', 'build', 'design', 'make', 'add',
            'landing page', 'homepage', 'website', 'site', 'page',
            'store', 'e-commerce', 'ecommerce', 'shop', 'product', 'cart', 'checkout',
            'wireframe', 'layout', 'application', 'app', 'dashboard', 'admin',
            'hero', 'banner', 'header', 'footer', 'navigation', 'nav', 'menu',
            'pricing', 'plan', 'tier', 'subscription', 'payment',
            'contact', 'form', 'input', 'button', 'cta', 'call to action',
            'blog', 'article', 'content', 'post', 'news',
            'gallery', 'portfolio', 'showcase', 'grid',
            'testimonial', 'review', 'feedback', 'quote',
            'feature', 'service', 'benefit', 'advantage',
            'about', 'team', 'company', 'organization',
            'login', 'signup', 'register', 'authentication', 'auth',
            'profile', 'account', 'user', 'settings',
            'search', 'filter', 'sort', 'pagination',
            'notification', 'alert', 'message', 'toast',
            'modal', 'popup', 'dialog', 'overlay',
            'sidebar', 'panel', 'section', 'component', 'widget',
            'card', 'list', 'table', 'chart', 'graph',
            'animation', 'transition', 'effect', 'motion',
            'responsive', 'mobile', 'tablet', 'desktop',
            'modern', 'clean', 'minimal', 'professional', 'beautiful',
            'colorful', 'vibrant', 'elegant', 'sophisticated'
          ]
          
          const inputLower = inputValue.toLowerCase()
          shouldCreateComponents = designKeywords.some(keyword => inputLower.includes(keyword)) ||
                                 inputLower.includes('surprise') ||
                                 inputLower.includes('proceed') ||
                                 inputLower.includes('help me') ||
                                 inputLower.includes('i want') ||
                                 inputLower.includes('i need') ||
                                 inputLower.includes('can you') ||
                                 inputLower.includes('would you')
        }
        // In Ask mode, never create components automatically - only provide text responses
        
        console.log('Mode:', mode)
        console.log('Input value:', inputValue)
        console.log('Should create components:', shouldCreateComponents)
        
        if (shouldCreateComponents) {
          // Execute the canvas creation in the background (Agent mode only)
          console.log('Executing canvas creation in Agent mode...')
          setTimeout(async () => {
            try {
              const result = await FramerService.executeAIRequest(inputValue)
              console.log('Canvas creation result:', result)
            } catch (error) {
              console.error('Canvas creation error:', error)
            }
          }, 500)
        }
        
        // Add mode-specific context info
        let contextInfo = ''
        if (mode === 'ask') {
          contextInfo = selection.length > 0 ? 
            `\n\n📋 **Current Selection:** ${selection.length} item(s) selected on canvas\n💡 **Tip:** Switch to Agent mode to automatically create components on canvas` : 
            '\n\n📋 **Canvas:** No items currently selected\n💡 **Tip:** Switch to Agent mode to automatically create components on canvas'
        } else {
          contextInfo = selection.length > 0 ? 
            `\n\n📋 **Current Selection:** ${selection.length} item(s) selected on canvas` : 
            '\n\n📋 **Canvas:** Ready for component creation'
        }

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: aiResponse.text + contextInfo,
          timestamp: new Date(),
          tokens: aiResponse.usage?.totalTokens || 0,
          cost: aiResponse.usage?.totalTokens ? (aiResponse.usage.totalTokens / 1000) * (selectedModel.costPer1kTokens || 0.001) : 0,
          canApplyToCanvas: shouldCreateComponents || aiResponse.text.toLowerCase().includes('component') || aiResponse.text.toLowerCase().includes('create'),
          code: aiResponse.text.includes('```') ? 'ai-generated-code' : undefined,
        }

        setMessages(prev => [...prev, aiMessage])
      } else {
        throw new Error(aiResponse.error || 'AI service failed')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      
      // Fallback to simulation if API fails
      try {
        const fallbackResponse = await simulateAIResponse(inputValue, selection, selectedModel.name)
        
        const contextInfo = selection.length > 0 ? 
          `\n\n📋 **Current Selection:** ${selection.length} item(s) selected on canvas` : 
          '\n\n📋 **Canvas:** No items currently selected'

        const aiMessage: Message = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: `⚠️ **Using Demo Mode** (API unavailable)\n\n${fallbackResponse.content}${contextInfo}`,
          timestamp: new Date(),
          tokens: fallbackResponse.tokens,
          cost: fallbackResponse.cost,
          canApplyToCanvas: fallbackResponse.canApplyToCanvas,
          code: fallbackResponse.code,
        }

        setMessages(prev => [...prev, aiMessage])
      } catch (fallbackError) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'ai',
          content: '❌ Sorry, there was an error processing your request. Please try again.',
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyToCanvas = async (message: Message) => {
    try {
      // Use the new FramerService to execute the AI request
      const success = await FramerService.executeAIRequest(message.content)
      
      if (!success) {
        // Fallback to the original implementation if FramerService doesn't handle it
        const componentType = message.content.toLowerCase().includes('pricing') ? 'pricing' :
                             message.content.toLowerCase().includes('hero') ? 'hero' :
                             message.content.toLowerCase().includes('button') ? 'button' : 'component'
        
        const componentSVGs = {
          pricing: `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
            <rect width="300" height="400" fill="#f8fafc" stroke="#e2e8f0" rx="12"/>
            <rect x="20" y="20" width="260" height="60" fill="#3b82f6" rx="8"/>
            <text x="150" y="55" text-anchor="middle" fill="white" font-size="18" font-weight="600">Basic Plan</text>
            <text x="150" y="100" text-anchor="middle" fill="#1f2937" font-size="32" font-weight="700">$9/mo</text>
            <rect x="20" y="130" width="260" height="200" fill="#ffffff" stroke="#e5e7eb" rx="6"/>
            <text x="30" y="155" fill="#374151" font-size="14">✓ Feature 1</text>
            <text x="30" y="180" fill="#374151" font-size="14">✓ Feature 2</text>
            <text x="30" y="205" fill="#374151" font-size="14">✓ Feature 3</text>
            <rect x="40" y="350" width="220" height="35" fill="#3b82f6" rx="6"/>
            <text x="150" y="372" text-anchor="middle" fill="white" font-size="14" font-weight="600">Get Started</text>
          </svg>`,
          hero: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
            <defs>
              <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill="url(#heroGrad)" rx="12"/>
            <text x="200" y="120" text-anchor="middle" fill="white" font-size="28" font-weight="700">Build Amazing UIs</text>
            <text x="200" y="150" text-anchor="middle" fill="rgba(255,255,255,0.9)" font-size="16">With AI-powered design tools</text>
            <rect x="150" y="180" width="100" height="40" fill="rgba(255,255,255,0.2)" stroke="white" rx="8"/>
            <text x="200" y="205" text-anchor="middle" fill="white" font-size="14" font-weight="600">Get Started</text>
          </svg>`,
          button: `<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50">
            <rect width="150" height="50" fill="#10b981" rx="8"/>
            <text x="75" y="32" text-anchor="middle" fill="white" font-size="16" font-weight="600">Click Me</text>
          </svg>`,
          component: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100" viewBox="0 0 200 100">
            <rect width="200" height="100" fill="#6366f1" rx="8"/>
            <text x="100" y="55" text-anchor="middle" fill="white" font-family="Inter" font-size="16" font-weight="600">
              Generated Component
            </text>
          </svg>`
        }

        await framer.addSVG({
          svg: componentSVGs[componentType as keyof typeof componentSVGs],
          name: `Framium-${componentType}-${Date.now()}.svg`,
        })

        framer.notify(`✅ ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} component applied to canvas!`)
      }
    } catch (error) {
      console.error('Error applying to canvas:', error)
      framer.notify('❌ Error applying component to canvas')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div>
          <h2 className="chat-title">💬 Chat with Framium</h2>
          <div className="chat-controls">
            <div className="mode-selector">
              <button 
                className={`mode-button ${mode === 'ask' ? 'active' : ''}`}
                onClick={() => setMode('ask')}
              >
                💬 Ask Mode
              </button>
              <button 
                className={`mode-button ${mode === 'agent' ? 'active' : ''}`}
                onClick={() => setMode('agent')}
              >
                ⚡ Agent Mode
              </button>
            </div>
            <div className="model-selector" ref={modelDropdownRef}>
              <button 
                className="model-select-button"
                onClick={() => setShowModelDropdown(!showModelDropdown)}
              >
                <span className="model-name">{selectedModel.name}</span>
                <ChevronDown size={16} className={`chevron ${showModelDropdown ? 'open' : ''}`} />
              </button>
              
              {showModelDropdown && (
                <div className="model-dropdown">
                  {getModelsByTier().map(({ tier, models }) => (
                    <div key={tier} className="model-tier-group">
                      <div className="model-tier-header">
                        {tier} Models
                      </div>
                      {models.map(model => {
                        const isLocked = !canUseModel(model)
                        return (
                          <button
                            key={model.id}
                            className={`model-option ${selectedModel.id === model.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                            onClick={() => handleModelSelect(model)}
                          >
                            <span className="model-option-name">{model.name}</span>
                            <div className="model-option-icons">
                              {selectedModel.id === model.id && <CheckCircle size={14} className="check-icon" />}
                              {isLocked && <Lock size={14} className="lock-icon" />}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className={`message-avatar ${message.type}`}>
              {message.type === 'user' ? (
                user?.name?.[0]?.toUpperCase() || 'U'
              ) : (
                <Sparkles size={16} />
              )}
            </div>
            <div className="message-content">
              <div dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/\n/g, '<br>')
              }} />
              
              {message.tokens && (
                <div style={{ 
                  fontSize: 11, 
                  color: 'var(--text-tertiary)', 
                  marginTop: 8,
                  opacity: 0.7
                }}>
                                    {message.tokens} tokens • ${message.cost?.toFixed(4)} • {formatTimestamp(message.timestamp)}
                </div>
              )}
              {message.id === 'welcome' && (
                <div className="message-actions">
                </div>
              )}

              {message.id === 'welcome' && (
                <div className="message-actions">
                  {message.canApplyToCanvas && (
                    <button 
                      className="action-button primary"
                      onClick={() => handleApplyToCanvas(message)}
                    >
                      <Check size={14} />
                      Apply to Canvas
                    </button>
                  )}
                  <button 
                    className="action-button"
                    onClick={() => handleQuickAction('wireframe')}
                  >
                    <Edit3 size={14} />
                    Generate Wireframe
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => handleQuickAction('website')}
                  >
                    <RotateCcw size={14} />
                    Design Website
                  </button>
                  <button 
                    className="action-button"
                    onClick={() => handleQuickAction('store')}
                  >
                    <Save size={14} />
                    Create Online Store
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-avatar ai">
              <Sparkles size={16} />
            </div>
            <div className="message-content">
              <div className="loading">
                <div className="loading-spinner"></div>
                <span>{selectedModel.name} is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="chat-input">
        <div className="input-container">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={mode === 'ask' ? 
              "Plan, search, build anything" : 
              "Plan, search, build anything"
            }
            className="input-field"
            rows={1}
            style={{ 
              minHeight: 40,
              maxHeight: 120,
              resize: 'none',
              overflow: 'hidden'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = Math.min(target.scrollHeight, 120) + 'px'
            }}
          />
          <div className="input-footer">
            <div className="input-controls">
              <span className="model-indicator">{selectedModel.name}</span>
            </div>
            <div className="input-buttons">
              <div className="add-context-container" ref={framesDropdownRef}>
                <button 
                  className="add-context-button"
                  onClick={() => setShowFramesDropdown(!showFramesDropdown)}
                >
                  @ Add Context
                </button>
                {showFramesDropdown && (
                  <div className="frames-dropdown">
                    <div className="frames-dropdown-header">
                      <h4>Select Frame Context</h4>
                    </div>
                    <div className="frames-list">
                      {getFramesWithHeaders().length > 0 ? (
                        getFramesWithHeaders().map((frame) => (
                          frame.isHeader ? (
                            <div
                              key={frame.id}
                              className="frame-item header"
                            >
                              {frame.name}
                            </div>
                          ) : (
                            <div
                              key={frame.id}
                              className="frame-item"
                              onClick={() => handleFrameSelect(frame)}
                            >
                              <div className="frame-icon">
                                {frame.type === 'Selected' ? <Target size={16} /> : 
                                 frame.type === 'Component' ? <Box size={16} /> : <Layers size={16} />}
                              </div>
                              <div className="frame-info">
                                <div className="frame-name">{frame.name}</div>
                                <div className="frame-type">{frame.type}</div>
                              </div>
                            </div>
                          )
                        ))
                      ) : (
                        <div className="no-frames">
                          No frames available
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                className="image-upload-button"
                onClick={handleImageUpload}
              >
                <Image size={16} />
              </button>
              <button 
                className="send-button-input"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && selectedLockedModel && (
        <div className="upgrade-modal-overlay">
          <div className="upgrade-modal">
            <div className="upgrade-modal-header">
              <h3>Unlock {selectedLockedModel.name}</h3>
              <button 
                className="upgrade-modal-close"
                onClick={() => setShowUpgradeModal(false)}
              >
                ×
              </button>
            </div>
            <div className="upgrade-modal-content">
              <p>
                <strong>{selectedLockedModel.name}</strong> is available with the <strong>{selectedLockedModel.tier}</strong> plan.
              </p>
              <p>
                Upgrade your plan to access this model and unlock more powerful AI capabilities.
              </p>
            </div>
            <div className="upgrade-modal-actions">
              <button 
                className="upgrade-button primary"
                onClick={() => {
                  // TODO: Navigate to upgrade page with selected plan
                  setShowUpgradeModal(false)
                  framer.notify(`🚀 Upgrade to ${selectedLockedModel.tier} plan to unlock ${selectedLockedModel.name}`)
                }}
              >
                Upgrade to {selectedLockedModel.tier}
              </button>
              <button 
                className="upgrade-button secondary"
                onClick={() => {
                  setShowUpgradeModal(false)
                  // Keep current model selection
                }}
              >
                Switch Models
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced AI response simulation with better logic
async function simulateAIResponse(prompt: string, selection: CanvasNode[], modelName: string) {
  // Simulate realistic API delay based on model
  const baseDelay = modelName.includes('4') ? 2000 : 1500
  const randomDelay = Math.random() * 1000
  await new Promise(resolve => setTimeout(resolve, baseDelay + randomDelay))

  // Analyze prompt for better responses
  const isDesignRequest = /design|layout|ui|style/i.test(prompt)
  const isPricingRequest = /pricing|plan|subscription|tier/i.test(prompt)
  const isHeroRequest = /hero|banner|header|landing/i.test(prompt)
  const hasSelection = selection.length > 0

  let response: any

  if (isPricingRequest) {
    response = {
      content: "I'll create a modern pricing section with 3 tiers for you! Here's a beautiful component with hover animations and a monthly/yearly toggle.\n\n```jsx\nfunction PricingSection() {\n  const [isYearly, setIsYearly] = useState(false)\n  \n  return (\n    <div className=\"pricing-section\">\n      <div className=\"pricing-toggle\">\n        <button onClick={() => setIsYearly(!isYearly)}>\n          {isYearly ? 'Yearly' : 'Monthly'}\n        </button>\n      </div>\n      <div className=\"pricing-cards\">\n        {plans.map(plan => (\n          <PricingCard key={plan.id} plan={plan} isYearly={isYearly} />\n        ))}\n      </div>\n    </div>\n  )\n}\n```\n\nThis component includes:\n• 3 responsive pricing tiers (Basic, Pro, Enterprise)\n• Smooth hover animations and transitions\n• Monthly/yearly toggle with price updates\n• CTA buttons with gradient effects\n• Mobile-optimized responsive layout\n• Accessibility features (ARIA labels, keyboard nav)",
      tokens: 420,
      cost: 0.0126,
      canApplyToCanvas: true,
      code: "pricing-component"
    }
  } else if (isHeroRequest) {
    response = {
      content: "I'll design a stunning hero section with animated background! This will include:\n\n🎨 **Visual Elements:**\n• Gradient mesh background with subtle animation\n• Floating geometric shapes with parallax\n• Typography with staggered text reveal effects\n• Call-to-action button with hover micro-interactions\n• Social proof indicators\n\n⚡ **Animations:**\n• Parallax background movement on scroll\n• Staggered text appearance with spring physics\n• Button hover states with color transitions\n• Smooth scroll indicators and progress\n• Mobile-responsive touch interactions\n\n🔧 **Technical Features:**\n• Optimized SVG animations\n• CSS custom properties for theming\n• Intersection Observer for performance\n• Reduced motion support for accessibility\n\nShall I apply this hero design to your canvas?",
      tokens: 312,
      cost: 0.0094,
      canApplyToCanvas: true,
      code: "hero-section"
    }
  } else if (hasSelection) {
    response = {
      content: `Great! I can help you enhance the ${selection.length} selected item${selection.length === 1 ? '' : 's'} on your canvas.\n\n🔧 **Available Actions:**\n• Add interactive hover states and transitions\n• Apply consistent styling and design tokens\n• Create component variants for different states\n• Add Framer Motion animations and gestures\n• Generate responsive layouts for all devices\n• Implement accessibility improvements\n• Add micro-interactions and feedback\n\n💡 **Smart Suggestions:**\n• Convert to reusable components\n• Add state management for interactivity\n• Optimize for performance and loading\n• Implement design system tokens\n\nWhat specific enhancement would you like me to apply to your selection?`,
      tokens: 245,
      cost: 0.0074,
      canApplyToCanvas: false,
      code: undefined
    }
  } else if (isDesignRequest) {
    response = {
      content: `I'll help you create a beautiful design! Based on your request, I can generate:\n\n🎨 **Design Options:**\n• Modern component library with consistent styling\n• Responsive layouts for mobile, tablet, and desktop\n• Interactive prototypes with micro-animations\n• Accessible components following WCAG guidelines\n• Design system tokens for colors, typography, spacing\n\n🚀 **Quick Start Templates:**\n• Landing page with hero, features, testimonials\n• Dashboard with navigation, charts, data tables\n• E-commerce with product cards, cart, checkout\n• Blog layout with articles, sidebar, pagination\n• Portfolio with projects, about, contact sections\n\nWhich type of design would you like me to create first?`,
      tokens: 198,
      cost: 0.0059,
      canApplyToCanvas: true,
      code: "design-template"
    }
  } else {
    // Default helpful response
    response = {
      content: `I'm here to help you build amazing UIs! I can assist with:\n\n🎯 **What I can create:**\n• Complete page layouts and sections\n• Interactive components and animations\n• Responsive design systems\n• Custom illustrations and icons\n• Data visualization components\n\n💻 **Development Support:**\n• React/TypeScript components\n• Framer Motion animations\n• CSS styling and layouts\n• Performance optimization\n• Accessibility implementation\n\n🚀 **Quick Examples:**\nTry: "Create a pricing section with 3 tiers"\nTry: "Design a hero with animated background"\nTry: "Build a testimonial carousel"\nTry: "Generate a contact form with validation"\n\nWhat would you like to build today?`,
      tokens: 167,
      cost: 0.0050,
      canApplyToCanvas: false,
      code: undefined
    }
  }

  return response
}
