import { useState } from 'react'
import { LogOut, User, Shield, Palette, Code, HelpCircle, ExternalLink, Save, Crown, Zap, Check } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useModel } from '../contexts/ModelContext'

interface SettingsPanelProps {
  onOpenAuth?: (mode?: 'signin' | 'signup') => void
}

export function SettingsPanel({ onOpenAuth }: SettingsPanelProps) {
  const { user, logout, updatePlan } = useAuth()
  const { mode, setMode } = useModel()
  const [activeTab, setActiveTab] = useState<'account' | 'preferences' | 'upgrade' | 'about'>('account')
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    notifications: true,
    autoSave: true,
    codeStyle: 'typescript',
    defaultMode: mode
  })
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSavePreferences = () => {
    // In production, save to localStorage or API
    localStorage.setItem('framium-preferences', JSON.stringify(preferences))
    setMode(preferences.defaultMode)
    
    // Apply theme if possible (local state solution)
    if (preferences.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', preferences.theme)
    }
    
    alert('✅ Preferences saved successfully!')
  }

  const handleEditProfile = () => {
    setShowEditProfile(true)
  }

  const handleSaveProfile = () => {
    // TODO: Update user profile via API
    console.log('Saving profile:', profileForm)
    setShowEditProfile(false)
    alert('✅ Profile updated successfully!')
  }

  const handleChangePassword = () => {
    setShowChangePassword(true)
  }

  const handleSavePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('❌ Passwords do not match')
      return
    }
    
    // TODO: Change password via API
    console.log('Changing password')
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setShowChangePassword(false)
    alert('✅ Password changed successfully!')
  }

  const handleUpgrade = async (planId: string) => {
    try {
      const planMap = {
        'basic': 'Basic' as const,
        'max': 'Max' as const, 
        'beast': 'Beast' as const,
        'ultimate': 'Ultimate' as const
      }
      
      const planType = planMap[planId as keyof typeof planMap]
      if (planType) {
        await updatePlan(planType)
        alert('✅ Plan upgraded successfully!')
      } else {
        alert('💬 Contact sales for plan upgrade')
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
      alert('❌ Upgrade failed. Please try again.')
    }
  }

  const handleLogout = () => {
    console.log('SettingsPanel logout button clicked')
    logout()
    setShowLogoutConfirm(false)
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'upgrade', label: 'Upgrade', icon: Crown },
    { id: 'about', label: 'About', icon: HelpCircle }
  ]

  // Pricing plans data
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for getting started',
      monthlyPrice: 9,
      yearlyPrice: 90,
      tokens: '50K',
      features: [
        'Basic AI models',
        'Standard components',
        'Email support',
        'Basic templates',
        '1,000 requests/month'
      ],
      buttonText: user?.plan === 'Basic' ? 'Current Plan' : 'Upgrade to Basic',
      popular: false,
      disabled: user?.plan === 'Basic'
    },
    {
      id: 'max',
      name: 'Max',
      description: 'Perfect for professionals and teams',
      monthlyPrice: 29,
      yearlyPrice: 290,
      tokens: '250K',
      features: [
        'Advanced AI models',
        'Premium components',
        'Priority support',
        'Custom templates',
        '10,000 requests/month',
        'Real-time collaboration'
      ],
      buttonText: user?.plan === 'Max' ? 'Current Plan' : 'Upgrade to Max',
      popular: true,
      disabled: user?.plan === 'Max'
    },
    {
      id: 'beast',
      name: 'Beast',
      description: 'Unleash the full power of AI',
      monthlyPrice: 79,
      yearlyPrice: 790,
      tokens: '1M',
      features: [
        'All Max features',
        'Unlimited tokens',
        'Advanced model control',
        'Custom AI training',
        'Dedicated support',
        'Advanced animations',
        'Team management'
      ],
      buttonText: user?.plan === 'Beast' ? 'Current Plan' : 'Upgrade to Beast',
      popular: false,
      disabled: user?.plan === 'Beast'
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      description: 'Enterprise-grade AI with unlimited access',
      monthlyPrice: 199,
      yearlyPrice: 1990,
      tokens: 'Unlimited',
      features: [
        'All Beast features',
        'Unlimited everything',
        'Custom model training',
        'Advanced model control',
        'White-label options',
        'Custom integrations',
        'SSO authentication',
        '24/7 dedicated support'
      ],
      buttonText: 'Upgrade to Ultimate',
      popular: false,
      disabled: false
    }
  ]

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>
          <span className="gradient-icon settings">⚙️</span>
          Settings
        </h2>
        <p>Manage your account and preferences</p>
      </div>

      {/* Settings Tabs */}
      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id as any)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="settings-content">
          {user ? (
            <>
              <div className="user-profile">
                <div className="profile-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.name[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-info">
                  <h4>{user.name}</h4>
                  <p>{user.email}</p>
                  <span className={`plan-badge ${user.plan.toLowerCase()}`}>
                    {user.plan} Plan
                  </span>
                </div>
              </div>

              <div className="account-stats">
                <div className="stat-item">
                  <div className="stat-value">{user.tokensUsed.toLocaleString()}</div>
                  <div className="stat-label">Tokens Used</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{user.tokensLimit.toLocaleString()}</div>
                  <div className="stat-label">Token Limit</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {Math.round(((user.tokensLimit - user.tokensUsed) / user.tokensLimit) * 100)}%
                  </div>
                  <div className="stat-label">Remaining</div>
                </div>
              </div>

              <div className="account-actions">
                <button 
                  className="action-button"
                  onClick={handleEditProfile}
                >
                  <User size={14} />
                  Edit Profile
                </button>
                <button 
                  className="action-button"
                  onClick={handleChangePassword}
                >
                  <Shield size={14} />
                  Change Password
                </button>
                <button 
                  className="gradient-button danger"
                  onClick={() => setShowLogoutConfirm(true)}
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="auth-required">
              <h4>Sign in required</h4>
              <p>Please sign in to access your account settings</p>
              <div className="auth-buttons">
                <button 
                  className="gradient-button"
                  onClick={() => onOpenAuth?.('signin')}
                >
                  Sign In
                </button>
                <button 
                  className="gradient-button signup"
                  onClick={() => onOpenAuth?.('signup')}
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="settings-content">
          <div className="preference-group">
            <h4>Appearance</h4>
            <div className="preference-item">
              <label>Theme</label>
              <select 
                value={preferences.theme}
                onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
                className="preference-select"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <div className="preference-group">
            <h4>Behavior</h4>
            <div className="preference-item">
              <label>Default AI Mode</label>
              <select 
                value={preferences.defaultMode}
                onChange={(e) => setPreferences(prev => ({ ...prev, defaultMode: e.target.value as any }))}
                className="preference-select"
              >
                <option value="ask">Ask Mode</option>
                <option value="agent">Agent Mode</option>
              </select>
            </div>
            <div className="preference-item">
              <label>Code Style</label>
              <select 
                value={preferences.codeStyle}
                onChange={(e) => setPreferences(prev => ({ ...prev, codeStyle: e.target.value }))}
                className="preference-select"
              >
                <option value="typescript">TypeScript</option>
                <option value="javascript">JavaScript</option>
                <option value="jsx">JSX</option>
              </select>
            </div>
          </div>

          <div className="preference-group">
            <h4>Notifications</h4>
            <div className="preference-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => setPreferences(prev => ({ ...prev, notifications: e.target.checked }))}
                />
                Enable notifications
              </label>
            </div>
            <div className="preference-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.autoSave}
                  onChange={(e) => setPreferences(prev => ({ ...prev, autoSave: e.target.checked }))}
                />
                Auto-save generated components
              </label>
            </div>
          </div>

          <div className="preference-actions">
            <button 
              className="action-button primary"
              onClick={handleSavePreferences}
            >
              <Save size={14} />
              Save Preferences
            </button>
          </div>
        </div>
      )}

      {/* Upgrade Tab */}
      {activeTab === 'upgrade' && (
        <div className="settings-content">
          <div className="upgrade-header">
            <h3>Choose Your Plan</h3>
            <p>Unlock more features and higher usage limits</p>
            
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
          </div>

          <div className="pricing-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`pricing-card ${plan.popular ? 'popular' : ''} ${plan.disabled ? 'current' : ''}`}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="plan-header">
                  <h4>{plan.name}</h4>
                  <p className="plan-description">{plan.description}</p>
                  <div className="plan-price">
                    <span className="price">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : Math.floor(plan.yearlyPrice / 12)}
                    </span>
                    <span className="period">/{billingCycle === 'monthly' ? 'month' : 'month'}</span>
                  </div>
                  {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                    <p className="yearly-note">
                      Billed ${plan.yearlyPrice} annually
                    </p>
                  )}
                </div>

                <div className="plan-features">
                  <div className="feature-highlight">
                    <Zap size={16} />
                    <strong>{plan.tokens} tokens/month</strong>
                  </div>
                  <ul>
                    {plan.features.map((feature, index) => (
                      <li key={index}>
                        <Check size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`plan-button ${plan.popular ? 'gradient-button' : 'secondary-button'} ${plan.disabled ? 'current-plan' : ''}`}
                  disabled={plan.disabled}
                  onClick={() => !plan.disabled && handleUpgrade(plan.id)}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>

          <div className="upgrade-footer">
            <p>
              <strong>Need a custom solution?</strong> Contact our sales team for enterprise pricing.
            </p>
            <button className="contact-sales-button">
              Contact Sales
            </button>
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="settings-content">
          <div className="about-section">
            <div className="app-info">
              <h4>Framium</h4>
              <p>AI-powered design and coding agent for Framer</p>
              <span className="version">Version 1.0.0</span>
            </div>

            <div className="feature-highlights">
              <h5>✨ Features</h5>
              <ul>
                <li>Multi-model AI support (Claude, GPT-4, Gemini)</li>
                <li>Intelligent component generation</li>
                <li>Agent-based automation</li>
                <li>Real-time canvas integration</li>
                <li>Advanced animation support</li>
              </ul>
            </div>

            <div className="links-section">
              <h5>📚 Resources</h5>
              <div className="resource-links">
                <a href="https://framer.com/developers" target="_blank" rel="noopener noreferrer">
                  <Code size={14} />
                  Documentation
                  <ExternalLink size={12} />
                </a>
                <a href="https://github.com/framium/plugin" target="_blank" rel="noopener noreferrer">
                  <Code size={14} />
                  GitHub Repository
                  <ExternalLink size={12} />
                </a>
                <a href="https://framium.dev/support" target="_blank" rel="noopener noreferrer">
                  <HelpCircle size={14} />
                  Support Center
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="credits">
              <p>Built with ❤️ by Framium Labs</p>
              <p>Powered by Framer Plugin API</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Confirm Sign Out</h3>
            <p>Are you sure you want to sign out? Any unsaved work will be lost.</p>
            <div className="modal-footer">
              <button 
                className="secondary-button"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="gradient-button danger"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Edit Profile</h3>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="secondary-button"
                onClick={() => setShowEditProfile(false)}
              >
                Cancel
              </button>
              <button 
                className="gradient-button"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Change Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="secondary-button"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </button>
              <button 
                className="gradient-button"
                onClick={handleSavePassword}
                disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
