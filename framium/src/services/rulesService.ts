import { db, auth } from '../lib/supabase'

export interface Rule {
  id: string
  name: string
  description: string
  prompt: string
  category: 'general' | 'coding' | 'ui-design' | 'workflow'
  enabled: boolean
  priority: number
  conditions?: {
    fileTypes?: string[]
    contexts?: string[]
  }
  created_at?: string
  updated_at?: string
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  steps: string[]
  category: 'component' | 'animation' | 'layout' | 'integration'
  enabled: boolean
  is_public?: boolean
  usage_count?: number
  created_at?: string
  updated_at?: string
}

export interface FineTuningProject {
  id: string
  name: string
  description: string
  base_model: string
  status: 'draft' | 'training' | 'completed' | 'failed'
  progress?: number
  training_data?: any
  model_config?: any
  deployed_model_id?: string
  training_started_at?: string
  completed_at?: string
  error_message?: string
  created_at?: string
  updated_at?: string
}

export class RulesService {
  // ==================== RULES MANAGEMENT ====================
  
  static async getRules(): Promise<Rule[]> {
    try {
      const { user } = await auth.getUser()
      if (!user) {
        return []
      }

      const { data, error } = await db.customRules.getUserRules(user.id)
      
      if (error) {
        console.error('Database error:', error)
        throw new Error(error.message)
      }

      return (data || []).map(this.transformRuleFromDB)
    } catch (error) {
      console.error('Failed to get rules:', error)
      return []
    }
  }

  static async createRule(
    name: string, 
    description: string, 
    prompt: string, 
    category: Rule['category'],
    conditions?: Rule['conditions'],
    priority: number = 0
  ): Promise<Rule | null> {
    try {
      const { user } = await auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await db.customRules.create({
        user_id: user.id,
        name,
        description,
        prompt,
        category,
        enabled: true,
        priority,
        conditions: conditions || null
      })

      if (error) throw new Error(error.message)
      return data ? this.transformRuleFromDB(data) : null
    } catch (error) {
      console.error('Failed to create rule:', error)
      throw error
    }
  }

  static async updateRule(ruleId: string, updates: Partial<Rule>): Promise<Rule | null> {
    try {
      const { data, error } = await db.customRules.update(ruleId, {
        name: updates.name,
        description: updates.description,
        prompt: updates.prompt,
        category: updates.category,
        enabled: updates.enabled,
        priority: updates.priority,
        conditions: updates.conditions || null
      })

      if (error) throw new Error(error.message)
      return data ? this.transformRuleFromDB(data) : null
    } catch (error) {
      console.error('Failed to update rule:', error)
      throw error
    }
  }

  static async deleteRule(ruleId: string): Promise<boolean> {
    try {
      const { error } = await db.customRules.delete(ruleId)
      if (error) throw new Error(error.message)
      return true
    } catch (error) {
      console.error('Failed to delete rule:', error)
      return false
    }
  }

  static async toggleRule(ruleId: string, enabled: boolean): Promise<Rule | null> {
    try {
      const { data, error } = await db.customRules.toggle(ruleId, enabled)
      if (error) throw new Error(error.message)
      return data ? this.transformRuleFromDB(data) : null
    } catch (error) {
      console.error('Failed to toggle rule:', error)
      throw error
    }
  }

  // ==================== WORKFLOWS MANAGEMENT ====================

  static async getWorkflows(): Promise<WorkflowTemplate[]> {
    try {
      const { user } = await auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await db.workflowTemplates.getUserWorkflows(user.id)
      
      // If table doesn't exist yet, return empty array instead of throwing
      if (error && error.message.includes('relation "workflow_templates" does not exist')) {
        console.warn('Workflow templates table not found. Please apply the rules schema to your Supabase database.')
        return []
      }
      
      if (error) throw new Error(error.message)

      return (data || []).map(this.transformWorkflowFromDB)
    } catch (error) {
      console.error('Failed to get workflows:', error)
      return []
    }
  }

