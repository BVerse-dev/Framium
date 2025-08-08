import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"
import { Sidebar } from "./components/Sidebar"
import { ChatInterface } from "./components/ChatInterface"
import { RulesPanel } from "./components/RulesPanel"
import { TasksPanel } from "./components/TasksPanel"
import { ModelsPanel } from "./components/ModelsPanel"
import { ProjectPanel } from "./components/ProjectPanel"
import { SettingsPanel } from "./components/SettingsPanel"
import { AuthModal } from "./components/AuthModal"
import { AuthProvider } from "./contexts/AuthContext"
import { ModelProvider } from "./contexts/ModelContext"
import { ensure, REQUIRED_PERMISSIONS } from "./services/permissions"
import "./App.css"

framer.showUI({
    position: "top right",
    width: 420,
    height: 600,
    resizable: true
})

/**
 * Initialize plugin and ensure permissions following Copilot instructions
 */
async function initPlugin() {
  try {
    console.log('🔧 Initializing Framium plugin...')
    
    const ok = await ensure([...REQUIRED_PERMISSIONS])
    if (!ok) {
      console.warn('⚠️ Canvas permissions not granted')
      framer.notify('🔐 Grant canvas access to create components')
    } else {
      console.log('✅ All permissions granted')
      framer.notify('🚀 Framium ready to build!')
    }
    
    // Wait for canvas readiness
    console.log('⏳ Waiting for canvas readiness...')
    // Note: In actual implementation, we would await Canvas.ready()
    
  } catch (error) {
    console.error('Plugin initialization error:', error)
    framer.notify('❌ Plugin initialization failed')
  }
}

function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

export function App() {
    const selection = useSelection()
    const [activePage, setActivePage] = useState<'chat' | 'rules' | 'tasks' | 'models' | 'project' | 'settings'>('chat')
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin')

    // Initialize plugin on mount
    useEffect(() => {
        initPlugin()
    }, [])

    const openAuthModal = (mode: 'signin' | 'signup' = 'signin') => {
        setAuthModalMode(mode)
        setAuthModalOpen(true)
    }

    const closeAuthModal = () => {
        setAuthModalOpen(false)
    }

    return (
        <AuthProvider>
            <ModelProvider>
                <div className="app-container">
                    <Sidebar 
                        activePage={activePage} 
                        setActivePage={setActivePage}
                        selectionCount={selection.length}
                    />
                    <div className="main-content">
                        {activePage === 'chat' && <ChatInterface selection={selection} />}
                        {activePage === 'rules' && <RulesPanel />}
                        {activePage === 'tasks' && <TasksPanel />}
                        {activePage === 'models' && <ModelsPanel />}
                        {activePage === 'project' && <ProjectPanel selection={selection} />}
                        {activePage === 'settings' && <SettingsPanel onOpenAuth={openAuthModal} />}
                    </div>
                    
                    {/* Auth Modal */}
                    <AuthModal 
                        isOpen={authModalOpen}
                        onClose={closeAuthModal}
                        initialMode={authModalMode}
                    />
                </div>
            </ModelProvider>
        </AuthProvider>
    )
}
