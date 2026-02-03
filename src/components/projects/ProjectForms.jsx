import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { getOperators, getAircraft, getClients, getFormsByProject, linkFormToProject } from '../../lib/firestore'
import { useBranding } from '../BrandingSettings'
import { useOrganization } from '../../hooks/useOrganization'
import * as formDefs from '../../lib/formDefinitions'
import { 
  ClipboardList,
  Plus,
  Trash2,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Info,
  Search,
  X,
  Edit3,
  Eye,
  Save,
  Shield,
  Users,
  Truck,
  AlertOctagon,
  ClipboardCheck,
  Clipboard,
  MapPin,
  Upload,
  Phone,
  Plane,
  GraduationCap,
  HardHat,
  Loader2,
  AlertCircle,
  Download,
  Copy,
  Wrench,
  Camera,
  PhoneCall,
  Bell
} from 'lucide-react'
import { logger } from '../../lib/logger'

// Extract with fallbacks
const FORM_TEMPLATES = formDefs.FORM_TEMPLATES || {}
const FORM_CATEGORIES = formDefs.FORM_CATEGORIES || []
const HAZARD_CATEGORIES = formDefs.HAZARD_CATEGORIES || []
const SEVERITY_RATINGS = formDefs.SEVERITY_RATINGS || []
const PROBABILITY_RATINGS = formDefs.PROBABILITY_RATINGS || []
const CONTROL_TYPES = formDefs.CONTROL_TYPES || []
const SUBSTANDARD_ACTS = formDefs.SUBSTANDARD_ACTS || []
const SUBSTANDARD_CONDITIONS = formDefs.SUBSTANDARD_CONDITIONS || []
const PERSONAL_FACTORS = formDefs.PERSONAL_FACTORS || []
const JOB_SYSTEM_FACTORS = formDefs.JOB_SYSTEM_FACTORS || []
const RPAS_INCIDENT_TRIGGERS = formDefs.RPAS_INCIDENT_TRIGGERS || {}
const calculateRiskScore = formDefs.calculateRiskScore || (() => 'unknown')

// Map icon names to components
const iconMap = {
  Shield: Shield,
  Users: Users,
  Truck: Truck,
  AlertTriangle: AlertTriangle,
  AlertOctagon: AlertOctagon,
  FileText: FileText,
  ClipboardCheck: ClipboardCheck,
  Calendar: Calendar,
  Clipboard: Clipboard,
  CheckSquare: ClipboardCheck,
  Search: Search,
  GraduationCap: GraduationCap,
  HardHat: HardHat,
  Wrench: Wrench
}

