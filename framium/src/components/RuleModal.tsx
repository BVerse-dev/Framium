import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { useRulesService, Rule } from '../services/rulesService'

interface RuleModalProps {
  isOpen: boolean
  onClose: () => void
  onRuleCreated: (rule: Rule) => void
  onRuleUpdated: (rule: Rule) => void
  existingRule?: Rule | null
}

export function RuleModal({ isOpen, onClose, onRuleCreated, onRuleUpdated, existingRule }: RuleModalProps) {
  const { createRule, updateRule } = useRulesService()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: existingRule?.name || '',
    description: existingRule?.description || '',
    prompt: existingRule?.prompt || '',
    category: existingRule?.category || 'general' as Rule['category'],
    priority: existingRule?.priority || 0,
    fileTypes: existingRule?.conditions?.fileTypes?.join(', ') || '',
    contexts: existingRule?.conditions?.contexts?.join(', ') || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const conditions = {
        fileTypes: formData.fileTypes ? formData.fileTypes.split(',').map(t => t.trim()).filter(Boolean) : undefined,
        contexts: formData.contexts ? formData.contexts.split(',').map(c => c.trim()).filter(Boolean) : undefined
      }

      if (existingRule) {
        const updatedRule = await updateRule(existingRule.id, {
          name: formData.name,
          description: formData.description,
          prompt: formData.prompt,
          category: formData.category,
          priority: formData.priority,
          conditions: (conditions.fileTypes?.length || conditions.contexts?.length) ? conditions : undefined
        })
        if (updatedRule) {
          onRuleUpdated(updatedRule)
          onClose()
        }
      } else {
        const newRule = await createRule(
          formData.name,
          formData.description,
          formData.prompt,
          formData.category,
          (conditions.fileTypes?.length || conditions.contexts?.length) ? conditions : undefined,
          formData.priority
        )
        if (newRule) {
          onRuleCreated(newRule)
          onClose()
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="modal-content large">
        <div className="modal-header">
          <h3>{existingRule ? 'Edit Rule' : 'Create New Rule'}</h3>
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
            <label htmlFor="name">Rule Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Component Structure"
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
              placeholder="Brief description of what this rule does"
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Rule['category'] }))}
                disabled={loading}
              >
                <option value="general">General</option>
                <option value="coding">Coding</option>
                <option value="ui-design">UI Design</option>
                <option value="workflow">Workflow</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <input
                id="priority"
                type="number"
                min="0"
                max="100"
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prompt">AI Instruction *</label>
            <textarea
              id="prompt"
              value={formData.prompt}
              onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Write the instruction that the AI should follow when this rule is applied..."
              rows={4}
              required
              disabled={loading}
            />
            <small>This is the instruction that will be sent to the AI model when this rule is triggered.</small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fileTypes">File Types (Optional)</label>
              <input
                id="fileTypes"
                type="text"
                value={formData.fileTypes}
                onChange={(e) => setFormData(prev => ({ ...prev, fileTypes: e.target.value }))}
                placeholder=".tsx, .jsx, .ts, .js"
                disabled={loading}
              />
              <small>Comma-separated list of file extensions where this rule applies</small>
            </div>

            <div className="form-group">
              <label htmlFor="contexts">Contexts (Optional)</label>
              <input
                id="contexts"
                type="text"
                value={formData.contexts}
                onChange={(e) => setFormData(prev => ({ ...prev, contexts: e.target.value }))}
                placeholder="component, function, class"
                disabled={loading}
              />
              <small>Comma-separated list of code contexts where this rule applies</small>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button 
            type="submit" 
            form="ruleForm"
            className="gradient-button" 
            disabled={loading || !formData.name.trim() || !formData.prompt.trim()}
            onClick={handleSubmit}
          >
            {loading ? 'Saving...' : existingRule ? 'Update Rule' : 'Create Rule'}
          </button>
        </div>
      </div>
    </div>
  )
}
