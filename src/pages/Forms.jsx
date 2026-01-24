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

import { useState, useEffect, useRef, useId } from 'react'
import {
  Plus, Search, ClipboardList, Filter, ChevronRight, ChevronDown,
  Shield, AlertOctagon, AlertTriangle, Users, CheckSquare, FileText,
  Wrench, HardHat, GraduationCap, Truck, Calendar, ClipboardCheck,
  X, Clock, MapPin, User, Download, Eye, Trash2, Copy,
  Phone, AlertCircle, CheckCircle2, ArrowRight, Loader2, Upload
} from 'lucide-react'
import { FORM_TEMPLATES, FORM_CATEGORIES, RPAS_INCIDENT_TRIGGERS, calculateRiskScore, SEVERITY_RATINGS, PROBABILITY_RATINGS, CONTROL_TYPES, HAZARD_CATEGORIES } from '../lib/formDefinitions'
import { logger } from '../lib/logger'
import { createForm, getForms, getProjects, getOperators, getAircraft, getEquipment, getServices, getCustomForms, createCustomForm } from '../lib/firestore'
import { uploadFormAttachment, deleteFormAttachment } from '../lib/storageHelpers'
import { useAuth } from '../contexts/AuthContext'
import FormBuilder from '../components/forms/FormBuilder'
import TemplateLibrary from '../components/forms/TemplateLibrary'

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

