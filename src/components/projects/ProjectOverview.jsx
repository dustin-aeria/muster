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
  
  return (
    <div className="bg-gradient-to-r from-aeria-navy to-aeria-navy/80 text-white rounded-xl p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              {project?.startDate ? new Date(project.startDate).toLocaleDateString() : 'No Date'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1">Sites</p>
            <p className="text-3xl font-bold">{sites.length}</p>
          </div>
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1">Operations</p>
            <p className="text-lg font-medium">{operationTypes.join(', ')}</p>
          </div>
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1">Governing SAIL</p>
            {maxSAIL ? (
              <span 
                className="inline-block px-4 py-1 rounded-full text-lg font-bold"
                style={{ 
                  backgroundColor: sailColors[maxSAIL],
                  color: maxSAIL === 'I' || maxSAIL === 'II' ? '#1F2937' : '#FFFFFF'
                }}
              >
                {maxSAIL}
              </span>
            ) : (
              <span className="text-lg">N/A</span>
            )}
          </div>
          <div className="text-center">
            <p className="text-white/70 text-xs mb-1">SORA Scope</p>
            {allWithinScope ? (
              <CheckCircle2 className="w-8 h-8 mx-auto text-green-400" />
            ) : (
              <XCircle className="w-8 h-8 mx-auto text-red-400" />
            )}
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
