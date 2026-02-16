/**
 * ProjectOverview.jsx
 * Multi-site project overview with summary cards and quick actions
 * 
 * Features:
 * - Project summary header
 * - Multi-site status cards
 * - SORA summary across all sites
 * - Quick navigation to sections
 * - Export options
 * - Completion progress
 * 
 * @location src/components/projects/ProjectOverview.jsx
 * @action NEW
 */

import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  MapPin,
  Plane,
  Shield,
  AlertTriangle,
  FileText,
  Users,
  Calendar,
  Clock,
  Check,
  X,
  ChevronRight,
  Download,
  Eye,
  Target,
  Flag,
  Navigation,
  Gauge,
  Cloud,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react'
import {
  sailColors,
  populationCategories,
  getIntrinsicGRC,
  calculateFinalGRC,
  calculateResidualARC,
  getSAIL
} from '../../lib/soraConfig'
import ProjectServicesSection from './ProjectServicesSection'

// ============================================
// SITE STATUS CARD
// ============================================

function SiteStatusCard({ site, index, calculations, onNavigate, onSelect }) {
  const calc = calculations?.[site.id] || {}
  const mapData = site.mapData || {}
  
  // Completion checks
  const checks = {
    siteSurvey: {
      location: !!mapData.siteSurvey?.siteLocation,
      boundary: !!mapData.siteSurvey?.operationsBoundary,
      population: !!site.siteSurvey?.population?.category
    },
    flightPlan: {
      launchPoint: !!mapData.flightPlan?.launchPoint,
      recoveryPoint: !!mapData.flightPlan?.recoveryPoint,
      operationType: !!site.flightPlan?.operationType
    },
    emergency: {
      musterPoint: (mapData.emergency?.musterPoints?.length || 0) > 0,
      route: (mapData.emergency?.evacuationRoutes?.length || 0) > 0
    },
    sora: {
      population: !!site.soraAssessment?.populationCategory,
      uaChar: !!site.soraAssessment?.uaCharacteristics,
      sail: !!calc.sail
    }
  }
  
  const surveyComplete = Object.values(checks.siteSurvey).every(Boolean)
  const flightComplete = Object.values(checks.flightPlan).every(Boolean)
  const emergencyComplete = Object.values(checks.emergency).every(Boolean)
  const soraComplete = Object.values(checks.sora).every(Boolean)
  
  const totalChecks = [
    ...Object.values(checks.siteSurvey),
    ...Object.values(checks.flightPlan),
    ...Object.values(checks.emergency),
    ...Object.values(checks.sora)
  ]
  const completedChecks = totalChecks.filter(Boolean).length
  const completionPercent = Math.round((completedChecks / totalChecks.length) * 100)
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => onSelect?.(site.id)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}
            >
              {index + 1}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{site.name || `Site ${index + 1}`}</h3>
              <p className="text-sm text-gray-500">{site.siteSurvey?.location || 'Location not set'}</p>
            </div>
          </div>
          
          {calc.sail && (
            <span 
              className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ 
                backgroundColor: sailColors[calc.sail],
                color: calc.sail === 'I' || calc.sail === 'II' ? '#1F2937' : '#FFFFFF'
              }}
            >
              SAIL {calc.sail}
            </span>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-gray-500">Completion</span>
            <span className={`font-medium ${
              completionPercent === 100 ? 'text-green-600' :
              completionPercent >= 50 ? 'text-amber-600' : 'text-gray-600'
            }`}>
              {completionPercent}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full transition-all ${
                completionPercent === 100 ? 'bg-green-500' :
                completionPercent >= 50 ? 'bg-amber-500' : 'bg-gray-400'
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
        
        {/* Status Grid */}
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div className={`p-2 rounded text-center ${surveyComplete ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
            <MapPin className="w-4 h-4 mx-auto mb-1" />
            Survey
          </div>
          <div className={`p-2 rounded text-center ${flightComplete ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
            <Plane className="w-4 h-4 mx-auto mb-1" />
            Flight
          </div>
          <div className={`p-2 rounded text-center ${emergencyComplete ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
            <Flag className="w-4 h-4 mx-auto mb-1" />
            Emergency
          </div>
          <div className={`p-2 rounded text-center ${soraComplete ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>
            <Shield className="w-4 h-4 mx-auto mb-1" />
            SORA
          </div>
        </div>
      </div>
      
      {/* Footer Actions */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {site.flightPlan?.operationType || 'VLOS'} • GRC: {calc.fGRC ?? '?'}
        </span>
        <button
          onClick={() => onSelect?.(site.id)}
          className="text-xs text-aeria-navy hover:underline flex items-center gap-1"
        >
          View Details
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}

// ============================================
// PROJECT SUMMARY HEADER
// ============================================

function ProjectSummaryHeader({ project, sites, calculations }) {
  const maxSAIL = useMemo(() => {
    const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
    let maxIndex = -1
    
    sites.forEach(site => {
      const calc = calculations[site.id]
      const idx = sailOrder.indexOf(calc?.sail)
      if (idx > maxIndex) maxIndex = idx
    })
    
    return maxIndex >= 0 ? sailOrder[maxIndex] : null
  }, [sites, calculations])
  
  const allWithinScope = useMemo(() => {
    return sites.every(site => {
      const calc = calculations[site.id]
      return calc?.fGRC === null || calc?.fGRC <= 7
    })
  }, [sites, calculations])
  
  const operationTypes = [...new Set(sites.map(s => s.flightPlan?.operationType || 'VLOS'))]
  
  // Format project date - show range if both start and end exist
  const formatProjectDate = () => {
    if (!project?.startDate) return 'No Date'
    const startDate = new Date(project.startDate).toLocaleDateString()
    if (project?.endDate) {
      const endDate = new Date(project.endDate).toLocaleDateString()
      return startDate === endDate ? startDate : `${startDate} - ${endDate}`
    }
    return startDate
  }

  return (
    <div className="bg-gradient-to-r from-aeria-navy to-aeria-navy/80 text-white rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-2">{project?.name || 'Unnamed Project'}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              {project?.projectCode || 'No Code'}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {project?.clientName || 'No Client'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatProjectDate()}
            </span>
          </div>
        </div>

        {/* Summary stats - aligned grid for consistent sizing */}
        <div className="grid grid-cols-4 gap-4 lg:gap-6">
          <div className="text-center min-w-[80px]">
            <p className="text-white/70 text-xs mb-1 uppercase tracking-wide">Sites</p>
            <p className="text-2xl font-bold leading-8">{sites.length}</p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-white/70 text-xs mb-1 uppercase tracking-wide">Operations</p>
            <p className="text-sm font-medium leading-8 truncate" title={operationTypes.join(', ')}>
              {operationTypes.join(', ') || 'N/A'}
            </p>
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-white/70 text-xs mb-1 uppercase tracking-wide">SAIL</p>
            {maxSAIL ? (
              <span
                className="inline-block px-3 py-0.5 rounded-full text-sm font-bold leading-7"
                style={{
                  backgroundColor: sailColors[maxSAIL],
                  color: maxSAIL === 'I' || maxSAIL === 'II' ? '#1F2937' : '#FFFFFF'
                }}
              >
                {maxSAIL}
              </span>
            ) : (
              <span className="text-sm leading-8">N/A</span>
            )}
          </div>
          <div className="text-center min-w-[80px]">
            <p className="text-white/70 text-xs mb-1 uppercase tracking-wide">SORA</p>
            <div className="leading-8">
              {allWithinScope ? (
                <span className="inline-flex items-center gap-1 text-green-400 text-sm font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  In Scope
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-red-400 text-sm font-medium">
                  <XCircle className="w-5 h-5" />
                  Review
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// QUICK STATS ROW
// ============================================

function QuickStatsRow({ project, sites, calculations }) {
  const stats = useMemo(() => {
    let totalMusterPoints = 0
    let totalRoutes = 0
    let sitesWithLaunch = 0
    let sitesWithBoundary = 0
    
    sites.forEach(site => {
      totalMusterPoints += site.mapData?.emergency?.musterPoints?.length || 0
      totalRoutes += site.mapData?.emergency?.evacuationRoutes?.length || 0
      if (site.mapData?.flightPlan?.launchPoint) sitesWithLaunch++
      if (site.mapData?.siteSurvey?.operationsBoundary) sitesWithBoundary++
    })
    
    return {
      aircraft: project?.aircraft?.length || 0,
      crew: project?.crew?.length || 0,
      musterPoints: totalMusterPoints,
      routes: totalRoutes,
      sitesWithLaunch,
      sitesWithBoundary,
      emergencyContacts: project?.emergencyPlan?.contacts?.length || 0
    }
  }, [project, sites])
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <Plane className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.aircraft}</p>
        <p className="text-xs text-gray-500">Aircraft</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <Users className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.crew}</p>
        <p className="text-xs text-gray-500">Crew</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <Target className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.sitesWithBoundary}/{sites.length}</p>
        <p className="text-xs text-gray-500">Boundaries</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <Navigation className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.sitesWithLaunch}/{sites.length}</p>
        <p className="text-xs text-gray-500">Launch Points</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <Flag className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.musterPoints}</p>
        <p className="text-xs text-gray-500">Muster Points</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <AlertTriangle className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.routes}</p>
        <p className="text-xs text-gray-500">Evac Routes</p>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
        <Shield className="w-5 h-5 mx-auto text-gray-400 mb-1" />
        <p className="text-xl font-bold text-gray-900">{stats.emergencyContacts}</p>
        <p className="text-xs text-gray-500">Contacts</p>
      </div>
    </div>
  )
}

// ============================================
// QUICK ACTIONS
// ============================================

function QuickActions({ onNavigate, onExport }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <button
          onClick={() => onNavigate?.('siteSurvey')}
          className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 text-sm text-center transition-colors"
        >
          <MapPin className="w-5 h-5 mx-auto mb-1" />
          Site Survey
        </button>
        <button
          onClick={() => onNavigate?.('flightPlan')}
          className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm text-center transition-colors"
        >
          <Plane className="w-5 h-5 mx-auto mb-1" />
          Flight Plan
        </button>
        <button
          onClick={() => onNavigate?.('emergency')}
          className="p-3 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 text-sm text-center transition-colors"
        >
          <AlertTriangle className="w-5 h-5 mx-auto mb-1" />
          Emergency
        </button>
        <button
          onClick={() => onNavigate?.('sora')}
          className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 text-sm text-center transition-colors"
        >
          <Shield className="w-5 h-5 mx-auto mb-1" />
          SORA
        </button>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
        <button
          onClick={() => onExport?.('operations-plan')}
          className="px-4 py-2 bg-aeria-navy text-white rounded-lg text-sm flex items-center gap-2 hover:bg-aeria-navy/90"
        >
          <Download className="w-4 h-4" />
          Export Operations Plan
        </button>
        <button
          onClick={() => onExport?.('sora')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200"
        >
          <Download className="w-4 h-4" />
          Export SORA
        </button>
      </div>
    </div>
  )
}

// ============================================
// PROJECT DETAILS (Editable)
// ============================================

function ProjectDetails({ project, onUpdate }) {
  const handleChange = (field, value) => {
    onUpdate({ [field]: value })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
        <FileText className="w-4 h-4" />
        Project Details
      </h3>

      <div className="space-y-4">
        {/* Estimated Field Days - Key for cost calculations */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-medium text-blue-800">
              Estimated Field Days
            </label>
            {/* Show project dates as a guide */}
            {(project?.startDate || project?.endDate) && (
              <span className="text-xs text-blue-600 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {project?.startDate && project?.endDate && project.startDate !== project.endDate ? (
                  <>
                    {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {(() => {
                      const start = new Date(project.startDate)
                      const end = new Date(project.endDate)
                      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
                      return ` (${diffDays} days)`
                    })()}
                  </>
                ) : project?.startDate ? (
                  new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                ) : null}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              step="0.5"
              value={project?.estimatedFieldDays || ''}
              onChange={(e) => handleChange('estimatedFieldDays', e.target.value ? parseFloat(e.target.value) : null)}
              className="w-24 px-3 py-1.5 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <span className="text-sm text-blue-700">days</span>
            <span className="text-xs text-blue-600 ml-2">
              (Used for field cost calculations)
            </span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Author / Prepared By</label>
          <input
            type="text"
            value={project?.author || ''}
            onChange={(e) => handleChange('author', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent"
            placeholder="Name of plan author"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Authorities / Approvals Required</label>
          <textarea
            value={project?.authorities || ''}
            onChange={(e) => handleChange('authorities', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent min-h-[60px]"
            placeholder="e.g., NAV CANADA, SFOC, Site access permits..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Deliverables</label>
          <textarea
            value={project?.deliverables || ''}
            onChange={(e) => handleChange('deliverables', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent min-h-[60px]"
            placeholder="e.g., Orthomosaic, 3D model, Inspection report..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Scope of Work</label>
          <textarea
            value={project?.scope || ''}
            onChange={(e) => handleChange('scope', e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-blue focus:border-transparent min-h-[80px]"
            placeholder="Describe the project scope, objectives, and boundaries..."
          />
        </div>
      </div>
    </div>
  )
}

// ============================================
// DOCUMENT CHECKLIST SUMMARY (Links to Review)
// ============================================

function DocumentChecklistSummary({ project, onNavigate }) {
  const checklist = project?.documentChecklist || {}
  const totalDocs = 8 // Base number of documents
  const completedDocs = Object.values(checklist).filter(Boolean).length
  const progress = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Documents
        </h3>
        <button
          onClick={() => onNavigate?.('review')}
          className="text-xs text-aeria-navy hover:underline"
        >
          Manage
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Checklist Progress</span>
          <span className={`font-medium ${completedDocs === totalDocs ? 'text-green-600' : 'text-gray-900'}`}>
            {completedDocs}/{totalDocs}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${completedDocs === totalDocs ? 'bg-green-500' : 'bg-aeria-blue'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quick status */}
      <div className="text-sm">
        {completedDocs === 0 ? (
          <p className="text-gray-500">No documents verified yet</p>
        ) : completedDocs === totalDocs ? (
          <p className="text-green-600 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            All documents verified
          </p>
        ) : (
          <p className="text-amber-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {totalDocs - completedDocs} documents remaining
          </p>
        )}
      </div>
    </div>
  )
}

// ============================================
// TEAM SUMMARY
// ============================================

function TeamSummary({ project, onNavigate }) {
  const crew = project?.crew || []
  const roles = {
    pic: crew.filter(c => c.role === 'PIC' || c.role === 'pic'),
    vo: crew.filter(c => c.role === 'VO' || c.role === 'vo'),
    other: crew.filter(c => !['PIC', 'pic', 'VO', 'vo'].includes(c.role))
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Users className="w-4 h-4" />
          Crew Assignment
        </h3>
        <button
          onClick={() => onNavigate?.('crew')}
          className="text-xs text-aeria-navy hover:underline"
        >
          Manage
        </button>
      </div>
      
      {crew.length === 0 ? (
        <p className="text-sm text-gray-500">No crew assigned yet</p>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Pilots in Command (PIC)</span>
            <span className="font-medium">{roles.pic.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Visual Observers (VO)</span>
            <span className="font-medium">{roles.vo.length}</span>
          </div>
          {roles.other.length > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Other Crew</span>
              <span className="font-medium">{roles.other.length}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm font-medium">
              <span className="text-gray-900">Total Crew</span>
              <span>{crew.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// REGULATORY CHECKLIST
// ============================================

function RegulatoryChecklist({ project, sites, calculations }) {
  const maxSAIL = useMemo(() => {
    const sails = Object.values(calculations).map(c => c.sail).filter(Boolean)
    if (sails.length === 0) return null
    const sailOrder = ['I', 'II', 'III', 'IV', 'V', 'VI']
    return sails.reduce((max, s) => sailOrder.indexOf(s) > sailOrder.indexOf(max) ? s : max, 'I')
  }, [calculations])
  
  // Check various regulatory requirements
  const checks = [
    {
      id: 'rpas_reg',
      name: 'RPAS Registration',
      description: 'Aircraft registered with Transport Canada',
      status: (project?.aircraft || []).every(a => a.registration) ? 'complete' : 'incomplete'
    },
    {
      id: 'pilot_cert',
      name: 'Pilot Certificate',
      description: 'Valid Advanced Operations certificate',
      status: (project?.crew || []).some(c => c.certifications?.includes('advanced')) ? 'complete' : 'incomplete'
    },
    {
      id: 'sora_complete',
      name: 'SORA Assessment',
      description: 'All sites have valid SORA assessment',
      status: sites.every(s => calculations[s.id]?.sail) ? 'complete' : 'incomplete'
    },
    {
      id: 'airspace_auth',
      name: 'Airspace Authorization',
      description: 'Required for controlled airspace',
      status: sites.some(s => s.flightPlan?.airspace?.controlled && !s.flightPlan?.airspace?.atcCoordinationRequired) 
        ? 'required' 
        : sites.some(s => s.flightPlan?.airspace?.controlled) 
          ? 'complete' 
          : 'not_required'
    },
    {
      id: 'notam',
      name: 'NOTAM Filed',
      description: 'Notice to Airmen if required',
      status: sites.some(s => s.flightPlan?.airspace?.notamRequired && !project?.notamFiled)
        ? 'required'
        : 'not_required'
    },
    {
      id: 'sfoc',
      name: 'SFOC Application',
      description: 'Special Flight Operations Certificate',
      status: maxSAIL && ['IV', 'V', 'VI'].includes(maxSAIL)
        ? (project?.sfocStatus === 'approved' ? 'complete' : 'required')
        : 'not_required'
    }
  ]
  
  const statusIcons = {
    complete: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    incomplete: <XCircle className="w-4 h-4 text-red-500" />,
    required: <AlertCircle className="w-4 h-4 text-amber-500" />,
    not_required: <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
  }
  
  const statusColors = {
    complete: 'text-green-700 bg-green-50',
    incomplete: 'text-red-700 bg-red-50',
    required: 'text-amber-700 bg-amber-50',
    not_required: 'text-gray-500 bg-gray-50'
  }
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Regulatory Compliance
        </h3>
        {maxSAIL && (
          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
            Max SAIL {maxSAIL}
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        {checks.map(check => (
          <div 
            key={check.id}
            className={`flex items-center justify-between py-1.5 px-2 rounded ${statusColors[check.status]}`}
          >
            <div className="flex items-center gap-2">
              {statusIcons[check.status]}
              <div>
                <span className="text-sm font-medium">{check.name}</span>
                <p className="text-xs opacity-75">{check.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ============================================
// PROJECT TIMELINE
// ============================================

function ProjectTimeline({ project }) {
  const timeline = project?.timeline || {}
  
  const milestones = [
    { id: 'created', label: 'Project Created', date: project?.createdAt, status: 'complete' },
    { id: 'survey', label: 'Site Surveys', date: timeline.surveyComplete, status: timeline.surveyComplete ? 'complete' : 'pending' },
    { id: 'sora', label: 'SORA Assessment', date: timeline.soraComplete, status: timeline.soraComplete ? 'complete' : 'pending' },
    { id: 'review', label: 'Review & Approval', date: timeline.reviewComplete, status: timeline.reviewComplete ? 'complete' : 'pending' },
    { id: 'operation', label: 'Operation Date', date: project?.operationDate || project?.startDate, status: 'upcoming' }
  ]
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4" />
        Project Timeline
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gray-200" />
        
        <div className="space-y-4">
          {milestones.map((milestone, idx) => (
            <div key={milestone.id} className="flex items-start gap-3 relative">
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 ${
                milestone.status === 'complete' 
                  ? 'bg-green-500 border-green-500' 
                  : milestone.status === 'upcoming'
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white border-gray-300'
              }`}>
                {milestone.status === 'complete' && (
                  <Check className="w-3 h-3 text-white" style={{ marginLeft: '0.5px', marginTop: '0.5px' }} />
                )}
              </div>
              <div className="flex-1 -mt-0.5">
                <p className={`text-sm font-medium ${
                  milestone.status === 'complete' ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {milestone.label}
                </p>
                {milestone.date && (
                  <p className="text-xs text-gray-400">
                    {new Date(milestone.date).toLocaleDateString('en-CA', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProjectOverview({ 
  project, 
  onUpdate, 
  onNavigateToSection,
  onExport 
}) {
  // Get sites array
  const sites = useMemo(() => {
    return Array.isArray(project?.sites) ? project.sites : []
  }, [project?.sites])
  
  // Calculate SORA for all sites
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
        withinScope: fGRC !== null && fGRC <= 7
      }
    })
    
    return results
  }, [sites])
  
  // Handle site selection
  const handleSelectSite = (siteId) => {
    onUpdate?.({ activeSiteId: siteId })
    onNavigateToSection?.('siteSurvey')
  }
  
  // No sites state
  if (sites.length === 0) {
    return (
      <div className="space-y-6">
        <ProjectSummaryHeader project={project} sites={[]} calculations={{}} />
        
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MapPin className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Operation Sites</h3>
          <p className="text-gray-500 mb-6">Add your first operation site to get started.</p>
          <button
            onClick={() => onNavigateToSection?.('siteSurvey')}
            className="btn-primary"
          >
            Add First Site
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Project Header */}
      <ProjectSummaryHeader 
        project={project} 
        sites={sites} 
        calculations={calculations} 
      />
      
      {/* Quick Stats */}
      <QuickStatsRow 
        project={project} 
        sites={sites} 
        calculations={calculations} 
      />
      
      {/* Quick Actions */}
      <QuickActions
        onNavigate={onNavigateToSection}
        onExport={onExport}
      />

      {/* Project Details - Author, Authorities, Deliverables, Scope */}
      <ProjectDetails
        project={project}
        onUpdate={onUpdate}
      />

      {/* Project Services */}
      <ProjectServicesSection
        project={project}
        onUpdate={onUpdate}
      />

      {/* Overview Grid - Documents, Team, Regulatory, Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DocumentChecklistSummary
          project={project}
          onNavigate={onNavigateToSection}
        />
        <TeamSummary
          project={project}
          onNavigate={onNavigateToSection}
        />
        <RegulatoryChecklist
          project={project}
          sites={sites}
          calculations={calculations}
        />
        <ProjectTimeline
          project={project}
        />
      </div>
      
      {/* Site Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Operation Sites</h2>
          <button
            onClick={() => onNavigateToSection?.('siteSurvey')}
            className="text-sm text-aeria-navy hover:underline flex items-center gap-1"
          >
            Manage Sites
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sites.map((site, index) => (
            <SiteStatusCard
              key={site.id}
              site={site}
              index={index}
              calculations={calculations}
              onNavigate={onNavigateToSection}
              onSelect={handleSelectSite}
            />
          ))}
        </div>
      </div>
      
      {/* Warnings */}
      {Object.values(calculations).some(c => c.fGRC !== null && c.fGRC > 7) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-red-800">Operations Outside SORA Scope</h3>
              <p className="text-sm text-red-700 mt-1">
                One or more sites have a final GRC exceeding 7. These operations require 
                additional regulatory approval beyond SORA methodology.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

ProjectOverview.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    status: PropTypes.string,
    sites: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      siteSurvey: PropTypes.object,
      flightPlan: PropTypes.object,
      mapData: PropTypes.object
    }))
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onNavigateToSection: PropTypes.func,
  onExport: PropTypes.func
}
