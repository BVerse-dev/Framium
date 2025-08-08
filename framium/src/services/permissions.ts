/**
 * Framium – Professional Permission Management
 * Industry-leading permission handling based on official Framer plugin patterns
 * Ensures compatibility with all Framer canvas operations
 */

import { framer } from 'framer-plugin'

// Actual Framer API permission identifiers (from official plugin analysis)
const FRAMER_API_PERMISSIONS = [
  'addSVG',
  'addImage', 
  'setImage',
  'createFrameNode',
  'addComponentInstance',
  'addDetachedComponentLayers',
  'Node.setAttributes',
  'Node.getRect',
  'Node.getChildren',
  'CanvasNode.setAttributes',
  'FrameNode.setAttributes',
  'Canvas.getCanvasRoot',
  'Canvas.getSelection',
  'Canvas.setSelection'
] as const

export type FramerApiPermission = typeof FRAMER_API_PERMISSIONS[number]

/**
 * Check if we have specific permissions using the official isAllowedTo pattern
 */
export function has(...permissions: string[]): boolean {
  try {
    // Use the exact pattern from official plugins
    return (framer.isAllowedTo as any)(...permissions)
  } catch (error) {
    console.warn('Permission check failed:', error)
    return false
  }
}

/**
 * Professional permission checking with user feedback
 */
export async function ensure(...permissions: string[]): Promise<boolean> {
  const hasPermissions = has(...permissions)
  
  if (!hasPermissions) {
    console.log('Missing permissions:', permissions)
    framer.notify('🔐 Framium needs canvas access. Please check plugin permissions in Framer settings.')
    
    // Give user time to adjust permissions
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Re-check permissions
    return has(...permissions)
  }
  
  return true
}

/**
 * Professional error handling for permission failures
 */
export function getPermissionTitle(hasPermission: boolean): string | undefined {
  return hasPermission ? undefined : 'Grant canvas access in plugin settings'
}

// Specialized permission checkers following official plugin patterns
export const canAddSVG = () => has('addSVG')
export const canAddImages = () => has('addImage', 'setImage') 
export const canCreateNodes = () => has('createFrameNode', 'Node.setAttributes')
export const canAddComponents = () => has('addComponentInstance')
export const canManipulateNodes = () => has('Node.setAttributes', 'CanvasNode.setAttributes')
export const canAccessCanvas = () => has('Canvas.getCanvasRoot', 'Canvas.getSelection')

/**
 * Comprehensive permission status for debugging
 */
export function getPermissionStatus() {
  return {
    addSVG: canAddSVG(),
    addImages: canAddImages(),
    createNodes: canCreateNodes(), 
    addComponents: canAddComponents(),
    manipulateNodes: canManipulateNodes(),
    accessCanvas: canAccessCanvas(),
    allPermissions: has(...FRAMER_API_PERMISSIONS)
  }
}

export const REQUIRED_PERMISSIONS = FRAMER_API_PERMISSIONS
