import { useState } from 'react'
import { X, Plus, Trash2, AlertCircle, GripVertical } from 'lucide-react'
import { useRulesService, WorkflowTemplate } from '../services/rulesService'

interface WorkflowModalProps {
  isOpen: boolean
  onClose: () => void
  onWorkflowCreated: (workflow: WorkflowTemplate) => void
  onWorkflowUpdated: (workflow: WorkflowTemplate) => void
  existingWorkflow?: WorkflowTemplate | null
}

export function WorkflowModal({ isOpen, onClose, onWorkflowCreated, onWorkflowUpdated, existingWorkflow }: WorkflowModalProps) {
  const { createWorkflow, updateWorkflow } = useRulesService()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: existingWorkflow?.name || '',
    description: existingWorkflow?.description || '',
    category: existingWorkflow?.category || 'component' as WorkflowTemplate['category'],
    steps: existingWorkflow?.steps || ['']
  })

  const addStep = () => {
    setFormData(prev => ({
      ...prev,
      steps: [...prev.steps, '']
    }))
  }

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter((_, i) => i !== index)
    }))
  }

  const updateStep = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.map((step, i) => i === index ? value : step)
    }))
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    setFormData(prev => {
      const newSteps = [...prev.steps]
      const [movedStep] = newSteps.splice(fromIndex, 1)
      newSteps.splice(toIndex, 0, movedStep)
      return { ...prev, steps: newSteps }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const validSteps = formData.steps.filter(step => step.trim())
      
      if (validSteps.length === 0) {
        setError('At least one step is required')
        setLoading(false)
        return
      }

      if (existingWorkflow) {
        const updatedWorkflow = await updateWorkflow(existingWorkflow.id, {
          name: formData.name,
          description: formData.description,
          category: formData.category,
          steps: validSteps
        })
        if (updatedWorkflow) {
          onWorkflowUpdated(updatedWorkflow)
          onClose()
        }
      } else {
        const newWorkflow = await createWorkflow(
          formData.name,
          formData.description,
          validSteps,
          formData.category
        )
        if (newWorkflow) {
          onWorkflowCreated(newWorkflow)
          onClose()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save workflow')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{existingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div className="error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">Workflow Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Component Creation"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this workflow does"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as WorkflowTemplate['category'] }))}
              disabled={loading}
            >
              <option value="component">Component</option>
              <option value="animation">Animation</option>
              <option value="layout">Layout</option>
              <option value="integration">Integration</option>
            </select>
          </div>

          <div className="form-group">
            <label>Workflow Steps *</label>
            <div className="workflow-steps-editor">
              {formData.steps.map((step, index) => (
                <div key={index} className="step-editor">
                  <div className="step-handle">
                    <GripVertical size={16} />
                    <span className="step-number">{index + 1}</span>
                  </div>
                  <textarea
                    value={step}
                    onChange={(e) => updateStep(index, e.target.value)}
                    placeholder={`Step ${index + 1}: Describe what should happen...`}
                    rows={2}
                    disabled={loading}
                  />
                  <div className="step-actions">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => moveStep(index, index - 1)}
                        className="icon-button"
                        disabled={loading}
                      >
                        ↑
                      </button>
                    )}
                    {index < formData.steps.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveStep(index, index + 1)}
                        className="icon-button"
                        disabled={loading}
                      >
                        ↓
                      </button>
                    )}
                    {formData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="icon-button text-red-400"
                        disabled={loading}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addStep}
                className="add-step-button"
                disabled={loading}
              >
                <Plus size={16} />
                Add Step
              </button>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            type="submit" 
            className="gradient-button" 
            disabled={loading || !formData.name.trim() || formData.steps.filter(s => s.trim()).length === 0}
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : existingWorkflow ? 'Update Workflow' : 'Create Workflow'}
          </button>
        </div>
      </div>
    </div>
  )
}