  static async createWorkflow(
    name: string,
    description: string,
    steps: string[],
    category: WorkflowTemplate['category']
  ): Promise<WorkflowTemplate | null> {
    try {
      const { user } = await auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await db.workflowTemplates.create({
        user_id: user.id,
        name,
        description,
        steps: steps,
        category,
        enabled: true,
        is_public: false,
        usage_count: 0
      })

      if (error) throw new Error(error.message)
      return data ? this.transformWorkflowFromDB(data) : null
    } catch (error) {
      console.error('Failed to create workflow:', error)
      throw error
    }
  }

  static async updateWorkflow(workflowId: string, updates: Partial<WorkflowTemplate>): Promise<WorkflowTemplate | null> {
    try {
      const { data, error } = await db.workflowTemplates.update(workflowId, {
        name: updates.name,
        description: updates.description,
        steps: updates.steps,
        category: updates.category,
        enabled: updates.enabled,
        is_public: updates.is_public
      })

      if (error) throw new Error(error.message)
      return data ? this.transformWorkflowFromDB(data) : null
    } catch (error) {
      console.error('Failed to update workflow:', error)
      throw error
    }
  }

  static async deleteWorkflow(workflowId: string): Promise<boolean> {
    try {
      const { error } = await db.workflowTemplates.delete(workflowId)
      if (error) throw new Error(error.message)
      return true
    } catch (error) {
      console.error('Failed to delete workflow:', error)
      return false
    }
  }

  static async toggleWorkflow(workflowId: string, enabled: boolean): Promise<WorkflowTemplate | null> {
    try {
      const { data, error } = await db.workflowTemplates.toggle(workflowId, enabled)
      if (error) throw new Error(error.message)
      return data ? this.transformWorkflowFromDB(data) : null
    } catch (error) {
      console.error('Failed to toggle workflow:', error)
      throw error
    }
  }

  // ==================== FINE-TUNING MANAGEMENT ====================

  static async getFineTuningProjects(): Promise<FineTuningProject[]> {
    try {
      const { user } = await auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await db.fineTuningProjects.getUserProjects(user.id)
      if (error) throw new Error(error.message)

      return (data || []).map(this.transformFineTuningFromDB)
    } catch (error) {
      console.error('Failed to get fine-tuning projects:', error)
      return []
    }
  }

  static async createFineTuningProject(
    name: string,
    description: string,
    baseModel: string,
    trainingData?: any,
    modelConfig?: any
  ): Promise<FineTuningProject | null> {
    try {
      const { user } = await auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await db.fineTuningProjects.create({
        user_id: user.id,
        name,
        description,
        base_model: baseModel,
        status: 'draft',
        progress: 0,
        training_data: trainingData || null,
        model_config: modelConfig || null
      })

      if (error) throw new Error(error.message)
      return data ? this.transformFineTuningFromDB(data) : null
    } catch (error) {
      console.error('Failed to create fine-tuning project:', error)
      throw error
    }
  }

  static async updateFineTuningProject(projectId: string, updates: Partial<FineTuningProject>): Promise<FineTuningProject | null> {
    try {
      const { data, error } = await db.fineTuningProjects.update(projectId, {
        name: updates.name,
        description: updates.description,
        base_model: updates.base_model,
        training_data: updates.training_data,
        model_config: updates.model_config,
        error_message: updates.error_message
      })

      if (error) throw new Error(error.message)
      return data ? this.transformFineTuningFromDB(data) : null
    } catch (error) {
      console.error('Failed to update fine-tuning project:', error)
      throw error
    }
  }

  static async updateProjectStatus(
    projectId: string, 
    status: FineTuningProject['status'], 
    progress?: number
  ): Promise<FineTuningProject | null> {
    try {
      const { data, error } = await db.fineTuningProjects.updateStatus(projectId, status, progress)
      if (error) throw new Error(error.message)
      return data ? this.transformFineTuningFromDB(data) : null
    } catch (error) {
      console.error('Failed to update project status:', error)
      throw error
    }
  }

