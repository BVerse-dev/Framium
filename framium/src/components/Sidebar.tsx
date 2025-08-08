import { MessageCircle, Brain, Compass, FolderOpen, Settings, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { ProfileButton } from './ProfileDropdown'

interface SidebarProps {
  activePage: 'chat' | 'rules' | 'tasks' | 'models' | 'project' | 'settings'
  setActivePage: (page: 'chat' | 'rules' | 'tasks' | 'models' | 'project' | 'settings') => void
  selectionCount: number
}

export function Sidebar({ activePage, setActivePage, selectionCount }: SidebarProps) {
  const { user } = useAuth()

  const menuItems = [
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'rules', icon: Zap, label: 'Rules & Workflow' },
    { id: 'tasks', icon: Brain, label: 'AI Tasks' },
    { id: 'models', icon: Compass, label: 'Models' },
    { id: 'project', icon: FolderOpen, label: 'Project' },
  ]

  const settingsItems = [
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]

  const getPlanIcon = () => {
    if (!user) return '⚡'
    switch (user.plan) {
      case 'Basic': return '⚡'
      case 'Max': return '🚀'
      case 'Beast': return '🔥'
      case 'Ultimate': return '👑'
      default: return '⚡'
    }
  }

  return (
    <div className="sidebar">
      {/* Logo/Brand */}
      <div className="sidebar-item" style={{ marginBottom: 20 }}>
        <span className="text-gradient" style={{ fontSize: 24, fontWeight: 'bold' }}>F</span>
      </div>

      {/* Main Navigation */}
      {menuItems.map((item) => (
        <button
          key={item.id}
          className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
          onClick={() => setActivePage(item.id as any)}
          title={item.label}
        >
          <item.icon size={20} />
          {item.id === 'project' && selectionCount > 0 && (
            <span className="selection-badge">{selectionCount}</span>
          )}
        </button>
      ))}

      {/* Bottom section */}
      <div className="sidebar-bottom">
        {/* User Plan Indicator */}
        {user && (
          <button
            className="sidebar-item"
            onClick={() => setActivePage('models')}
            title={`${user.plan} Plan - Click to upgrade - ${user.usage.tokens.toLocaleString()}/${user.usage.maxTokens.toLocaleString()} tokens`}
            style={{ 
              fontSize: 16,
              background: user.plan === 'Beast' ? 'rgba(245, 158, 11, 0.2)' : 
                         user.plan === 'Max' ? 'rgba(99, 102, 241, 0.2)' : 
                         user.plan === 'Ultimate' ? 'rgba(168, 85, 247, 0.2)' :
                         'rgba(255, 255, 255, 0.1)',
              color: user.plan === 'Beast' ? '#f59e0b' : 
                     user.plan === 'Max' ? '#6366f1' : 
                     user.plan === 'Ultimate' ? '#a855f7' :
                     '#a0a0a0'
            }}
          >
            {getPlanIcon()}
          </button>
        )}

        {/* Settings */}
        {settingsItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id as any)}
            title={item.label}
          >
            <item.icon size={20} />
          </button>
        ))}

        {/* Profile */}
        <ProfileButton onNavigateToSettings={() => setActivePage('settings')} />
      </div>
    </div>
  )
}
