import { useState } from 'react'
import { Check, Lock, Zap, Flame, Rocket, TrendingUp, Clock } from 'lucide-react'
import { framer } from 'framer-plugin'
import { useAuth } from '../contexts/AuthContext'
import { useModel, AI_MODELS, AIModel } from '../contexts/ModelContext'

export function ModelsPanel() {
  const { user, updatePlan } = useAuth()
  const { selectedModel, setSelectedModel, canUseModel, getTokenCost } = useModel()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'BASIC' | 'MAX' | 'BEAST'>('MAX')
  const [isLoading, setIsLoading] = useState(false)

  const modelsByTier = {
    BASIC: AI_MODELS.filter(m => m.tier === 'BASIC'),
    MAX: AI_MODELS.filter(m => m.tier === 'MAX'),
    BEAST: AI_MODELS.filter(m => m.tier === 'BEAST')
  }

  const planDetails = {
    BASIC: {
      icon: <Zap size={20} className="text-gray-400" />,
      name: 'Basic',
      price: '$9/month',
      tokens: '50K tokens/month',
      features: ['GPT-3.5 Turbo', 'Claude 3 Haiku', 'Basic components', 'Standard support'],
      color: '#6b7280'
    },
    MAX: {
      icon: <Rocket size={20} className="text-blue-400" />,
      name: 'Max',
      price: '$29/month',
      tokens: '250K tokens/month',
      features: ['All Basic models', 'GPT-4 Turbo', 'Claude 3 Sonnet', 'Advanced animations', 'Priority support'],
      color: '#3b82f6'
    },
    BEAST: {
      icon: <Flame size={20} className="text-orange-400" />,
      name: 'Beast',
      price: '$99/month',
      tokens: '1M tokens/month',
      features: ['All Max models', 'Claude 3 Opus', 'Gemini Pro', 'Agent mode', 'Custom integrations', 'White-glove support'],
      color: '#f97316'
    }
  }

  const handleModelSelect = (model: AIModel) => {
    if (canUseModel(model)) {
      setSelectedModel(model)
    } else {
      setShowUpgradeModal(true)
      // Set recommended plan based on model tier
      setSelectedPlan(model.tier)
    }
  }

  const handleUpgrade = async () => {
    try {
      // Simulate payment processing
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update user plan in context
      await updatePlan(selectedPlan)
      setShowUpgradeModal(false)
      
      // Show success feedback
      framer.notify(`🎉 Successfully upgraded to ${selectedPlan} plan!`)
      
      // TODO: Implement real payment processing with Stripe/etc
      console.log('Payment processed for plan:', selectedPlan)
    } catch (error) {
      framer.notify('❌ Upgrade failed. Please try again.')
      console.error('Upgrade error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      case 'google': return '🔮'
      case 'mistral': return '⚡'
      default: return '🤖'
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const getCurrentUsage = () => {
    if (!user) return { used: 0, total: 0, percentage: 0 }
    const percentage = (user.tokensUsed / user.tokensLimit) * 100
    return {
      used: user.tokensUsed,
      total: user.tokensLimit,
      percentage: Math.min(percentage, 100)
    }
  }

  const usage = getCurrentUsage()

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>
          <span className="gradient-icon models">🧭</span>
          AI Models
        </h2>
        <p>Choose your AI model and manage your plan</p>
        <button 
          className="gradient-button small"
          onClick={() => setShowUpgradeModal(true)}
          style={{ marginTop: 12 }}
        >
          Upgrade Plan
        </button>
      </div>

      {/* Current Plan & Usage */}
      {user && (
        <div className="current-plan-card">
          <div className="plan-header">
            <div className="plan-info">
              {planDetails[user.plan].icon}
              <div>
                <h4>{planDetails[user.plan].name} Plan</h4>
                <p>{planDetails[user.plan].price}</p>
              </div>
            </div>
          </div>
          
          <div className="usage-section">
            <div className="usage-header">
              <span>Token Usage</span>
              <span>{formatNumber(usage.used)} / {formatNumber(usage.total)}</span>
            </div>
            <div className="usage-bar">
              <div 
                className="usage-fill"
                style={{ 
                  width: `${usage.percentage}%`,
                  backgroundColor: usage.percentage > 80 ? '#ef4444' : '#10b981'
                }}
              />
            </div>
            <div className="usage-meta">
              <span>{(100 - usage.percentage).toFixed(1)}% remaining</span>
              <span>Resets monthly</span>
            </div>
          </div>
        </div>
      )}

      {/* Model Selection by Tier */}
      {Object.entries(modelsByTier).map(([tier, models]) => (
        <div key={tier} className="tier-section">
          <div className="tier-header">
            <div className="tier-badge" style={{ backgroundColor: planDetails[tier as keyof typeof planDetails].color }}>
              {planDetails[tier as keyof typeof planDetails].icon}
              <span>{tier}</span>
            </div>
            {user && user.plan !== tier && (
              <Lock size={16} className="text-gray-400" />
            )}
          </div>

          <div className="models-grid">
            {models.map(model => {
              const isAvailable = canUseModel(model)
              const isSelected = selectedModel.id === model.id
              const estimatedCost = getTokenCost(1000, model)

              return (
                <div 
                  key={model.id}
                  className={`model-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'locked' : ''}`}
                  onClick={() => handleModelSelect(model)}
                >
                  <div className="model-header">
                    <div className="model-info">
                      <span className="model-provider">{getProviderIcon(model.provider)}</span>
                      <div>
                        <h5>{model.name}</h5>
                        <p>{model.description}</p>
                      </div>
                    </div>
                    {isSelected && <Check size={16} className="text-green-400" />}
                    {!isAvailable && <Lock size={16} className="text-gray-400" />}
                  </div>

                  <div className="model-specs">
                    <div className="spec-item">
                      <Clock size={12} />
                      <span>{formatNumber(model.maxTokens)} tokens</span>
                    </div>
                    <div className="spec-item">
                      <TrendingUp size={12} />
                      <span>${estimatedCost.toFixed(4)}/1K</span>
                    </div>
                  </div>

                  <div className="model-capabilities">
                    {model.capabilities.slice(0, 3).map(cap => (
                      <span key={cap} className="capability-tag">{cap}</span>
                    ))}
                    {model.capabilities.length > 3 && (
                      <span className="capability-more">+{model.capabilities.length - 3}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Model Comparison */}
      <div className="model-comparison">
        <h4>💡 Model Recommendations</h4>
        <div className="recommendations">
          <div className="recommendation">
            <strong>For UI Design:</strong> Claude 3 Sonnet - Best for layout and component generation
          </div>
          <div className="recommendation">
            <strong>For Complex Logic:</strong> GPT-4 Turbo - Excellent reasoning and code generation
          </div>
          <div className="recommendation">
            <strong>For Agent Tasks:</strong> Claude 3 Opus - Multi-step planning and execution
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content upgrade-modal" onClick={e => e.stopPropagation()}>
            <h3>🚀 Upgrade Your Plan</h3>
            <p>Unlock more powerful AI models and advanced features</p>

            <div className="plans-comparison">
              {Object.entries(planDetails).map(([key, plan]) => (
                <div 
                  key={key}
                  className={`plan-option ${selectedPlan === key ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(key as any)}
                >
                  <div className="plan-header">
                    {plan.icon}
                    <div>
                      <h4>{plan.name}</h4>
                      <p>{plan.price}</p>
                    </div>
                    {selectedPlan === key && <Check size={16} />}
                  </div>
                  <div className="plan-features">
                    {plan.features.map(feature => (
                      <div key={feature} className="feature-item">
                        <Check size={12} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-footer">
              <button 
                className="secondary-button"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
              <button 
                className="gradient-button"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Upgrade to ${planDetails[selectedPlan].name}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
