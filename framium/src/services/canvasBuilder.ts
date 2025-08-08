/**
 * Framium Canvas Builder - Professional Edition
 * Industry-leading website template generation with advanced layout systems
 * Based on official Framer design system patterns and best practices
 */

import { framer } from 'framer-plugin'
import { addSVGToCanvas, getCanvasPermissionStatus } from './mutateCanvas'
import { professionalCanvasBuilder } from './professionalCanvasBuilder'
import { has } from './permissions'

export interface WebsiteSection {
  type: 'hero' | 'features' | 'about' | 'contact' | 'pricing' | 'testimonials'
  title: string
  content: string
  style?: {
    backgroundColor?: string
    textColor?: string
    padding?: number
    height?: number
  }
  elements?: Array<{
    type: 'text' | 'image' | 'button' | 'icon'
    content: string
    style?: Record<string, any>
  }>
}

export interface WebsiteTemplate {
  name: string
  theme: 'modern' | 'classic' | 'minimal' | 'bold'
  sections: WebsiteSection[]
  layout: {
    width: number
    responsive: boolean
    breakpoints?: {
      mobile: number
      tablet: number
      desktop: number
    }
  }
}

/**
 * Professional Canvas Builder for Website Templates
 */
export class FramiumCanvasBuilder {
  private initialized = false
  
