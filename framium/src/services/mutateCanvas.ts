/**
 * Framium - Professional Canvas Mutations
 * Industry-leading canvas operations based on official Framer plugin patterns
 * Ensures safe, permission-checked operations for professional results
 */

import { framer } from 'framer-plugin'
import { has, getPermissionTitle } from './permissions'

/**
 * Professional canvas mutation wrapper following official plugin patterns
 */
export async function mutateCanvas<T>(
  requiredPermissions: string[],
  operation: () => Promise<T>,
  operationName = 'canvas operation'
): Promise<T | null> {
  try {
    // Professional permission checking
    if (!has(...requiredPermissions)) {
      console.warn(`Missing permissions for ${operationName}:`, requiredPermissions)
      framer.notify(`🔐 ${operationName} requires canvas permissions. Check plugin settings.`)
      return null
    }

    console.log(`Executing ${operationName} with permissions:`, requiredPermissions)
    return await operation()
    
  } catch (error) {
    const errorMessage = `${operationName} failed: ${(error as Error).message}`
    console.error(errorMessage, error)
    framer.notify(`❌ ${errorMessage}`)
    return null
  }
}

/**
 * Professional SVG operations following official plugin patterns
 */
export async function addSVGToCanvas(svgContent: string, name = 'Generated SVG'): Promise<any | null> {
  return mutateCanvas(['addSVG'], async () => {
    return await framer.addSVG({
      svg: svgContent,
      name: name
    })
  }, 'Add SVG')
}

/**
 * Professional image operations following official plugin patterns  
 */
export async function addImageToCanvas(
  imageData: Uint8Array, 
  mimeType = 'image/png',
  name = 'Generated Image'
): Promise<any | null> {
  return mutateCanvas(['addImage'], async () => {
    return await framer.addImage({
      image: {
        type: 'bytes',
        bytes: imageData,
        mimeType: mimeType
      },
      name: name
    })
  }, 'Add Image')
}

/**
 * Professional component operations following official plugin patterns
 */
export async function addComponentToCanvas(componentUrl: string): Promise<any | null> {
  return mutateCanvas(['addComponentInstance'], async () => {
    return await framer.addComponentInstance({
      url: componentUrl
    })
  }, 'Add Component')
}

/**
 * Professional frame creation following official plugin patterns
 */
export async function createFrameNode(
  width = 375, 
  height = 812, 
  name = 'Frame'
): Promise<any | null> {
  return mutateCanvas(['createFrameNode', 'Node.setAttributes'], async () => {
    // Create frame with initial attributes
    const frame = await framer.createFrameNode({
      name: name,
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#FFFFFF'
    })
    
    return frame
  }, 'Create Frame')
}

/**
 * Professional node attribute updates following official plugin patterns
 */
export async function updateNodeAttributes(
  nodeId: string, 
  attributes: Record<string, any>
): Promise<boolean> {
  const result = await mutateCanvas(['Node.setAttributes'], async () => {
    const node = await framer.getNode(nodeId)
    if (node && 'setAttributes' in node) {
      await (node as any).setAttributes(attributes)
      return true
    }
    return false
  }, 'Update Node Attributes')
  
  return result ?? false
}

/**
 * Get permission status for UI feedback
 */
export function getCanvasPermissionStatus() {
  return {
    canAddSVG: has('addSVG'),
    canAddImages: has('addImage'),
    canCreateFrames: has('createFrameNode'),
    canAddComponents: has('addComponentInstance'),
    canUpdateNodes: has('Node.setAttributes'),
    title: (hasPermission: boolean) => getPermissionTitle(hasPermission)
  }
}