  static async deleteFineTuningProject(projectId: string): Promise<boolean> {
    try {
      const { error } = await db.fineTuningProjects.delete(projectId)
      if (error) throw new Error(error.message)
      return true
    } catch (error) {
      console.error('Failed to delete fine-tuning project:', error)
      return false
    }
  }

  // ==================== EXECUTION LOGGING ====================

  static async logRuleExecution(
    ruleId: string,
    context: any,
    inputPrompt: string,
    outputResult: string,
    tokensUsed: number = 0,
    executionTimeMs: number = 0,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    try {
      const { user } = await auth.getUser()
      if (!user) return

      await db.ruleExecutions.log(
        user.id,
        ruleId,
        context,
        inputPrompt,
        outputResult,
        tokensUsed,
        executionTimeMs,
        success,
        errorMessage
      )
    } catch (error) {
      console.error('Failed to log rule execution:', error)
    }
  }

  // ==================== HELPER METHODS ====================

  private static transformRuleFromDB(dbRule: any): Rule {
    return {
      id: dbRule.id,
      name: dbRule.name,
      description: dbRule.description || '',
      prompt: dbRule.prompt,
      category: dbRule.category || 'general',
      enabled: dbRule.enabled ?? true,
      priority: dbRule.priority || 0,
      conditions: dbRule.conditions ? JSON.parse(JSON.stringify(dbRule.conditions)) : undefined,
      created_at: dbRule.created_at,
      updated_at: dbRule.updated_at
    }
  }

  private static transformWorkflowFromDB(dbWorkflow: any): WorkflowTemplate {
    return {
      id: dbWorkflow.id,
      name: dbWorkflow.name,
      description: dbWorkflow.description || '',
      steps: Array.isArray(dbWorkflow.steps) ? dbWorkflow.steps : JSON.parse(dbWorkflow.steps || '[]'),
      category: dbWorkflow.category || 'component',
      enabled: dbWorkflow.enabled ?? true,
      is_public: dbWorkflow.is_public ?? false,
      usage_count: dbWorkflow.usage_count || 0,
      created_at: dbWorkflow.created_at,
      updated_at: dbWorkflow.updated_at
    }
  }

  private static transformFineTuningFromDB(dbProject: any): FineTuningProject {
    return {
      id: dbProject.id,
      name: dbProject.name,
      description: dbProject.description || '',
      base_model: dbProject.base_model,
      status: dbProject.status || 'draft',
      progress: dbProject.progress || 0,
      training_data: dbProject.training_data,
      model_config: dbProject.model_config,
      deployed_model_id: dbProject.deployed_model_id,
      training_started_at: dbProject.training_started_at,
      completed_at: dbProject.completed_at,
      error_message: dbProject.error_message,
      created_at: dbProject.created_at,
      updated_at: dbProject.updated_at
    }
  }
}

// Hook for easy integration in React components
export function useRulesService() {
  return {
    // Rules
    getRules: RulesService.getRules,
    createRule: RulesService.createRule,
    updateRule: RulesService.updateRule,
    deleteRule: RulesService.deleteRule,
    toggleRule: RulesService.toggleRule,
    
    // Workflows
    getWorkflows: RulesService.getWorkflows,
    createWorkflow: RulesService.createWorkflow,
    updateWorkflow: RulesService.updateWorkflow,
    deleteWorkflow: RulesService.deleteWorkflow,
    toggleWorkflow: RulesService.toggleWorkflow,
    
    // Fine-tuning
    getFineTuningProjects: RulesService.getFineTuningProjects,
    createFineTuningProject: RulesService.createFineTuningProject,
    updateFineTuningProject: RulesService.updateFineTuningProject,
    updateProjectStatus: RulesService.updateProjectStatus,
    deleteFineTuningProject: RulesService.deleteFineTuningProject,
    
    // Logging
    logRuleExecution: RulesService.logRuleExecution
  }
}