  /**
   * Initialize professional canvas system
   */
  async initialize(): Promise<boolean> {
    try {
      console.log('Initializing professional canvas system...')
      
      // Check permissions first
      const permissionStatus = getCanvasPermissionStatus()
      if (!permissionStatus.canCreateFrames) {
        framer.notify('🔐 Canvas permissions required. Check plugin settings.')
        return false
      }

      // Initialize professional canvas builder
      const success = await professionalCanvasBuilder.initialize({
        width: 1200,
        height: 800,
        responsive: true,
        autoLayout: true
      })

      if (success) {
        this.initialized = true
        console.log('Professional canvas system ready')
        framer.notify('✅ Professional canvas ready for website generation')
        return true
      }

      return false
      
    } catch (error) {
      console.error('Canvas initialization failed:', error)
      framer.notify(`❌ Canvas setup failed: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * Build professional website template
   */
  async buildWebsiteTemplate(template: WebsiteTemplate): Promise<boolean> {
    if (!this.initialized) {
      console.log('Initializing canvas for website template...')
      const initSuccess = await this.initialize()
      if (!initSuccess) return false
    }

    try {
      console.log(`Building ${template.theme} website template: ${template.name}`)
      framer.notify(`🚀 Generating ${template.name} website...`)

      // Build sections in order
      for (const section of template.sections) {
        await this.buildSection(section, template.theme)
      }

      console.log('Website template built successfully')
      framer.notify('✅ Professional website template completed!')
      return true
      
    } catch (error) {
      console.error('Website template building failed:', error)
      framer.notify(`❌ Template building failed: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * Build individual website section
   */
  private async buildSection(section: WebsiteSection, theme: string): Promise<void> {
    console.log(`Building ${section.type} section: ${section.title}`)
    
    switch (section.type) {
      case 'hero':
        await this.buildHeroSection(section, theme)
        break
      case 'features':
        await this.buildFeaturesSection(section, theme)
        break
      case 'about':
        await this.buildAboutSection(section, theme)
        break
      case 'contact':
        await this.buildContactSection(section, theme)
        break
      case 'pricing':
        await this.buildPricingSection(section, theme)
        break
      case 'testimonials':
        await this.buildTestimonialsSection(section, theme)
        break
      default:
        await this.buildGenericSection(section, theme)
    }
  }

  /**
   * Build professional hero section
   */
  private async buildHeroSection(section: WebsiteSection, theme: string): Promise<void> {
    const themeColors = this.getThemeColors(theme)
    
    await professionalCanvasBuilder.addHeroSection(
      section.title,
      section.content,
      themeColors.heroBackground
    )
  }

  /**
   * Build professional features section  
   */
  private async buildFeaturesSection(section: WebsiteSection, _theme: string): Promise<void> {
    // Parse features from section content or elements
    const features = section.elements?.map(element => ({
      title: element.content.split('\n')[0] || 'Feature',
      description: element.content.split('\n')[1] || 'Feature description',
      icon: this.generateFeatureIcon(element.type)
    })) || [
      {
        title: section.title,
        description: section.content,
        icon: this.generateFeatureIcon('star')
      }
    ]

    await professionalCanvasBuilder.addFeatureSection(features)
  }

  /**
   * Build other section types
   */
  private async buildAboutSection(section: WebsiteSection, theme: string): Promise<void> {
    await professionalCanvasBuilder.addSection({
      name: section.title,
      backgroundColor: this.getThemeColors(theme).backgroundSecondary,
      padding: 80,
      gap: 32
    })
  }

  private async buildContactSection(section: WebsiteSection, theme: string): Promise<void> {
    await professionalCanvasBuilder.addSection({
      name: section.title,
      backgroundColor: this.getThemeColors(theme).backgroundPrimary,
      padding: 80,
      gap: 24
    })
  }

  private async buildPricingSection(section: WebsiteSection, theme: string): Promise<void> {
    await professionalCanvasBuilder.addSection({
      name: section.title,
      backgroundColor: this.getThemeColors(theme).backgroundSecondary,
      padding: 80,
      gap: 48
    })
  }

  private async buildTestimonialsSection(section: WebsiteSection, theme: string): Promise<void> {
    await professionalCanvasBuilder.addSection({
      name: section.title,
      backgroundColor: this.getThemeColors(theme).backgroundPrimary,
      padding: 80,
      gap: 32
    })
  }

  private async buildGenericSection(section: WebsiteSection, theme: string): Promise<void> {
    await professionalCanvasBuilder.addSection({
      name: section.title,
      backgroundColor: section.style?.backgroundColor || this.getThemeColors(theme).backgroundPrimary,
      padding: section.style?.padding || 60,
      gap: 24
    })
  }

  /**
   * Get theme-specific colors
   */
  private getThemeColors(theme: string) {
    const themes = {
      modern: {
        backgroundPrimary: '#FFFFFF',
        backgroundSecondary: '#F8F9FA',
        heroBackground: '#000000',
        textPrimary: '#000000',
        textSecondary: '#666666',
        accent: '#007AFF'
      },
      classic: {
        backgroundPrimary: '#FFFFFF',
        backgroundSecondary: '#F5F5F5',
        heroBackground: '#2C3E50',
        textPrimary: '#2C3E50',
        textSecondary: '#7F8C8D',
        accent: '#3498DB'
      },
      minimal: {
        backgroundPrimary: '#FFFFFF',
        backgroundSecondary: '#FAFAFA',
        heroBackground: '#000000',
        textPrimary: '#000000',
        textSecondary: '#888888',
        accent: '#000000'
      },
      bold: {
        backgroundPrimary: '#FFFFFF',
        backgroundSecondary: '#FF6B6B',
        heroBackground: '#FF6B6B',
        textPrimary: '#2C3E50',
        textSecondary: '#FFFFFF',
        accent: '#FF6B6B'
      }
    }

    return themes[theme as keyof typeof themes] || themes.modern
  }

  /**
   * Generate professional feature icons
   */
  private generateFeatureIcon(type: string): string {
    const icons = {
      star: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6z"/></svg>',
      check: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      heart: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
      shield: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
    }

    return icons[type as keyof typeof icons] || icons.star
  }

  /**
   * Add custom SVG component to canvas
   */
  async addSVGComponent(svgContent: string, name = 'Custom SVG'): Promise<boolean> {
    if (!has('addSVG')) {
      framer.notify('🔐 SVG permissions required')
      return false
    }

    try {
      const result = await addSVGToCanvas(svgContent, name)
      if (result) {
        console.log(`SVG component "${name}" added successfully`)
        framer.notify(`✅ ${name} added to canvas`)
        return true
      }
      return false
    } catch (error) {
      console.error('SVG component addition failed:', error)
      framer.notify(`❌ SVG addition failed: ${(error as Error).message}`)
      return false
    }
  }

  /**
   * Legacy static methods for backwards compatibility
   */
  static async addSVGComponent(svgContent: string, name = 'Generated Component'): Promise<boolean> {
    return framiumCanvasBuilder.addSVGComponent(svgContent, name)
  }

  static async buildSection(
    type: 'hero' | 'features' | 'pricing' | 'testimonials' | 'cta' | 'footer',
    options: { width?: number; height?: number } = {}
  ): Promise<boolean> {
    // Convert old section types to new professional system
    const template: WebsiteTemplate = {
      name: `${type} Template`,
      theme: 'modern',
      sections: [{
        type: type === 'cta' ? 'contact' : type === 'footer' ? 'about' : type,
        title: type.charAt(0).toUpperCase() + type.slice(1),
        content: `Professional ${type} section content`
      }],
      layout: {
        width: options.width || 1200,
        responsive: true
      }
    }

    return framiumCanvasBuilder.buildWebsiteTemplate(template)
  }

  /**
   * Get professional status information
   */
  getStatus() {
    return {
      initialized: this.initialized,
      permissions: getCanvasPermissionStatus(),
      canvasState: professionalCanvasBuilder.getCanvasState()
    }
  }
}

// Export singleton instance
export const framiumCanvasBuilder = new FramiumCanvasBuilder()

// Backwards compatibility exports
export const CanvasBuilder = {
  addSVGComponent: FramiumCanvasBuilder.addSVGComponent,
  buildSection: FramiumCanvasBuilder.buildSection
}

// Legacy export for backwards compatibility
export const addSVGToFramerCanvas = framiumCanvasBuilder.addSVGComponent.bind(framiumCanvasBuilder)
