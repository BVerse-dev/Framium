import { useState, useEffect } from 'react'
import { Play, Pause, Trash2, CheckCircle, Clock, AlertCircle, Brain, Plus } from 'lucide-react'
import { framer } from 'framer-plugin'
import { useAuth } from '../contexts/AuthContext'
import { useModel } from '../contexts/ModelContext'

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused'
  progress: number
  steps: TaskStep[]
  createdAt: Date
  completedAt?: Date
  model: string
  estimatedTime?: string
}

interface TaskStep {
  id: string
  title: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: string
  error?: string
}

export function TasksPanel() {
  const { user } = useAuth()
  const { selectedModel } = useModel()
  const [tasks, setTasks] = useState<Task[]>(() => {
    // Load tasks from localStorage on init
    const savedTasks = localStorage.getItem('framium-tasks')
    if (savedTasks) {
      try {
        return JSON.parse(savedTasks).map((task: any) => ({
          ...task,
          createdAt: new Date(task.createdAt),
          completedAt: task.completedAt ? new Date(task.completedAt) : undefined
        }))
      } catch {
        return []
      }
    }
    return []
  })
  const [showNewTaskModal, setShowNewTaskModal] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('framium-tasks', JSON.stringify(tasks))
  }, [tasks])

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'running': return <Clock size={25} className="text-blue-400" />
      case 'completed': return <CheckCircle size={25} className="text-green-400" />
      case 'failed': return <AlertCircle size={25} className="text-red-400" />
      case 'paused': return <Pause size={25} className="text-yellow-400" />
      default: return <Clock size={25} className="text-gray-400" />
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'running': return '#3b82f6'
      case 'completed': return '#10b981'
      case 'failed': return '#ef4444'
      case 'paused': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      description: newTaskDescription,
      status: 'pending',
      progress: 0,
      model: selectedModel.name,
      createdAt: new Date(),
      steps: [
        { id: 'step-1', title: 'Analyzing requirements...', status: 'pending' },
        { id: 'step-2', title: 'Planning structure...', status: 'pending' },
        { id: 'step-3', title: 'Generating components...', status: 'pending' },
        { id: 'step-4', title: 'Applying to canvas...', status: 'pending' }
      ]
    }

    setTasks(prev => [newTask, ...prev])
    setShowNewTaskModal(false)
    setNewTaskTitle('')
    setNewTaskDescription('')

    // Simulate task execution
    simulateTaskExecution(newTask.id)
    framer.notify(`🚀 Started task: ${newTask.title}`)
  }

  const simulateTaskExecution = (taskId: string) => {
    // Update task to running
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: 'running' as const } : task
    ))

    // Enhanced step-by-step progress simulation
    let currentStep = 0
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          const updatedSteps = [...task.steps]
          if (updatedSteps[currentStep]) {
            updatedSteps[currentStep].status = 'completed'
            updatedSteps[currentStep].result = getStepResult(updatedSteps[currentStep].title, task.title)
          }
          
          currentStep++
          const progress = (currentStep / task.steps.length) * 100
          
          if (currentStep >= task.steps.length) {
            clearInterval(interval)
            
            // Generate final result based on task type
            generateTaskResult(task.title, task.description)
            
            return {
              ...task,
              status: 'completed' as const,
              progress: 100,
              completedAt: new Date(),
              steps: updatedSteps
            }
          }
          
          if (updatedSteps[currentStep]) {
            updatedSteps[currentStep].status = 'running'
          }
          
          return {
            ...task,
            progress,
            steps: updatedSteps
          }
        }
        return task
      }))
    }, 2000)
  }

  const getStepResult = (stepTitle: string, taskTitle: string): string => {
    const results = {
      'Analyzing requirements': `Analyzed "${taskTitle}" - identified key components and user flows`,
      'Planning structure': 'Created component hierarchy and layout structure',
      'Generating components': 'Generated React components with TypeScript',
      'Applying to canvas': 'Applied components to Framer canvas successfully'
    }
    
    return results[stepTitle as keyof typeof results] || `Completed: ${stepTitle}`
  }

  const generateTaskResult = (title: string, description: string) => {
    // TODO: In production, this would trigger real AI generation
    console.log('Task completed:', { title, description })
    framer.notify(`🎉 Task "${title}" completed successfully!`)
    
    // Simulate adding result to canvas
    setTimeout(() => {
      const componentType = title.toLowerCase().includes('landing') ? 'landing-page' : 
                           title.toLowerCase().includes('component') ? 'component-library' : 'general'
      framer.notify(`📋 ${componentType} added to your canvas`)
    }, 1000)
  }

  const handlePauseTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId && task.status === 'running'
        ? { ...task, status: 'paused' as const }
        : task
    ))
  }

  const handleResumeTask = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId && task.status === 'paused'
        ? { ...task, status: 'running' as const }
        : task
    ))
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>
          <span className="gradient-icon tasks">🧠</span>
          AI Tasks
        </h2>
        <p>Multi-step agent workflows and automation</p>
        <button 
          className="gradient-button small"
          onClick={() => setShowNewTaskModal(true)}
          style={{ marginTop: 12 }}
        >
          <Plus size={14} />
          New Task
        </button>
      </div>

      {/* Usage Info */}
      {user && (
        <div className="usage-info">
          <div className="usage-stat">
            <span className="usage-label">Active Tasks:</span>
            <span className="usage-value">{tasks.filter(t => t.status === 'running').length}</span>
          </div>
          <div className="usage-stat">
            <span className="usage-label">Model:</span>
            <span className="usage-value">{selectedModel.name}</span>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="tasks-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <Brain size={48} style={{ opacity: 0.3 }} />
            <p>No active tasks</p>
            <span>Create a new task to get started with AI automation</span>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="task-info">
                  {getStatusIcon(task.status)}
                  <div>
                    <h4>{task.title}</h4>
                    <p>{task.description}</p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${task.progress}%`,
                      backgroundColor: getStatusColor(task.status)
                    }}
                  />
                </div>
                <div className="progress-footer">
                  <span className="progress-text">{Math.round(task.progress)}%</span>
                  <div className="task-actions">
                    {task.status === 'running' && (
                      <button onClick={() => handlePauseTask(task.id)} title="Pause">
                        <Pause size={16} />
                      </button>
                    )}
                    {task.status === 'paused' && (
                      <button onClick={() => handleResumeTask(task.id)} title="Resume">
                        <Play size={16} />
                      </button>
                    )}
                    {(task.status === 'running' || task.status === 'paused') && (
                      <div className="action-separator"></div>
                    )}
                    <button onClick={() => handleDeleteTask(task.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div className="task-steps">
                {task.steps.map(step => (
                  <div key={step.id} className={`step-item ${step.status}`}>
                    <div className="step-indicator" />
                    <span>{step.title}</span>
                  </div>
                ))}
              </div>

              {/* Meta Info */}
              <div className="task-meta">
                <span>Model: {task.model}</span>
                <span>{formatTimeAgo(task.createdAt)}</span>
                {task.estimatedTime && task.status === 'running' && (
                  <span>ETA: {task.estimatedTime}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="modal-overlay" onClick={() => setShowNewTaskModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Create New AI Task</h3>
            <div className="form-group">
              <label>Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Create pricing page"
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Describe what you want the AI to build..."
                className="input-field"
                rows={3}
              />
            </div>
            <div className="modal-footer">
              <button 
                className="gradient-button"
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim()}
              >
                Create Task
              </button>
              <button 
                className="secondary-button"
                onClick={() => setShowNewTaskModal(false)}
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
