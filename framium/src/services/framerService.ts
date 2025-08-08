/**
 * Framer Service - Professional Integration Layer
 * Industry-leading AI-powered canvas generation with proper permission handling
 * Based on official Framer plugin best practices and permission patterns
 */

import { framer } from 'framer-plugin'
import { framiumCanvasBuilder, WebsiteTemplate, WebsiteSection } from './canvasBuilder'
import { has, ensure, getPermissionStatus } from './permissions'
import { getCanvasPermissionStatus } from './mutateCanvas'

export interface AIWebsiteRequest {
  type: 'website' | 'component' | 'section'
  description: string
  style?: {
    theme: 'modern' | 'classic' | 'minimal' | 'bold'
    colors?: string[]
    layout?: 'single-page' | 'multi-section'
  }
  content?: {
    sections?: Array<{
      type: 'hero' | 'features' | 'about' | 'contact' | 'pricing' | 'testimonials'
      title: string
      content: string
    }>
    branding?: {
      companyName?: string
      tagline?: string
    }
  }
}

export interface AIResponse {
  success: boolean
  message: string
  generatedContent?: {
    template?: WebsiteTemplate
    sections?: WebsiteSection[]
    svgCode?: string
  }
  permissionIssues?: string[]
}

/**
 * Professional Framer Service with AI integration
 */
export class FramerService {
  private initialized = false

