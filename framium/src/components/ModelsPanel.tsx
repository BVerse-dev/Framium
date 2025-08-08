import { useState } from 'react'
import { Check, Lock, Zap, Flame, Rocket, TrendingUp, Clock, Crown } from 'lucide-react'
import { framer } from 'framer-plugin'
import { useAuth } from '../contexts/AuthContext'
import { useModel, AIModel } from '../contexts/ModelContext'

export function ModelsPanel() {
  const { user, updatePlan } = useAuth()
  const { selectedModel, availableModels, setSelectedModel, canUseModel, getTokenCost } = useModel()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'Basic' | 'Max' | 'Beast' | 'Ultimate'>('Max')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isLoading, setIsLoading] = useState(false)

  const modelsByTier = {
    Basic: availableModels.filter((m: AIModel) => m.tier === 'Basic'),
    Max: availableModels.filter((m: AIModel) => m.tier === 'Max'),
    Beast: availableModels.filter((m: AIModel) => m.tier === 'Beast'),
    Ultimate: availableModels.filter((m: AIModel) => m.tier === 'Ultimate')
  }

  // Debug logging
  console.log('ModelsPanel - Available models:', availableModels.length)
  console.log('ModelsPanel - Models by tier:', {
    Basic: modelsByTier.Basic.length,
    Max: modelsByTier.Max.length,
    Beast: modelsByTier.Beast.length,
    Ultimate: modelsByTier.Ultimate.length
  })
  console.log('ModelsPanel - User plan:', user?.plan || 'No user')

  const planDetails = {
    Basic: {
      icon: <Zap size={20} className="text-gray-400" />,
      name: 'Basic',
      monthlyPrice: 9,
      yearlyPrice: 90,
      tokens: '100K tokens/month',
      features: [
        'GPT-3.5 Turbo & Claude 3 Haiku',
        'Gemini 1.5 Flash',
        'Basic UI components',
        'Standard response speed',
        'Email support'
      ],
      color: '#6b7280'
    },
    Max: {
      icon: <Rocket size={20} className="text-blue-400" />,
      name: 'Max',
      monthlyPrice: 29,
      yearlyPrice: 290,
      tokens: '500K tokens/month',
      features: [
        'All Basic models + GPT-4o Mini',
        'Claude 3.5 Haiku & GPT-4 Turbo',
        'Cohere Command R',
        'Advanced animations & components',
        'Priority support',
        'Faster response times'
      ],
      color: '#3b82f6'
    },
    Beast: {
      icon: <Flame size={20} className="text-orange-400" />,
      name: 'Beast',
      monthlyPrice: 79,
      yearlyPrice: 790,
      tokens: '2M tokens/month',
      features: [
        'All Max + GPT-4o & Claude 3.5 Sonnet',
        'Gemini 1.5 Pro & Grok Beta',
        'Llama 3.1 70B & Command R+',
        'Agent mode & automation',
        'Custom integrations',
        'White-glove support'
      ],
      color: '#f97316'
    },
    Ultimate: {
      icon: <Crown size={20} className="text-purple-400" />,
      name: 'Ultimate',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      tokens: 'Unlimited tokens',
      features: [
        'All Beast + Claude 3 Opus',
        'Llama 3.1 405B & Mistral Large',
        'Perplexity Sonar Large',
        'Real-time web search',
        'Custom model fine-tuning',
        'White-label options',
        '24/7 dedicated support'
      ],
      color: '#a855f7'
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
      
      // Map Ultimate to Ultimate since auth context now supports all plans
      const planToUpdate = selectedPlan
      
      // Update user plan in context
      await updatePlan(planToUpdate)
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
    switch (provider.toLowerCase()) {
      case 'openai': return '🤖'
      case 'anthropic': return '🧠'
      case 'google': return '🔮'
      case 'xai': return '🚀'
      case 'meta-llama': 
      case 'meta': return '🦙'
      case 'cohere': return '🔷'
      case 'mistral': return '⚡'
      case 'perplexity': return '🔍'
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
      {user && planDetails[user.plan] && (
        <div className="current-plan-card">
          <div className="plan-header">
            <div className="plan-info">
              {planDetails[user.plan].icon}
              <div>
                <h4>{planDetails[user.plan].name} Plan</h4>
                <p>${billingCycle === 'monthly' ? planDetails[user.plan].monthlyPrice : Math.floor(planDetails[user.plan].yearlyPrice / 12)}/month</p>
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
                      <span>{formatNumber(model.maxTokens || 8192)} tokens</span>
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
            <strong>For UI/UX Design:</strong> Claude 3.5 Sonnet - Superior component generation and design understanding
          </div>
          <div className="recommendation">
            <strong>For Complex Coding:</strong> GPT-4o - Advanced reasoning with function calling capabilities
          </div>
          <div className="recommendation">
            <strong>For Real-time Data:</strong> Grok Beta or Perplexity - Live web search and current information
          </div>
          <div className="recommendation">
            <strong>For Enterprise/RAG:</strong> Command R+ - Specialized retrieval and document processing
          </div>
          <div className="recommendation">
            <strong>For Multimodal:</strong> Gemini 1.5 Pro - Vision, extended context, and multimedia processing
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="modal-overlay" onClick={() => setShowUpgradeModal(false)}>
          <div className="modal-content upgrade-modal" onClick={e => e.stopPropagation()}>
            <h3>🚀 Upgrade Your Plan</h3>
            <p>Unlock more powerful AI models and advanced features</p>

            {/* Billing Toggle */}
            <div className="billing-toggle">
              <button
                className={`billing-option ${billingCycle === 'monthly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('monthly')}
              >
                Monthly
              </button>
              <button
                className={`billing-option ${billingCycle === 'yearly' ? 'active' : ''}`}
                onClick={() => setBillingCycle('yearly')}
              >
                Yearly
                <span className="discount-badge">Save 17%</span>
              </button>
            </div>

            <div className="plans-comparison">
              {Object.entries(planDetails).map(([key, plan]) => (
                <div 
                  key={key}
                  className={`plan-option ${selectedPlan === key ? 'selected' : ''}`}
                  onClick={() => setSelectedPlan(key as any)}
                >
                  <div className="plan-header">
                    {billingCycle === 'monthly' ? (
                      <div>
                        <h4>{plan.icon} {plan.name}</h4>
                        <p>${plan.monthlyPrice}/month</p>
                      </div>
                    ) : (
                      <div>
                        <h4>{plan.icon} {plan.name}</h4>
                        <p>${Math.floor(plan.yearlyPrice / 12)}/month</p>
                        <span className="yearly-note">Billed ${plan.yearlyPrice} annually</span>
                      </div>
                    )}
                    {selectedPlan === key && <Check size={16} />}
                  </div>
                  <div className="plan-features">
                    <div className="feature-highlight">
                      <Zap size={16} />
                      <strong>{plan.tokens}</strong>
                    </div>
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
                className="gradient-button"
                onClick={handleUpgrade}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : `Upgrade to ${planDetails[selectedPlan].name}`}
              </button>
              <button 
                className="secondary-button"
                onClick={() => setShowUpgradeModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
