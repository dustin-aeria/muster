/**
 * Forms.jsx
 * Dynamic form builder and submission system
 * 
 * Features:
 * - Template-based form creation
 * - Dynamic field visibility with safe condition evaluation
 * - Risk assessment calculations
 * - RPAS incident reporting triggers
 * - Form status tracking
 * 
 * Security Fix (Batch 2):
 * - Replaced eval() with safe condition parser for showIf conditions
 * 
 * Code Quality Fix (Batch 5):
 * - Replaced console.log with logger utility
 * 
 * @location src/pages/Forms.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { 
  Plus, Search, ClipboardList, Filter, ChevronRight, ChevronDown,
  Shield, AlertOctagon, AlertTriangle, Users, CheckSquare, FileText,
  Wrench, HardHat, GraduationCap, Truck, Calendar, ClipboardCheck,
  X, Clock, MapPin, User, Download, Eye, Trash2, Copy,
  Phone, AlertCircle, CheckCircle2, ArrowRight
} from 'lucide-react'
import { FORM_TEMPLATES, FORM_CATEGORIES, RPAS_INCIDENT_TRIGGERS, calculateRiskScore, SEVERITY_RATINGS, PROBABILITY_RATINGS, CONTROL_TYPES, HAZARD_CATEGORIES } from '../lib/formDefinitions'
import { logger } from '../lib/logger'
import { createForm, getForms } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'

// Icon mapping
const iconMap = {
  Shield, AlertOctagon, AlertTriangle, Users, CheckSquare, FileText,
  Wrench, HardHat, GraduationCap, Truck, Calendar, ClipboardCheck, Search
}

// Form status badge
function StatusBadge({ status }) {
  const styles = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    requires_action: 'bg-amber-100 text-amber-700',
  }
  const labels = {
    draft: 'Draft',
    in_progress: 'In Progress',
    completed: 'Completed',
    requires_action: 'Requires Action',
  }
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  )
}

// Risk score badge
function RiskBadge({ level }) {
  const styles = {
    critical: 'bg-red-700 text-white',
    high: 'bg-red-500 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-green-500 text-white',
  }
  return (
    <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${styles[level] || 'bg-gray-200'}`}>
      {level}
    </span>
  )
}

// Notification triggers panel for incident forms
function NotificationTriggersPanel({ triggers }) {
  if (!triggers || triggers.length === 0) return null
  
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-red-800 text-lg">REQUIRED NOTIFICATIONS</h3>
          <p className="text-red-700 text-sm mb-4">Based on your answers, the following actions are required:</p>
          
          <div className="space-y-3">
            {triggers.includes('TSB_IMMEDIATE') && (
              <div className="bg-red-100 border border-red-400 rounded-lg p-3">
                <div className="flex items-center gap-2 font-bold text-red-900">
                  <Phone className="w-5 h-5" />
                  <span>CALL TSB IMMEDIATELY</span>
                </div>
                <div className="mt-2 text-red-800">
                  <p className="font-mono text-lg">1-800-387-3557 (toll-free)</p>
                  <p className="font-mono">or 1-819-994-3741 (direct/collect)</p>
                </div>
                <p className="text-sm mt-2 text-red-700">
                  Triggered by: Fatality, serious injury, RPAS &gt;25kg accident, collision with manned aircraft
                </p>
              </div>
            )}
            
            {triggers.includes('TRANSPORT_CANADA') && (
              <div className="bg-orange-100 border border-orange-400 rounded-lg p-3">
                <div className="flex items-center gap-2 font-bold text-orange-900">
                  <FileText className="w-5 h-5" />
                  <span>NOTIFY TRANSPORT CANADA</span>
                </div>
                <p className="text-sm mt-1 text-orange-800">
                  Submit CADORS report. If under SFOC, submit RPAS Aviation Occurrence Reporting Form.
                </p>
              </div>
            )}
            
            {triggers.includes('WORKSAFEBC') && (
              <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-3">
                <div className="flex items-center gap-2 font-bold text-yellow-900">
                  <AlertTriangle className="w-5 h-5" />
                  <span>NOTIFY WORKSAFEBC</span>
                </div>
                <p className="text-sm mt-1 text-yellow-800">
                  Report workplace incident to WorkSafeBC.
                </p>
              </div>
            )}
            
            <div className="bg-blue-100 border border-blue-400 rounded-lg p-3">
              <div className="flex items-center gap-2 font-bold text-blue-900">
                <User className="w-5 h-5" />
                <span>NOTIFY AERIA ACCOUNTABLE EXECUTIVE</span>
              </div>
              <div className="mt-1 text-blue-800">
                <p>Dustin Wales: <span className="font-mono">604-849-2345</span></p>
              </div>
              <p className="text-sm mt-1 text-blue-700">Required for ALL incidents.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Form field components
function FormField({ field, value, onChange, formData }) {
  const [localValue, setLocalValue] = useState(value || '')
  
  // Safe condition evaluator (replaces eval for security)
  const evaluateCondition = (condition, data) => {
    if (!condition || !data) return true
    
    // Handle simple equality: fieldName === 'value' or fieldName !== 'value'
    const equalityMatch = condition.match(/^(\w+)\s*(===?|!==?)\s*['"]([^'"]*)['"]\s*$/)
    if (equalityMatch) {
      const [, fieldName, operator, expectedValue] = equalityMatch
      const actualValue = data[fieldName]
      if (operator === '===' || operator === '==') {
        return actualValue === expectedValue
      }
      if (operator === '!==' || operator === '!=') {
        return actualValue !== expectedValue
      }
    }
    
    // Handle boolean comparison: fieldName === true/false
    const boolMatch = condition.match(/^(\w+)\s*(===?|!==?)\s*(true|false)\s*$/)
    if (boolMatch) {
      const [, fieldName, operator, boolStr] = boolMatch
      const actualValue = data[fieldName]
      const expectedBool = boolStr === 'true'
      if (operator === '===' || operator === '==') {
        return actualValue === expectedBool
      }
      if (operator === '!==' || operator === '!=') {
        return actualValue !== expectedBool
      }
    }
    
    // Handle simple truthy check: fieldName
    const truthyMatch = condition.match(/^!?(\w+)$/)
    if (truthyMatch) {
      const isNegated = condition.startsWith('!')
      const fieldName = truthyMatch[1]
      const actualValue = data[fieldName]
      return isNegated ? !actualValue : !!actualValue
    }
    
    // Handle AND conditions: fieldA && fieldB
    if (condition.includes('&&')) {
      const parts = condition.split('&&').map(p => p.trim())
      return parts.every(part => evaluateCondition(part, data))
    }
    
    // Handle OR conditions: fieldA || fieldB
    if (condition.includes('||')) {
      const parts = condition.split('||').map(p => p.trim())
      return parts.some(part => evaluateCondition(part, data))
    }
    
    // Default to showing the field if condition can't be parsed
    logger.warn('Could not parse showIf condition:', condition)
    return true
  }
  
  // Handle show/hide conditions safely
  if (field.showIf) {
    if (!evaluateCondition(field.showIf, formData)) {
      return null
    }
  }

  const handleChange = (newValue) => {
    setLocalValue(newValue)
    onChange(field.id, newValue)
  }

  const baseInputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent transition-colors"
  
  switch (field.type) {
    case 'text':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
            required={field.required}
          />
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'textarea':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            rows={field.rows || 3}
            className={baseInputClass}
            required={field.required}
          />
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'select':
      const options = typeof field.options === 'string' 
        ? (field.options === 'HAZARD_CATEGORIES' ? HAZARD_CATEGORIES :
           field.options === 'SEVERITY_RATINGS' ? SEVERITY_RATINGS :
           field.options === 'PROBABILITY_RATINGS' ? PROBABILITY_RATINGS :
           field.options === 'CONTROL_TYPES' ? CONTROL_TYPES : [])
        : field.options
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={field.required}
          >
            <option value="">Select...</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'yesno':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value="true"
                checked={localValue === true || localValue === 'true'}
                onChange={() => handleChange(true)}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className={`px-3 py-1 rounded-full text-sm ${localValue === true || localValue === 'true' ? 'bg-red-100 text-red-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                Yes
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value="false"
                checked={localValue === false || localValue === 'false'}
                onChange={() => handleChange(false)}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className={`px-3 py-1 rounded-full text-sm ${localValue === false || localValue === 'false' ? 'bg-green-100 text-green-700 font-medium' : 'bg-gray-100 text-gray-600'}`}>
                No
              </span>
            </label>
          </div>
          {field.trigger && (localValue === true || localValue === 'true') && (
            <p className="text-xs text-red-600 mt-1 font-medium">⚠️ This triggers: {field.trigger}</p>
          )}
        </div>
      )

    case 'date':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="date"
            value={localValue || (field.defaultToday ? new Date().toISOString().split('T')[0] : '')}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={field.required}
          />
        </div>
      )

    case 'time':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="time"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={field.required}
          />
        </div>
      )

    case 'datetime':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="datetime-local"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={field.required}
          />
        </div>
      )

    case 'number':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="number"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={field.required}
          />
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'checkbox':
      return (
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={localValue === true}
              onChange={(e) => handleChange(e.target.checked)}
              className="w-5 h-5 text-aeria-navy rounded"
            />
            <span className="text-sm font-medium text-gray-700">{field.label}</span>
            {field.required && <span className="text-red-500">*</span>}
          </label>
        </div>
      )

    case 'risk_matrix':
      const severity = formData?.[field.id.replace('_risk', '_severity')] || formData?.severity
      const probability = formData?.[field.id.replace('_risk', '_probability')] || formData?.probability
      const riskLevel = calculateRiskScore(severity, probability)
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <RiskBadge level={riskLevel} />
        </div>
      )

    case 'signature':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
            <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600">Click to sign</p>
            {localValue && (
              <div className="mt-2">
                <CheckCircle2 className="w-5 h-5 mx-auto text-green-500" />
                <p className="text-xs text-green-600 mt-1">Signed</p>
              </div>
            )}
          </div>
        </div>
      )

    case 'gps':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Lat, Long"
              className={`${baseInputClass} flex-1`}
            />
            <button
              type="button"
              className="px-3 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors flex items-center gap-1"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    handleChange(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`)
                  })
                }
              }}
            >
              <MapPin className="w-4 h-4" />
            </button>
          </div>
        </div>
      )

    case 'file_upload':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 cursor-pointer transition-colors">
            <Download className="w-8 h-8 mx-auto mb-2 text-gray-400 rotate-180" />
            <p className="text-sm text-gray-600">Click to upload or drag files here</p>
            <p className="text-xs text-gray-400 mt-1">{field.accept || 'Any file type'}</p>
          </div>
        </div>
      )

    case 'auto_id':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 font-mono text-sm">
            {localValue || 'Auto-generated on save'}
          </div>
        </div>
      )

    case 'multiselect':
      const msOptions = typeof field.options === 'string' ? [] : field.options
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {msOptions.map(opt => (
              <label key={opt.value || opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Array.isArray(localValue) && localValue.includes(opt.value || opt)}
                  onChange={(e) => {
                    const current = Array.isArray(localValue) ? localValue : []
                    if (e.target.checked) {
                      handleChange([...current, opt.value || opt])
                    } else {
                      handleChange(current.filter(v => v !== (opt.value || opt)))
                    }
                  }}
                  className="w-4 h-4 text-aeria-navy rounded"
                />
                <span className="text-sm text-gray-700">{opt.label || opt}</span>
              </label>
            ))}
          </div>
        </div>
      )

    case 'project_select':
    case 'operator_select':
    case 'aircraft_select':
    case 'crew_multi_select':
    case 'equipment_select':
    case 'incident_select':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            required={field.required}
          >
            <option value="">Select...</option>
            <option value="demo">Demo Selection</option>
          </select>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    default:
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
          />
        </div>
      )
  }
}

// Form section component
function FormSection({ section, formData, onChange, isExpanded, onToggle, activeTriggers }) {
  const [repeatableItems, setRepeatableItems] = useState([{ id: 1 }])

  const addRepeatableItem = () => {
    setRepeatableItems([...repeatableItems, { id: Date.now() }])
  }

  // Handle special section types that don't have fields
  if (section.type === 'trigger_checklist') {
    return (
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={onToggle}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <h3 className="font-semibold text-gray-900">{section.title}</h3>
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>

        {isExpanded && (
          <div className="p-4">
            {section.description && (
              <p className="text-sm text-gray-600 mb-4">{section.description}</p>
            )}
            {activeTriggers && activeTriggers.length > 0 ? (
              <NotificationTriggersPanel triggers={activeTriggers} />
            ) : (
              <div className="text-center py-6 text-gray-500">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No regulatory notifications required based on current answers.</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Skip rendering if section has no fields
  if (!section.fields || section.fields.length === 0) {
    return null
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="font-semibold text-gray-900">{section.title}</h3>
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {section.description && (
            <p className="text-sm text-gray-600 mb-4">{section.description}</p>
          )}

          {section.repeatable ? (
            <>
              {repeatableItems.map((item, index) => (
                <div key={item.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => setRepeatableItems(repeatableItems.filter(i => i.id !== item.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.fields.map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <FormField
                          field={field}
                          value={formData?.[`${section.id}_${index}_${field.id}`]}
                          onChange={(id, value) => onChange(`${section.id}_${index}_${id}`, value)}
                          formData={formData}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addRepeatableItem}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-aeria-navy hover:text-aeria-navy transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {section.repeatLabel || 'Add Item'}
              </button>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map(field => (
                <div key={field.id} className={field.type === 'textarea' || field.type === 'multi_signature' ? 'md:col-span-2' : ''}>
                  <FormField
                    field={field}
                    value={formData?.[field.id]}
                    onChange={onChange}
                    formData={formData}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Active form modal/panel
function ActiveFormPanel({ template, onClose, onSave }) {
  const [formData, setFormData] = useState({})
  const [expandedSections, setExpandedSections] = useState({ [template.sections[0]?.id]: true })
  const [activeTriggers, setActiveTriggers] = useState([])
  
  const IconComponent = iconMap[template.icon] || ClipboardList
  
  const handleFieldChange = (fieldId, value) => {
    const newData = { ...formData, [fieldId]: value }
    setFormData(newData)
    
    // Check for triggers on incident forms
    if (template.hasTriggers) {
      const triggers = new Set()
      
      // TSB triggers
      if (newData.fatality === true || newData.fatality === 'true') triggers.add('TSB_IMMEDIATE')
      if (newData.serious_injury === true || newData.serious_injury === 'true') {
        triggers.add('TSB_IMMEDIATE')
        triggers.add('WORKSAFEBC')
      }
      if (newData.collision_manned === true || newData.collision_manned === 'true') triggers.add('TSB_IMMEDIATE')
      if (newData.rpas_over_25kg === true || newData.rpas_over_25kg === 'true') triggers.add('TSB_IMMEDIATE')
      
      // Transport Canada triggers
      if (newData.fly_away === true || newData.fly_away === 'true') triggers.add('TRANSPORT_CANADA')
      if (newData.boundary_violation === true || newData.boundary_violation === 'true') triggers.add('TRANSPORT_CANADA')
      if (newData.unintended_contact === true || newData.unintended_contact === 'true') triggers.add('TRANSPORT_CANADA')
      if (newData.near_miss === true || newData.near_miss === 'true') triggers.add('TRANSPORT_CANADA')
      
      setActiveTriggers(Array.from(triggers))
    }
  }
  
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center overflow-y-auto py-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-aeria-navy to-aeria-blue text-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{template.name}</h2>
              <p className="text-sm text-white/80">{template.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Form content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Notification triggers panel */}
          {template.hasTriggers && activeTriggers.length > 0 && (
            <NotificationTriggersPanel triggers={activeTriggers} />
          )}
          
          {/* Sections */}
          <div className="space-y-4">
            {template.sections.map(section => (
              <FormSection
                key={section.id}
                section={section}
                formData={formData}
                onChange={handleFieldChange}
                isExpanded={expandedSections[section.id]}
                onToggle={() => toggleSection(section.id)}
                activeTriggers={activeTriggers}
              />
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors">
              Save as Draft
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Submit Form
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main Forms page
export default function Forms() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [activeForm, setActiveForm] = useState(null)
  const [recentForms, setRecentForms] = useState([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [view, setView] = useState('templates') // 'templates' | 'submitted'

  // Load submitted forms from Firebase on mount
  useEffect(() => {
    async function loadSubmittedForms() {
      try {
        const forms = await getForms({ status: 'completed' })
        setRecentForms(forms.map(f => ({
          id: f.id,
          template: f.templateId,
          templateName: f.templateName,
          status: f.status,
          date: f.createdAt?.toDate?.()?.toISOString() || f.createdAt,
          submittedBy: f.submittedBy || 'Unknown'
        })))
      } catch (err) {
        logger.error('Error loading forms:', err)
      } finally {
        setLoadingForms(false)
      }
    }
    loadSubmittedForms()
  }, [])
  
  // Filter templates based on search and category
  const filteredTemplates = Object.values(FORM_TEMPLATES).filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.shortName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const handleStartForm = (templateId) => {
    const template = FORM_TEMPLATES[templateId]
    if (template) {
      setActiveForm(template)
    }
  }
  
  const handleSaveForm = async (formData) => {
    try {
      // Save form to Firebase
      const savedForm = await createForm({
        templateId: activeForm.id,
        templateName: activeForm.name,
        data: formData,
        status: 'completed',
        submittedBy: user?.displayName || user?.email || 'Unknown User',
        submittedById: user?.uid
      })

      logger.debug('Form saved:', savedForm.id)

      // Update local state with new form
      setRecentForms([
        {
          id: savedForm.id,
          template: activeForm.id,
          templateName: activeForm.name,
          status: 'completed',
          date: new Date().toISOString(),
          submittedBy: user?.displayName || user?.email || 'Unknown User'
        },
        ...recentForms
      ])
      setActiveForm(null)
    } catch (err) {
      logger.error('Error saving form:', err)
      alert('Failed to save form. Please try again.')
    }
  }

  return (
    <div className="flex h-full -m-6">
      {/* Sidebar */}
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Form Categories</h2>
        
        <nav className="space-y-1">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              !selectedCategory ? 'bg-aeria-navy text-white' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            <span className="font-medium">All Forms</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${!selectedCategory ? 'bg-white/20' : 'bg-gray-200'}`}>
              {Object.keys(FORM_TEMPLATES).length}
            </span>
          </button>
          
          {FORM_CATEGORIES.map(category => {
            const IconComp = iconMap[category.icon] || ClipboardList
            const count = category.forms.length
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category.id ? 'bg-aeria-navy text-white' : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComp className="w-5 h-5" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium block truncate">{category.name}</span>
                  <span className={`text-xs ${selectedCategory === category.id ? 'text-white/70' : 'text-gray-500'}`}>
                    {category.description}
                  </span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-200'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </nav>
        
        <hr className="my-4 border-gray-200" />
        
        <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
          <Plus className="w-5 h-5" />
          <span className="font-medium">Custom Form Builder</span>
        </button>
      </div>
      
      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
            <p className="text-gray-600 mt-1">
              {selectedCategory 
                ? FORM_CATEGORIES.find(c => c.id === selectedCategory)?.description 
                : 'All field forms and documentation'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView('templates')}
              className={`px-4 py-2 rounded-lg transition-colors ${view === 'templates' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Templates
            </button>
            <button
              onClick={() => setView('submitted')}
              className={`px-4 py-2 rounded-lg transition-colors ${view === 'submitted' ? 'bg-aeria-navy text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Submitted
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
          <label htmlFor="form-search" className="sr-only">Search forms</label>
          <input
            id="form-search"
            type="search"
            placeholder="Search forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
          />
        </div>

        {view === 'templates' ? (
          /* Form templates grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(template => {
              const IconComp = iconMap[template.icon] || ClipboardList
              const category = FORM_CATEGORIES.find(c => c.id === template.category)
              return (
                <div
                  key={template.id}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-aeria-navy/30 transition-all cursor-pointer group"
                  onClick={() => handleStartForm(template.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-aeria-sky rounded-lg flex items-center justify-center group-hover:bg-aeria-navy group-hover:text-white transition-colors">
                      <IconComp className="w-6 h-6 text-aeria-navy group-hover:text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-aeria-navy transition-colors">
                        {template.shortName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                      {template.hasTriggers && (
                        <span className="inline-flex items-center gap-1 mt-2 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                          <AlertTriangle className="w-3 h-3" />
                          Has regulatory triggers
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{category?.name}</span>
                    <span className="text-xs text-gray-400">{template.sections.length} sections</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          /* Submitted forms list */
          <div className="space-y-3">
            {recentForms.length > 0 ? (
              recentForms.map(form => (
                <div key={form.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{form.templateName}</h4>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(form.date).toLocaleDateString()} by {form.submittedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={form.status} />
                    <button className="p-2 text-gray-400 hover:text-aeria-navy transition-colors">
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-aeria-navy transition-colors">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ClipboardList className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No submitted forms yet</h3>
                <p className="text-gray-500 mb-4">
                  Complete a form to see it here
                </p>
                <button 
                  onClick={() => setView('templates')}
                  className="px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Start a Form
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Active form modal */}
      {activeForm && (
        <ActiveFormPanel
          template={activeForm}
          onClose={() => setActiveForm(null)}
          onSave={handleSaveForm}
        />
      )}
    </div>
  )
}
