import { useState, useRef, useEffect } from 'react'
import { User, Settings, LogOut, Crown, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  onNavigateToSettings?: () => void
}

export function ProfileDropdown({ isOpen, onClose, onNavigateToSettings }: ProfileDropdownProps) {
  const { user, logout } = useAuth()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const getPlanIcon = () => {
    switch (user?.plan) {
      case 'BEAST': return <Crown className="gradient-icon" size={12} />
      case 'MAX': return <Zap className="gradient-icon" size={12} />
      default: return null
    }
  }

  const getPlanColor = () => {
    switch (user?.plan) {
      case 'BEAST': return 'var(--accent-beast)'
      case 'MAX': return 'var(--accent-primary)'
      default: return 'var(--text-secondary)'
    }
  }

  return (
    <>
      {/* Background overlay */}
      <div 
        className="profile-dropdown-overlay"
        onClick={onClose}
      />
      
      {/* Dropdown content */}
      <div className="profile-dropdown" ref={dropdownRef}>
        <div className="profile-header">
          <div className="profile-avatar">
            <User size={20} />
          </div>
          <div className="profile-info">
            <div className="profile-name">{user?.name || 'User'}</div>
            <div className="profile-plan" style={{ color: getPlanColor() }}>
              {getPlanIcon()}
              {user?.plan || 'BASIC'} Plan
            </div>
          </div>
        </div>
        
        <div className="profile-divider" />
        
        <div className="profile-menu">
          <button className="profile-menu-item" onClick={() => {
            onClose()
            onNavigateToSettings?.()
          }}>
            <Settings size={16} />
            Settings
          </button>
          
          <button className="profile-menu-item danger" onClick={() => {
            onClose()
            logout()
          }}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
        
        <div className="profile-footer">
          <div className="usage-info">
            <div className="usage-label">Usage this month</div>
            <div className="usage-stats">
              <div className="usage-item">
                <span className="usage-count">{user?.usage?.requests || 0}</span>
                <span className="usage-type">Requests</span>
              </div>
              <div className="usage-item">
                <span className="usage-count">{user?.usage?.tokens || 0}</span>
                <span className="usage-type">Tokens</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function ProfileButton({ onNavigateToSettings }: { onNavigateToSettings?: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const getPlanColor = () => {
    switch (user?.plan) {
      case 'BEAST': return 'var(--accent-beast)'
      case 'MAX': return 'var(--accent-primary)'
      default: return 'var(--text-secondary)'
    }
  }

  return (
    <div className="profile-container">
      <button 
        className="profile-button"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: getPlanColor() }}
      >
        <User size={18} />
        {user?.plan && user.plan !== 'BASIC' && (
          <div className="plan-indicator" style={{ background: getPlanColor() }} />
        )}
      </button>
      
      <ProfileDropdown 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        onNavigateToSettings={onNavigateToSettings}
      />
    </div>
  )
}
