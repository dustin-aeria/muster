/**
 * ProjectSORA.jsx
 * SORA 2.5 Assessment component with multi-site integration
 * 
 * PHASE 1 FIXES:
 * - Fixed OSO button click handling with proper event management
 * - Added auto-population from Site Survey population on site change
 * - Added auto-population of UA characteristics from assigned aircraft
 * - Made first OSO category expanded by default
 * - Added stopPropagation to prevent event bubbling issues
 * - Improved state update patterns for nested objects
 * 
 * @location src/components/projects/ProjectSORA.jsx
 * @action REPLACE
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Shield,
  MapPin,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowRight,
  Plane,
  Users,
  Target,
  Layers,
  FileText,
  ExternalLink,
  RefreshCw,
  Eye,
  BarChart3,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap
} from 'lucide-react'
import {
  populationCategories,
  uaCharacteristics,
  groundMitigations,
  arcLevels,
  tmprDefinitions,
  sailColors,
  sailDescriptions,
  robustnessLevels,
  osoCategories,
  osoDefinitions,
  getIntrinsicGRC,
  calculateFinalGRC,
  isWithinSORAScope,
  calculateResidualARC,
  getSAIL,
  getContainmentRequirement,
  checkAllOSOCompliance
} from '../../lib/soraConfig'

// ============================================
// CONSTANTS
// ============================================

const STEP_LABELS = {
  1: 'Operation Documentation',
  2: 'Intrinsic GRC',
  3: 'Final GRC',
  4: 'Initial ARC',
  5: 'Residual ARC',
  6: 'SAIL Determination',
  7: 'OSO Compliance',
  8: 'Containment',
  9: 'Summary'
}

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true, 
  badge = null,
  stepNumber = null,
  status = null 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  const statusColors = {
    complete: 'bg-green-100 text-green-700',
    partial: 'bg-amber-100 text-amber-700',
    missing: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700'
  }
  
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {stepNumber && (
            <span className="w-6 h-6 rounded-full bg-aeria-navy text-white text-xs font-bold flex items-center justify-center">
              {stepNumber}
            </span>
          )}
          {Icon && !stepNumber && <Icon className="w-5 h-5 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-700'}`}>
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================
// SITE SELECTOR BAR
// ============================================

function SiteSelectorBar({ sites = [], activeSiteId, onSelectSite, calculations = {} }) {
  // Defensive: ensure sites is an array
  const safeSites = Array.isArray(sites) ? sites : []
  
  if (safeSites.length <= 1) return null
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3 overflow-x-auto">
      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Site:</span>
      <div className="flex gap-2">
        {safeSites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const siteCalc = calculations[site.id]
          const sail = siteCalc?.sail
          const sailColor = sail ? sailColors[sail] : null
          
          return (
            <button
              key={site.id}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onSelectSite(site.id)
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-aeria-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? 'white' : `hsl(${index * 60}, 70%, 50%)` }}
              />
              {site.name}
              {sail && (
                <span 
                  className={`text-xs px-1.5 py-0.5 rounded ${isActive ? 'bg-white/20' : ''}`}
                  style={{ backgroundColor: isActive ? undefined : sailColor }}
                >
                  {sail}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// SAIL BADGE
// ============================================

function SAILBadge({ sail, size = 'md' }) {
  if (!sail) return <span className="text-gray-400">N/A</span>
  
  const color = sailColors[sail] || '#9CA3AF'
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-lg px-4 py-2 font-bold'
  }
  
  return (
    <span 
      className={`rounded-full font-medium ${sizeClasses[size]}`}
      style={{ backgroundColor: color, color: sail === 'I' || sail === 'II' ? '#1F2937' : '#FFFFFF' }}
    >
      SAIL {sail}
    </span>
  )
}

// ============================================
// GRC DISPLAY
// ============================================

function GRCDisplay({ label, value, description }) {
  const getGRCColor = (grc) => {
    if (grc === null) return 'bg-gray-200 text-gray-600'
    if (grc <= 2) return 'bg-green-500 text-white'
    if (grc <= 4) return 'bg-yellow-500 text-white'
    if (grc <= 6) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }
  
  return (
    <div className="text-center p-4 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600 mb-2">{label}</p>
      <div 
        className={`inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold ${getGRCColor(value)}`}
      >
        {value ?? '?'}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-2">{description}</p>
      )}
    </div>
  )
}

// ============================================
// POPULATION CATEGORY SELECTOR
// ============================================

function PopulationSelector({ value, onChange, fromSiteSurvey, onSyncFromSurvey }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Population Category (Operations Area)
        </label>
        {fromSiteSurvey && fromSiteSurvey !== value && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onSyncFromSurvey()
            }}
            className="text-xs text-aeria-navy hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Sync from Site Survey ({populationCategories[fromSiteSurvey]?.label})
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(populationCategories).map(([key, cat]) => {
          const isSelected = value === key
          const isFromSurvey = fromSiteSurvey === key
          
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(key)
              }}
              className={`p-3 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'border-aeria-navy bg-aeria-navy/5 ring-2 ring-aeria-navy/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${isSelected ? 'text-aeria-navy' : 'text-gray-900'}`}>
                  {cat.label.split('(')[0].trim()}
                </span>
                {isFromSurvey && !isSelected && (
                  <span className="text-xs text-blue-600">Survey</span>
                )}
              </div>
              <p className="text-xs text-gray-500">{cat.label.match(/\(([^)]+)\)/)?.[1] || ''}</p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// UA CHARACTERISTICS SELECTOR
// ============================================

function UACharacteristicsSelector({ value, onChange, aircraft = [], siteAircraft }) {
  // Try to auto-detect from aircraft specs
  const suggestedUA = useMemo(() => {
    // First check site-specific aircraft
    let targetAircraft = siteAircraft
    
    // If no site aircraft, use project aircraft
    if (!targetAircraft && Array.isArray(aircraft) && aircraft.length > 0) {
      targetAircraft = aircraft.find(a => a.isPrimary) || aircraft[0]
    }
    
    if (!targetAircraft) return null
    
    const maxDim = targetAircraft.maxDimension || targetAircraft.wingspan || 1
    const maxSpeed = targetAircraft.maxSpeed || 25
    
    // Find matching category
    for (const [key, char] of Object.entries(uaCharacteristics)) {
      if (maxDim <= char.maxDimension && maxSpeed <= char.maxSpeed) {
        return key
      }
    }
    return '1m_25ms'
  }, [aircraft, siteAircraft])
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          UA Characteristics (Max Dimension / Max Speed)
        </label>
        {suggestedUA && suggestedUA !== value && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(suggestedUA)
            }}
            className="text-xs text-aeria-navy hover:underline flex items-center gap-1"
          >
            <Zap className="w-3 h-3" />
            Auto-detect ({uaCharacteristics[suggestedUA]?.label})
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {Object.entries(uaCharacteristics).map(([key, char]) => {
          const isSelected = value === key
          const isSuggested = suggestedUA === key
          
          return (
            <button
              key={key}
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onChange(key)
              }}
              className={`p-3 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'border-aeria-navy bg-aeria-navy/5 ring-2 ring-aeria-navy/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className={`text-sm font-medium block ${isSelected ? 'text-aeria-navy' : 'text-gray-900'}`}>
                {char.label}
              </span>
              <p className="text-xs text-gray-500 mt-1">{char.description}</p>
              {isSuggested && !isSelected && (
                <span className="text-xs text-blue-600 mt-1 block">From aircraft</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// MITIGATION SELECTOR
// ============================================

function MitigationSelector({ mitigationId, mitigation, config = {}, onChange }) {
  const isEnabled = config?.enabled || false
  const robustness = config?.robustness || 'none'
  
  // Get available robustness levels for this mitigation
  const availableLevels = Object.keys(mitigation.reductions || {}).filter(r => r !== 'none')
  
  return (
    <div className={`p-4 rounded-lg border ${isEnabled ? 'border-aeria-navy bg-aeria-navy/5' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => {
                e.stopPropagation()
                onChange({ ...config, enabled: e.target.checked })
              }}
              className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
            />
            <span className="font-medium text-gray-900">{mitigation.name}</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-6">{mitigation.description}</p>
        </div>
        {isEnabled && (
          <span className="text-sm font-medium text-green-600">
            {mitigation.reductions?.[robustness] || 0} GRC
          </span>
        )}
      </div>
      
      {isEnabled && (
        <div className="ml-6 space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Robustness Level</label>
            <div className="flex gap-2 flex-wrap">
              {availableLevels.map(level => {
                const reduction = mitigation.reductions?.[level]
                const isSelected = robustness === level
                
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onChange({ ...config, robustness: level })
                    }}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-aeria-navy text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)} ({reduction})
                  </button>
                )
              })}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Evidence / Justification</label>
            <textarea
              value={config?.evidence || ''}
              onChange={(e) => {
                e.stopPropagation()
                onChange({ ...config, evidence: e.target.value })
              }}
              placeholder="Describe the evidence supporting this mitigation claim..."
              rows={2}
              className="input text-sm"
            />
          </div>
          
          {mitigation.notes && (
            <p className="text-xs text-amber-600 flex items-start gap-1">
              <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {mitigation.notes}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// ARC SELECTOR
// ============================================

function ARCSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Object.entries(arcLevels).map(([key, arc]) => {
        const isSelected = value === key
        const colors = {
          'ARC-a': 'border-green-500 bg-green-50',
          'ARC-b': 'border-yellow-500 bg-yellow-50',
          'ARC-c': 'border-orange-500 bg-orange-50',
          'ARC-d': 'border-red-500 bg-red-50'
        }
        
        return (
          <button
            key={key}
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onChange(key)
            }}
            className={`p-3 rounded-lg border-2 text-left transition-all ${
              isSelected ? colors[key] : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-lg font-bold block">{key}</span>
            <p className="text-xs text-gray-600 mt-1">{arc.description}</p>
          </button>
        )
      })}
    </div>
  )
}

// ============================================
// TMPR SELECTOR
// ============================================

function TMPRSelector({ value = {}, onChange }) {
  const isEnabled = value?.enabled || false
  const type = value?.type || 'VLOS'
  const robustness = value?.robustness || 'low'
  
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => {
            e.stopPropagation()
            onChange({ ...value, enabled: e.target.checked })
          }}
          className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
        />
        <span className="font-medium text-gray-900">Apply Tactical Mitigation (TMPR)</span>
      </label>
      
      {isEnabled && (
        <div className="ml-6 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(tmprDefinitions).map(([key, def]) => {
              const isSelected = type === key
              
              return (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange({ ...value, type: key })
                  }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-aeria-navy bg-aeria-navy/5 ring-2 ring-aeria-navy/20'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium block">{key}</span>
                  <p className="text-xs text-gray-500 mt-1">{def.description}</p>
                  <p className="text-xs text-green-600 mt-1">-{def.arcReduction} ARC step</p>
                </button>
              )
            })}
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Robustness Level</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high'].map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onChange({ ...value, robustness: level })
                  }}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    robustness === level
                      ? 'bg-aeria-navy text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Evidence</label>
            <textarea
              value={value?.evidence || ''}
              onChange={(e) => {
                e.stopPropagation()
                onChange({ ...value, evidence: e.target.value })
              }}
              placeholder="Describe how TMPR is achieved..."
              rows={2}
              className="input text-sm"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// OSO COMPLIANCE TABLE - FIXED
// ============================================

function OSOComplianceSection({ sail, osoCompliance = {}, onChange }) {
  // Default to first category expanded
  const [expandedCategory, setExpandedCategory] = useState(() => {
    const categories = Object.keys(osoCategories || {})
    return categories[0] || null
  })
  
  const compliance = useMemo(() => {
    return checkAllOSOCompliance(sail, osoCompliance)
  }, [sail, osoCompliance])
  
  // Handler for OSO changes with proper state update
  const handleOSOChange = useCallback((osoId, updates) => {
    const newCompliance = {
      ...osoCompliance,
      [osoId]: {
        ...(osoCompliance[osoId] || {}),
        ...updates
      }
    }
    onChange(newCompliance)
  }, [osoCompliance, onChange])
  
  // Safe access to compliance results
  const safeResults = Array.isArray(compliance?.results) ? compliance.results : []
  const safeSummary = compliance?.summary || { compliant: 0, total: 0, optional: 0, nonCompliant: 0, overallCompliant: false }
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`p-4 rounded-lg ${
        safeSummary.overallCompliant 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {safeSummary.overallCompliant ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <span className="font-medium">
              {safeSummary.compliant} of {safeSummary.total - safeSummary.optional} required OSOs compliant
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {safeSummary.nonCompliant} gaps remaining
          </span>
        </div>
      </div>
      
      {/* OSO Categories */}
      {Object.entries(osoCategories || {}).map(([catKey, catLabel]) => {
        const catOSOs = safeResults.filter(o => o.category === catKey)
        const isExpanded = expandedCategory === catKey
        const catCompliant = catOSOs.filter(o => o.compliant || o.required === 'O').length
        
        return (
          <div key={catKey} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setExpandedCategory(isExpanded ? null : catKey)
              }}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
            >
              <span className="font-medium text-gray-900">{catLabel}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${catCompliant === catOSOs.length ? 'text-green-600' : 'text-gray-600'}`}>
                  {catCompliant}/{catOSOs.length}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {catOSOs.map(oso => {
                  const currentRobustness = osoCompliance[oso.id]?.robustness || 'none'
                  const currentEvidence = osoCompliance[oso.id]?.evidence || ''
                  
                  return (
                    <div key={oso.id} className="p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{oso.id}</span>
                            {oso.compliant ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : oso.required === 'O' ? (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Optional</span>
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{oso.name}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            oso.required === 'O' ? 'bg-gray-100 text-gray-600' :
                            oso.required === 'L' ? 'bg-green-100 text-green-700' :
                            oso.required === 'M' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Required: {oso.requiredLabel}
                          </span>
                        </div>
                      </div>
                      
                      {/* Robustness Level Buttons */}
                      <div className="mb-3">
                        <label className="block text-xs text-gray-500 mb-1">Achieved Robustness</label>
                        <div className="flex gap-2 flex-wrap">
                          {['none', 'low', 'medium', 'high'].map(level => {
                            const isSelected = currentRobustness === level
                            
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleOSOChange(oso.id, { robustness: level })
                                }}
                                className={`px-3 py-1.5 text-xs rounded-md font-medium transition-colors ${
                                  isSelected
                                    ? 'bg-aeria-navy text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {level === 'none' ? 'None' : level.charAt(0).toUpperCase() + level.slice(1)}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      
                      {/* Evidence Input */}
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Evidence / Reference</label>
                        <input
                          type="text"
                          value={currentEvidence}
                          onChange={(e) => {
                            e.stopPropagation()
                            handleOSOChange(oso.id, { evidence: e.target.value })
                          }}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Document reference, procedure number, etc..."
                          className="input text-sm py-1.5"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ============================================
// MULTI-SITE SUMMARY
// ============================================

function MultiSiteSummary({ sites = [], calculations = {} }) {
  const safeSites = Array.isArray(sites) ? sites : []
  
  const summary = useMemo(() => {
    const siteSummaries = safeSites.map(site => {
      const calc = calculations[site.id] || {}
      return {
        id: site.id,
        name: site.name,
        iGRC: calc.iGRC,
        fGRC: calc.fGRC,
        initialARC: calc.initialARC,
        residualARC: calc.residualARC,
        sail: calc.sail,
        withinScope: calc.fGRC !== null && calc.fGRC <= 7
      }
    })
    
    const maxSAIL = siteSummaries.reduce((max, s) => {
      const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
      const currentIdx = sailOrder.indexOf(s.sail)
      const maxIdx = sailOrder.indexOf(max)
      return currentIdx > maxIdx ? s.sail : max
    }, 'I')
    
    const allWithinScope = siteSummaries.every(s => s.withinScope)
    
    return {
      sites: siteSummaries,
      maxSAIL,
      allWithinScope,
      siteCount: safeSites.length
    }
  }, [safeSites, calculations])
  
  if (safeSites.length <= 1) return null
  
  return (
    <div className="bg-gradient-to-r from-aeria-navy to-aeria-navy/80 text-white rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Multi-Site Risk Summary
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-sm">Sites Assessed</p>
          <p className="text-2xl font-bold">{summary.siteCount}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-sm">Highest SAIL</p>
          <p className="text-2xl font-bold">{summary.maxSAIL || 'N/A'}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-sm">Within SORA Scope</p>
          <p className="text-2xl font-bold">
            {summary.allWithinScope ? (
              <Check className="w-6 h-6 mx-auto text-green-400" />
            ) : (
              <X className="w-6 h-6 mx-auto text-red-400" />
            )}
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-3 text-center">
          <p className="text-white/70 text-sm">Governing SAIL</p>
          <SAILBadge sail={summary.maxSAIL} size="md" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-white/70 border-b border-white/20">
              <th className="text-left py-2">Site</th>
              <th className="text-center py-2">iGRC</th>
              <th className="text-center py-2">fGRC</th>
              <th className="text-center py-2">ARC</th>
              <th className="text-center py-2">SAIL</th>
            </tr>
          </thead>
          <tbody>
            {summary.sites.map(site => (
              <tr key={site.id} className="border-b border-white/10">
                <td className="py-2">{site.name}</td>
                <td className="text-center py-2">{site.iGRC ?? '-'}</td>
                <td className="text-center py-2">{site.fGRC ?? '-'}</td>
                <td className="text-center py-2">{site.residualARC || site.initialARC || '-'}</td>
                <td className="text-center py-2">
                  {site.sail ? <SAILBadge sail={site.sail} size="sm" /> : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectSORA({ project, onUpdate, onNavigateToSection }) {
  // Get sites array with defensive coding
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  // Active site
  const activeSiteId = project?.activeSiteId || sites[0]?.id || null
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === activeSiteId) || sites[0] || null
  }, [sites, activeSiteId])
  
  // Site's SORA data
  const siteSORA = activeSite?.soraAssessment || {}
  
  // Project aircraft
  const projectAircraft = useMemo(() => {
    return Array.isArray(project?.flightPlan?.aircraft) ? project.flightPlan.aircraft : []
  }, [project?.flightPlan?.aircraft])
  
  // Site-assigned aircraft
  const siteAircraft = useMemo(() => {
    const assignedId = activeSite?.flightPlan?.assignedAircraftId
    if (!assignedId) return null
    return projectAircraft.find(a => a.id === assignedId) || null
  }, [activeSite?.flightPlan?.assignedAircraftId, projectAircraft])
  
  // ============================================
  // AUTO-POPULATION EFFECTS
  // ============================================
  
  // Auto-populate population from Site Survey when site changes (if not already set)
  useEffect(() => {
    if (!activeSite || !onUpdate) return
    
    const surveyPopulation = activeSite.siteSurvey?.population?.category
    const soraPopulation = activeSite.soraAssessment?.populationCategory
    
    // If site survey has population but SORA doesn't, auto-sync
    if (surveyPopulation && !soraPopulation) {
      const updatedSites = sites.map(site => {
        if (site.id !== activeSiteId) return site
        return {
          ...site,
          soraAssessment: {
            ...site.soraAssessment,
            populationCategory: surveyPopulation,
            lastUpdated: new Date().toISOString()
          }
        }
      })
      onUpdate({ sites: updatedSites })
    }
  }, [activeSiteId]) // Only run when site changes
  
  // ============================================
  // CALCULATIONS
  // ============================================
  
  const calculations = useMemo(() => {
    const results = {}
    
    sites.forEach(site => {
      const sora = site.soraAssessment || {}
      const population = sora.populationCategory || site.siteSurvey?.population?.category || 'sparsely'
      const uaChar = sora.uaCharacteristics || '1m_25ms'
      
      const iGRC = getIntrinsicGRC(population, uaChar)
      const fGRC = calculateFinalGRC(iGRC, sora.mitigations || {})
      const initialARC = sora.initialARC || 'ARC-b'
      const residualARC = calculateResidualARC(initialARC, sora.tmpr || {})
      const sail = getSAIL(fGRC, residualARC)
      
      results[site.id] = {
        population,
        uaChar,
        iGRC,
        fGRC,
        initialARC,
        residualARC,
        sail,
        withinScope: isWithinSORAScope(fGRC)
      }
    })
    
    return results
  }, [sites])
  
  const activeCalc = calculations[activeSiteId] || {}
  
  // ============================================
  // HANDLERS
  // ============================================
  
  const handleSelectSite = useCallback((siteId) => {
    onUpdate?.({ activeSiteId: siteId })
  }, [onUpdate])
  
  const updateSiteSORA = useCallback((updates) => {
    if (!activeSiteId || !onUpdate) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      return {
        ...site,
        soraAssessment: {
          ...(site.soraAssessment || {}),
          ...updates,
          lastUpdated: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      }
    })
    
    onUpdate({ sites: updatedSites })
  }, [sites, activeSiteId, onUpdate])
  
  const syncPopulationFromSurvey = useCallback(() => {
    const surveyCategory = activeSite?.siteSurvey?.population?.category
    if (surveyCategory) {
      updateSiteSORA({ populationCategory: surveyCategory })
    }
  }, [activeSite, updateSiteSORA])
  
  // ============================================
  // RENDER
  // ============================================
  
  if (sites.length === 0) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Sites to Assess</h3>
        <p className="text-gray-500 mb-4">Add operation sites in Site Survey before performing SORA assessment.</p>
        <button 
          type="button"
          onClick={() => onNavigateToSection?.('siteSurvey')} 
          className="btn-primary"
        >
          Go to Site Survey
        </button>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">SORA 2.5 Assessment</h2>
          <p className="text-gray-500">JARUS Specific Operations Risk Assessment per site</p>
        </div>
        
        <div className="flex items-center gap-4">
          {activeCalc.sail && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Site SAIL Level</p>
              <SAILBadge sail={activeCalc.sail} size="lg" />
            </div>
          )}
        </div>
      </div>
      
      {/* Site Selector */}
      <SiteSelectorBar
        sites={sites}
        activeSiteId={activeSiteId}
        onSelectSite={handleSelectSite}
        calculations={calculations}
      />
      
      {/* Multi-Site Summary */}
      <MultiSiteSummary sites={sites} calculations={calculations} />
      
      {/* Scope Warning */}
      {!activeCalc.withinScope && activeCalc.fGRC !== null && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Outside SORA Scope</h3>
              <p className="text-sm text-red-700 mt-1">
                Final GRC of {activeCalc.fGRC} exceeds SORA limit of 7. This operation requires 
                additional approval beyond SORA methodology.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Step 2: Intrinsic GRC */}
      <CollapsibleSection
        title="Ground Risk - Intrinsic GRC (iGRC)"
        stepNumber={2}
        badge={activeCalc.iGRC ? `iGRC: ${activeCalc.iGRC}` : null}
        status={activeCalc.iGRC ? 'complete' : 'missing'}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <Info className="w-4 h-4 inline mr-1" />
            iGRC is determined by population density and UA characteristics (SORA 2.5 Table 2)
          </p>
        </div>
        
        <PopulationSelector
          value={siteSORA.populationCategory || activeCalc.population}
          onChange={(v) => updateSiteSORA({ populationCategory: v })}
          fromSiteSurvey={activeSite?.siteSurvey?.population?.category}
          onSyncFromSurvey={syncPopulationFromSurvey}
        />
        
        <div className="mt-6">
          <UACharacteristicsSelector
            value={siteSORA.uaCharacteristics || activeCalc.uaChar}
            onChange={(v) => updateSiteSORA({ uaCharacteristics: v })}
            aircraft={projectAircraft}
            siteAircraft={siteAircraft}
          />
        </div>
        
        <div className="mt-6 flex justify-center">
          <GRCDisplay 
            label="Intrinsic Ground Risk Class" 
            value={activeCalc.iGRC}
            description="Before mitigations"
          />
        </div>
      </CollapsibleSection>
      
      {/* Step 3: Final GRC */}
      <CollapsibleSection
        title="Ground Risk - Final GRC (fGRC)"
        stepNumber={3}
        badge={activeCalc.fGRC ? `fGRC: ${activeCalc.fGRC}` : null}
        status={activeCalc.fGRC ? 'complete' : 'missing'}
      >
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-800">
            <Info className="w-4 h-4 inline mr-1" />
            Apply mitigations to reduce ground risk. M3 (ERP) was removed in SORA 2.5.
          </p>
        </div>
        
        <div className="space-y-4">
          {Object.entries(groundMitigations || {}).map(([key, mitigation]) => (
            <MitigationSelector
              key={key}
              mitigationId={key}
              mitigation={mitigation}
              config={siteSORA.mitigations?.[key] || {}}
              onChange={(config) => updateSiteSORA({
                mitigations: {
                  ...(siteSORA.mitigations || {}),
                  [key]: config
                }
              })}
            />
          ))}
        </div>
        
        <div className="mt-6 flex justify-center gap-8">
          <GRCDisplay label="iGRC" value={activeCalc.iGRC} />
          <div className="flex items-center">
            <ArrowRight className="w-8 h-8 text-gray-400" />
          </div>
          <GRCDisplay label="Final GRC" value={activeCalc.fGRC} description="After mitigations" />
        </div>
      </CollapsibleSection>
      
      {/* Step 4-5: Air Risk */}
      <CollapsibleSection
        title="Air Risk - ARC & TMPR"
        stepNumber={4}
        badge={activeCalc.residualARC || activeCalc.initialARC}
        status={siteSORA.initialARC ? 'complete' : 'missing'}
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Initial Air Risk Class (ARC)</h4>
            <ARCSelector
              value={siteSORA.initialARC || 'ARC-b'}
              onChange={(v) => updateSiteSORA({ initialARC: v })}
            />
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Tactical Mitigation Performance Requirement (TMPR)</h4>
            <TMPRSelector
              value={siteSORA.tmpr || {}}
              onChange={(v) => updateSiteSORA({ tmpr: v })}
            />
          </div>
          
          <div className="flex justify-center gap-8 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Initial ARC</p>
              <span className="text-lg font-bold">{siteSORA.initialARC || 'ARC-b'}</span>
            </div>
            <ArrowRight className="w-6 h-6 text-gray-400 self-center" />
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Residual ARC</p>
              <span className="text-lg font-bold text-green-600">{activeCalc.residualARC}</span>
            </div>
          </div>
        </div>
      </CollapsibleSection>
      
      {/* Step 6: SAIL Determination */}
      <CollapsibleSection
        title="SAIL Determination"
        stepNumber={6}
        badge={activeCalc.sail ? `SAIL ${activeCalc.sail}` : null}
        status={activeCalc.sail ? 'complete' : 'missing'}
      >
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Based on Final GRC and Residual ARC</p>
          
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">Final GRC</p>
              <p className="text-2xl font-bold">{activeCalc.fGRC ?? '?'}</p>
            </div>
            <span className="text-gray-400">×</span>
            <div className="text-center">
              <p className="text-sm text-gray-500">Residual ARC</p>
              <p className="text-2xl font-bold">{activeCalc.residualARC}</p>
            </div>
            <span className="text-gray-400">=</span>
            <div className="text-center">
              <p className="text-sm text-gray-500">SAIL Level</p>
              <SAILBadge sail={activeCalc.sail} size="lg" />
            </div>
          </div>
          
          {activeCalc.sail && sailDescriptions?.[activeCalc.sail] && (
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              {sailDescriptions[activeCalc.sail]}
            </p>
          )}
        </div>
      </CollapsibleSection>
      
      {/* Step 7: OSO Compliance */}
      {activeCalc.sail && (
        <CollapsibleSection
          title="Operational Safety Objectives (OSO)"
          stepNumber={7}
          defaultOpen={false}
        >
          <OSOComplianceSection
            sail={activeCalc.sail}
            osoCompliance={siteSORA.osoCompliance || {}}
            onChange={(v) => updateSiteSORA({ osoCompliance: v })}
          />
        </CollapsibleSection>
      )}
      
      {/* Navigation Links */}
      <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
        <button
          type="button"
          onClick={() => onNavigateToSection?.('siteSurvey')}
          className="text-aeria-navy hover:underline flex items-center gap-1"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          Back to Site Survey
        </button>
        
        <button
          type="button"
          onClick={() => onNavigateToSection?.('flightPlan')}
          className="text-aeria-navy hover:underline flex items-center gap-1"
        >
          View Flight Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
