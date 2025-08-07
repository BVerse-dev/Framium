import { useState, useEffect, useRef } from 'react'
import { Layers, Eye, EyeOff, Copy, Trash2, Search, Filter, Zap, Square, Type, Image as ImageIcon } from 'lucide-react'
import { framer, CanvasNode } from 'framer-plugin'

interface FramerLayer {
  id: string
  name: string
  type: string
  visible: boolean
  locked: boolean
  children?: FramerLayer[]
  parent?: string
}

interface ProjectPanelProps {
  selection: CanvasNode[]
}

export function ProjectPanel({ selection }: ProjectPanelProps) {
  const [layers, setLayers] = useState<FramerLayer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'frame' | 'text' | 'image'>('all')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLayerIds, setSelectedLayerIds] = useState<Set<string>>(new Set())
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Combine Framer selection with manual checkbox selections
  const totalSelectedLayers = new Set([
    ...selection.map(node => node.id),
    ...selectedLayerIds
  ])

  // Debounced notification for selection changes
  const showSelectionSummary = () => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current)
    }
    
    notificationTimeoutRef.current = setTimeout(() => {
      const selectedNames = Array.from(totalSelectedLayers).map(id => {
        return layers.find(l => l.id === id)?.name || 
               layers.flatMap(l => l.children || []).find(c => c.id === id)?.name || 
               'Unknown Layer'
      })
      
      if (selectedNames.length === 0) {
        framer.notify('❌ No layers selected')
      } else if (selectedNames.length === 1) {
        framer.notify(`✅ Selected: ${selectedNames[0]}`)
      } else {
        framer.notify(`✅ Selected ${selectedNames.length} layers: ${selectedNames.slice(0, 3).join(', ')}${selectedNames.length > 3 ? '...' : ''}`)
      }
    }, 300) // 300ms debounce
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  // Mock layers data - in production, this would come from Framer API
  const mockLayers: FramerLayer[] = [
    {
      id: 'layer-1',
      name: 'Navigation',
      type: 'Frame',
      visible: true,
      locked: false,
      children: [
        { id: 'layer-1-1', name: 'Logo', type: 'Image', visible: true, locked: false, parent: 'layer-1' },
        { id: 'layer-1-2', name: 'Menu Items', type: 'Frame', visible: true, locked: false, parent: 'layer-1' },
        { id: 'layer-1-3', name: 'CTA Button', type: 'Frame', visible: true, locked: false, parent: 'layer-1' }
      ]
    },
    {
      id: 'layer-2',
      name: 'Hero Section',
      type: 'Frame',
      visible: true,
      locked: false,
      children: [
        { id: 'layer-2-1', name: 'Headline', type: 'Text', visible: true, locked: false, parent: 'layer-2' },
        { id: 'layer-2-2', name: 'Subheading', type: 'Text', visible: true, locked: false, parent: 'layer-2' },
        { id: 'layer-2-3', name: 'Hero Image', type: 'Image', visible: true, locked: false, parent: 'layer-2' }
      ]
    },
    {
      id: 'layer-3',
      name: 'Features Grid',
      type: 'Frame',
      visible: true,
      locked: false,
      children: [
        { id: 'layer-3-1', name: 'Feature 1', type: 'Frame', visible: true, locked: false, parent: 'layer-3' },
        { id: 'layer-3-2', name: 'Feature 2', type: 'Frame', visible: true, locked: false, parent: 'layer-3' },
        { id: 'layer-3-3', name: 'Feature 3', type: 'Frame', visible: true, locked: false, parent: 'layer-3' }
      ]
    }
  ]

  useEffect(() => {
    setLayers(mockLayers)
  }, [])

  // Show selection summary when Framer selection changes
  useEffect(() => {
    showSelectionSummary()
  }, [selection, selectedLayerIds, layers])

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'frame': return <Square size={14} />
      case 'text': return <Type size={14} />
      case 'image': return <ImageIcon size={14} />
      default: return <Layers size={14} />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'frame': return '#3b82f6'
      case 'text': return '#10b981'
      case 'image': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const handleLayerSelect = async (layerId: string) => {
    try {
      // TODO: Replace with real Framer API call
      // await framer.setSelection([layerId])
      
      // Local state management for now
      const layer = layers.find(l => l.id === layerId) || 
                    layers.flatMap(l => l.children || []).find(c => c.id === layerId)
      
      if (layer) {
        console.log('Selecting layer:', layerId, layer.name)
        // Update local selection state
        setSelectedLayerIds(prev => {
          const newSet = new Set(prev)
          newSet.add(layerId)
          return newSet
        })
      }
    } catch (error) {
      console.error('Failed to select layer:', error)
    }
  }

  const handleCheckboxToggle = (layerId: string, isChecked: boolean) => {
    setSelectedLayerIds(prev => {
      const newSet = new Set(prev)
      if (isChecked) {
        newSet.add(layerId)
      } else {
        newSet.delete(layerId)
      }
      return newSet
    })
    
    // Show debounced selection summary
    showSelectionSummary()
  }

  const isLayerSelected = (layerId: string) => {
    return selectedLayerIds.has(layerId) || selection.some(node => node.id === layerId)
  }

  const handleSelectAll = () => {
    const allLayerIds = new Set<string>()
    filteredLayers.forEach(layer => {
      allLayerIds.add(layer.id)
      if (layer.children) {
        layer.children.forEach(child => allLayerIds.add(child.id))
      }
    })
    setSelectedLayerIds(allLayerIds)
    showSelectionSummary()
  }

  const handleClearSelection = () => {
    setSelectedLayerIds(new Set())
    showSelectionSummary()
  }

  const handleToggleVisibility = async (layerId: string) => {
    setLayers(prev => 
      prev.map(layer => {
        if (layer.id === layerId) {
          return { ...layer, visible: !layer.visible }
        }
        if (layer.children) {
          return {
            ...layer,
            children: layer.children.map(child => 
              child.id === layerId ? { ...child, visible: !child.visible } : child
            )
          }
        }
        return layer
      })
    )
  }

  const handleDuplicateLayer = async (layerId: string) => {
    try {
      // TODO: Replace with real Framer API call
      // await framer.cloneNode(layerId)
      
      // Local state simulation for now
      const layerToDuplicate = layers.find(l => l.id === layerId) || 
                               layers.flatMap(l => l.children || []).find(c => c.id === layerId)
      
      if (layerToDuplicate) {
        const duplicatedLayer = {
          ...layerToDuplicate,
          id: `${layerId}-copy-${Date.now()}`,
          name: `${layerToDuplicate.name} Copy`
        }
        
        // Add to layers state
        setLayers(prev => {
          if (layerToDuplicate.parent) {
            // It's a child layer
            return prev.map(layer => 
              layer.id === layerToDuplicate.parent 
                ? { ...layer, children: [...(layer.children || []), duplicatedLayer] }
                : layer
            )
          } else {
            // It's a parent layer
            return [...prev, duplicatedLayer]
          }
        })
        
        framer.notify(`✅ Duplicated: ${layerToDuplicate.name}`)
      }
    } catch (error) {
      console.error('Failed to duplicate layer:', error)
      framer.notify('❌ Failed to duplicate layer')
    }
  }

  const handleDeleteLayer = async (layerId: string) => {
    try {
      // In production, use framer.removeNode(layerId)
      setLayers(prev => 
        prev.filter(layer => layer.id !== layerId)
          .map(layer => ({
            ...layer,
            children: layer.children?.filter(child => child.id !== layerId)
          }))
      )
      framer.notify(`Deleted layer: ${layerId}`)
    } catch (error) {
      console.error('Failed to delete layer:', error)
    }
  }

  const handleGenerateComponent = async () => {
    if (totalSelectedLayers.size === 0) {
      framer.notify('❌ Please select at least one layer to generate a component')
      return
    }

    setIsLoading(true)
    try {
      // Get selected layer names for better feedback
      const selectedNames = Array.from(totalSelectedLayers).map(id => {
        return layers.find(l => l.id === id)?.name || 
               layers.flatMap(l => l.children || []).find(c => c.id === id)?.name || 
               'Unknown Layer'
      })

      // Show generation start message
      if (selectedNames.length === 1) {
        framer.notify(`🚀 Generating component from: ${selectedNames[0]}`)
      } else {
        framer.notify(`🚀 Generating component from ${selectedNames.length} layers: ${selectedNames.slice(0, 2).join(', ')}${selectedNames.length > 2 ? '...' : ''}`)
      }

      // Enhanced component generation with different types
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Determine component type based on selected layers
      const componentType = selectedNames.some(name => name.toLowerCase().includes('button')) ? 'button' :
                           selectedNames.some(name => name.toLowerCase().includes('card')) ? 'card' :
                           selectedNames.some(name => name.toLowerCase().includes('nav')) ? 'navigation' : 'component'
      
      const componentSVGs = {
        button: `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40">
          <rect width="120" height="40" fill="#3b82f6" rx="8"/>
          <text x="60" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="600">${selectedNames[0]}</text>
        </svg>`,
        card: `<svg xmlns="http://www.w3.org/2000/svg" width="250" height="300" viewBox="0 0 250 300">
          <rect width="250" height="300" fill="#ffffff" stroke="#e5e7eb" rx="12"/>
          <rect x="20" y="20" width="210" height="120" fill="#f3f4f6" rx="8"/>
          <rect x="20" y="160" width="150" height="16" fill="#374151" rx="4"/>
          <rect x="20" y="190" width="100" height="12" fill="#6b7280" rx="2"/>
          <rect x="20" y="250" width="80" height="30" fill="#10b981" rx="6"/>
        </svg>`,
        navigation: `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="60" viewBox="0 0 400 60">
          <rect width="400" height="60" fill="#ffffff" stroke="#e5e7eb"/>
          <rect x="20" y="20" width="80" height="20" fill="#1f2937" rx="4"/>
          <rect x="150" y="22" width="50" height="16" fill="#6b7280" rx="2"/>
          <rect x="220" y="22" width="50" height="16" fill="#6b7280" rx="2"/>
          <rect x="290" y="22" width="50" height="16" fill="#6b7280" rx="2"/>
        </svg>`,
        component: `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
          <rect width="200" height="150" fill="#f8fafc" stroke="#e2e8f0" rx="8"/>
          <rect x="20" y="20" width="160" height="20" fill="#3b82f6" rx="4"/>
          <rect x="20" y="50" width="120" height="12" fill="#64748b" rx="2"/>
          <rect x="20" y="70" width="140" height="12" fill="#64748b" rx="2"/>
          <rect x="20" y="100" width="100" height="30" fill="#10b981" rx="6"/>
          <text x="70" y="118" text-anchor="middle" fill="white" font-size="12" font-weight="600">Component</text>
        </svg>`
      }
      
      await framer.addSVG({
        svg: componentSVGs[componentType as keyof typeof componentSVGs],
        name: `Generated-${componentType}-${Date.now()}.svg`,
      })
      
      framer.notify(`✅ ${componentType.charAt(0).toUpperCase() + componentType.slice(1)} component generated successfully!`)
    } catch (error) {
      console.error('Failed to generate component:', error)
      framer.notify('❌ Failed to generate component')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredLayers = layers.filter(layer => {
    const matchesSearch = layer.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || layer.type.toLowerCase() === filterType
    return matchesSearch && matchesFilter
  })

  return (
    <div className="panel">
      <div className="panel-header">
        <h2>
          <span className="gradient-icon project">🗂</span>
          Project Overview
        </h2>
        <p>Manage layers and canvas elements</p>
      </div>

      {/* Selection Info */}
      <div className="selection-info">
        <div className="selection-stat">
          <span className="selection-label">Selected:</span>
          <span className="selection-value">{totalSelectedLayers.size} items</span>
        </div>
        <div className="selection-stat">
          <span className="selection-label">Total Layers:</span>
          <span className="selection-value">{layers.length}</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className="action-button primary"
          onClick={handleGenerateComponent}
          disabled={totalSelectedLayers.size === 0 || isLoading}
        >
          <Zap size={14} />
          {isLoading ? 'Generating...' : 'Generate Component'}
        </button>
      </div>

      {/* Selection Controls */}
      <div className="selection-controls">
        <button 
          className="selection-control-btn"
          onClick={handleSelectAll}
          disabled={filteredLayers.length === 0}
        >
          Select All
        </button>
        <button 
          className="selection-control-btn"
          onClick={handleClearSelection}
          disabled={totalSelectedLayers.size === 0}
        >
          Clear Selection
        </button>
      </div>

      {/* Search and Filter */}
      <div className="project-controls">
        <div className="search-container">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search layers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={16} />
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value as any)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="frame">Frames</option>
            <option value="text">Text</option>
            <option value="image">Images</option>
          </select>
        </div>
      </div>

      {/* Layers List */}
      <div className="layers-list">
        {filteredLayers.length === 0 ? (
          <div className="empty-state">
            <Layers size={48} style={{ opacity: 0.3 }} />
            <p>No layers found</p>
            <span>Try adjusting your search or filter</span>
          </div>
        ) : (
          filteredLayers.map(layer => (
            <div key={layer.id}>
              <div className={`layer-item ${isLayerSelected(layer.id) ? 'selected' : ''}`} onClick={() => {
                handleLayerSelect(layer.id)
                handleCheckboxToggle(layer.id, !isLayerSelected(layer.id))
              }}>
                <div className="layer-info">
                  <input
                    type="checkbox"
                    checked={isLayerSelected(layer.id)}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleCheckboxToggle(layer.id, e.target.checked)
                    }}
                    className="layer-checkbox"
                  />
                  <div className="layer-icon" style={{ color: getTypeColor(layer.type) }}>
                    {getTypeIcon(layer.type)}
                  </div>
                  <div>
                    <h5>{layer.name}</h5>
                    <span className="layer-type">{layer.type}</span>
                  </div>
                </div>
                <div className="layer-actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleVisibility(layer.id)
                    }}
                    title={layer.visible ? 'Hide' : 'Show'}
                  >
                    {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDuplicateLayer(layer.id)
                    }}
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteLayer(layer.id)
                    }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Child Layers */}
              {layer.children && layer.children.length > 0 && (
                <div className="child-layers">
                  {layer.children.map(child => (
                    <div key={child.id} className={`layer-item child ${isLayerSelected(child.id) ? 'selected' : ''}`} onClick={() => {
                      handleLayerSelect(child.id)
                      handleCheckboxToggle(child.id, !isLayerSelected(child.id))
                    }}>
                      <div className="layer-info">
                        <input
                          type="checkbox"
                          checked={isLayerSelected(child.id)}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleCheckboxToggle(child.id, e.target.checked)
                          }}
                          className="layer-checkbox"
                        />
                        <div className="layer-icon" style={{ color: getTypeColor(child.type) }}>
                          {getTypeIcon(child.type)}
                        </div>
                        <div>
                          <h5>{child.name}</h5>
                          <span className="layer-type">{child.type}</span>
                        </div>
                      </div>
                      <div className="layer-actions">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleToggleVisibility(child.id)
                          }}
                          title={child.visible ? 'Hide' : 'Show'}
                        >
                          {child.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDuplicateLayer(child.id)
                          }}
                          title="Duplicate"
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteLayer(child.id)
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