  /**
   * Initialize professional service with permission validation
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing professional Framer service...')
      
      // Comprehensive permission check
      const permissions = getPermissionStatus()
      const canvasPermissions = getCanvasPermissionStatus()
      
      if (!permissions.addSVG || !canvasPermissions.canCreateFrames) {
        framer.notify('🔐 Professional features require full canvas permissions. Check plugin settings.')
        return false
      }

      // Initialize canvas system
      const canvasReady = await framiumCanvasBuilder.initialize()
      if (!canvasReady) {
        return false
      }

      this.initialized = true
      console.log('Professional Framer service initialized successfully')
      framer.notify('✅ Professional AI canvas service ready')
      
      return true
      
    } catch (error) {
      console.error('Service initialization failed:', error)
      framer.notify(`❌ Service initialization failed: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * Execute AI-powered website generation request
   */
  async executeAIRequest(request: AIWebsiteRequest): Promise<AIResponse> {
    console.log('Processing AI request:', request.type, request.description)
    
    try {
      // Ensure service is initialized
      if (!this.initialized) {
        const initSuccess = await this.initialize()
        if (!initSuccess) {
          return {
            success: false,
            message: 'Service initialization failed. Please check permissions.',
            permissionIssues: ['Canvas access required']
          }
        }
      }

      // Professional permission validation
      if (!await this.validatePermissions(request)) {
        return {
          success: false,
          message: 'Insufficient permissions for requested operation',
          permissionIssues: this.getPermissionIssues(request)
        }
      }

      // Process request by type
      switch (request.type) {
        case 'website':
          return await this.generateWebsite(request)
        case 'section':
          return await this.generateSection(request)
        case 'component':
          return await this.generateComponent(request)
        default:
          return {
            success: false,
            message: `Unsupported request type: ${request.type}`
          }
      }
      
    } catch (error) {
      console.error('AI request execution failed:', error)
      return {
        success: false,
        message: `AI request failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * Legacy static method for backwards compatibility
   */
  static async executeAIRequest(input: string, _autoExecute: boolean = true): Promise<boolean> {
    const service = new FramerService()
    
    // Parse legacy input format
    const request: AIWebsiteRequest = {
      type: input.toLowerCase().includes('website') ? 'website' : 
            input.toLowerCase().includes('section') ? 'section' : 'component',
      description: input,
      style: { theme: 'modern' },
      content: {
        branding: {
          companyName: 'Your Company',
          tagline: 'Professional solutions'
        }
      }
    }

    const response = await service.executeAIRequest(request)
    
    if (response.success) {
      console.log('AI request completed successfully:', response.message)
      framer.notify(response.message)
      return true
    } else {
      console.error('AI request failed:', response.message)
      if (response.permissionIssues?.length) {
        framer.notify(`❌ Permission issues: ${response.permissionIssues.join(', ')}`)
      } else {
        framer.notify(`❌ ${response.message}`)
      }
      return false
    }
  }

  /**
   * Generate professional website template
   */
  private async generateWebsite(request: AIWebsiteRequest): Promise<AIResponse> {
    try {
      framer.notify('🚀 Generating professional website...')
      
      // Create professional website template
      const template: WebsiteTemplate = {
        name: request.content?.branding?.companyName || 'Professional Website',
        theme: request.style?.theme || 'modern',
        sections: this.generateWebsiteSections(request),
        layout: {
          width: 1200,
          responsive: true,
          breakpoints: {
            mobile: 375,
            tablet: 768,
            desktop: 1200
          }
        }
      }

      // Build template using professional canvas builder
      const success = await framiumCanvasBuilder.buildWebsiteTemplate(template)
      
      if (success) {
        console.log('Professional website generated successfully')
        return {
          success: true,
          message: 'Professional website template generated successfully',
          generatedContent: { template }
        }
      } else {
        return {
          success: false,
          message: 'Website generation failed. Check canvas permissions.'
        }
      }
      
    } catch (error) {
      console.error('Website generation failed:', error)
      return {
        success: false,
        message: `Website generation failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * Generate individual section
   */
  private async generateSection(request: AIWebsiteRequest): Promise<AIResponse> {
    try {
      framer.notify('🎨 Generating professional section...')
      
      const sections = this.generateWebsiteSections(request)
      if (sections.length === 0) {
        return {
          success: false,
          message: 'No valid sections found in request'
        }
      }

      // Build first section
      const section = sections[0]
      const template: WebsiteTemplate = {
        name: `${section.type} Section`,
        theme: request.style?.theme || 'modern',
        sections: [section],
        layout: { width: 1200, responsive: true }
      }

      const success = await framiumCanvasBuilder.buildWebsiteTemplate(template)
      
      return {
        success,
        message: success 
          ? 'Professional section generated successfully'
          : 'Section generation failed',
        generatedContent: { sections: [section] }
      }
      
    } catch (error) {
      console.error('Section generation failed:', error)
      return {
        success: false,
        message: `Section generation failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * Generate custom component
   */
  private async generateComponent(request: AIWebsiteRequest): Promise<AIResponse> {
    try {
      framer.notify('⚡ Generating custom component...')
      
      // Generate professional SVG component
      const svgCode = this.generateComponentSVG(request)
      const componentName = this.extractComponentName(request.description)
      
      const success = await framiumCanvasBuilder.addSVGComponent(svgCode, componentName)
      
      return {
        success,
        message: success 
          ? `Professional ${componentName} component generated`
          : 'Component generation failed',
        generatedContent: { svgCode }
      }
      
    } catch (error) {
      console.error('Component generation failed:', error)
      return {
        success: false,
        message: `Component generation failed: ${(error as Error).message}`
      }
    }
  }

  /**
   * Generate website sections from AI request
   */
  private generateWebsiteSections(request: AIWebsiteRequest): WebsiteSection[] {
    // Use provided sections or generate default ones
    if (request.content?.sections && request.content.sections.length > 0) {
      return request.content.sections.map(section => ({
        type: section.type,
        title: section.title,
        content: section.content,
        style: {
          backgroundColor: request.style?.colors?.[0] || '#FFFFFF',
          textColor: '#000000',
          padding: 80
        }
      }))
    }

    // Generate default professional sections
    const companyName = request.content?.branding?.companyName || 'Your Company'
    const tagline = request.content?.branding?.tagline || 'Professional solutions for modern businesses'

    return [
      {
        type: 'hero',
        title: `Welcome to ${companyName}`,
        content: tagline,
        style: { backgroundColor: '#000000', textColor: '#FFFFFF', padding: 100 }
      },
      {
        type: 'features',
        title: 'Our Features',
        content: 'Discover what makes us different',
        elements: [
          { type: 'text', content: 'Professional Quality\nIndustry-leading standards' },
          { type: 'text', content: 'Fast Delivery\nQuick turnaround times' },
          { type: 'text', content: 'Expert Support\n24/7 customer service' }
        ]
      },
      {
        type: 'about',
        title: `About ${companyName}`,
        content: 'We are dedicated to providing exceptional service and innovative solutions.'
      },
      {
        type: 'contact',
        title: 'Get In Touch',
        content: 'Ready to start your project? Contact us today for a consultation.'
      }
    ]
  }

  /**
   * Generate professional SVG component
   */
  private generateComponentSVG(request: AIWebsiteRequest): string {
    const width = 300
    const height = 200
    const theme = request.style?.theme || 'modern'
    
    const colors = this.getThemeColors(theme)
    const componentName = this.extractComponentName(request.description)

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="${width}" height="${height}" fill="${colors.background}" rx="12" stroke="${colors.border}" stroke-width="1"/>
  <text x="${width/2}" y="${height/2 - 10}" text-anchor="middle" fill="${colors.text}" font-family="Inter, -apple-system, sans-serif" font-size="18" font-weight="600">${componentName}</text>
  <text x="${width/2}" y="${height/2 + 15}" text-anchor="middle" fill="${colors.textSecondary}" font-family="Inter, -apple-system, sans-serif" font-size="14">Professional Component</text>
  <rect x="${width/2 - 40}" y="${height/2 + 30}" width="80" height="32" fill="${colors.accent}" rx="6"/>
  <text x="${width/2}" y="${height/2 + 50}" text-anchor="middle" fill="#FFFFFF" font-family="Inter, -apple-system, sans-serif" font-size="12" font-weight="500">Action</text>
</svg>`
  }

  /**
   * Get theme colors for components
   */
  private getThemeColors(theme: string) {
    const themes = {
      modern: { background: '#FFFFFF', border: '#E5E7EB', text: '#1F2937', textSecondary: '#6B7280', accent: '#3B82F6' },
      classic: { background: '#FFFFFF', border: '#D1D5DB', text: '#374151', textSecondary: '#6B7280', accent: '#059669' },
      minimal: { background: '#FAFAFA', border: '#E5E5E5', text: '#171717', textSecondary: '#737373', accent: '#000000' },
      bold: { background: '#FFFFFF', border: '#EF4444', text: '#DC2626', textSecondary: '#991B1B', accent: '#EF4444' }
    }
    return themes[theme as keyof typeof themes] || themes.modern
  }

  /**
   * Extract component name from description
   */
  private extractComponentName(description: string): string {
    // Simple extraction - in a real implementation, this could use AI
    const words = description.toLowerCase().split(' ')
    const componentWords = words.filter(word => 
      ['button', 'card', 'header', 'footer', 'navigation', 'menu', 'form', 'modal'].includes(word)
    )
    
    return componentWords.length > 0 
      ? componentWords[0].charAt(0).toUpperCase() + componentWords[0].slice(1)
      : 'Custom Component'
  }

  /**
   * Validate permissions for request
   */
  private async validatePermissions(request: AIWebsiteRequest): Promise<boolean> {
    const requiredPermissions = ['addSVG', 'createFrameNode']
    
    if (request.type === 'website' || request.type === 'section') {
      requiredPermissions.push('Node.setAttributes')
    }

    return await ensure(...requiredPermissions)
  }

  /**
   * Get permission issues for request
   */
  private getPermissionIssues(request: AIWebsiteRequest): string[] {
    const issues: string[] = []
    
    if (!has('addSVG')) issues.push('SVG creation permission required')
    if (!has('createFrameNode')) issues.push('Frame creation permission required')
    
    if (request.type === 'website' || request.type === 'section') {
      if (!has('Node.setAttributes')) issues.push('Node modification permission required')
    }

    return issues
  }

  /**
   * Get professional service status
   */
  getStatus() {
    return {
      initialized: this.initialized,
      permissions: getPermissionStatus(),
      canvasPermissions: getCanvasPermissionStatus(),
      canvasBuilder: framiumCanvasBuilder.getStatus()
    }
  }
}

// Export singleton instance
export const framerService = new FramerService()

// Legacy function for backwards compatibility
export async function executeAIRequest(
  prompt: string,
  _aiModel = 'gpt-4',
  requestType: 'component' | 'section' | 'website' = 'component'
): Promise<boolean> {
  const request: AIWebsiteRequest = {
    type: requestType,
    description: prompt,
    style: { theme: 'modern' }
  }

  const response = await framerService.executeAIRequest(request)
  
  if (response.success) {
    console.log('AI request completed successfully:', response.message)
    return true
  } else {
    console.error('AI request failed:', response.message)
    if (response.permissionIssues?.length) {
      framer.notify(`❌ Permission issues: ${response.permissionIssues.join(', ')}`)
    }
    return false
  }
}