// Location picker component with GPS and map selection
function LocationPicker({ field, value, onChange, required, allowMapSelect }) {
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [gettingLocation, setGettingLocation] = useState(false)
  const [manualCoords, setManualCoords] = useState(value || '')

  // Parse coordinates from value
  const parseCoords = (val) => {
    if (!val) return null
    const parts = val.split(',').map(p => parseFloat(p.trim()))
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] }
    }
    return null
  }

  const coords = parseCoords(value)

  const getCurrentPosition = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }
    setGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newValue = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
        setManualCoords(newValue)
        onChange(newValue)
        setGettingLocation(false)
      },
      (err) => {
        alert(`Unable to get location: ${err.message}`)
        setGettingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleManualChange = (e) => {
    setManualCoords(e.target.value)
    onChange(e.target.value)
  }

  const handleMapSelect = (lat, lng) => {
    const newValue = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    setManualCoords(newValue)
    onChange(newValue)
    setShowMapPicker(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          value={manualCoords}
          onChange={handleManualChange}
          placeholder="Lat, Long (e.g., 49.2827, -123.1207)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent transition-colors flex-1"
          required={required}
        />
        <button
          type="button"
          onClick={getCurrentPosition}
          disabled={gettingLocation}
          className="px-3 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-blue transition-colors flex items-center gap-1 disabled:opacity-50"
          title="Use current location"
        >
          {gettingLocation ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </button>
        {allowMapSelect && (
          <button
            type="button"
            onClick={() => setShowMapPicker(!showMapPicker)}
            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1"
            title="Select on map"
          >
            <Search className="w-4 h-4" />
            Map
          </button>
        )}
      </div>

      {/* Simple map picker */}
      {showMapPicker && (
        <div className="mt-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">
            Enter coordinates manually or use GPS above. Map integration coming soon.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={coords?.lat || ''}
                onChange={(e) => {
                  const lat = parseFloat(e.target.value)
                  const lng = coords?.lng || 0
                  if (!isNaN(lat)) handleMapSelect(lat, lng)
                }}
                placeholder="-90 to 90"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={coords?.lng || ''}
                onChange={(e) => {
                  const lng = parseFloat(e.target.value)
                  const lat = coords?.lat || 0
                  if (!isNaN(lng)) handleMapSelect(lat, lng)
                }}
                placeholder="-180 to 180"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMapPicker(false)}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Close
          </button>
        </div>
      )}

      {coords && (
        <p className="text-xs text-green-600 mt-1">
          Valid coordinates: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
        </p>
      )}

      {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
    </div>
  )
}

// Library select component - fetches data from firestore
function LibrarySelect({ field, value, onChange, fetchFn, labelFn, valueFn, detailFn, required, returnFullItem }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    async function loadOptions() {
      try {
        const data = await fetchFn()
        if (mounted) {
          setOptions(data)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }
    loadOptions()
    return () => { mounted = false }
  }, [])

  const handleChange = (e) => {
    const selectedValue = e.target.value
    if (returnFullItem) {
      const selectedItem = options.find(opt => valueFn(opt) === selectedValue)
      onChange(selectedValue, selectedItem)
    } else {
      onChange(selectedValue)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value || ''}
        onChange={handleChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent transition-colors"
        required={required}
        disabled={loading}
      >
        <option value="">{loading ? 'Loading...' : 'Select...'}</option>
        {options.map(opt => (
          <option key={valueFn(opt)} value={valueFn(opt)}>
            {labelFn(opt)}{detailFn && detailFn(opt) ? ` (${detailFn(opt)})` : ''}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
    </div>
  )
}

// Library multi-select component
function LibraryMultiSelect({ field, value, onChange, fetchFn, labelFn, valueFn, detailFn, required }) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [customEntry, setCustomEntry] = useState('')

  useEffect(() => {
    let mounted = true
    async function loadOptions() {
      try {
        const data = await fetchFn()
        if (mounted) {
          setOptions(data)
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setLoading(false)
        }
      }
    }
    loadOptions()
    return () => { mounted = false }
  }, [])

  const selectedValues = Array.isArray(value) ? value : []

  const toggleOption = (optValue) => {
    if (selectedValues.includes(optValue)) {
      onChange(selectedValues.filter(v => v !== optValue))
    } else {
      onChange([...selectedValues, optValue])
    }
  }

  const addCustom = () => {
    if (customEntry.trim() && !selectedValues.includes(customEntry.trim())) {
      onChange([...selectedValues, customEntry.trim()])
      setCustomEntry('')
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Selected items */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedValues.map(v => {
            const opt = options.find(o => valueFn(o) === v)
            const label = opt ? labelFn(opt) : v
            return (
              <span key={v} className="inline-flex items-center gap-1 px-2 py-1 bg-aeria-sky text-aeria-navy rounded-full text-sm">
                {label}
                <button
                  type="button"
                  onClick={() => toggleOption(v)}
                  className="hover:text-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Options list */}
      <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
        {loading ? (
          <p className="text-sm text-gray-500 py-2 text-center">Loading...</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-gray-500 py-2 text-center">No options available</p>
        ) : (
          options.map(opt => (
            <label key={valueFn(opt)} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
              <input
                type="checkbox"
                checked={selectedValues.includes(valueFn(opt))}
                onChange={() => toggleOption(valueFn(opt))}
                className="w-4 h-4 text-aeria-navy rounded"
              />
              <span className="text-sm text-gray-700">{labelFn(opt)}</span>
              {detailFn && detailFn(opt) && (
                <span className="text-xs text-gray-400">({detailFn(opt)})</span>
              )}
            </label>
          ))
        )}
      </div>

      {/* Custom entry */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          value={customEntry}
          onChange={(e) => setCustomEntry(e.target.value)}
          placeholder="Add custom..."
          className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustom())}
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Add
        </button>
      </div>

      {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
    </div>
  )
}

// Form field components
function FormField({ field, value, onChange, formData, formId }) {
  const { user } = useAuth()
  const [localValue, setLocalValue] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)
  const fileInputRef = useRef(null)
  
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
      const severity = formData?.[field.id.replace('_risk', '_severity')] || formData?.severity || '1'
      const probability = formData?.[field.id.replace('_risk', '_probability')] || formData?.probability || 'A'
      // calculateRiskScore expects (severity, probability) and returns a string like 'critical', 'high', 'medium', 'low'
      const riskLevel = calculateRiskScore(severity, probability)
      // Calculate a numeric score based on severity and probability
      const severityNum = parseInt(severity) || 1
      const probMap = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 }
      const probNum = probMap[probability] || 1
      const riskScore = severityNum * probNum
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <RiskBadge level={riskLevel} />
          <span className="ml-2 text-sm text-gray-500">Score: {riskScore}</span>
        </div>
      )

    case 'signature':
      const signerName = user?.displayName || user?.email || 'User'
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div
            className={`border-2 rounded-lg p-4 text-center transition-colors cursor-pointer ${
              localValue
                ? 'border-green-300 bg-green-50'
                : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => {
              if (!localValue) {
                const signatureData = {
                  name: signerName,
                  timestamp: new Date().toISOString(),
                  userId: user?.uid
                }
                handleChange(signatureData)
              }
            }}
          >
            {localValue ? (
              <div className="space-y-1">
                <CheckCircle2 className="w-8 h-8 mx-auto text-green-500" />
                <p className="text-sm font-medium text-gray-700">{localValue.name}</p>
                <p className="text-xs text-gray-500">
                  {new Date(localValue.timestamp).toLocaleString()}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleChange(null)
                  }}
                  className="text-xs text-red-500 hover:underline mt-2"
                >
                  Clear signature
                </button>
              </div>
            ) : (
              <>
                <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to sign as {signerName}</p>
              </>
            )}
          </div>
        </div>
      )

    case 'multi_signature':
    case 'crew_multi_signature':
      // Multi-person signature field - allows multiple crew members to sign
      const currentSignatures = Array.isArray(localValue) ? localValue : []
      const currentUserSigned = currentSignatures.some(sig => sig.userId === user?.uid)
      const currentUserName = user?.displayName || user?.email || 'User'

      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>

          {/* List of signatures */}
          {currentSignatures.length > 0 && (
            <div className="space-y-2 mb-3">
              {currentSignatures.map((sig, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sig.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(sig.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {sig.userId === user?.uid && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = currentSignatures.filter((_, i) => i !== idx)
                        handleChange(updated.length > 0 ? updated : null)
                      }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Sign button for current user */}
          {!currentUserSigned ? (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => {
                const newSignature = {
                  name: currentUserName,
                  timestamp: new Date().toISOString(),
                  userId: user?.uid
                }
                handleChange([...currentSignatures, newSignature])
              }}
            >
              <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600">Click to sign as {currentUserName}</p>
              {currentSignatures.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  {currentSignatures.length} signature{currentSignatures.length !== 1 ? 's' : ''} collected
                </p>
              )}
            </div>
          ) : (
            <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-6 h-6 mx-auto text-green-500 mb-1" />
              <p className="text-sm text-green-700">You have signed this form</p>
              <p className="text-xs text-gray-500 mt-1">
                {currentSignatures.length} total signature{currentSignatures.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {field.helpText && (
            <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
          )}
        </div>
      )

    case 'gps':
    case 'map_location':
      return (
        <LocationPicker
          field={field}
          value={localValue}
          onChange={handleChange}
          required={field.required}
          allowMapSelect={field.type === 'map_location' || field.allowMapSelect}
        />
      )

    case 'file_upload':
      const files = Array.isArray(localValue) ? localValue : (localValue ? [localValue] : [])
      const handleFileUpload = async (selectedFiles) => {
        if (!selectedFiles || selectedFiles.length === 0) return
        if (!formId) {
          setUploadError('Please save the form first before uploading files')
          return
        }

        setUploading(true)
        setUploadError(null)

        const newFiles = [...files]
        for (const file of selectedFiles) {
          try {
            const result = await uploadFormAttachment(file, formId, field.id)
            newFiles.push(result)
          } catch (err) {
            setUploadError(err.message || 'Upload failed')
          }
        }

        setUploading(false)
        handleChange(field.multiple ? newFiles : newFiles[newFiles.length - 1])
      }

      const handleFileDelete = async (index) => {
        const fileToDelete = files[index]
        try {
          if (fileToDelete.path) {
            await deleteFormAttachment(fileToDelete.path)
          }
          const newFiles = files.filter((_, i) => i !== index)
          handleChange(field.multiple ? newFiles : null)
        } catch (err) {
          setUploadError(err.message || 'Delete failed')
        }
      }

      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple={field.multiple}
            accept={field.accept}
            onChange={(e) => handleFileUpload(Array.from(e.target.files))}
            className="hidden"
          />
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              uploading ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50 cursor-pointer'
            } border-gray-300`}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <div className="py-2">
                <Loader2 className="w-8 h-8 mx-auto text-aeria-navy animate-spin mb-2" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-600">Click to upload{field.multiple ? ' files' : ' a file'}</p>
                <p className="text-xs text-gray-400 mt-1">{field.accept || 'PDF, Word, Excel, images, videos'}</p>
              </>
            )}
          </div>

          {uploadError && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{uploadError}</span>
              <button type="button" onClick={() => setUploadError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {files.length > 0 && (
            <div className="mt-3 space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    {file.size && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        ({(file.size / 1024).toFixed(0)} KB)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-aeria-navy hover:text-aeria-blue"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFileDelete(index)
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
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
      return (
        <LibrarySelect
          field={field}
          value={localValue}
          onChange={handleChange}
          fetchFn={getProjects}
          labelFn={(item) => item.name}
          valueFn={(item) => item.id}
          required={field.required}
        />
      )

    case 'operator_select':
      return (
        <LibrarySelect
          field={field}
          value={localValue}
          onChange={(val, item) => {
            handleChange(val)
            // Auto-populate certificate details if field exists
            if (item && field.autoPopulate) {
              field.autoPopulate.forEach(mapping => {
                if (item[mapping.from]) {
                  onChange(mapping.to, item[mapping.from])
                }
              })
            }
          }}
          fetchFn={getOperators}
          labelFn={(item) => `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || 'Unknown'}
          valueFn={(item) => item.id}
          detailFn={(item) => item.certNumber ? `Cert: ${item.certNumber}` : null}
          required={field.required}
          returnFullItem
        />
      )

    case 'aircraft_select':
      return (
        <LibrarySelect
          field={field}
          value={localValue}
          onChange={(val, item) => {
            handleChange(val)
            // Auto-populate aircraft details if configured
            if (item && field.autoPopulate) {
              field.autoPopulate.forEach(mapping => {
                if (item[mapping.from] !== undefined) {
                  onChange(mapping.to, item[mapping.from])
                }
              })
            }
          }}
          fetchFn={getAircraft}
          labelFn={(item) => item.nickname || item.model || 'Unknown Aircraft'}
          valueFn={(item) => item.id}
          detailFn={(item) => {
            const parts = []
            if (item.registration) parts.push(item.registration)
            if (item.weight) parts.push(`${item.weight}kg`)
            return parts.length > 0 ? parts.join(' | ') : null
          }}
          required={field.required}
          returnFullItem
        />
      )

    case 'crew_multi_select':
      return (
        <LibraryMultiSelect
          field={field}
          value={localValue}
          onChange={handleChange}
          fetchFn={getOperators}
          labelFn={(item) => `${item.firstName || ''} ${item.lastName || ''}`.trim() || item.name || 'Unknown'}
          valueFn={(item) => item.id}
          detailFn={(item) => item.role || item.position}
          required={field.required}
        />
      )

    case 'equipment_select':
      return (
        <LibrarySelect
          field={field}
          value={localValue}
          onChange={handleChange}
          fetchFn={() => getEquipment(field.equipmentCategory ? { category: field.equipmentCategory } : {})}
          labelFn={(item) => item.name || item.nickname || 'Unknown'}
          valueFn={(item) => item.id}
          detailFn={(item) => item.serialNumber ? `S/N: ${item.serialNumber}` : null}
          required={field.required}
        />
      )

    case 'service_select':
      return (
        <LibrarySelect
          field={field}
          value={localValue}
          onChange={(val, item) => {
            handleChange(val)
            // Auto-populate rate details if configured
            if (item && field.autoPopulate) {
              field.autoPopulate.forEach(mapping => {
                if (item[mapping.from] !== undefined) {
                  onChange(mapping.to, item[mapping.from])
                }
              })
            }
          }}
          fetchFn={() => getServices(field.serviceCategory ? { category: field.serviceCategory } : {})}
          labelFn={(item) => item.name || 'Unknown Service'}
          valueFn={(item) => item.id}
          detailFn={(item) => item.hourlyRate ? `$${item.hourlyRate}/hr` : null}
          required={field.required}
          returnFullItem
        />
      )

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
            <option value="new">New Incident</option>
          </select>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'currency':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className={`${baseInputClass} pl-7`}
              placeholder="0.00"
              step="0.01"
              min="0"
              required={field.required}
            />
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'phone':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="tel"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={baseInputClass}
            placeholder="(555) 123-4567"
            required={field.required}
          />
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'user_auto':
      // Auto-fill with current user's name
      if (!localValue && user) {
        const userName = user.displayName || user.email || 'Unknown User'
        setTimeout(() => handleChange(userName), 0)
      }
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-700">
            {localValue || user?.displayName || user?.email || 'Unknown User'}
          </div>
        </div>
      )

    case 'calculated':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 italic">
            {localValue || 'Auto-calculated'}
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'yesno_conditional':
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${formId}-${field.id}`}
                checked={localValue === true}
                onChange={() => handleChange(true)}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className="text-sm">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${formId}-${field.id}`}
                checked={localValue === false}
                onChange={() => handleChange(false)}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className="text-sm">No</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={`${formId}-${field.id}`}
                checked={localValue === 'na'}
                onChange={() => handleChange('na')}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className="text-sm">N/A</span>
            </label>
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'checklist':
      const checklistOptions = typeof field.options === 'string' ? [] : (field.options || [])
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
            {checklistOptions.map((opt, idx) => {
              const optValue = opt.value || opt
              const optLabel = opt.label || opt
              const isChecked = Array.isArray(localValue) && localValue.includes(optValue)
              return (
                <label key={idx} className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => {
                      const current = Array.isArray(localValue) ? localValue : []
                      if (e.target.checked) {
                        handleChange([...current, optValue])
                      } else {
                        handleChange(current.filter(v => v !== optValue))
                      }
                    }}
                    className="w-4 h-4 text-aeria-navy rounded mt-0.5"
                  />
                  <span className="text-sm text-gray-700">{optLabel}</span>
                </label>
              )
            })}
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'weather_conditions':
      const weatherOptions = [
        { value: 'clear', label: 'Clear' },
        { value: 'partly_cloudy', label: 'Partly Cloudy' },
        { value: 'cloudy', label: 'Cloudy' },
        { value: 'overcast', label: 'Overcast' },
        { value: 'rain', label: 'Rain' },
        { value: 'snow', label: 'Snow' },
        { value: 'fog', label: 'Fog' },
        { value: 'windy', label: 'Windy' }
      ]
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
            <option value="">Select weather...</option>
            {weatherOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'auto_increment':
      // Auto-increment field - generates sequential number
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <input
            type="text"
            value={localValue || 'Auto-generated'}
            className={`${baseInputClass} bg-gray-50`}
            disabled
          />
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'battery_select':
      // Battery select - filter equipment to battery type
      const batteries = availableEquipment.filter(e =>
        e.category === 'power' || e.name?.toLowerCase().includes('battery')
      )
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
            <option value="">Select battery...</option>
            {batteries.map(battery => (
              <option key={battery.id} value={battery.id}>
                {battery.name} {battery.serialNumber ? `(${battery.serialNumber})` : ''}
              </option>
            ))}
          </select>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'yesno_text':
      // Yes/No with text explanation field
      const yesnoTextValue = typeof localValue === 'object' ? localValue : { answer: '', text: '' }
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value="yes"
                  checked={yesnoTextValue.answer === 'yes'}
                  onChange={() => handleChange({ ...yesnoTextValue, answer: 'yes' })}
                  className="text-aeria-navy focus:ring-aeria-navy"
                />
                <span>Yes</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={field.id}
                  value="no"
                  checked={yesnoTextValue.answer === 'no'}
                  onChange={() => handleChange({ ...yesnoTextValue, answer: 'no' })}
                  className="text-aeria-navy focus:ring-aeria-navy"
                />
                <span>No</span>
              </label>
            </div>
            <textarea
              value={yesnoTextValue.text || ''}
              onChange={(e) => handleChange({ ...yesnoTextValue, text: e.target.value })}
              placeholder={field.textPlaceholder || 'Provide details...'}
              className={baseInputClass}
              rows={2}
            />
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'multiselect_text':
      // Multiselect with text for 'other' option
      const msTextValue = typeof localValue === 'object' ? localValue : { selected: [], otherText: '' }
      const msTextOptions = field.options || []
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2 border border-gray-200 rounded-lg p-3">
            {msTextOptions.map(opt => (
              <label key={opt.value || opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(msTextValue.selected || []).includes(opt.value || opt)}
                  onChange={(e) => {
                    const optValue = opt.value || opt
                    const newSelected = e.target.checked
                      ? [...(msTextValue.selected || []), optValue]
                      : (msTextValue.selected || []).filter(v => v !== optValue)
                    handleChange({ ...msTextValue, selected: newSelected })
                  }}
                  className="rounded text-aeria-navy focus:ring-aeria-navy"
                />
                <span className="text-sm">{opt.label || opt}</span>
              </label>
            ))}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(msTextValue.selected || []).includes('other')}
                onChange={(e) => {
                  const newSelected = e.target.checked
                    ? [...(msTextValue.selected || []), 'other']
                    : (msTextValue.selected || []).filter(v => v !== 'other')
                  handleChange({ ...msTextValue, selected: newSelected })
                }}
                className="rounded text-aeria-navy focus:ring-aeria-navy"
              />
              <span className="text-sm">Other</span>
            </label>
            {(msTextValue.selected || []).includes('other') && (
              <input
                type="text"
                value={msTextValue.otherText || ''}
                onChange={(e) => handleChange({ ...msTextValue, otherText: e.target.value })}
                placeholder="Specify other..."
                className={`${baseInputClass} mt-2`}
              />
            )}
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'repeatable_text':
      // Repeatable text entries
      const repTextItems = Array.isArray(localValue) ? localValue : ['']
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-2">
            {repTextItems.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...repTextItems]
                    newItems[idx] = e.target.value
                    handleChange(newItems)
                  }}
                  placeholder={field.placeholder || 'Enter text...'}
                  className={`${baseInputClass} flex-1`}
                />
                {repTextItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleChange(repTextItems.filter((_, i) => i !== idx))}
                    className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleChange([...repTextItems, ''])}
              className="text-sm text-aeria-navy hover:underline"
            >
              + Add another
            </button>
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'repeatable_person':
    case 'repeatable_witness':
      // Repeatable person/witness entries
      const repPersonItems = Array.isArray(localValue) ? localValue : [{ name: '', contact: '' }]
      const personLabel = field.type === 'repeatable_witness' ? 'Witness' : 'Person'
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </label>
          <div className="space-y-3">
            {repPersonItems.map((person, idx) => (
              <div key={idx} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">{personLabel} {idx + 1}</span>
                  {repPersonItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleChange(repPersonItems.filter((_, i) => i !== idx))}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={person.name || ''}
                    onChange={(e) => {
                      const newItems = [...repPersonItems]
                      newItems[idx] = { ...newItems[idx], name: e.target.value }
                      handleChange(newItems)
                    }}
                    placeholder="Name"
                    className={baseInputClass}
                  />
                  <input
                    type="text"
                    value={person.contact || ''}
                    onChange={(e) => {
                      const newItems = [...repPersonItems]
                      newItems[idx] = { ...newItems[idx], contact: e.target.value }
                      handleChange(newItems)
                    }}
                    placeholder="Phone/Email"
                    className={baseInputClass}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleChange([...repPersonItems, { name: '', contact: '' }])}
              className="text-sm text-aeria-navy hover:underline"
            >
              + Add {personLabel.toLowerCase()}
            </button>
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'contact_summary':
    case 'control_summary':
    case 'hazard_summary':
      // Summary display fields - show aggregated data from form
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            {localValue ? (
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{localValue}</div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                Summary will be generated based on form responses.
              </p>
            )}
          </div>
          {field.helpText && <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>}
        </div>
      )

    case 'trigger_checklist':
      // Trigger checklist - shows notification triggers
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-800">
              Notification triggers are evaluated based on form responses. Check the Notifications section for any required actions.
            </p>
          </div>
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
function FormSection({ section, formData, onChange, isExpanded, onToggle, activeTriggers, formId }) {
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
                          formId={formId}
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
                    formId={formId}
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
function ActiveFormPanel({ template, onClose, onSave, projects = [], selectedProjectId, onProjectChange }) {
  const [formData, setFormData] = useState({})
  const [expandedSections, setExpandedSections] = useState({ [template.sections[0]?.id]: true })
  const [activeTriggers, setActiveTriggers] = useState([])
  // Generate a unique form ID for file uploads (before the form is saved)
  const [formId] = useState(() => `form_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)

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
        
        {/* Project Link Section */}
        {projects.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Link to Project:
              </label>
              <select
                value={selectedProjectId || ''}
                onChange={(e) => onProjectChange(e.target.value || null)}
                className="flex-1 max-w-xs px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-transparent"
              >
                <option value="">No project (standalone form)</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.projectCode || ''} - {project.name}
                  </option>
                ))}
              </select>
              {selectedProjectId && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Will be linked
                </span>
              )}
            </div>
          </div>
        )}

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
                formId={formId}
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
  const [customForms, setCustomForms] = useState([])
  const [loadingForms, setLoadingForms] = useState(true)
  const [view, setView] = useState('templates') // 'templates' | 'submitted'
  const [showFormBuilder, setShowFormBuilder] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [importedTemplates, setImportedTemplates] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  // Load submitted forms, custom forms, and projects from Firebase on mount
  useEffect(() => {
    async function loadForms() {
      try {
        const [submittedForms, userCustomForms, allProjects] = await Promise.all([
          getForms({ status: 'completed' }),
          user?.uid ? getCustomForms(user.uid) : [],
          getProjects().catch(() => [])
        ])

        setRecentForms(submittedForms.map(f => ({
          id: f.id,
          template: f.templateId,
          templateName: f.templateName,
          status: f.status,
          date: f.createdAt?.toDate?.()?.toISOString() || f.createdAt,
          submittedBy: f.submittedBy || 'Unknown',
          projectId: f.projectId
        })))

        setCustomForms(userCustomForms)
        setProjects(allProjects || [])
      } catch (err) {
        logger.error('Error loading forms:', err)
      } finally {
        setLoadingForms(false)
      }
    }
    loadForms()
  }, [user?.uid])

  // Save custom form
  const handleSaveCustomForm = async (formData) => {
    if (!user?.uid) {
      throw new Error('You must be logged in to create custom forms')
    }

    const saved = await createCustomForm(formData, user.uid)
    setCustomForms([saved, ...customForms])
    logger.debug('Custom form saved:', saved.id)
  }

  // Import template from library
  const handleImportTemplate = async (template) => {
    if (!user?.uid) {
      throw new Error('You must be logged in to import templates')
    }

    // Save as a custom form (editable copy)
    const formData = {
      ...template,
      id: `imported_${template.id}_${Date.now()}`,
      name: template.name,
      shortName: template.shortName,
      description: template.description,
      icon: template.icon || 'FileText',
      isImported: true,
      sourceTemplateId: template.id,
      sections: template.sections
    }

    const saved = await createCustomForm(formData, user.uid)
    setCustomForms([saved, ...customForms])
    setImportedTemplates([...importedTemplates, template.id])
    logger.debug('Template imported:', saved.id)
  }
  
  // Combine built-in templates with custom forms
  const allTemplates = [
    ...Object.values(FORM_TEMPLATES),
    ...customForms.map(cf => ({
      ...cf,
      isCustom: true,
      category: 'custom'
    }))
  ]

  // Filter templates based on search and category
  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = !searchQuery ||
      template.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.shortName?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  const handleStartForm = (templateId) => {
    // Check built-in templates first
    let template = FORM_TEMPLATES[templateId]

    // If not found, check custom forms
    if (!template) {
      template = customForms.find(f => f.id === templateId)
    }

    if (template) {
      setActiveForm(template)
    }
  }
  
  const handleSaveForm = async (formData, projectId = null) => {
    try {
      // Save form to Firebase with optional project link
      const savedForm = await createForm({
        templateId: activeForm.id,
        templateName: activeForm.name,
        data: formData,
        status: 'completed',
        submittedBy: user?.displayName || user?.email || 'Unknown User',
        submittedById: user?.uid,
        projectId: projectId || selectedProjectId  // Link to selected project
      })

      logger.debug('Form saved:', savedForm.id, projectId ? `linked to project ${projectId}` : '')

      // Update local state with new form
      setRecentForms([
        {
          id: savedForm.id,
          template: activeForm.id,
          templateName: activeForm.name,
          status: 'completed',
          date: new Date().toISOString(),
          submittedBy: user?.displayName || user?.email || 'Unknown User',
          projectId: projectId || selectedProjectId
        },
        ...recentForms
      ])

      // Reset selected project after save
      setSelectedProjectId(null)
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

        {/* Custom Forms Section */}
        {customForms.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2 px-3">My Custom Forms</p>
            {customForms.slice(0, 5).map(form => (
              <button
                key={form.id}
                onClick={() => handleStartForm(form.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors text-left"
              >
                <FileText className="w-4 h-4 text-aeria-navy" />
                <span className="text-sm truncate">{form.shortName || form.name}</span>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowTemplateLibrary(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors mb-2"
        >
          <Download className="w-5 h-5" />
          <span className="font-medium">Templates</span>
        </button>

        <button
          onClick={() => setShowFormBuilder(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-aeria-navy bg-aeria-sky hover:bg-aeria-sky/70 transition-colors"
        >
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
          onClose={() => { setActiveForm(null); setSelectedProjectId(null); }}
          onSave={handleSaveForm}
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
      )}

      {/* Custom Form Builder */}
      <FormBuilder
        isOpen={showFormBuilder}
        onClose={() => setShowFormBuilder(false)}
        onSave={handleSaveCustomForm}
      />

      {/* Template Library */}
      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onImport={handleImportTemplate}
        importedTemplates={importedTemplates}
      />
    </div>
  )
}
