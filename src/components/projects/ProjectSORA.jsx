/**
 * ProjectSORA.jsx
 * SORA 2.5 Assessment component with multi-site integration
 * 
 * FIXES APPLIED:
 * - Issue #1: Fixed OSO dropdown state updates not persisting
 * - Issue #2: Added useCallback for handleOSOChange with proper dependencies
 * - Issue #3: Added key prop to OSOComplianceSection for proper re-rendering
 * - Issue #4: Improved state initialization for osoCompliance
 * 
 * Features:
 * - Multi-site support with site selector
 * - Auto-populate from site survey population data
 * - Per-site iGRC/fGRC calculations
 * - Ground risk mitigations (M1A, M1B, M1C, M2)
 * - Air risk assessment (ARC, TMPR)
 * - SAIL determination
 * - OSO compliance tracking
 * - Aggregate risk summary across all sites
 * 
 * @location src/components/projects/ProjectSORA.jsx
 * @action REPLACE
 * 
 * Batch 2 Fix: Split Step 4 (Air Risk) into Step 4 (Initial ARC) and Step 5 (Residual ARC)
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'
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
  AlertCircle
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
  containmentMethods,
  containmentRobustness,
  adjacentAreaGuidance,
  osoCategories,
  osoDefinitions,
  getIntrinsicGRC,
  calculateFinalGRC,
  isWithinSORAScope,
  calculateResidualARC,
  getSAIL,
  getContainmentRequirement,
  calculateAdjacentAreaDistance,
  checkAllOSOCompliance
} from '../../lib/soraConfig'
import NoAircraftAssignedModal from '../NoAircraftAssignedModal'

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
        onClick={() => setIsOpen(!isOpen)}
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

function SiteSelectorBar({ sites, activeSiteId, onSelectSite, calculations }) {
  if (sites.length <= 1) return null
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3 overflow-x-auto">
      <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Site:</span>
      <div className="flex gap-2">
        {sites.map((site, index) => {
          const isActive = site.id === activeSiteId
          const siteCalc = calculations?.[site.id]
          const sail = siteCalc?.sail
          const sailColor = sail ? sailColors[sail] : null
          
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => onSelectSite(site.id)}
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
// SORA RISK PATH SUMMARY (Visual Flow)
// ============================================

function SORARiskPathSummary({ calc, sail }) {
  const getGRCBgColor = (grc) => {
    if (grc === null) return 'bg-gray-100 border-gray-300'
    if (grc <= 2) return 'bg-green-100 border-green-400'
    if (grc <= 4) return 'bg-yellow-100 border-yellow-400'
    if (grc <= 6) return 'bg-orange-100 border-orange-400'
    return 'bg-red-100 border-red-400'
  }

  const getARCBgColor = (arc) => {
    if (!arc) return 'bg-gray-100 border-gray-300'
    if (arc === 'ARC-a') return 'bg-green-100 border-green-400'
    if (arc === 'ARC-b') return 'bg-yellow-100 border-yellow-400'
    if (arc === 'ARC-c') return 'bg-orange-100 border-orange-400'
    return 'bg-red-100 border-red-400'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-sm font-medium text-gray-500 mb-3 text-center">SORA Risk Assessment Flow</h3>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {/* Ground Risk Path */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-2 rounded-lg border-2 text-center ${getGRCBgColor(calc.iGRC)}`}>
            <p className="text-[10px] text-gray-500 uppercase">iGRC</p>
            <p className="text-lg font-bold">{calc.iGRC ?? '?'}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className={`px-3 py-2 rounded-lg border-2 text-center ${getGRCBgColor(calc.fGRC)}`}>
            <p className="text-[10px] text-gray-500 uppercase">fGRC</p>
            <p className="text-lg font-bold">{calc.fGRC ?? '?'}</p>
          </div>
        </div>

        <div className="hidden sm:block text-gray-300 text-2xl font-light mx-2">+</div>

        {/* Air Risk Path */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-2 rounded-lg border-2 text-center ${getARCBgColor(calc.initialARC)}`}>
            <p className="text-[10px] text-gray-500 uppercase">Init ARC</p>
            <p className="text-sm font-bold">{calc.initialARC || '?'}</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
          <div className={`px-3 py-2 rounded-lg border-2 text-center ${getARCBgColor(calc.residualARC)}`}>
            <p className="text-[10px] text-gray-500 uppercase">Res ARC</p>
            <p className="text-sm font-bold">{calc.residualARC || '?'}</p>
          </div>
        </div>

        <div className="hidden sm:block text-gray-300 text-2xl font-light mx-2">=</div>

        {/* SAIL Result */}
        <div className="px-4 py-2 rounded-lg text-center" style={{ backgroundColor: sail ? sailColors[sail] : '#E5E7EB' }}>
          <p className="text-[10px] uppercase" style={{ color: sail && (sail === 'I' || sail === 'II') ? '#374151' : '#FFFFFF', opacity: 0.8 }}>SAIL</p>
          <p className="text-xl font-bold" style={{ color: sail && (sail === 'I' || sail === 'II') ? '#1F2937' : '#FFFFFF' }}>
            {sail || '?'}
          </p>
        </div>
      </div>
      {calc.fGRC !== null && calc.fGRC > 7 && (
        <p className="text-center text-xs text-red-600 mt-2">⚠ fGRC &gt; 7: Outside SORA scope</p>
      )}
    </div>
  )
}