// Generate unique form ID
const generateFormId = (formType) => {
  const date = new Date()
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${formType.toUpperCase()}-${dateStr}-${random}`
}

// Risk level colors
const riskColors = {
  critical: 'bg-red-600 text-white',
  high: 'bg-orange-500 text-white',
  medium: 'bg-yellow-400 text-gray-900',
  low: 'bg-green-500 text-white',
  unknown: 'bg-gray-300 text-gray-700'
}

// Convert FORM_TEMPLATES to array format for the library
const getAvailableForms = () => {
  try {
    const templates = FORM_TEMPLATES || {}
    if (typeof templates !== 'object' || templates === null) {
      logger.warn('FORM_TEMPLATES is not an object:', templates)
      return []
    }
    return Object.values(templates).map(form => {
      if (!form || typeof form !== 'object') return null
      return {
        id: form.id || '',
        name: form.name || 'Unknown Form',
        shortName: form.shortName || form.name || 'Unknown',
        description: form.description || '',
        category: form.category || 'other',
        icon: form.icon || 'FileText',
        version: form.version || '1.0',
        sections: Array.isArray(form.sections) ? form.sections : []
      }
    }).filter(Boolean)
  } catch (e) {
    logger.error('Error in getAvailableForms:', e)
    return []
  }
}

const formStatuses = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-600', icon: Clock },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: Edit3 },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  issue: { label: 'Issue Noted', color: 'bg-amber-100 text-amber-700', icon: AlertTriangle }
}

// ============================================
// HELPER: Calculate time duration
// ============================================
const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return null
  const [startH, startM] = startTime.split(':').map(Number)
  const [endH, endM] = endTime.split(':').map(Number)
  let totalMinutes = (endH * 60 + endM) - (startH * 60 + startM)
  if (totalMinutes < 0) totalMinutes += 24 * 60 // Handle overnight
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  return `${hours}h ${mins}m`
}

// ============================================
// HELPER: Check if date needs renewal
// ============================================
const checkRenewalRequired = (expiryDate, daysWarning = 30) => {
  if (!expiryDate) return null
  const expiry = new Date(expiryDate)
  const today = new Date()
  const warningDate = new Date()
  warningDate.setDate(warningDate.getDate() + daysWarning)
  
  if (expiry < today) return 'EXPIRED'
  if (expiry <= warningDate) return 'DUE SOON'
  return 'Current'
}

// ============================================
// HELPER: Determine triggered notifications
// ============================================
const getTriggeredNotifications = (classificationData) => {
  const triggered = []
  
  // Check TSB IMMEDIATE triggers
  if (classificationData?.fatality === true || 
      classificationData?.serious_injury === true ||
      classificationData?.collision_manned === true ||
      classificationData?.rpas_over_25kg === true) {
    triggered.push({
      ...RPAS_INCIDENT_TRIGGERS.TSB_IMMEDIATE,
      key: 'TSB_IMMEDIATE',
      severity: 'critical'
    })
  }
  
  // Check Transport Canada triggers
  if (classificationData?.fly_away === true ||
      classificationData?.boundary_violation === true ||
      classificationData?.unintended_contact === true ||
      classificationData?.equipment_damage === true ||
      classificationData?.near_miss === true) {
    triggered.push({
      ...RPAS_INCIDENT_TRIGGERS.TRANSPORT_CANADA,
      key: 'TRANSPORT_CANADA',
      severity: 'high'
    })
  }
  
  // Check WorkSafeBC triggers
  if (classificationData?.fatality === true ||
      classificationData?.serious_injury === true) {
    triggered.push({
      ...RPAS_INCIDENT_TRIGGERS.WORKSAFEBC,
      key: 'WORKSAFEBC',
      severity: 'high'
    })
  }
  
  // Always include Aeria Internal
  triggered.push({
    ...RPAS_INCIDENT_TRIGGERS.AERIA_INTERNAL,
    key: 'AERIA_INTERNAL',
    severity: 'normal'
  })
  
  return triggered
}

// ============================================
// FORM MODAL - Main form filling interface
// ============================================
function FormModal({ form, formTemplate, project, operators = [], aircraft = [], onSave, onClose, onBackToLibrary }) {
  // Early validation - if no valid template, show error
  if (!formTemplate || typeof formTemplate !== 'object') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Form Template Error</h3>
          <p className="text-sm text-gray-500 mt-2">Unable to load this form template.</p>
          <button onClick={onClose} className="btn-primary mt-6">Close</button>
        </div>
      </div>
    )
  }

  const [formData, setFormData] = useState(() => {
    // Initialize with existing data or defaults
    const initial = form?.data || {}
    
    // Set auto-generated ID if not present
    try {
      if (formTemplate?.sections && Array.isArray(formTemplate.sections)) {
        formTemplate.sections.forEach(section => {
          if (!section || !section.id) return
          if (!initial[section.id]) initial[section.id] = section.repeatable ? [] : {}
          if (Array.isArray(section.fields)) {
            section.fields.forEach(field => {
              if (!field || !field.id) return
              if (field.type === 'auto_id' && !initial[section.id][field.id]) {
                initial[section.id][field.id] = generateFormId(formTemplate.id)
              }
              if (field.defaultToday && !initial[section.id][field.id]) {
                initial[section.id][field.id] = new Date().toISOString().split('T')[0]
              }
              if (field.defaultNow && !initial[section.id][field.id]) {
                const now = new Date()
                initial[section.id][field.id] = now.toTimeString().slice(0, 5)
              }
              
              // Enhanced auto-fill from project if specified
              if (field.autoFill && project && !initial[section.id][field.id]) {
                const path = field.autoFill.replace('project.', '').split('.')
                let value = project
                
                // Handle special auto-fill paths
                if (field.autoFill === 'project.hazards') {
                  // Try multiple locations for hazards
                  value = project.hseRisk?.hazards || project.siteSurvey?.hazards || []
                } else if (field.autoFill === 'project.controls') {
                  // Try multiple locations for controls
                  value = project.hseRisk?.controls || project.siteSurvey?.controls || []
                } else if (field.autoFill === 'project.ppe') {
                  // Get PPE from project or defaults
                  value = project.ppe?.required || project.hseRisk?.ppe || {
                    high_vis: true,
                    safety_boots: true,
                    safety_glasses: true
                  }
                } else if (field.autoFill === 'project.muster_point') {
                  value = project.emergency?.musterPoint || project.siteSurvey?.musterPoint || ''
                } else if (field.autoFill === 'project.location') {
                  value = project.siteSurvey?.location?.description || 
                          project.overview?.location || 
                          project.location || ''
                } else if (field.autoFill === 'project.crew') {
                  value = project.crew?.members?.map(m => m.id) || []
                } else if (field.autoFill === 'project.aircraft') {
                  value = project.flightPlan?.aircraft || project.equipment?.primaryAircraft || ''
                } else {
                  // Standard path traversal
                  for (const key of path) {
                    value = value?.[key]
                  }
                }
                
                if (value !== undefined && value !== null) {
                  initial[section.id][field.id] = value
                }
              }
            })
          }
        })
      }
    } catch (err) {
      logger.error('Error initializing form data:', err)
    }
    
    return initial
  })
  
  const [activeSection, setActiveSection] = useState(0)
  const [repeatableSections, setRepeatableSections] = useState({})
  const [errors, setErrors] = useState({})
  const [gettingLocation, setGettingLocation] = useState(false)

  if (!formTemplate) return null

  const updateField = (sectionId, fieldId, value, repeatIndex = null) => {
    setFormData(prev => {
      if (repeatIndex !== null) {
        const sectionData = prev[sectionId] || []
        const updatedSection = [...sectionData]
        if (!updatedSection[repeatIndex]) updatedSection[repeatIndex] = {}
        updatedSection[repeatIndex][fieldId] = value
        return { ...prev, [sectionId]: updatedSection }
      }
      return {
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || {}),
          [fieldId]: value
        }
      }
    })
  }

  const getFieldValue = (sectionId, fieldId, repeatIndex = null) => {
    if (repeatIndex !== null) {
      return formData[sectionId]?.[repeatIndex]?.[fieldId] || ''
    }
    return formData[sectionId]?.[fieldId] || ''
  }

  const addRepeatableItem = (sectionId) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: [...(prev[sectionId] || []), {}]
    }))
  }

  const removeRepeatableItem = (sectionId, index) => {
    setFormData(prev => ({
      ...prev,
      [sectionId]: (prev[sectionId] || []).filter((_, i) => i !== index)
    }))
  }

  const handleSave = (markComplete = false) => {
    onSave(formData, markComplete)
  }

  const getCurrentLocation = () => {
    setGettingLocation(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          // Find the GPS field in current section and update it
          const section = formTemplate.sections[activeSection]
          const gpsField = section?.fields?.find(f => f.type === 'gps')
          if (gpsField) {
            updateField(section.id, gpsField.id, { lat: latitude.toFixed(6), lng: longitude.toFixed(6) })
          }
          setGettingLocation(false)
        },
        (error) => {
          logger.error('Error getting location:', error)
          setGettingLocation(false)
        }
      )
    }
  }

  // Get options from named constants
  const getOptions = (optionsRef) => {
    if (Array.isArray(optionsRef)) return optionsRef
    
    // Build options map with defensive checks
    const optionsMap = {
      'HAZARD_CATEGORIES': HAZARD_CATEGORIES || [],
      'SEVERITY_RATINGS': SEVERITY_RATINGS || [],
      'PROBABILITY_RATINGS': PROBABILITY_RATINGS || [],
      'CONTROL_TYPES': CONTROL_TYPES || [],
      'SUBSTANDARD_ACTS': Array.isArray(SUBSTANDARD_ACTS) ? SUBSTANDARD_ACTS.map(s => ({ value: s, label: s })) : [],
      'SUBSTANDARD_CONDITIONS': Array.isArray(SUBSTANDARD_CONDITIONS) ? SUBSTANDARD_CONDITIONS.map(s => ({ value: s, label: s })) : [],
      'PERSONAL_FACTORS': Array.isArray(PERSONAL_FACTORS) ? PERSONAL_FACTORS.map(s => ({ value: s, label: s })) : [],
      'JOB_SYSTEM_FACTORS': Array.isArray(JOB_SYSTEM_FACTORS) ? JOB_SYSTEM_FACTORS.map(s => ({ value: s, label: s })) : [],
    }
    
    return optionsMap[optionsRef] || []
  }

  // Check if field should be shown based on conditions
  const shouldShowField = (field, sectionId, repeatIndex = null) => {
    if (!field.showIf) return true
    
    // Parse simple conditions like "fieldName === true"
    const match = field.showIf.match(/(\w+)\s*(===|!==|>|<|>=|<=)\s*(.+)/)
    if (!match) return true
    
    const [, fieldName, operator, rawValue] = match
    const fieldValue = getFieldValue(sectionId, fieldName, repeatIndex)
    let compareValue = rawValue.trim()
    
    // Parse the compare value
    if (compareValue === 'true') compareValue = true
    else if (compareValue === 'false') compareValue = false
    else if (compareValue.startsWith('"') || compareValue.startsWith("'")) {
      compareValue = compareValue.slice(1, -1)
    }
    
    switch (operator) {
      case '===': return fieldValue === compareValue
      case '!==': return fieldValue !== compareValue
      case '>': return fieldValue > compareValue
      case '<': return fieldValue < compareValue
      case '>=': return fieldValue >= compareValue
      case '<=': return fieldValue <= compareValue
      default: return true
    }
  }

  // ============================================
  // FIELD RENDERER
  // ============================================
  const renderField = (field, sectionId, repeatIndex = null) => {
    if (!shouldShowField(field, sectionId, repeatIndex)) return null
    
    const value = getFieldValue(sectionId, field.id, repeatIndex)
    const fieldKey = repeatIndex !== null ? `${sectionId}-${repeatIndex}-${field.id}` : `${sectionId}-${field.id}`
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
            placeholder={field.placeholder || ''}
          />
        )
      
      case 'auto_id':
        return (
          <input
            type="text"
            value={value}
            className="input bg-gray-50 font-mono text-sm"
            readOnly
          />
        )
      
      case 'auto_increment':
        return (
          <input
            type="text"
            value={value || (repeatIndex !== null ? repeatIndex + 1 : 1)}
            className="input bg-gray-50 font-mono text-sm w-20"
            readOnly
          />
        )
      
      case 'battery_select':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
            placeholder="Battery ID (e.g., BAT-001)"
          />
        )
      
      case 'yesno_text':
        const yesnoTextValue = value || { answer: null, details: '' }
        return (
          <div className="space-y-2">
            <div className="flex gap-4">
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                yesnoTextValue.answer === true ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name={fieldKey}
                  checked={yesnoTextValue.answer === true}
                  onChange={() => updateField(sectionId, field.id, { ...yesnoTextValue, answer: true }, repeatIndex)}
                  className="w-4 h-4"
                />
                <span>Yes</span>
              </label>
              <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                yesnoTextValue.answer === false ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-gray-50'
              }`}>
                <input
                  type="radio"
                  name={fieldKey}
                  checked={yesnoTextValue.answer === false}
                  onChange={() => updateField(sectionId, field.id, { ...yesnoTextValue, answer: false }, repeatIndex)}
                  className="w-4 h-4"
                />
                <span>No</span>
              </label>
            </div>
            {yesnoTextValue.answer === true && (
              <textarea
                value={yesnoTextValue.details || ''}
                onChange={(e) => updateField(sectionId, field.id, { ...yesnoTextValue, details: e.target.value }, repeatIndex)}
                className="input"
                placeholder="Please provide details..."
                rows={2}
              />
            )}
          </div>
        )
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
            min={field.min}
            max={field.max}
            step={field.step}
          />
        )
      
      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={value}
              onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
              className="input pl-7"
              min="0"
              step="0.01"
            />
          </div>
        )
      
      case 'phone':
        return (
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel"
              value={value}
              onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
              className="input pl-10"
              placeholder="(555) 555-5555"
            />
          </div>
        )
      
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          />
        )
      
      case 'time':
        return (
          <input
            type="time"
            value={value || ''}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          />
        )
      
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={value || ''}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input min-h-[80px]"
            rows={field.rows || 3}
            placeholder={field.placeholder || ''}
          />
        )
      
      case 'select':
        const options = getOptions(field.options)
        return (
          <select
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
                {opt.description && ` - ${opt.description}`}
              </option>
            ))}
          </select>
        )
      
      case 'multiselect':
        const multiOptions = getOptions(field.options)
        const selectedValues = value || []
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
            {multiOptions.map(opt => (
              <label key={opt.value || opt} className="flex items-start gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(opt.value || opt)}
                  onChange={(e) => {
                    const optValue = opt.value || opt
                    if (e.target.checked) {
                      updateField(sectionId, field.id, [...selectedValues, optValue], repeatIndex)
                    } else {
                      updateField(sectionId, field.id, selectedValues.filter(v => v !== optValue), repeatIndex)
                    }
                  }}
                  className="w-4 h-4 rounded mt-0.5"
                />
                <span className="text-sm">{opt.label || opt}</span>
              </label>
            ))}
          </div>
        )
      
      // NEW: Multiselect with text option
      case 'multiselect_text':
        const msTextOptions = getOptions(field.options) || []
        const msTextValue = value || { selected: [], other: '' }
        return (
          <div className="space-y-2">
            <div className="max-h-40 overflow-y-auto border rounded-lg p-2">
              {msTextOptions.map(opt => (
                <label key={opt.value || opt} className="flex items-start gap-2 cursor-pointer p-1 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={(msTextValue.selected || []).includes(opt.value || opt)}
                    onChange={(e) => {
                      const optValue = opt.value || opt
                      const currentSelected = msTextValue.selected || []
                      const newSelected = e.target.checked 
                        ? [...currentSelected, optValue]
                        : currentSelected.filter(v => v !== optValue)
                      updateField(sectionId, field.id, { ...msTextValue, selected: newSelected }, repeatIndex)
                    }}
                    className="w-4 h-4 rounded mt-0.5"
                  />
                  <span className="text-sm">{opt.label || opt}</span>
                </label>
              ))}
            </div>
            <input
              type="text"
              value={msTextValue.other || ''}
              onChange={(e) => updateField(sectionId, field.id, { ...msTextValue, other: e.target.value }, repeatIndex)}
              className="input"
              placeholder="Other (please specify)"
            />
          </div>
        )
      
      case 'yesno':
        return (
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              value === true ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name={fieldKey}
                checked={value === true}
                onChange={() => updateField(sectionId, field.id, true, repeatIndex)}
                className="w-4 h-4"
              />
              <span>Yes</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              value === false ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name={fieldKey}
                checked={value === false}
                onChange={() => updateField(sectionId, field.id, false, repeatIndex)}
                className="w-4 h-4"
              />
              <span>No</span>
            </label>
          </div>
        )
      
      case 'yesno_conditional':
        // Special yes/no that checks a condition before showing
        return (
          <div className="flex gap-4">
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              value === true ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name={fieldKey}
                checked={value === true}
                onChange={() => updateField(sectionId, field.id, true, repeatIndex)}
                className="w-4 h-4"
              />
              <span>Yes</span>
            </label>
            <label className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
              value === false ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-gray-50'
            }`}>
              <input
                type="radio"
                name={fieldKey}
                checked={value === false}
                onChange={() => updateField(sectionId, field.id, false, repeatIndex)}
                className="w-4 h-4"
              />
              <span>No</span>
            </label>
          </div>
        )
      
      case 'checkbox':
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => updateField(sectionId, field.id, e.target.checked, repeatIndex)}
              className="w-5 h-5 rounded"
            />
            <span className="text-sm">{field.checkboxLabel || 'Confirmed'}</span>
          </label>
        )
      
      case 'checklist':
        const checklistOptions = getOptions(field.options) || field.items || []
        const checklistValue = value || {}
        return (
          <div className="space-y-2">
            {checklistOptions.map(item => (
              <label key={item.value} className="flex items-start gap-2 cursor-pointer p-2 rounded hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={checklistValue[item.value] === true}
                  onChange={(e) => updateField(sectionId, field.id, {
                    ...checklistValue,
                    [item.value]: e.target.checked
                  }, repeatIndex)}
                  className="w-4 h-4 rounded mt-0.5"
                />
                <span className="text-sm">{item.label}</span>
              </label>
            ))}
          </div>
        )
      
      case 'operator_select':
      case 'user_auto':
        return (
          <select
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          >
            <option value="">Select person...</option>
            {(Array.isArray(operators) ? operators : []).map(op => (
              <option key={op.id} value={op.id}>{op.name}</option>
            ))}
          </select>
        )
      
      case 'crew_multi_select':
        const selectedCrew = value || []
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {selectedCrew.map(crewId => {
                const crew = operators.find(o => o.id === crewId)
                return crew ? (
                  <span key={crewId} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1">
                    {crew.name}
                    <button
                      onClick={() => updateField(sectionId, field.id, selectedCrew.filter(c => c !== crewId), repeatIndex)}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ) : null
              })}
            </div>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedCrew.includes(e.target.value)) {
                  updateField(sectionId, field.id, [...selectedCrew, e.target.value], repeatIndex)
                }
              }}
              className="input"
            >
              <option value="">Add crew member...</option>
              {(Array.isArray(operators) ? operators : []).filter(op => !selectedCrew.includes(op.id)).map(op => (
                <option key={op.id} value={op.id}>{op.name}</option>
              ))}
            </select>
          </div>
        )
      
      case 'aircraft_select':
        return (
          <select
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          >
            <option value="">Select aircraft...</option>
            {(Array.isArray(aircraft) ? aircraft : []).map(ac => (
              <option key={ac.id} value={ac.id}>
                {ac.nickname || ac.model} - {ac.serialNumber}
              </option>
            ))}
          </select>
        )
      
      // NEW: Equipment select
      case 'equipment_select':
        // For now, use text input - can be enhanced with equipment database
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
            placeholder="Equipment ID or description"
          />
        )
      
      // NEW: Incident select (for linking investigation to incident)
      case 'incident_select':
        const projectForms = Array.isArray(project?.forms) ? project.forms : []
        const incidentForms = projectForms.filter(f => f.templateId === 'incident_report')
        return (
          <select
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
          >
            <option value="">Select incident report...</option>
            {incidentForms.map(form => (
              <option key={form.id} value={form.id}>
                {form.data?.header?.form_id || form.id} - {form.data?.occurrence?.occurrence_date || 'No date'}
              </option>
            ))}
          </select>
        )
      
      case 'project_select':
        return (
          <input
            type="text"
            value={project?.name || ''}
            className="input bg-gray-50"
            readOnly
          />
        )
      
      case 'gps':
        const gpsValue = value || {}
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">Latitude</label>
                <input
                  type="text"
                  value={gpsValue.lat || ''}
                  onChange={(e) => updateField(sectionId, field.id, { ...gpsValue, lat: e.target.value }, repeatIndex)}
                  className="input font-mono text-sm"
                  placeholder="e.g., 49.2827"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Longitude</label>
                <input
                  type="text"
                  value={gpsValue.lng || ''}
                  onChange={(e) => updateField(sectionId, field.id, { ...gpsValue, lng: e.target.value }, repeatIndex)}
                  className="input font-mono text-sm"
                  placeholder="e.g., -123.1207"
                />
              </div>
            </div>
            <button
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="btn-secondary text-sm flex items-center gap-2"
            >
              {gettingLocation ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              {gettingLocation ? 'Getting Location...' : 'Use Current Location'}
            </button>
          </div>
        )
      
      case 'weather_conditions':
        const weatherValue = value || {}
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-gray-500">Temperature (Â°C)</label>
              <input
                type="number"
                value={weatherValue.temp || ''}
                onChange={(e) => updateField(sectionId, field.id, { ...weatherValue, temp: e.target.value }, repeatIndex)}
                className="input"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Wind (km/h)</label>
              <input
                type="number"
                value={weatherValue.wind || ''}
                onChange={(e) => updateField(sectionId, field.id, { ...weatherValue, wind: e.target.value }, repeatIndex)}
                className="input"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Visibility</label>
              <select
                value={weatherValue.visibility || ''}
                onChange={(e) => updateField(sectionId, field.id, { ...weatherValue, visibility: e.target.value }, repeatIndex)}
                className="input"
              >
                <option value="">Select...</option>
                <option value="good">Good (&gt;5km)</option>
                <option value="moderate">Moderate (1-5km)</option>
                <option value="poor">Poor (&lt;1km)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">Conditions</label>
              <select
                value={weatherValue.conditions || ''}
                onChange={(e) => updateField(sectionId, field.id, { ...weatherValue, conditions: e.target.value }, repeatIndex)}
                className="input"
              >
                <option value="">Select...</option>
                <option value="clear">Clear</option>
                <option value="cloudy">Cloudy</option>
                <option value="rain">Rain</option>
                <option value="snow">Snow</option>
                <option value="fog">Fog</option>
              </select>
            </div>
          </div>
        )
      
      case 'signature':
        return (
          <div className={`border-2 rounded-lg p-4 text-center ${value ? 'border-green-300 bg-green-50' : 'border-dashed border-gray-300'}`}>
            {value ? (
              <div className="space-y-1">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto" />
                <p className="text-sm font-medium text-gray-700">{value.name}</p>
                <p className="text-xs text-gray-500">{new Date(value.timestamp).toLocaleString()}</p>
                <button
                  onClick={() => updateField(sectionId, field.id, null, repeatIndex)}
                  className="text-xs text-red-500 hover:underline mt-2"
                >
                  Clear signature
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const signerName = operators.find(o => o.id === formData.header?.pic)?.name || 'User'
                  updateField(sectionId, field.id, {
                    name: signerName,
                    timestamp: new Date().toISOString()
                  }, repeatIndex)
                }}
                className="w-full py-4 text-sm text-aeria-blue hover:bg-blue-50 rounded transition-colors"
              >
                <User className="w-6 h-6 mx-auto mb-1 opacity-50" />
                Click to sign
              </button>
            )}
          </div>
        )
      
      case 'multi_signature':
      case 'crew_multi_signature':
        const signatures = value || []
        return (
          <div className="space-y-3">
            {signatures.length > 0 && (
              <div className="space-y-2">
                {signatures.map((sig, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{sig.name}</span>
                      <span className="text-xs text-gray-500">{new Date(sig.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <button
                      onClick={() => updateField(sectionId, field.id, signatures.filter((_, i) => i !== idx), repeatIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <select
                id={`${fieldKey}-select`}
                className="input flex-1"
                defaultValue=""
              >
                <option value="">Select person to sign...</option>
                {(Array.isArray(operators) ? operators : []).filter(op => !signatures.find(s => s.id === op.id)).map(op => (
                  <option key={op.id} value={op.id}>{op.name}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  const select = document.getElementById(`${fieldKey}-select`)
                  if (select?.value) {
                    const person = operators.find(o => o.id === select.value)
                    if (person) {
                      updateField(sectionId, field.id, [...signatures, {
                        id: person.id,
                        name: person.name,
                        timestamp: new Date().toISOString()
                      }], repeatIndex)
                      select.value = ''
                    }
                  }
                }}
                className="btn-secondary"
              >
                Add Signature
              </button>
            </div>
          </div>
        )
      
      case 'risk_matrix':
        // Get severity and probability from sibling fields
        const severityFieldId = field.id.includes('residual') ? 'residual_severity' : 'severity'
        const probabilityFieldId = field.id.includes('residual') ? 'residual_probability' : 'probability'
        // Also check for potential_ prefix (used in near_miss)
        const altSeverityId = field.id.includes('potential') ? 'potential_severity' : severityFieldId
        const altProbabilityId = field.id.includes('potential') ? 'potential_probability' : probabilityFieldId
        
        const severity = getFieldValue(sectionId, severityFieldId, repeatIndex) || getFieldValue(sectionId, altSeverityId, repeatIndex)
        const probability = getFieldValue(sectionId, probabilityFieldId, repeatIndex) || getFieldValue(sectionId, altProbabilityId, repeatIndex)
        const riskLevel = calculateRiskScore(severity, probability)
        
        return (
          <div className={`px-4 py-2 rounded-lg font-medium text-center ${riskColors[riskLevel]}`}>
            {riskLevel.toUpperCase()}
          </div>
        )
      
      case 'file_upload':
        const files = value || []
        return (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-aeria-blue transition-colors">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                {field.multiple ? 'Drop files here or click to upload' : 'Drop file here or click to upload'}
              </p>
              <input
                type="file"
                accept={field.accept || '*'}
                multiple={field.multiple}
                className="hidden"
                id={fieldKey}
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files).map(f => ({
                    name: f.name,
                    size: f.size,
                    type: f.type,
                    uploadedAt: new Date().toISOString()
                  }))
                  updateField(sectionId, field.id, field.multiple ? [...files, ...newFiles] : newFiles, repeatIndex)
                }}
              />
              <label htmlFor={fieldKey} className="btn-secondary mt-2 cursor-pointer inline-block">
                Browse Files
              </label>
            </div>
            {files.length > 0 && (
              <div className="space-y-1">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <button
                      onClick={() => updateField(sectionId, field.id, files.filter((_, i) => i !== idx), repeatIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      
      // Photo capture with camera integration
      case 'photo_capture':
        const photos = value || []
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {/* Camera capture button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-aeria-blue transition-colors">
                <Camera className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 mb-2">Take Photo</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  id={`${fieldKey}-camera`}
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0]
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const newPhoto = {
                          id: `photo-${Date.now()}`,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          data: event.target.result,
                          capturedAt: new Date().toISOString(),
                          gps: null,
                          annotation: ''
                        }
                        // Try to get GPS
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (pos) => {
                              newPhoto.gps = {
                                lat: pos.coords.latitude.toFixed(6),
                                lng: pos.coords.longitude.toFixed(6)
                              }
                              updateField(sectionId, field.id, [...photos, newPhoto], repeatIndex)
                            },
                            () => {
                              updateField(sectionId, field.id, [...photos, newPhoto], repeatIndex)
                            }
                          )
                        } else {
                          updateField(sectionId, field.id, [...photos, newPhoto], repeatIndex)
                        }
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                />
                <label htmlFor={`${fieldKey}-camera`} className="btn-secondary text-xs cursor-pointer">
                  <Camera className="w-3 h-3 inline mr-1" />
                  Camera
                </label>
              </div>
              
              {/* File upload button */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-aeria-blue transition-colors">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 mb-2">Upload Photo</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  id={`${fieldKey}-upload`}
                  onChange={(e) => {
                    Array.from(e.target.files).forEach(file => {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const newPhoto = {
                          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          data: event.target.result,
                          capturedAt: new Date().toISOString(),
                          gps: null,
                          annotation: ''
                        }
                        updateField(sectionId, field.id, [...(formData[sectionId]?.[field.id] || []), newPhoto], repeatIndex)
                      }
                      reader.readAsDataURL(file)
                    })
                  }}
                />
                <label htmlFor={`${fieldKey}-upload`} className="btn-secondary text-xs cursor-pointer">
                  <Upload className="w-3 h-3 inline mr-1" />
                  Browse
                </label>
              </div>
            </div>
            
            {/* Photo gallery */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {photos.map((photo, idx) => (
                  <div key={photo.id || idx} className="relative group">
                    <img
                      src={photo.data}
                      alt={photo.name || `Photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={() => {
                          const annotation = prompt('Add annotation:', photo.annotation || '')
                          if (annotation !== null) {
                            const updated = [...photos]
                            updated[idx] = { ...photo, annotation }
                            updateField(sectionId, field.id, updated, repeatIndex)
                          }
                        }}
                        className="p-1.5 bg-white rounded-full text-gray-700 hover:bg-blue-100"
                        title="Add annotation"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateField(sectionId, field.id, photos.filter((_, i) => i !== idx), repeatIndex)}
                        className="p-1.5 bg-white rounded-full text-red-500 hover:bg-red-100"
                        title="Delete"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    {photo.gps && (
                      <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/70 rounded text-white text-[10px] flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        GPS
                      </div>
                    )}
                    {photo.annotation && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-blue-600/90 rounded text-white text-[10px]">
                        Note
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {photos.length > 0 && (
              <p className="text-xs text-gray-500">{photos.length} photo{photos.length !== 1 ? 's' : ''} captured</p>
            )}
          </div>
        )
      
      // NEW: Repeatable text (array of strings)
      case 'repeatable_text':
        const textItems = value || []
        return (
          <div className="space-y-2">
            {textItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...textItems]
                    newItems[idx] = e.target.value
                    updateField(sectionId, field.id, newItems, repeatIndex)
                  }}
                  className="input flex-1"
                  placeholder={field.placeholder || `Item ${idx + 1}`}
                />
                <button
                  onClick={() => updateField(sectionId, field.id, textItems.filter((_, i) => i !== idx), repeatIndex)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => updateField(sectionId, field.id, [...textItems, ''], repeatIndex)}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add {field.itemLabel || 'Item'}
            </button>
          </div>
        )
      
      // NEW: Repeatable person (array of {name, role, contact})
      case 'repeatable_person':
        const persons = value || []
        return (
          <div className="space-y-3">
            {persons.map((person, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-gray-50 relative">
                <button
                  onClick={() => updateField(sectionId, field.id, persons.filter((_, i) => i !== idx), repeatIndex)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={person.name || ''}
                    onChange={(e) => {
                      const newPersons = [...persons]
                      newPersons[idx] = { ...person, name: e.target.value }
                      updateField(sectionId, field.id, newPersons, repeatIndex)
                    }}
                    className="input"
                    placeholder="Name"
                  />
                  <input
                    type="text"
                    value={person.role || ''}
                    onChange={(e) => {
                      const newPersons = [...persons]
                      newPersons[idx] = { ...person, role: e.target.value }
                      updateField(sectionId, field.id, newPersons, repeatIndex)
                    }}
                    className="input"
                    placeholder="Role"
                  />
                  <input
                    type="text"
                    value={person.contact || ''}
                    onChange={(e) => {
                      const newPersons = [...persons]
                      newPersons[idx] = { ...person, contact: e.target.value }
                      updateField(sectionId, field.id, newPersons, repeatIndex)
                    }}
                    className="input"
                    placeholder="Contact info"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => updateField(sectionId, field.id, [...persons, { name: '', role: '', contact: '' }], repeatIndex)}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Person
            </button>
          </div>
        )
      
      // NEW: Repeatable witness (array of {name, statement})
      case 'repeatable_witness':
        const witnesses = value || []
        return (
          <div className="space-y-3">
            {witnesses.map((witness, idx) => (
              <div key={idx} className="p-3 border rounded-lg bg-gray-50 relative">
                <button
                  onClick={() => updateField(sectionId, field.id, witnesses.filter((_, i) => i !== idx), repeatIndex)}
                  className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-100 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={witness.name || ''}
                    onChange={(e) => {
                      const newWitnesses = [...witnesses]
                      newWitnesses[idx] = { ...witness, name: e.target.value }
                      updateField(sectionId, field.id, newWitnesses, repeatIndex)
                    }}
                    className="input"
                    placeholder="Witness name"
                  />
                  <textarea
                    value={witness.statement || ''}
                    onChange={(e) => {
                      const newWitnesses = [...witnesses]
                      newWitnesses[idx] = { ...witness, statement: e.target.value }
                      updateField(sectionId, field.id, newWitnesses, repeatIndex)
                    }}
                    className="input"
                    rows={2}
                    placeholder="Statement summary"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => updateField(sectionId, field.id, [...witnesses, { name: '', statement: '' }], repeatIndex)}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Witness
            </button>
          </div>
        )
      
      // NEW: Hazard summary (read-only display from project)
      case 'hazard_summary':
        const projectHazards = project?.hseRisk?.hazards || project?.siteSurvey?.hazards || []
        if (projectHazards.length === 0) {
          return <p className="text-sm text-gray-500 italic">No hazards identified in project assessment</p>
        }
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {projectHazards.map((hazard, idx) => (
              <div key={idx} className="p-2 bg-amber-50 border border-amber-200 rounded text-sm">
                <span className="font-medium">{hazard.category || hazard.type}:</span> {hazard.description || hazard.hazard}
                {hazard.risk && <span className={`ml-2 px-2 py-0.5 rounded text-xs ${riskColors[hazard.risk?.toLowerCase()] || 'bg-gray-200'}`}>{hazard.risk}</span>}
              </div>
            ))}
          </div>
        )
      
      // NEW: Control summary (read-only display from project)
      case 'control_summary':
        const projectControls = project?.hseRisk?.controls || project?.siteSurvey?.controls || []
        if (projectControls.length === 0) {
          return <p className="text-sm text-gray-500 italic">No controls defined in project assessment</p>
        }
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {projectControls.map((control, idx) => (
              <div key={idx} className="p-2 bg-green-50 border border-green-200 rounded text-sm">
                <span className="font-medium">{control.type || 'Control'}:</span> {control.description || control.control}
              </div>
            ))}
          </div>
        )
      
      // NEW: Contact summary (emergency contacts)
      case 'contact_summary':
        const contacts = project?.emergency?.contacts || []
        const defaultContacts = [
          { role: 'Emergency Services', number: '911' },
          { role: 'Poison Control', number: '1-800-567-8911' }
        ]
        const displayContacts = contacts.length > 0 ? contacts : defaultContacts
        return (
          <div className="space-y-2">
            {displayContacts.map((contact, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                <span className="text-sm font-medium">{contact.role || contact.name}</span>
                <span className="text-sm font-mono flex items-center gap-1">
                  <PhoneCall className="w-3 h-3" />
                  {contact.number || contact.phone}
                </span>
              </div>
            ))}
          </div>
        )
      
      case 'calculated':
        // Handle specific calculated fields
        let calculatedValue = 'Auto-calculated'
        
        if (field.id === 'flight_duration') {
          const takeoff = getFieldValue(sectionId, 'takeoff_time', repeatIndex)
          const landing = getFieldValue(sectionId, 'landing_time', repeatIndex)
          calculatedValue = calculateDuration(takeoff, landing) || 'Enter times'
        }
        else if (field.id === 'total_flights') {
          const flights = formData.flights || []
          calculatedValue = `${flights.length} flight${flights.length !== 1 ? 's' : ''}`
        }
        else if (field.id === 'total_flight_time') {
          const flights = formData.flights || []
          let totalMinutes = 0
          flights.forEach(flight => {
            if (flight.takeoff_time && flight.landing_time) {
              const [startH, startM] = flight.takeoff_time.split(':').map(Number)
              const [endH, endM] = flight.landing_time.split(':').map(Number)
              let mins = (endH * 60 + endM) - (startH * 60 + startM)
              if (mins < 0) mins += 24 * 60
              totalMinutes += mins
            }
          })
          const hours = Math.floor(totalMinutes / 60)
          const mins = totalMinutes % 60
          calculatedValue = flights.length > 0 ? `${hours}h ${mins}m` : 'No flights'
        }
        else if (field.id === 'renewal_required') {
          const expiry = getFieldValue(sectionId, 'expiry_date', repeatIndex)
          const status = checkRenewalRequired(expiry)
          if (status === 'EXPIRED') {
            return <div className="px-3 py-2 bg-red-100 text-red-700 rounded font-medium">EXPIRED</div>
          } else if (status === 'DUE SOON') {
            return <div className="px-3 py-2 bg-amber-100 text-amber-700 rounded font-medium">Renewal Due Soon</div>
          }
          calculatedValue = status || 'Enter expiry date'
        }
        else if (field.id === 'rpas_weight') {
          const aircraftId = getFieldValue('rpas_info', 'aircraft', repeatIndex)
          const selectedAircraft = aircraft.find(a => a.id === aircraftId)
          calculatedValue = selectedAircraft?.weight ? `${selectedAircraft.weight} kg` : 'Select aircraft'
        }
        else if (field.id === 'registration') {
          const aircraftId = getFieldValue('rpas_info', 'aircraft', repeatIndex)
          const selectedAircraft = aircraft.find(a => a.id === aircraftId)
          calculatedValue = selectedAircraft?.registration || 'Select aircraft'
        }
        else if (field.id === 'pic_cert') {
          const picId = getFieldValue('personnel', 'pic', repeatIndex)
          const selectedPic = operators.find(o => o.id === picId)
          calculatedValue = selectedPic?.certNumber || 'Select PIC'
        }
        
        return (
          <div className="input bg-gray-50 text-gray-700">
            {calculatedValue}
          </div>
        )
      
      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => updateField(sectionId, field.id, e.target.value, repeatIndex)}
            className="input"
            placeholder={field.placeholder || ''}
          />
        )
    }
  }

  // ============================================
  // TRIGGER CHECKLIST RENDERER (for incident reports)
  // ============================================
  const renderTriggerChecklist = () => {
    const classificationData = formData.classification || {}
    const triggeredNotifications = getTriggeredNotifications(classificationData)
    
    const hasCritical = triggeredNotifications.some(t => t.severity === 'critical')
    
    return (
      <div className="space-y-4">
        {hasCritical && (
          <div className="p-4 bg-red-600 text-white rounded-lg animate-pulse">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8" />
              <div>
                <h4 className="font-bold text-lg">IMMEDIATE ACTION REQUIRED</h4>
                <p className="text-sm">Based on your answers, regulatory notification is required IMMEDIATELY</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          {triggeredNotifications.map((notification, idx) => (
            <div 
              key={notification.key}
              className={`p-4 rounded-lg border-2 ${
                notification.severity === 'critical' 
                  ? 'bg-red-50 border-red-500' 
                  : notification.severity === 'high'
                    ? 'bg-orange-50 border-orange-400'
                    : 'bg-blue-50 border-blue-300'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  notification.severity === 'critical' ? 'bg-red-500 text-white' :
                  notification.severity === 'high' ? 'bg-orange-500 text-white' :
                  'bg-blue-500 text-white'
                }`}>
                  {notification.severity === 'critical' ? (
                    <AlertOctagon className="w-5 h-5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{notification.label}</h4>
                  {notification.phone && (
                    <p className="text-lg font-mono font-bold mt-1 flex items-center gap-2">
                      <PhoneCall className="w-4 h-4" />
                      {notification.phone}
                      {notification.altPhone && <span className="text-sm font-normal">or {notification.altPhone}</span>}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-2">{notification.instructions}</p>
                  
                  {/* Completion checkbox */}
                  <label className="flex items-center gap-2 mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.notification_checklist?.[notification.key] === true}
                      onChange={(e) => updateField('notification_checklist', notification.key, e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <span className="text-sm font-medium">
                      {notification.key === 'AERIA_INTERNAL' ? 'Accountable Executive notified' : 'Notification completed'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ============================================
  // SECTION RENDERER
  // ============================================
  const renderSection = (section, sectionIndex) => {
    const isActive = activeSection === sectionIndex
    
    // Handle trigger_checklist section type
    if (section.type === 'trigger_checklist') {
      return (
        <div key={section.id} className={`${isActive ? '' : 'hidden'}`}>
          {section.description && (
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mb-4">{section.description}</p>
          )}
          {renderTriggerChecklist()}
        </div>
      )
    }
    
    // Handle repeatable sections
    if (section.repeatable) {
      const items = formData[section.id] || []
      
      return (
        <div key={section.id} className={`${isActive ? '' : 'hidden'}`}>
          <div className="space-y-4">
            {items.length === 0 && (
              <p className="text-sm text-gray-500 italic">No items added yet</p>
            )}
            
            {items.map((item, idx) => (
              <div key={idx} className="p-4 border rounded-lg bg-gray-50 relative">
                <div className="absolute top-2 right-2">
                  <button
                    onClick={() => removeRepeatableItem(section.id, idx)}
                    className="p-1 text-red-500 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  {section.repeatLabel?.replace('Add ', '') || 'Item'} #{idx + 1}
                </h4>
                <div className="grid gap-4">
                  {section.fields?.map(field => (
                    <div key={field.id}>
                      <label className="label flex items-center gap-1">
                        {field.label}
                        {field.required && <span className="text-red-500">*</span>}
                        {field.helpText && (
                          <span className="text-xs text-gray-400 ml-1">({field.helpText})</span>
                        )}
                      </label>
                      {renderField(field, section.id, idx)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={() => addRepeatableItem(section.id)}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {section.repeatLabel || 'Add Item'}
            </button>
          </div>
        </div>
      )
    }
    
    // Regular section
    return (
      <div key={section.id} className={`space-y-4 ${isActive ? '' : 'hidden'}`}>
        {section.description && (
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">{section.description}</p>
        )}
        
        {section.fields?.map(field => {
          if (!shouldShowField(field, section.id)) return null
          
          return (
            <div key={field.id}>
              <label className="label flex items-center gap-1">
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.helpText && (
                <p className="text-xs text-gray-500 mb-1">{field.helpText}</p>
              )}
              {renderField(field, section.id)}
            </div>
          )
        })}
      </div>
    )
  }

  const sections = Array.isArray(formTemplate.sections) ? formTemplate.sections : []
  const currentSection = sections[activeSection]
  const IconComponent = iconMap[formTemplate.icon] || FileText

  // Handle case where form has no sections defined
  if (sections.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">Form Not Yet Available</h3>
          <p className="text-sm text-gray-500 mt-2">
            The "{formTemplate.name}" form template doesn't have any sections defined yet.
          </p>
          <div className="flex gap-2 justify-center mt-6">
            {onBackToLibrary && (
              <button onClick={onBackToLibrary} className="btn-secondary">
                Back to Library
              </button>
            )}
            <button onClick={onClose} className="btn-primary">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-aeria-blue to-blue-600 text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <IconComponent className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-semibold">{formTemplate.name}</h2>
              <p className="text-sm text-blue-100">{formTemplate.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onBackToLibrary && (
              <button 
                onClick={onBackToLibrary} 
                className="px-3 py-1.5 text-sm bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Library
              </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="border-b bg-gray-50 px-4 overflow-x-auto">
          <div className="flex gap-1 py-2">
            {sections.map((section, idx) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(idx)}
                className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                  activeSection === idx
                    ? 'bg-white text-aeria-blue shadow'
                    : 'text-gray-600 hover:bg-white/50'
                }`}
              >
                <span className="mr-2">{idx + 1}.</span>
                {section.title}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {sections.map((section, idx) => renderSection(section, idx))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
              disabled={activeSection === 0}
              className="btn-secondary flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
              disabled={activeSection === sections.length - 1}
              className="btn-secondary flex items-center gap-1 disabled:opacity-50"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button onClick={() => handleSave(false)} className="btn-secondary flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button onClick={() => handleSave(true)} className="btn-primary flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Complete Form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================
// FORM LIBRARY BROWSER
// ============================================
function FormLibrary({ onSelectForm, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  
  const forms = getAvailableForms() || []
  
  const filteredForms = Array.isArray(forms) ? forms.filter(form => {
    if (!form) return false
    const matchesSearch = !searchQuery || 
      (form.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (form.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === 'all' || form.category === activeCategory
    return matchesSearch && matchesCategory
  }) : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-aeria-blue" />
            Form Library
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 border-b space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
            <label htmlFor="project-form-search" className="sr-only">Search forms</label>
            <input
              id="project-form-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search forms..."
              className="input pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm ${
                activeCategory === 'all' ? 'bg-aeria-blue text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              All Forms
            </button>
            {(FORM_CATEGORIES || []).map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-sm ${
                  activeCategory === cat.id ? 'bg-aeria-blue text-white' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Form Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredForms.map(form => {
              const IconComponent = iconMap[form.icon] || FileText
              return (
                <button
                  key={form.id}
                  onClick={() => onSelectForm(form)}
                  className="p-4 border rounded-lg text-left hover:border-aeria-blue hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-aeria-blue group-hover:text-white transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{form.shortName || form.name}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">{form.description}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          
          {filteredForms.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No forms found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function ProjectForms({ project, onUpdate }) {
  const [operators, setOperators] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [clients, setClients] = useState([])
  const [showLibrary, setShowLibrary] = useState(false)
  const [selectedForm, setSelectedForm] = useState(null)
  const [editingForm, setEditingForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [linkedForms, setLinkedForms] = useState([])  // Forms from Firestore linked to this project

  // FIX #8 & #9: Get branding for PDF exports
  const { branding } = useBranding()
  const { organizationId } = useOrganization()

  useEffect(() => {
    const loadData = async () => {
      if (!organizationId) return
      try {
        // Load operators, aircraft, clients, and linked forms in parallel
        const [ops, acs, cls, linked] = await Promise.all([
          getOperators(organizationId).catch(() => []),
          getAircraft(organizationId).catch(() => []),
          getClients(organizationId).catch(() => []),
          project?.id ? getFormsByProject(project.id).catch(() => []) : Promise.resolve([])
        ])
        setOperators(ops || [])
        setAircraft(acs || [])
        setClients(cls || [])
        setLinkedForms(linked || [])
      } catch (err) {
        logger.error('Error loading data:', err)
        setOperators([])
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [organizationId, project?.id])

  // FIX: Ensure projectForms is ALWAYS an array
  const projectForms = Array.isArray(project?.forms) ? project.forms : []

  const handleSelectForm = (formTemplate) => {
    setSelectedForm(formTemplate)
    setShowLibrary(false)
  }

  const handleSaveForm = (formData, markComplete) => {
    const newForm = {
      id: editingForm?.id || `form-${Date.now()}`,
      templateId: selectedForm?.id || editingForm?.templateId,
      status: markComplete ? 'completed' : 'in_progress',
      data: formData,
      createdAt: editingForm?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: markComplete ? new Date().toISOString() : null
    }

    let updatedForms
    if (editingForm) {
      updatedForms = projectForms.map(f => f.id === editingForm.id ? newForm : f)
    } else {
      updatedForms = [...projectForms, newForm]
    }

    onUpdate({ forms: updatedForms })
    setSelectedForm(null)
    setEditingForm(null)
  }

  const handleEditForm = (form) => {
    const template = (FORM_TEMPLATES || {})[form.templateId]
    if (template) {
      setSelectedForm(template)
      setEditingForm(form)
    }
  }

  const handleDeleteForm = (formId) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      onUpdate({ forms: projectForms.filter(f => f.id !== formId) })
    }
  }

  const handleExportForm = async (form) => {
    const template = (FORM_TEMPLATES || {})[form.templateId]
    if (!template) {
      alert('Unable to export: Form template not found')
      return
    }
    
    try {
      // FIX #8 & #9: Get branding and client data for the export
      const clientData = project?.clientId 
        ? clients.find(c => c.id === project.clientId)
        : null
      
      // Build branding object with operator branding
      const exportBranding = branding?.operator ? { operator: branding.operator } : null
      
      // Build client branding object if client has a logo
      const clientBranding = clientData?.logo ? {
        name: clientData.name,
        logo: clientData.logo
      } : null
      
      // Dynamic import to avoid loading PDF lib until needed
      const { exportFormToPDF } = await import('../../lib/pdfExportService')
      
      // FIX #8 & #9: Pass branding and clientBranding to export
      await exportFormToPDF(form, template, project, operators, exportBranding, clientBranding)
    } catch (err) {
      logger.error('Error exporting form:', err)
      alert('Error exporting form to PDF. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-aeria-blue" />
      </div>
    )
  }

  // Defensive check for form definitions
  const categories = Array.isArray(FORM_CATEGORIES) ? FORM_CATEGORIES : []
  const templates = FORM_TEMPLATES || {}

  // Group forms by category
  const formsByCategory = {}
  categories.forEach(cat => {
    formsByCategory[cat.id] = projectForms.filter(f => {
      const template = templates[f.templateId]
      return template?.category === cat.id
    })
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Forms</h2>
          <p className="text-sm text-gray-500 mt-1">
            {projectForms.length + linkedForms.length} form{(projectForms.length + linkedForms.length) !== 1 ? 's' : ''}
            {linkedForms.length > 0 && ` (${linkedForms.length} linked)`} •
            {projectForms.filter(f => f.status === 'completed').length + linkedForms.filter(f => f.status === 'completed').length} completed
          </p>
        </div>
        <button
          onClick={() => setShowLibrary(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Form
        </button>
      </div>

      {/* Linked Forms from Forms Page */}
      {linkedForms.length > 0 && (
        <div className="card border-l-4 border-l-aeria-navy">
          <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-5 h-5 text-aeria-navy" />
            Linked Forms
            <span className="text-sm font-normal text-gray-500">
              (Submitted from Forms page)
            </span>
          </h3>
          <div className="space-y-2">
            {linkedForms.map(form => {
              const statusConfig = {
                draft: { color: 'bg-gray-100 text-gray-700', label: 'Draft' },
                in_progress: { color: 'bg-blue-100 text-blue-700', label: 'In Progress' },
                completed: { color: 'bg-green-100 text-green-700', label: 'Completed' }
              }
              const status = statusConfig[form.status] || statusConfig.draft
              const createdDate = form.createdAt?.toDate?.()
                ? form.createdAt.toDate().toLocaleDateString()
                : 'Unknown date'

              return (
                <div
                  key={form.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {form.templateName || form.templateId || 'Form'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Submitted {createdDate}
                        {form.submittedBy && ` by ${form.submittedBy}`}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Forms by Category */}
      {projectForms.length === 0 && linkedForms.length === 0 ? (
        <div className="card text-center py-12">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="font-medium text-gray-900">No forms yet</h3>
          <p className="text-sm text-gray-500 mt-1">Add forms from the library to get started</p>
          <button
            onClick={() => setShowLibrary(true)}
            className="btn-primary mt-4"
          >
            Browse Form Library
          </button>
        </div>
      ) : projectForms.length === 0 ? null : (
        <div className="space-y-6">
          {categories.map(category => {
            const categoryForms = formsByCategory[category.id] || []
            if (categoryForms.length === 0) return null
            
            return (
              <div key={category.id} className="card">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  {category.name}
                  <span className="text-sm font-normal text-gray-500">
                    ({categoryForms.length})
                  </span>
                </h3>
                
                <div className="space-y-2">
                  {categoryForms.map(form => {
                    const template = templates[form.templateId]
                    const status = formStatuses[form.status] || formStatuses.pending
                    const StatusIcon = status.icon
                    const FormIcon = iconMap[template?.icon] || FileText
                    
                    return (
                      <div
                        key={form.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FormIcon className="w-5 h-5 text-gray-400" />
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {template?.shortName || template?.name || 'Unknown Form'}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {form.updatedAt ? `Updated ${new Date(form.updatedAt).toLocaleDateString()}` : 'Draft'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${status.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {status.label}
                          </span>
                          <button
                            onClick={() => handleEditForm(form)}
                            className="p-2 text-gray-500 hover:text-aeria-blue hover:bg-blue-50 rounded"
                            title="Edit form"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleExportForm(form)}
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                            title="Export to PDF"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded"
                            title="Delete form"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showLibrary && (
        <FormLibrary
          onSelectForm={handleSelectForm}
          onClose={() => setShowLibrary(false)}
        />
      )}

      {selectedForm && (
        <FormModal
          form={editingForm}
          formTemplate={selectedForm}
          project={project}
          operators={operators}
          aircraft={aircraft}
          onSave={handleSaveForm}
          onBackToLibrary={() => {
            setSelectedForm(null)
            setEditingForm(null)
            setShowLibrary(true)
          }}
          onClose={() => {
            setSelectedForm(null)
            setEditingForm(null)
          }}
        />
      )}
    </div>
  )
}

ProjectForms.propTypes = {
  project: PropTypes.shape({
    forms: PropTypes.array,
    crew: PropTypes.array,
    aircraft: PropTypes.array
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
