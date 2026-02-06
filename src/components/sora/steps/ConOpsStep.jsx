/**
 * ConOpsStep.jsx
 * Step 1: Concept of Operations
 *
 * Collects operation description, UAS details, environment, crew, and procedures
 * Per JARUS SORA 2.5 Annex A - ConOps Template
 *
 * @location src/components/sora/steps/ConOpsStep.jsx
 */

import { useState, useEffect } from 'react'
import {
  FileText,
  Plane,
  MapPin,
  Users,
  ClipboardList,
  Cloud,
  Save,
  CheckCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { updateConOps, CONOPS_SECTIONS } from '../../../lib/firestoreSora'

const SECTION_ICONS = {
  operation_description: FileText,
  uas_description: Plane,
  operating_environment: MapPin,
  crew_composition: Users,
  operational_procedures: ClipboardList,
  weather_limitations: Cloud
}

export default function ConOpsStep({ assessment }) {
  const [saving, setSaving] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    operation_description: true,
    uas_description: true,
    operating_environment: false,
    crew_composition: false,
    operational_procedures: false,
    weather_limitations: false
  })

  // Form data
  const [formData, setFormData] = useState({
    operationDescription: {
      purpose: '',
      objectives: '',
      scope: '',
      duration: ''
    },
    uasDescription: {
      manufacturer: '',
      model: '',
      mtow: '',
      maxDimension: '',
      maxSpeed: '',
      propulsion: '',
      endurance: ''
    },
    operatingEnvironment: {
      airspaceClass: '',
      maxAltitudeAGL: '',
      operationalVolume: '',
      groundEnvironment: ''
    },
    crewComposition: {
      remotePilot: '',
      visualObservers: 0,
      payloadOperator: false,
      flightDirector: false
    },
    operationalProcedures: {
      normalOps: '',
      contingencyProcedures: '',
      emergencyProcedures: ''
    },
    weatherLimitations: {
      maxWindSpeed: '',
      minVisibility: '',
      temperatureRange: '',
      precipitationLimits: ''
    }
  })

  // Initialize from assessment data
  useEffect(() => {
    if (assessment?.conops) {
      setFormData({
        operationDescription: {
          purpose: assessment.conops.operationDescription?.purpose || '',
          objectives: assessment.conops.operationDescription?.objectives || '',
          scope: assessment.conops.operationDescription?.scope || '',
          duration: assessment.conops.operationDescription?.duration || ''
        },
        uasDescription: {
          manufacturer: assessment.conops.uasDescription?.manufacturer || '',
          model: assessment.conops.uasDescription?.model || '',
          mtow: assessment.conops.uasDescription?.mtow || '',
          maxDimension: assessment.conops.uasDescription?.maxDimension || '',
          maxSpeed: assessment.conops.uasDescription?.maxSpeed || '',
          propulsion: assessment.conops.uasDescription?.propulsion || '',
          endurance: assessment.conops.uasDescription?.endurance || ''
        },
        operatingEnvironment: {
          airspaceClass: assessment.conops.operatingEnvironment?.airspaceClass || '',
          maxAltitudeAGL: assessment.conops.operatingEnvironment?.maxAltitudeAGL || '',
          operationalVolume: assessment.conops.operatingEnvironment?.operationalVolume || '',
          groundEnvironment: assessment.conops.operatingEnvironment?.groundEnvironment || ''
        },
        crewComposition: {
          remotePilot: assessment.conops.crewComposition?.remotePilot || '',
          visualObservers: assessment.conops.crewComposition?.visualObservers || 0,
          payloadOperator: assessment.conops.crewComposition?.payloadOperator || false,
          flightDirector: assessment.conops.crewComposition?.flightDirector || false
        },
        operationalProcedures: {
          normalOps: assessment.conops.operationalProcedures?.normalOps || '',
          contingencyProcedures: assessment.conops.operationalProcedures?.contingencyProcedures || '',
          emergencyProcedures: assessment.conops.operationalProcedures?.emergencyProcedures || ''
        },
        weatherLimitations: {
          maxWindSpeed: assessment.conops.weatherLimitations?.maxWindSpeed || '',
          minVisibility: assessment.conops.weatherLimitations?.minVisibility || '',
          temperatureRange: assessment.conops.weatherLimitations?.temperatureRange || '',
          precipitationLimits: assessment.conops.weatherLimitations?.precipitationLimits || ''
        }
      })
    }
  }, [assessment])

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateConOps(assessment.id, formData)
    } catch (err) {
      console.error('Error saving ConOps:', err)
    } finally {
      setSaving(false)
    }
  }

  // Check section completion
  const isSectionComplete = (sectionId) => {
    switch (sectionId) {
      case 'operation_description':
        return Boolean(formData.operationDescription.purpose)
      case 'uas_description':
        return Boolean(formData.uasDescription.mtow && formData.uasDescription.maxDimension)
      case 'operating_environment':
        return Boolean(formData.operatingEnvironment.maxAltitudeAGL)
      case 'crew_composition':
        return Boolean(formData.crewComposition.remotePilot)
      case 'operational_procedures':
        return Boolean(formData.operationalProcedures.normalOps)
      case 'weather_limitations':
        return Boolean(formData.weatherLimitations.maxWindSpeed)
      default:
        return false
    }
  }

  return (
    <div className="divide-y divide-gray-200">
      {/* Header */}
      <div className="p-4 bg-blue-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Step 1: Concept of Operations</h3>
              <p className="text-sm text-gray-600">Define your operation per JARUS SORA 2.5 Annex A</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Progress
          </button>
        </div>
      </div>

      {/* Operation Description */}
      <div>
        <button
          onClick={() => toggleSection('operation_description')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSectionComplete('operation_description') ? 'bg-green-100' : 'bg-gray-100'}`}>
              <FileText className={`w-5 h-5 ${isSectionComplete('operation_description') ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Operation Description</p>
              <p className="text-sm text-gray-500">Purpose, objectives, and scope</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSectionComplete('operation_description') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {expandedSections.operation_description ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.operation_description && (
          <div className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Operation <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.operationDescription.purpose}
                onChange={(e) => updateField('operationDescription', 'purpose', e.target.value)}
                placeholder="Describe the purpose of this drone operation..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Objectives</label>
              <textarea
                value={formData.operationDescription.objectives}
                onChange={(e) => updateField('operationDescription', 'objectives', e.target.value)}
                placeholder="What are the specific objectives?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scope</label>
                <input
                  type="text"
                  value={formData.operationDescription.scope}
                  onChange={(e) => updateField('operationDescription', 'scope', e.target.value)}
                  placeholder="e.g., Provincial, National"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={formData.operationDescription.duration}
                  onChange={(e) => updateField('operationDescription', 'duration', e.target.value)}
                  placeholder="e.g., 12 months"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* UAS Description */}
      <div>
        <button
          onClick={() => toggleSection('uas_description')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSectionComplete('uas_description') ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Plane className={`w-5 h-5 ${isSectionComplete('uas_description') ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">UAS Description</p>
              <p className="text-sm text-gray-500">Aircraft characteristics for GRC determination</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSectionComplete('uas_description') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {expandedSections.uas_description ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.uas_description && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                <input
                  type="text"
                  value={formData.uasDescription.manufacturer}
                  onChange={(e) => updateField('uasDescription', 'manufacturer', e.target.value)}
                  placeholder="e.g., DJI, Freefly"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                <input
                  type="text"
                  value={formData.uasDescription.model}
                  onChange={(e) => updateField('uasDescription', 'model', e.target.value)}
                  placeholder="e.g., Matrice 350 RTK"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MTOW (kg) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.uasDescription.mtow}
                  onChange={(e) => updateField('uasDescription', 'mtow', parseFloat(e.target.value) || '')}
                  placeholder="e.g., 400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Dimension (m) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.uasDescription.maxDimension}
                  onChange={(e) => updateField('uasDescription', 'maxDimension', parseFloat(e.target.value) || '')}
                  placeholder="e.g., 3.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Largest dimension (wingspan/rotor span)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Speed (m/s) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.uasDescription.maxSpeed}
                  onChange={(e) => updateField('uasDescription', 'maxSpeed', parseFloat(e.target.value) || '')}
                  placeholder="e.g., 35"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Propulsion</label>
                <select
                  value={formData.uasDescription.propulsion}
                  onChange={(e) => updateField('uasDescription', 'propulsion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select propulsion type</option>
                  <option value="electric_multirotor">Electric Multirotor</option>
                  <option value="electric_fixed_wing">Electric Fixed Wing</option>
                  <option value="gas_turbine">Gas Turbine</option>
                  <option value="internal_combustion">Internal Combustion</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Endurance</label>
                <input
                  type="text"
                  value={formData.uasDescription.endurance}
                  onChange={(e) => updateField('uasDescription', 'endurance', e.target.value)}
                  placeholder="e.g., 45 minutes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* UA Characteristic Auto-Detection */}
            {formData.uasDescription.maxDimension && formData.uasDescription.maxSpeed && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Auto-detected UA Characteristic:</strong>{' '}
                  {formData.uasDescription.maxDimension <= 1 && formData.uasDescription.maxSpeed <= 25 && '≤1m / ≤25 m/s'}
                  {formData.uasDescription.maxDimension > 1 && formData.uasDescription.maxDimension <= 3 && formData.uasDescription.maxSpeed <= 35 && '≤3m / ≤35 m/s'}
                  {formData.uasDescription.maxDimension > 3 && formData.uasDescription.maxDimension <= 8 && formData.uasDescription.maxSpeed <= 75 && '≤8m / ≤75 m/s'}
                  {formData.uasDescription.maxDimension > 8 && formData.uasDescription.maxDimension <= 20 && formData.uasDescription.maxSpeed <= 120 && '≤20m / ≤120 m/s'}
                  {formData.uasDescription.maxDimension > 20 && formData.uasDescription.maxDimension <= 40 && formData.uasDescription.maxSpeed <= 200 && '≤40m / ≤200 m/s'}
                  {formData.uasDescription.maxDimension > 40 && 'Outside SORA scope (>40m dimension)'}
                  {' '}(per SORA Table 2)
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Operating Environment */}
      <div>
        <button
          onClick={() => toggleSection('operating_environment')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSectionComplete('operating_environment') ? 'bg-green-100' : 'bg-gray-100'}`}>
              <MapPin className={`w-5 h-5 ${isSectionComplete('operating_environment') ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Operating Environment</p>
              <p className="text-sm text-gray-500">Airspace and ground environment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSectionComplete('operating_environment') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {expandedSections.operating_environment ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.operating_environment && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Airspace Class</label>
                <select
                  value={formData.operatingEnvironment.airspaceClass}
                  onChange={(e) => updateField('operatingEnvironment', 'airspaceClass', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select airspace</option>
                  <option value="G">Class G (Uncontrolled)</option>
                  <option value="E">Class E (Controlled)</option>
                  <option value="D">Class D (Controlled)</option>
                  <option value="C">Class C (Controlled)</option>
                  <option value="B">Class B (Controlled)</option>
                  <option value="A">Class A (Controlled)</option>
                  <option value="restricted">Restricted/Prohibited</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Altitude AGL (ft) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.operatingEnvironment.maxAltitudeAGL}
                  onChange={(e) => updateField('operatingEnvironment', 'maxAltitudeAGL', parseInt(e.target.value) || '')}
                  placeholder="e.g., 400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operational Volume</label>
              <textarea
                value={formData.operatingEnvironment.operationalVolume}
                onChange={(e) => updateField('operatingEnvironment', 'operationalVolume', e.target.value)}
                placeholder="Describe the operational volume (geographic area, altitude range)..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ground Environment</label>
              <textarea
                value={formData.operatingEnvironment.groundEnvironment}
                onChange={(e) => updateField('operatingEnvironment', 'groundEnvironment', e.target.value)}
                placeholder="Describe ground environment (terrain, obstacles, population)..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Crew Composition */}
      <div>
        <button
          onClick={() => toggleSection('crew_composition')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSectionComplete('crew_composition') ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Users className={`w-5 h-5 ${isSectionComplete('crew_composition') ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Crew Composition</p>
              <p className="text-sm text-gray-500">Remote crew roles and responsibilities</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSectionComplete('crew_composition') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {expandedSections.crew_composition ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.crew_composition && (
          <div className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Remote Pilot Qualifications <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.crewComposition.remotePilot}
                onChange={(e) => updateField('crewComposition', 'remotePilot', e.target.value)}
                placeholder="e.g., Advanced Operations Certificate, type rating"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visual Observers</label>
              <input
                type="number"
                min="0"
                value={formData.crewComposition.visualObservers}
                onChange={(e) => updateField('crewComposition', 'visualObservers', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.crewComposition.payloadOperator}
                  onChange={(e) => updateField('crewComposition', 'payloadOperator', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Payload Operator Required</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.crewComposition.flightDirector}
                  onChange={(e) => updateField('crewComposition', 'flightDirector', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Flight Director Required</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Operational Procedures */}
      <div>
        <button
          onClick={() => toggleSection('operational_procedures')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSectionComplete('operational_procedures') ? 'bg-green-100' : 'bg-gray-100'}`}>
              <ClipboardList className={`w-5 h-5 ${isSectionComplete('operational_procedures') ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Operational Procedures</p>
              <p className="text-sm text-gray-500">Normal, contingency, and emergency procedures</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSectionComplete('operational_procedures') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {expandedSections.operational_procedures ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.operational_procedures && (
          <div className="px-4 pb-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Normal Operating Procedures <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.operationalProcedures.normalOps}
                onChange={(e) => updateField('operationalProcedures', 'normalOps', e.target.value)}
                placeholder="Describe standard operating procedures..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contingency Procedures</label>
              <textarea
                value={formData.operationalProcedures.contingencyProcedures}
                onChange={(e) => updateField('operationalProcedures', 'contingencyProcedures', e.target.value)}
                placeholder="Describe procedures for abnormal situations..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Procedures</label>
              <textarea
                value={formData.operationalProcedures.emergencyProcedures}
                onChange={(e) => updateField('operationalProcedures', 'emergencyProcedures', e.target.value)}
                placeholder="Describe emergency response procedures..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Weather Limitations */}
      <div>
        <button
          onClick={() => toggleSection('weather_limitations')}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSectionComplete('weather_limitations') ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Cloud className={`w-5 h-5 ${isSectionComplete('weather_limitations') ? 'text-green-600' : 'text-gray-600'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Weather Limitations</p>
              <p className="text-sm text-gray-500">Environmental operating limits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSectionComplete('weather_limitations') && <CheckCircle className="w-5 h-5 text-green-500" />}
            {expandedSections.weather_limitations ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
          </div>
        </button>
        {expandedSections.weather_limitations && (
          <div className="px-4 pb-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Wind Speed (km/h) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.weatherLimitations.maxWindSpeed}
                  onChange={(e) => updateField('weatherLimitations', 'maxWindSpeed', parseInt(e.target.value) || '')}
                  placeholder="e.g., 45"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Visibility (m)</label>
                <input
                  type="number"
                  value={formData.weatherLimitations.minVisibility}
                  onChange={(e) => updateField('weatherLimitations', 'minVisibility', parseInt(e.target.value) || '')}
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temperature Range</label>
                <input
                  type="text"
                  value={formData.weatherLimitations.temperatureRange}
                  onChange={(e) => updateField('weatherLimitations', 'temperatureRange', e.target.value)}
                  placeholder="e.g., -10°C to +40°C"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precipitation Limits</label>
                <input
                  type="text"
                  value={formData.weatherLimitations.precipitationLimits}
                  onChange={(e) => updateField('weatherLimitations', 'precipitationLimits', e.target.value)}
                  placeholder="e.g., No rain, light snow OK"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button Footer */}
      <div className="p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {assessment?.conops?.isComplete ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> ConOps complete - proceed to Ground Risk
              </span>
            ) : (
              'Complete required fields to proceed'
            )}
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}