// ============================================
// GRC DISPLAY (Compact)
// ============================================

function GRCDisplay({ label, value, description, compact = false }) {
  const getGRCColor = (grc) => {
    if (grc === null) return 'bg-gray-200 text-gray-600'
    if (grc <= 2) return 'bg-green-500 text-white'
    if (grc <= 4) return 'bg-yellow-500 text-white'
    if (grc <= 6) return 'bg-orange-500 text-white'
    return 'bg-red-500 text-white'
  }

  if (compact) {
    return (
      <div className="text-center">
        <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-lg font-bold ${getGRCColor(value)}`}>
          {value ?? '?'}
        </div>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    )
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
            onClick={onSyncFromSurvey}
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
              onClick={() => onChange(key)}
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

function UACharacteristicsSelector({ value, onChange, aircraft }) {
  // Try to auto-detect from aircraft specs
  const suggestedUA = useMemo(() => {
    if (!aircraft || aircraft.length === 0) return null
    
    const primary = aircraft.find(a => a.isPrimary) || aircraft[0]
    const maxDim = primary?.maxDimension || primary?.wingspan || 1
    const maxSpeed = primary?.maxSpeed || 25
    
    // Find matching category
    for (const [key, char] of Object.entries(uaCharacteristics)) {
      if (maxDim <= char.maxDimension && maxSpeed <= char.maxSpeed) {
        return key
      }
    }
    return '1m_25ms'
  }, [aircraft])
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          UA Characteristics (Max Dimension / Max Speed)
        </label>
        {suggestedUA && suggestedUA !== value && (
          <button
            type="button"
            onClick={() => onChange(suggestedUA)}
            className="text-xs text-aeria-navy hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Use suggested ({uaCharacteristics[suggestedUA]?.label})
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
              onClick={() => onChange(key)}
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
                <span className="text-xs text-blue-600 mt-1 block">Suggested</span>
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

function MitigationSelector({ mitigationId, mitigation, config, onChange }) {
  const isEnabled = config?.enabled || false
  const robustness = config?.robustness || 'none'
  
  // Get available robustness levels for this mitigation
  const availableLevels = Object.keys(mitigation.reductions).filter(r => r !== 'none')
  
  return (
    <div className={`p-4 rounded-lg border ${isEnabled ? 'border-aeria-navy bg-aeria-navy/5' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => onChange({ ...config, enabled: e.target.checked })}
              className="w-4 h-4 text-aeria-navy rounded focus:ring-aeria-navy"
            />
            <span className="font-medium text-gray-900">{mitigation.name}</span>
          </label>
          <p className="text-sm text-gray-500 mt-1 ml-6">{mitigation.description}</p>
        </div>
        {isEnabled && (
          <span className="text-sm font-medium text-green-600">
            {mitigation.reductions[robustness] || 0} GRC
          </span>
        )}
      </div>
      
      {isEnabled && (
        <div className="ml-6 space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Robustness Level</label>
            <div className="flex gap-2">
              {availableLevels.map(level => {
                const reduction = mitigation.reductions[level]
                const isSelected = robustness === level
                
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onChange({ ...config, robustness: level })}
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
              onChange={(e) => onChange({ ...config, evidence: e.target.value })}
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
            onClick={() => onChange(key)}
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

function TMPRSelector({ value, onChange }) {
  const isEnabled = value?.enabled || false
  const type = value?.type || 'VLOS'
  const robustness = value?.robustness || 'low'
  
  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={isEnabled}
          onChange={(e) => onChange({ ...value, enabled: e.target.checked })}
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
                  onClick={() => onChange({ ...value, type: key })}
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
                  onClick={() => onChange({ ...value, robustness: level })}
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
              onChange={(e) => onChange({ ...value, evidence: e.target.value })}
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
// OSO COMPLIANCE TABLE (ENHANCED)
// ============================================

function OSOComplianceSection({ sail, osoCompliance, onChange }) {
  const [expandedCategory, setExpandedCategory] = useState(null)
  const [showGuidance, setShowGuidance] = useState({})
  
  // Ensure osoCompliance is always an object
  const safeOsoCompliance = osoCompliance || {}
  
  const compliance = useMemo(() => {
    return checkAllOSOCompliance(sail, safeOsoCompliance)
  }, [sail, safeOsoCompliance])
  
  // FIX: Wrap in useCallback with proper dependencies
  const handleOSOChange = useCallback((osoId, updates) => {
    // Create new compliance object with the update
    const newCompliance = {
      ...safeOsoCompliance,
      [osoId]: {
        ...(safeOsoCompliance[osoId] || { robustness: 'none', evidence: '' }),
        ...updates
      }
    }
    onChange(newCompliance)
  }, [safeOsoCompliance, onChange])

  const toggleGuidance = (osoId) => {
    setShowGuidance(prev => ({ ...prev, [osoId]: !prev[osoId] }))
  }
  
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className={`p-4 rounded-lg ${
        compliance.summary.overallCompliant 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-amber-50 border border-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {compliance.summary.overallCompliant ? (
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
            <span className="font-medium">
              {compliance.summary.compliant} of {compliance.summary.total - compliance.summary.optional} required OSOs compliant
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {compliance.summary.nonCompliant} gaps remaining
          </span>
        </div>
      </div>
      
      {/* SAIL indicator */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          <Info className="w-4 h-4 inline mr-1" />
          Requirements shown for <strong>SAIL {sail}</strong>. Select robustness level achieved and provide evidence reference.
        </p>
      </div>
      
      {/* OSO Categories */}
      {Object.entries(osoCategories).map(([catKey, catConfig]) => {
        const catOSOs = compliance.results.filter(o => o.category === catKey)
        const isExpanded = expandedCategory === catKey
        const catCompliant = catOSOs.filter(o => o.compliant || o.required === 'O').length
        
        return (
          <div key={catKey} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedCategory(isExpanded ? null : catKey)}
              className="w-full px-4 py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100"
            >
              <span className="font-medium text-gray-900">{catConfig.label}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm px-2 py-0.5 rounded-full ${
                  catCompliant === catOSOs.length 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {catCompliant}/{catOSOs.length}
                </span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>
            
            {isExpanded && (
              <div className="divide-y divide-gray-100">
                {catOSOs.map(oso => {
                  // Get current robustness for this OSO
                  const currentRobustness = safeOsoCompliance[oso.id]?.robustness || 'none'
                  const currentEvidence = safeOsoCompliance[oso.id]?.evidence || ''
                  const isGuidanceShown = showGuidance[oso.id]
                  
                  // Get evidence guidance for required level
                  const requiredLevel = oso.required === 'L' ? 'low' : oso.required === 'M' ? 'medium' : oso.required === 'H' ? 'high' : null
                  const guidance = oso.evidenceGuidance?.[requiredLevel] || []
                  
                  return (
                    <div key={oso.id} className={`p-4 ${!oso.compliant && oso.required !== 'O' ? 'bg-red-50/30' : ''}`}>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{oso.id}</span>
                            {oso.compliant ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : oso.required === 'O' ? (
                              <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Optional</span>
                            ) : (
                              <X className="w-4 h-4 text-red-500" />
                            )}
                            <span className="text-xs text-gray-400">({oso.responsibility})</span>
                          </div>
                          <p className="text-sm text-gray-600">{oso.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{oso.description}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                            oso.required === 'O' ? 'bg-gray-100 text-gray-600' :
                            oso.required === 'L' ? 'bg-green-100 text-green-700' :
                            oso.required === 'M' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            Required: {oso.requiredLabel}
                          </span>
                          {guidance.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleGuidance(oso.id)}
                              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              <Info className="w-3 h-3" />
                              {isGuidanceShown ? 'Hide' : 'Show'} guidance
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Evidence Guidance */}
                      {isGuidanceShown && guidance.length > 0 && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-xs font-medium text-blue-900 mb-1">
                            Evidence guidance for {requiredLevel} robustness:
                          </p>
                          <ul className="text-xs text-blue-800 space-y-0.5">
                            {guidance.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-blue-500">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Robustness buttons */}
                      <div className="flex gap-2 mb-2">
                        {['none', 'low', 'medium', 'high'].map(level => {
                          const isSelected = currentRobustness === level
                          const meetsRequirement = oso.required === 'O' || 
                            (level === 'low' && ['L'].includes(oso.required)) ||
                            (level === 'medium' && ['L', 'M'].includes(oso.required)) ||
                            (level === 'high')
                          
                          return (
                            <button
                              key={`${oso.id}-${level}`}
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleOSOChange(oso.id, { robustness: level })
                              }}
                              className={`px-3 py-1.5 text-xs rounded font-medium transition-colors ${
                                isSelected
                                  ? 'bg-aeria-navy text-white'
                                  : level !== 'none' && meetsRequirement
                                    ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {level === 'none' ? 'None' : level.charAt(0).toUpperCase() + level.slice(1)}
                            </button>
                          )
                        })}
                      </div>
                      
                      <input
                        type="text"
                        value={currentEvidence}
                        onChange={(e) => handleOSOChange(oso.id, { evidence: e.target.value })}
                        placeholder="Evidence reference (e.g., Training Records Â§3.2, Maintenance Log)"
                        className="input text-sm py-1"
                      />
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
// CONTAINMENT & ADJACENT AREA SECTION
// ============================================

function ContainmentSection({ 
  sail, 
  adjacentPopulation, 
  operationalPopulation,
  containment = {},
  maxSpeed = 25,
  onChange 
}) {
  const [showDetails, setShowDetails] = useState(false)
  
  // Calculate adjacent area distance
  const adjacentDistance = useMemo(() => {
    return calculateAdjacentAreaDistance(maxSpeed)
  }, [maxSpeed])
  
  // Determine if adjacent area has higher population
  const populationOrder = ['controlled', 'remote', 'lightly', 'sparsely', 'suburban', 'highdensity', 'assembly']
  const opIdx = populationOrder.indexOf(operationalPopulation || 'sparsely')
  const adjIdx = populationOrder.indexOf(adjacentPopulation || operationalPopulation || 'sparsely')
  const adjacentIsHigher = adjIdx > opIdx
  
  // Get required containment robustness
  const requiredRobustness = useMemo(() => {
    if (!adjacentIsHigher) return 'none'
    return getContainmentRequirement(adjacentPopulation, sail) || 'low'
  }, [adjacentPopulation, sail, adjacentIsHigher])
  
  // Check if current containment meets requirement
  const currentMethod = containment.method || 'none'
  const currentRobustness = containmentMethods[currentMethod]?.robustnessAchievable || 'none'
  const robustnessOrder = ['none', 'low', 'medium', 'high']
  const meetsRequirement = robustnessOrder.indexOf(currentRobustness) >= robustnessOrder.indexOf(requiredRobustness)
  
  return (
    <div className="space-y-4">
      {/* Adjacent Area Assessment */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Adjacent Area Assessment</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Operational Area</p>
            <p className="font-medium text-gray-900">
              {populationCategories[operationalPopulation]?.label || 'Not set'}
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500 mb-1">Adjacent Area (within {(adjacentDistance/1000).toFixed(0)}km)</p>
            <select
              value={adjacentPopulation || ''}
              onChange={(e) => onChange({ adjacentPopulation: e.target.value })}
              className="input text-sm py-1 mt-1"
            >
              <option value="">Same as operational</option>
              {Object.entries(populationCategories).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Adjacent Area Status */}
        {adjacentIsHigher ? (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">Higher Population Adjacent</p>
                <p className="text-sm text-amber-700 mt-1">
                  Adjacent area has higher population density. You must either:
                </p>
                <ul className="text-sm text-amber-700 mt-1 ml-4 list-disc">
                  <li>Demonstrate containment with <strong>{requiredRobustness}</strong> robustness, OR</li>
                  <li>Use the higher population category for GRC calculation</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-green-800">
                Adjacent area population is same or lower - no additional containment required.
              </p>
            </div>
          </div>
        )}
      </div>
      
      {/* Containment Method Selection */}
      {adjacentIsHigher && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Containment Method</h4>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              requiredRobustness === 'low' ? 'bg-green-100 text-green-700' :
              requiredRobustness === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              Required: {requiredRobustness.charAt(0).toUpperCase() + requiredRobustness.slice(1)}
            </span>
          </div>
          
          <div className="space-y-2">
            {Object.entries(containmentMethods).map(([key, method]) => {
              const isSelected = currentMethod === key
              const methodMeetsReq = robustnessOrder.indexOf(method.robustnessAchievable) >= robustnessOrder.indexOf(requiredRobustness)
              
              return (
                <label
                  key={key}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-aeria-navy/5 border-aeria-navy' 
                      : methodMeetsReq && key !== 'none'
                        ? 'bg-green-50/50 border-green-200 hover:border-green-300'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="containmentMethod"
                    value={key}
                    checked={isSelected}
                    onChange={() => onChange({ method: key })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{method.label}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        method.robustnessAchievable === 'none' ? 'bg-gray-100 text-gray-600' :
                        method.robustnessAchievable === 'low' ? 'bg-green-100 text-green-700' :
                        method.robustnessAchievable === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {method.robustnessAchievable === 'none' ? 'N/A' : method.robustnessAchievable}
                      </span>
                      {methodMeetsReq && key !== 'none' && (
                        <Check className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{method.description}</p>
                  </div>
                </label>
              )
            })}
          </div>
          
          {/* Evidence Requirements */}
          {currentMethod !== 'none' && containmentMethods[currentMethod]?.evidenceRequired?.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <span className="text-sm font-medium text-blue-900">Evidence Required</span>
                {showDetails ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
              </button>
              {showDetails && (
                <ul className="mt-2 text-sm text-blue-800 space-y-1">
                  {containmentMethods[currentMethod].evidenceRequired.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-blue-500">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          
          {/* Evidence Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Containment Evidence Reference
            </label>
            <input
              type="text"
              value={containment.evidence || ''}
              onChange={(e) => onChange({ evidence: e.target.value })}
              placeholder="e.g., Geofence test report Â§4.2, FTS certification..."
              className="input"
            />
          </div>
          
          {/* Compliance Status */}
          <div className={`p-4 rounded-lg ${
            meetsRequirement 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {meetsRequirement ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-900">Containment requirement met</span>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-900">
                    Containment requirement not met - select method with {requiredRobustness} robustness
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// MULTI-SITE SUMMARY
// ============================================

function MultiSiteSummary({ sites, calculations }) {
  const summary = useMemo(() => {
    const siteSummaries = sites.map(site => {
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
      siteCount: sites.length
    }
  }, [sites, calculations])
  
  if (sites.length <= 1) return null
  
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
  // State for aircraft modal
  const [showAircraftModal, setShowAircraftModal] = useState(false)

  // Get sites array
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  // Active site
  const activeSiteId = project?.activeSiteId || sites[0]?.id || null
  const activeSite = useMemo(() => {
    return sites.find(s => s.id === activeSiteId) || sites[0] || null
  }, [sites, activeSiteId])
  
  // Site's SORA data - ensure it's always an object
  const siteSORA = useMemo(() => {
    return activeSite?.soraAssessment || {}
  }, [activeSite?.soraAssessment])
  
  // Project aircraft pool
  const projectAircraftPool = project?.aircraft || []
  
  // Site-specific aircraft (IDs only)
  const siteAircraftIds = activeSite?.flightPlan?.aircraft || []
  const sitePrimaryAircraftId = activeSite?.flightPlan?.primaryAircraftId
  
  // Get full aircraft objects for site assignment
  const siteAircraft = useMemo(() => {
    if (siteAircraftIds.length > 0) {
      return projectAircraftPool.filter(a => siteAircraftIds.includes(a.id))
    }
    // Fall back to project-level aircraft if no site assignment
    return project?.flightPlan?.aircraft || []
  }, [siteAircraftIds, projectAircraftPool, project?.flightPlan?.aircraft])
  
  // Get primary aircraft for this site
  const primaryAircraft = useMemo(() => {
    if (sitePrimaryAircraftId) {
      return projectAircraftPool.find(a => a.id === sitePrimaryAircraftId)
    }
    // Fall back to first site aircraft or project primary
    if (siteAircraft.length > 0) {
      return siteAircraft.find(a => a.isPrimary) || siteAircraft[0]
    }
    return null
  }, [sitePrimaryAircraftId, siteAircraft, projectAircraftPool])
  
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
    onUpdate({ activeSiteId: siteId })
  }, [onUpdate])
  
  // FIX: Improved updateSiteSORA with explicit immutable update
  const updateSiteSORA = useCallback((updates) => {
    if (!activeSiteId || !sites.length) return
    
    const updatedSites = sites.map(site => {
      if (site.id !== activeSiteId) return site
      
      // Create completely new objects for proper React detection
      const newSoraAssessment = {
        ...(site.soraAssessment || {}),
        ...updates,
        lastUpdated: new Date().toISOString()
      }
      
      return {
        ...site,
        soraAssessment: newSoraAssessment,
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

  // Handle aircraft selected from modal
  const handleAircraftFromModal = useCallback((aircraft) => {
    // Add to project aircraft list if not already there
    const currentAircraft = project?.aircraft || []
    const exists = currentAircraft.some(a => a.id === aircraft.id)

    const updates = {}

    if (!exists) {
      updates.aircraft = [
        ...currentAircraft,
        {
          id: aircraft.id,
          nickname: aircraft.nickname,
          make: aircraft.make,
          model: aircraft.model,
          serialNumber: aircraft.serialNumber,
          mtow: aircraft.mtow,
          maxSpeed: aircraft.maxSpeed,
          endurance: aircraft.endurance
        }
      ]
    }

    // Auto-assign to current site's flight plan and set as primary
    if (activeSiteId) {
      const currentSiteAircraft = activeSite?.flightPlan?.aircraft || []
      if (!currentSiteAircraft.includes(aircraft.id)) {
        const updatedSites = sites.map(site => {
          if (site.id !== activeSiteId) return site
          return {
            ...site,
            flightPlan: {
              ...site.flightPlan,
              aircraft: [...currentSiteAircraft, aircraft.id],
              primaryAircraftId: aircraft.id
            }
          }
        })
        updates.sites = updatedSites
      }
    }

    if (Object.keys(updates).length > 0) {
      onUpdate(updates)
    }
  }, [project?.aircraft, sites, activeSiteId, activeSite?.flightPlan?.aircraft, onUpdate])

  // ============================================
  // AUTO-SYNC FROM SITE SURVEY AND FLIGHT PLAN
  // ============================================
  
  // Auto-sync population category from Site Survey when it changes
  useEffect(() => {
    const surveyPopulation = activeSite?.siteSurvey?.population?.category
    const currentPopulation = siteSORA?.populationCategory
    
    // Only auto-sync if:
    // 1. Site survey has a population category set
    // 2. SORA doesn't have one yet (null/undefined) OR
    //    We want to keep them in sync (user hasn't manually changed it)
    if (surveyPopulation && !currentPopulation) {
      updateSiteSORA({ populationCategory: surveyPopulation })
    }
  }, [activeSite?.siteSurvey?.population?.category, activeSiteId])
  
  // Auto-sync adjacent population from Site Survey
  useEffect(() => {
    const surveyAdjacent = activeSite?.siteSurvey?.population?.adjacentCategory
    const currentAdjacent = siteSORA?.adjacentAreaPopulation
    
    if (surveyAdjacent && !currentAdjacent) {
      updateSiteSORA({ adjacentAreaPopulation: surveyAdjacent })
    }
  }, [activeSite?.siteSurvey?.population?.adjacentCategory, activeSiteId])
  
  // Auto-sync UA characteristics from site's primary aircraft
  useEffect(() => {
    if (!primaryAircraft) return
    if (siteSORA?.uaCharacteristics) return // Already set
    
    const maxDim = primaryAircraft?.maxDimension || primaryAircraft?.wingspan || 1
    const maxSpeed = primaryAircraft?.maxSpeed || 25
    
    // Find matching UA characteristic category
    let suggestedUA = '1m_25ms'
    for (const [key, char] of Object.entries(uaCharacteristics)) {
      if (maxDim <= char.maxDimension && maxSpeed <= char.maxSpeed) {
        suggestedUA = key
        break
      }
    }
    
    updateSiteSORA({ uaCharacteristics: suggestedUA })
  }, [primaryAircraft, activeSiteId])
  
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
          <p className="text-sm text-gray-500">JARUS Specific Operations Risk Assessment</p>
        </div>
        {sites.length > 1 && (
          <SiteSelectorBar
            sites={sites}
            activeSiteId={activeSiteId}
            onSelectSite={handleSelectSite}
            calculations={calculations}
          />
        )}
      </div>

      {/* Visual Risk Path Summary - Always visible */}
      <SORARiskPathSummary calc={activeCalc} sail={activeCalc.sail} />

      {/* Multi-Site Summary - Only show for multiple sites */}
      {sites.length > 1 && <MultiSiteSummary sites={sites} calculations={calculations} />}

      {/* No Aircraft Warning */}
      {!primaryAircraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Plane className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-amber-900">No Aircraft Assigned</h3>
                <p className="text-sm text-amber-700 mt-1">
                  SORA calculations require aircraft specifications (weight, speed) to determine risk categories.
                  Assign an aircraft to get accurate assessments.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAircraftModal(true)}
              className="btn btn-primary whitespace-nowrap"
            >
              Add Aircraft
            </button>
          </div>
        </div>
      )}

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
        title="Ground Risk - Intrinsic GRC"
        stepNumber={2}
        badge={activeCalc.iGRC ? `iGRC ${activeCalc.iGRC}` : null}
        status={activeCalc.iGRC ? 'complete' : 'missing'}
      >
        <p className="text-sm text-gray-600 mb-4">
          Select the population category and UA characteristics to determine intrinsic ground risk.
        </p>

        <PopulationSelector
          value={siteSORA.populationCategory || activeCalc.population}
          onChange={(v) => updateSiteSORA({ populationCategory: v })}
          fromSiteSurvey={activeSite?.siteSurvey?.population?.category}
          onSyncFromSurvey={syncPopulationFromSurvey}
        />

        <div className="mt-4">
          <UACharacteristicsSelector
            value={siteSORA.uaCharacteristics || activeCalc.uaChar}
            onChange={(v) => updateSiteSORA({ uaCharacteristics: v })}
            aircraft={siteAircraft}
          />
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-center gap-4">
          <span className="text-sm text-gray-600">Result:</span>
          <GRCDisplay label="iGRC" value={activeCalc.iGRC} compact />
        </div>
      </CollapsibleSection>
      
      {/* Step 3: Final GRC */}
      <CollapsibleSection
        title="Ground Risk Mitigations"
        stepNumber={3}
        badge={activeCalc.fGRC != null ? `fGRC ${activeCalc.fGRC}` : null}
        status={activeCalc.iGRC != null ? 'complete' : 'missing'}
      >
        <p className="text-sm text-gray-600 mb-4">
          Apply mitigations to reduce ground risk class. Each mitigation can reduce the GRC.
        </p>

        <div className="space-y-3">
          {Object.entries(groundMitigations).map(([key, mitigation]) => (
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

        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-center gap-4">
          <GRCDisplay label="iGRC" value={activeCalc.iGRC} compact />
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <GRCDisplay label="fGRC" value={activeCalc.fGRC} compact />
        </div>
      </CollapsibleSection>
      
      {/* Step 4: Initial Air Risk Class */}
      <CollapsibleSection
        title="Air Risk - Initial ARC"
        stepNumber={4}
        badge={siteSORA.initialARC || 'ARC-b'}
        status={siteSORA.initialARC ? 'complete' : 'missing'}
      >
        <p className="text-sm text-gray-600 mb-4">
          Select the initial Air Risk Class based on airspace and expected traffic density.
        </p>

        <ARCSelector
          value={siteSORA.initialARC || 'ARC-b'}
          onChange={(v) => updateSiteSORA({ initialARC: v })}
        />
      </CollapsibleSection>
      
      {/* Step 5: Residual ARC (TMPR) */}
      <CollapsibleSection
        title="Air Risk Mitigations (TMPR)"
        stepNumber={5}
        badge={activeCalc.residualARC}
        status={siteSORA.tmpr?.enabled ? 'complete' : 'info'}
      >
        <p className="text-sm text-gray-600 mb-4">
          Apply Tactical Mitigation Performance Requirements to reduce air risk.
        </p>

        <TMPRSelector
          value={siteSORA.tmpr || {}}
          onChange={(v) => updateSiteSORA({ tmpr: v })}
        />

        <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center justify-center gap-4">
          <div className="text-center">
            <span className="text-lg font-bold">{siteSORA.initialARC || 'ARC-b'}</span>
            <p className="text-xs text-gray-500">Initial</p>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="text-center">
            <span className="text-lg font-bold text-green-600">{activeCalc.residualARC}</span>
            <p className="text-xs text-gray-500">Residual</p>
          </div>
        </div>
      </CollapsibleSection>
      
      {/* Step 6: SAIL Determination */}
      <CollapsibleSection
        title="SAIL Determination"
        stepNumber={6}
        badge={activeCalc.sail ? `SAIL ${activeCalc.sail}` : null}
        status={activeCalc.sail ? 'complete' : 'missing'}
        defaultOpen={false}
      >
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">fGRC</p>
              <p className="text-xl font-bold">{activeCalc.fGRC ?? '?'}</p>
            </div>
            <span className="text-gray-300 text-xl">×</span>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Res. ARC</p>
              <p className="text-xl font-bold">{activeCalc.residualARC}</p>
            </div>
            <span className="text-gray-300 text-xl">=</span>
            <SAILBadge sail={activeCalc.sail} size="lg" />
          </div>

          {activeCalc.sail && sailDescriptions[activeCalc.sail] && (
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              {sailDescriptions[activeCalc.sail]}
            </p>
          )}
        </div>
      </CollapsibleSection>
      
      {/* Step 7: OSO Compliance - FIX: Added key prop for proper re-rendering */}
      {activeCalc.sail && (
        <CollapsibleSection
          title="Operational Safety Objectives (OSO)"
          stepNumber={7}
          defaultOpen={false}
        >
          <OSOComplianceSection
            key={`oso-${activeSiteId}`}
            sail={activeCalc.sail}
            osoCompliance={siteSORA.osoCompliance || {}}
            onChange={(v) => updateSiteSORA({ osoCompliance: v })}
          />
        </CollapsibleSection>
      )}
      
      {/* Step 8: Containment & Adjacent Area */}
      {activeCalc.sail && (
        <CollapsibleSection
          title="Containment & Adjacent Area"
          stepNumber={8}
          defaultOpen={false}
          status={
            !siteSORA.adjacentAreaPopulation ? 'incomplete' :
            (siteSORA.containment?.method && siteSORA.containment.method !== 'none') ? 'complete' : 
            'incomplete'
          }
        >
          <ContainmentSection
            sail={activeCalc.sail}
            adjacentPopulation={siteSORA.adjacentAreaPopulation}
            operationalPopulation={siteSORA.populationCategory || activeCalc.population}
            containment={siteSORA.containment || {}}
            maxSpeed={primaryAircraft?.maxSpeed || 25}
            onChange={(updates) => {
              const newData = {}
              if (updates.adjacentPopulation !== undefined) {
                newData.adjacentAreaPopulation = updates.adjacentPopulation
              }
              if (updates.method !== undefined || updates.evidence !== undefined) {
                newData.containment = {
                  ...(siteSORA.containment || {}),
                  ...(updates.method !== undefined && { method: updates.method }),
                  ...(updates.evidence !== undefined && { evidence: updates.evidence })
                }
              }
              updateSiteSORA(newData)
            }}
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

      {/* No Aircraft Modal */}
      <NoAircraftAssignedModal
        isOpen={showAircraftModal}
        onClose={() => setShowAircraftModal(false)}
        onAircraftSelected={handleAircraftFromModal}
        context="SORA"
      />
    </div>
  )
}

ProjectSORA.propTypes = {
  project: PropTypes.shape({
    sora: PropTypes.object,
    sites: PropTypes.array,
    aircraft: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onNavigateToSection: PropTypes.func
}
