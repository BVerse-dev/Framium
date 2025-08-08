import { useState, useEffect } from 'react'
import { 
  Settings, 
  Plus, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  Brain, 
  Code, 
  Palette, 
  Zap, 
  Crown, 
  Lock,
  ToggleLeft,
  ToggleRight,
  AlertCircle,
  CheckCircle2,
  Loader
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useRulesService, Rule, WorkflowTemplate, FineTuningProject } from '../services/rulesService'
import { RuleModal } from './RuleModal'
import { WorkflowModal } from './WorkflowModal'

export function RulesPanel() {
  const { user } = useAuth()
  const rulesService = useRulesService()
  
  const [activeTab, setActiveTab] = useState<'rules' | 'workflows' | 'finetuning'>('rules')
  const [expandedSections, setExpandedSections] = useState<string[]>(['general'])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Data state
  const [rules, setRules] = useState<Rule[]>([])
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([])
  const [fineTuningProjects, setFineTuningProjects] = useState<FineTuningProject[]>([])
  
  // Modal state
  const [ruleModalOpen, setRuleModalOpen] = useState(false)
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<Rule | null>(null)
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowTemplate | null>(null)

  // Load data on mount and tab change
  useEffect(() => {
    loadData()
  }, [activeTab])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      if (activeTab === 'rules') {
        const rulesData = await rulesService.getRules()
        setRules(rulesData)
      } else if (activeTab === 'workflows') {
        const workflowsData = await rulesService.getWorkflows()
        setWorkflows(workflowsData)
      } else if (activeTab === 'finetuning') {
        const projectsData = await rulesService.getFineTuningProjects()
        setFineTuningProjects(projectsData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      const updatedRule = await rulesService.toggleRule(ruleId, enabled)
      if (updatedRule) {
        setRules(prev => prev.map(rule => 
          rule.id === ruleId ? updatedRule : rule
        ))
      }
    } catch (err) {
      console.error('Failed to toggle rule:', err)
    }
  }

  const handleToggleWorkflow = async (workflowId: string, enabled: boolean) => {
    try {
      const updatedWorkflow = await rulesService.toggleWorkflow(workflowId, enabled)
      if (updatedWorkflow) {
        setWorkflows(prev => prev.map(workflow => 
          workflow.id === workflowId ? updatedWorkflow : workflow
        ))
      }
    } catch (err) {
      console.error('Failed to toggle workflow:', err)
    }
  }

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      try {
        const success = await rulesService.deleteRule(ruleId)
        if (success) {
          setRules(prev => prev.filter(rule => rule.id !== ruleId))
        }
      } catch (err) {
        console.error('Failed to delete rule:', err)
      }
    }
  }

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (confirm('Are you sure you want to delete this workflow?')) {
      try {
        const success = await rulesService.deleteWorkflow(workflowId)
        if (success) {
          setWorkflows(prev => prev.filter(workflow => workflow.id !== workflowId))
        }
      } catch (err) {
        console.error('Failed to delete workflow:', err)
      }
    }
  }

  const openEditRule = (rule: Rule) => {
    setEditingRule(rule)
    setRuleModalOpen(true)
  }

  const openEditWorkflow = (workflow: WorkflowTemplate) => {
    setEditingWorkflow(workflow)
    setWorkflowModalOpen(true)
  }

  const handleRuleCreated = (newRule: Rule) => {
    setRules(prev => [newRule, ...prev])
  }

  const handleRuleUpdated = (updatedRule: Rule) => {
    setRules(prev => prev.map(rule => 
      rule.id === updatedRule.id ? updatedRule : rule
    ))
  }

  const handleWorkflowCreated = (newWorkflow: WorkflowTemplate) => {
    setWorkflows(prev => [newWorkflow, ...prev])
  }

  const handleWorkflowUpdated = (updatedWorkflow: WorkflowTemplate) => {
    setWorkflows(prev => prev.map(workflow => 
      workflow.id === updatedWorkflow.id ? updatedWorkflow : workflow
    ))
  }

  const canAccessFineTuning = user?.plan === 'Ultimate'

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'general': return <Settings size={16} />
      case 'coding': return <Code size={16} />
      case 'ui-design': return <Palette size={16} />
      case 'workflow': return <Zap size={16} />
      default: return <Settings size={16} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#10b981'
      case 'training': return '#3b82f6'
      case 'failed': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = []
    acc[rule.category].push(rule)
    return acc
  }, {} as Record<string, Rule[]>)

  const workflowsByCategory = workflows.reduce((acc, workflow) => {
    if (!acc[workflow.category]) acc[workflow.category] = []
    acc[workflow.category].push(workflow)
    return acc
  }, {} as Record<string, WorkflowTemplate[]>)

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>
          <span className="gradient-icon">⚡</span>
          Rules & Workflow
        </h2>
        <p>Configure AI behavior, custom instructions, and workflow automation</p>
      </div>

      {/* Navigation Tabs */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          <Settings size={16} />
          <span>Custom Rules</span>
        </button>
        <button
          className={`settings-tab ${activeTab === 'workflows' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflows')}
        >
          <Zap size={16} />
          <span>Workflows</span>
        </button>
        <button
          className={`settings-tab ${activeTab === 'finetuning' ? 'active' : ''}`}
          onClick={() => setActiveTab('finetuning')}
        >
          <Brain size={16} />
          <span>Fine-tuning</span>
          {!canAccessFineTuning && <Lock size={12} />}
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="settings-content">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
            <Loader size={24} className="animate-spin" />
            <span style={{ marginLeft: '12px' }}>Loading...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="settings-content">
          <div className="error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={loadData} className="secondary-button small" style={{ marginLeft: 'auto' }}>
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Custom Rules Tab */}
      {!loading && !error && activeTab === 'rules' && (
        <div className="settings-content">
          <div className="section-header">
            <div>
              <h3>Custom Rules & Instructions</h3>
              <p>Define how AI models should behave in different contexts</p>
            </div>
            <button 
              className="gradient-button small"
              onClick={() => {
                setEditingRule(null)
                setRuleModalOpen(true)
              }}
            >
              <Plus size={14} />
              Add Rule
            </button>
          </div>

          {Object.keys(rulesByCategory).length === 0 ? (
            <div className="empty-state">
              <Settings size={48} />
              <p>No custom rules yet. Create your first<br />rule to get started.</p>
            </div>
          ) : (
            Object.entries(rulesByCategory).map(([category, categoryRules]) => (
              <div key={category} className="collapsible-section">
                <button
                  className="section-toggle"
                  onClick={() => toggleSection(category)}
                >
                  {expandedSections.includes(category) ? 
                    <ChevronDown size={16} /> : <ChevronRight size={16} />
                  }
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category.replace('-', ' ')}</span>
                  <span className="rule-count">{categoryRules.length}</span>
                </button>

                {expandedSections.includes(category) && (
                  <div className="section-content">
                    {categoryRules.map(rule => (
                      <div key={rule.id} className="rule-card">
                        <div className="rule-header">
                          <div className="rule-info">
                            <h4>{rule.name}</h4>
                            <p>{rule.description}</p>
                          </div>
                          <div className="rule-actions">
                            <button
                              className="toggle-button"
                              onClick={() => handleToggleRule(rule.id, !rule.enabled)}
                            >
                              {rule.enabled ? 
                                <ToggleRight size={20} className="text-green-400" /> :
                                <ToggleLeft size={20} className="text-gray-400" />
                              }
                            </button>
                            <button 
                              className="icon-button"
                              onClick={() => openEditRule(rule)}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              className="icon-button text-red-400"
                              onClick={() => handleDeleteRule(rule.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="rule-prompt">
                          <div className="prompt-label">Instruction:</div>
                          <div className="prompt-text">{rule.prompt}</div>
                        </div>

                        {rule.conditions && (
                          <div className="rule-conditions">
                            <div className="condition-label">Conditions:</div>
                            {rule.conditions.fileTypes && (
                              <div className="condition-tags">
                                {rule.conditions.fileTypes.map(type => (
                                  <span key={type} className="condition-tag">{type}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="rule-status">
                          {rule.enabled ? (
                            <span className="status-badge active">
                              <CheckCircle2 size={12} />
                              Active
                            </span>
                          ) : (
                            <span className="status-badge inactive">
                              <AlertCircle size={12} />
                              Inactive
                            </span>
                          )}
                          <span className="priority-badge">Priority {rule.priority}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Workflows Tab */}
      {!loading && !error && activeTab === 'workflows' && (
        <div className="settings-content">
          <div className="section-header">
            <div>
              <h3>Workflow Templates</h3>
              <p>Automate complex tasks with predefined workflows</p>
            </div>
            <button 
              className="gradient-button small"
              onClick={() => {
                setEditingWorkflow(null)
                setWorkflowModalOpen(true)
              }}
            >
              <Plus size={14} />
              Create Workflow
            </button>
          </div>

          {Object.keys(workflowsByCategory).length === 0 ? (
            <div className="empty-state">
              <Zap size={48} />
              <p>No workflows yet. Create your first workflow to automate tasks.</p>
            </div>
          ) : (
            Object.entries(workflowsByCategory).map(([category, categoryWorkflows]) => (
              <div key={category} className="collapsible-section">
                <button
                  className="section-toggle"
                  onClick={() => toggleSection(`workflow-${category}`)}
                >
                  {expandedSections.includes(`workflow-${category}`) ? 
                    <ChevronDown size={16} /> : <ChevronRight size={16} />
                  }
                  {getCategoryIcon(category)}
                  <span className="capitalize">{category}</span>
                  <span className="rule-count">{categoryWorkflows.length}</span>
                </button>

                {expandedSections.includes(`workflow-${category}`) && (
                  <div className="section-content">
                    {categoryWorkflows.map(workflow => (
                      <div key={workflow.id} className="workflow-card">
                        <div className="workflow-header">
                          <div className="workflow-info">
                            <h4>{workflow.name}</h4>
                            <p>{workflow.description}</p>
                          </div>
                          <div className="workflow-actions">
                            <button
                              className="toggle-button"
                              onClick={() => handleToggleWorkflow(workflow.id, !workflow.enabled)}
                            >
                              {workflow.enabled ? 
                                <ToggleRight size={20} className="text-green-400" /> :
                                <ToggleLeft size={20} className="text-gray-400" />
                              }
                            </button>
                            <button 
                              className="icon-button"
                              onClick={() => openEditWorkflow(workflow)}
                            >
                              <Edit3 size={14} />
                            </button>
                            <button 
                              className="icon-button text-red-400"
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <div className="workflow-steps">
                          <div className="steps-label">Steps:</div>
                          <ol className="steps-list">
                            {workflow.steps.map((step, index) => (
                              <li key={index} className="step-item">{step}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Fine-tuning Tab */}
      {!loading && !error && activeTab === 'finetuning' && (
        <div className="settings-content">
          {!canAccessFineTuning ? (
            <div className="locked-section">
              <div className="lock-icon">
                <Crown size={48} />
              </div>
              <h3>Ultimate Plan Required</h3>
              <p>Custom model fine-tuning is available exclusively for Ultimate plan subscribers.</p>
              <div className="locked-features">
                <div className="feature-item">
                  <CheckCircle2 size={16} />
                  <span>Train models on your specific use cases</span>
                </div>
                <div className="feature-item">
                  <CheckCircle2 size={16} />
                  <span>Specialized Framer component generation</span>
                </div>
                <div className="feature-item">
                  <CheckCircle2 size={16} />
                  <span>Custom prompt optimization</span>
                </div>
                <div className="feature-item">
                  <CheckCircle2 size={16} />
                  <span>Enterprise-grade model management</span>
                </div>
              </div>
              <button className="gradient-button">
                <Crown size={16} />
                Upgrade to Ultimate
              </button>
            </div>
          ) : (
            <>
              <div className="section-header">
                <div>
                  <h3>Model Fine-tuning</h3>
                  <p>Create specialized models trained on your specific requirements</p>
                </div>
                <button className="gradient-button small">
                  <Plus size={14} />
                  New Project
                </button>
              </div>

              {fineTuningProjects.length === 0 ? (
                <div className="empty-state">
                  <Brain size={48} />
                  <p>No fine-tuning projects yet. Create your first project to get started.</p>
                </div>
              ) : (
                <div className="finetuning-projects">
                  {fineTuningProjects.map(project => (
                    <div key={project.id} className="finetuning-card">
                      <div className="project-header">
                        <div className="project-info">
                          <h4>{project.name}</h4>
                          <p>{project.description}</p>
                          <div className="project-meta">
                            <span>Base: {project.base_model}</span>
                            <span>Created: {project.created_at}</span>
                          </div>
                        </div>
                        <div className="project-status">
                          <span 
                            className="status-indicator"
                            style={{ backgroundColor: getStatusColor(project.status) }}
                          >
                            {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {project.status === 'training' && project.progress && (
                        <div className="training-progress">
                          <div className="progress-header">
                            <span>Training Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="project-actions">
                        <button className="secondary-button small">View Details</button>
                        {project.status === 'completed' && (
                          <button className="gradient-button small">Deploy</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modals */}
      <RuleModal
        isOpen={ruleModalOpen}
        onClose={() => {
          setRuleModalOpen(false)
          setEditingRule(null)
        }}
        onRuleCreated={handleRuleCreated}
        onRuleUpdated={handleRuleUpdated}
        existingRule={editingRule}
      />

      <WorkflowModal
        isOpen={workflowModalOpen}
        onClose={() => {
          setWorkflowModalOpen(false)
          setEditingWorkflow(null)
        }}
        onWorkflowCreated={handleWorkflowCreated}
        onWorkflowUpdated={handleWorkflowUpdated}
        existingWorkflow={editingWorkflow}
      />
    </div>
  )
}
