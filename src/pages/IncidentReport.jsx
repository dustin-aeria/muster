/**
 * IncidentReport.jsx
 * Report New Incident Form for Aeria Ops Safety Module
 * 
 * Comprehensive incident reporting with:
 * - Incident classification
 * - RPAS-specific incident types
 * - Location and project linking
 * - People and equipment involved
 * - Immediate actions taken
 * - Regulatory notification flagging
 * 
 * @location src/pages/IncidentReport.jsx
 * @action NEW FILE
 */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Save, 
  ArrowLeft, 
  AlertTriangle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Plane,
  Building2,
  Plus,
  Trash2,
  Bell,
  Upload,
  Camera,
  Info,
  CheckCircle2,
  XCircle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { getProjects } from '../lib/firestore'
import { getAircraft } from '../lib/firestore'
import {
  createIncident,
  INCIDENT_TYPES,
  RPAS_INCIDENT_TYPES,
  SEVERITY_LEVELS,
  REGULATORY_TRIGGERS,
  determineRegulatoryNotifications
} from '../lib/firestoreSafety'

// Section component for form organization
function FormSection({ title, description, children, icon: Icon }) {
  return (
    <div className="card">
      <div className="flex items-start gap-3 mb-4">
        {Icon && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <Icon className="w-5 h-5 text-gray-600" />
          </div>
        )}
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// Notification warning component
function NotificationWarning({ notifications }) {
  const requiredNotifications = []
  
  if (notifications.tsbRequired) {
    requiredNotifications.push({
      type: 'TSB',
      label: REGULATORY_TRIGGERS.TSB_IMMEDIATE.label,
      phone: REGULATORY_TRIGGERS.TSB_IMMEDIATE.phone,
      timeframe: REGULATORY_TRIGGERS.TSB_IMMEDIATE.timeframe,
      critical: true
    })
  }
  
  if (notifications.tcRequired) {
    requiredNotifications.push({
      type: 'TC',
      label: REGULATORY_TRIGGERS.TRANSPORT_CANADA.label,
      timeframe: REGULATORY_TRIGGERS.TRANSPORT_CANADA.timeframe,
      critical: false
    })
  }
  
  if (notifications.worksafebcRequired) {
    requiredNotifications.push({
      type: 'WSBC',
      label: REGULATORY_TRIGGERS.WORKSAFEBC.label,
      timeframe: REGULATORY_TRIGGERS.WORKSAFEBC.timeframe,
      critical: true
    })
  }
  
  if (requiredNotifications.length === 0) return null
  
  const hasCritical = requiredNotifications.some(n => n.critical)
  
  return (
    <div className={`p-4 rounded-lg border-2 ${
      hasCritical ? 'bg-red-50 border-red-300' : 'bg-yellow-50 border-yellow-300'
    }`}>
      <div className="flex items-start gap-3">
        <Bell className={`w-6 h-6 flex-shrink-0 ${hasCritical ? 'text-red-600' : 'text-yellow-600'}`} />
        <div className="flex-1">
          <h3 className={`font-bold ${hasCritical ? 'text-red-900' : 'text-yellow-900'}`}>
            Regulatory Notifications Required
          </h3>
          <p className={`text-sm mt-1 ${hasCritical ? 'text-red-700' : 'text-yellow-700'}`}>
            Based on the incident details, the following notifications are required:
          </p>
          <ul className="mt-3 space-y-2">
            {requiredNotifications.map((notif) => (
              <li key={notif.type} className="flex items-start gap-2">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  notif.critical ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                }`}>
                  {notif.type}
                </span>
                <div className="text-sm">
                  <span className={notif.critical ? 'text-red-800' : 'text-yellow-800'}>
                    {notif.label}
                  </span>
                  {notif.phone && (
                    <a href={`tel:${notif.phone}`} className="ml-2 font-bold underline">
                      {notif.phone}
                    </a>
                  )}
                  <span className="text-gray-500 ml-2">({notif.timeframe})</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function IncidentReport() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { userProfile } = useAuth()
  
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState([])
  const [aircraft, setAircraft] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  
  // Form state
  const [formData, setFormData] = useState({
    // Classification
    type: 'near_miss',
    rpasType: '',
    severity: 'near_miss',
    
    // Event Details
    title: '',
    dateOccurred: new Date().toISOString().split('T')[0],
    timeOccurred: '',
    location: '',
    gpsCoordinates: null,
    projectId: searchParams.get('projectId') || '',
    projectName: '',
    aircraftId: '',
    aircraftName: '',
    
    // Description
    description: '',
    immediateActions: '',
    
    // People Involved
    involvedPersons: [],
    
    // Equipment Damage
    equipmentDamage: [],
    
    // Witnesses
    witnesses: [],
    
    // Reporter
    reportedBy: userProfile?.firstName && userProfile?.lastName 
      ? `${userProfile.firstName} ${userProfile.lastName}` 
      : '',
    reportedByEmail: userProfile?.email || '',
  })
  
  // Calculate notifications based on current form data
  const [notifications, setNotifications] = useState({
    tsbRequired: false,
    tcRequired: false,
    worksafebcRequired: false,
  })

  useEffect(() => {
    loadReferenceData()
  }, [])

  useEffect(() => {
    // Update notifications when relevant fields change
    const newNotifications = determineRegulatoryNotifications(formData)
    setNotifications(newNotifications)
  }, [formData.type, formData.rpasType, formData.severity, formData.involvedPersons])

  const loadReferenceData = async () => {
    setLoadingData(true)
    try {
      const [projectsData, aircraftData] = await Promise.all([
        getProjects(),
        getAircraft()
      ])
      setProjects(projectsData)
      setAircraft(aircraftData)
      
      // If projectId was passed, set the project name
      if (searchParams.get('projectId')) {
        const project = projectsData.find(p => p.id === searchParams.get('projectId'))
        if (project) {
          setFormData(prev => ({ ...prev, projectName: project.name }))
        }
      }
    } catch (err) {
      console.error('Error loading reference data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleProjectChange = (projectId) => {
    const project = projects.find(p => p.id === projectId)
    setFormData(prev => ({
      ...prev,
      projectId,
      projectName: project?.name || ''
    }))
  }

  const handleAircraftChange = (aircraftId) => {
    const ac = aircraft.find(a => a.id === aircraftId)
    setFormData(prev => ({
      ...prev,
      aircraftId,
      aircraftName: ac ? `${ac.nickname} (${ac.make} ${ac.model})` : ''
    }))
  }

  // Involved persons management
  const addInvolvedPerson = () => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: [
        ...prev.involvedPersons,
        {
          id: Date.now(),
          name: '',
          role: '',
          injuryType: 'none',
          injuryDescription: '',
          treatmentReceived: '',
          hospitalized: false,
          daysLost: 0
        }
      ]
    }))
  }

  const updateInvolvedPerson = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: prev.involvedPersons.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    }))
  }

  const removeInvolvedPerson = (id) => {
    setFormData(prev => ({
      ...prev,
      involvedPersons: prev.involvedPersons.filter(p => p.id !== id)
    }))
  }

  // Equipment damage management
  const addEquipmentDamage = () => {
    setFormData(prev => ({
      ...prev,
      equipmentDamage: [
        ...prev.equipmentDamage,
        {
          id: Date.now(),
          item: '',
          damageDescription: '',
          estimatedCost: 0,
          repairable: true
        }
      ]
    }))
  }

  const updateEquipmentDamage = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      equipmentDamage: prev.equipmentDamage.map(e =>
        e.id === id ? { ...e, [field]: value } : e
      )
    }))
  }

  const removeEquipmentDamage = (id) => {
    setFormData(prev => ({
      ...prev,
      equipmentDamage: prev.equipmentDamage.filter(e => e.id !== id)
    }))
  }

  // Witness management
  const addWitness = () => {
    setFormData(prev => ({
      ...prev,
      witnesses: [
        ...prev.witnesses,
        {
          id: Date.now(),
          name: '',
          contact: '',
          statement: ''
        }
      ]
    }))
  }

  const updateWitness = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.map(w =>
        w.id === id ? { ...w, [field]: value } : w
      )
    }))
  }

  const removeWitness = (id) => {
    setFormData(prev => ({
      ...prev,
      witnesses: prev.witnesses.filter(w => w.id !== id)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.title.trim()) {
      alert('Please enter an incident title')
      return
    }
    
    if (!formData.description.trim()) {
      alert('Please enter an incident description')
      return
    }
    
    setSaving(true)
    
    try {
      const incident = await createIncident({
        ...formData,
        dateOccurred: new Date(formData.dateOccurred),
        // Clean up the involved persons/equipment/witnesses to remove temp IDs
        involvedPersons: formData.involvedPersons.map(({ id, ...rest }) => rest),
        equipmentDamage: formData.equipmentDamage.map(({ id, ...rest }) => rest),
        witnesses: formData.witnesses.map(({ id, ...rest }) => rest),
      })
      
      // Show success and navigate
      navigate(`/incidents/${incident.id}`, { 
        state: { message: 'Incident reported successfully' } 
      })
    } catch (err) {
      console.error('Error creating incident:', err)
      alert('Failed to report incident. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const isRpasIncident = formData.type === 'aircraft' || !!formData.rpasType

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Incident</h1>
          <p className="text-gray-600 mt-1">Document a safety incident or near miss</p>
        </div>
      </div>

      {/* Notification Warnings */}
      {(notifications.tsbRequired || notifications.tcRequired || notifications.worksafebcRequired) && (
        <NotificationWarning notifications={notifications} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Classification */}
        <FormSection 
          title="Classification" 
          description="Categorize the incident type and severity"
          icon={AlertTriangle}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="input"
                required
              >
                {Object.entries(INCIDENT_TYPES).map(([key, type]) => (
                  <option key={key} value={key}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                className="input"
                required
              >
                {Object.entries(SEVERITY_LEVELS).map(([key, level]) => (
                  <option key={key} value={key}>{level.label}</option>
                ))}
              </select>
            </div>
            
            {/* RPAS-specific incident type */}
            {(formData.type === 'aircraft' || isRpasIncident) && (
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RPAS Incident Type
                </label>
                <select
                  value={formData.rpasType}
                  onChange={(e) => handleChange('rpasType', e.target.value)}
                  className="input"
                >
                  <option value="">Select RPAS incident type...</option>
                  {Object.entries(RPAS_INCIDENT_TYPES).map(([key, type]) => (
                    <option key={key} value={key}>
                      {type.label}
                      {type.notifyTC && ' (TC)'}
                      {type.notifyTSB && ' (TSB)'}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  TC = Transport Canada notification, TSB = Transportation Safety Board notification
                </p>
              </div>
            )}
          </div>
        </FormSection>

        {/* Event Details */}
        <FormSection 
          title="Event Details" 
          description="When and where did the incident occur?"
          icon={Calendar}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Incident Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="input"
                placeholder="Brief description of the incident"
                required
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Occurred *
                </label>
                <input
                  type="date"
                  value={formData.dateOccurred}
                  onChange={(e) => handleChange('dateOccurred', e.target.value)}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Occurred
                </label>
                <input
                  type="time"
                  value={formData.timeOccurred}
                  onChange={(e) => handleChange('timeOccurred', e.target.value)}
                  className="input"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                className="input"
                placeholder="Site name, address, or GPS coordinates"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Related Project
                </label>
                <select
                  value={formData.projectId}
                  onChange={(e) => handleProjectChange(e.target.value)}
                  className="input"
                >
                  <option value="">No project linked</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name} {project.projectCode && `(${project.projectCode})`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aircraft Involved
                </label>
                <select
                  value={formData.aircraftId}
                  onChange={(e) => handleAircraftChange(e.target.value)}
                  className="input"
                >
                  <option value="">No aircraft involved</option>
                  {aircraft.map(ac => (
                    <option key={ac.id} value={ac.id}>
                      {ac.nickname} ({ac.make} {ac.model})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </FormSection>

        {/* Description */}
        <FormSection 
          title="Description" 
          description="Provide details about what happened"
          icon={Info}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description of Incident *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="input"
                rows={5}
                placeholder="Describe what happened, including events leading up to and during the incident..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Immediate Actions Taken
              </label>
              <textarea
                value={formData.immediateActions}
                onChange={(e) => handleChange('immediateActions', e.target.value)}
                className="input"
                rows={3}
                placeholder="What actions were taken immediately after the incident?"
              />
            </div>
          </div>
        </FormSection>

        {/* People Involved */}
        <FormSection 
          title="People Involved" 
          description="Document any injuries or personnel involved"
          icon={User}
        >
          {formData.involvedPersons.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 mb-3">No people documented yet</p>
              <button
                type="button"
                onClick={addInvolvedPerson}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Person
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.involvedPersons.map((person, index) => (
                <div key={person.id} className="p-4 bg-gray-50 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeInvolvedPerson(person.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h4 className="font-medium text-gray-700 mb-3">Person {index + 1}</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updateInvolvedPerson(person.id, 'name', e.target.value)}
                        className="input"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Role</label>
                      <input
                        type="text"
                        value={person.role}
                        onChange={(e) => updateInvolvedPerson(person.id, 'role', e.target.value)}
                        className="input"
                        placeholder="e.g., Pilot, Ground Crew"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Injury Type</label>
                      <select
                        value={person.injuryType}
                        onChange={(e) => updateInvolvedPerson(person.id, 'injuryType', e.target.value)}
                        className="input"
                      >
                        <option value="none">No Injury</option>
                        <option value="first_aid">First Aid</option>
                        <option value="medical_aid">Medical Aid</option>
                        <option value="lost_time">Lost Time</option>
                        <option value="hospitalization">Hospitalization</option>
                        <option value="fatality">Fatality</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Days Lost</label>
                      <input
                        type="number"
                        value={person.daysLost}
                        onChange={(e) => updateInvolvedPerson(person.id, 'daysLost', parseInt(e.target.value) || 0)}
                        className="input"
                        min="0"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Injury Description</label>
                      <input
                        type="text"
                        value={person.injuryDescription}
                        onChange={(e) => updateInvolvedPerson(person.id, 'injuryDescription', e.target.value)}
                        className="input"
                        placeholder="Describe the injury"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Treatment Received</label>
                      <input
                        type="text"
                        value={person.treatmentReceived}
                        onChange={(e) => updateInvolvedPerson(person.id, 'treatmentReceived', e.target.value)}
                        className="input"
                        placeholder="What treatment was provided?"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={person.hospitalized}
                          onChange={(e) => updateInvolvedPerson(person.id, 'hospitalized', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Hospitalized</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addInvolvedPerson}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Person
              </button>
            </div>
          )}
        </FormSection>

        {/* Equipment Damage */}
        <FormSection 
          title="Equipment Damage" 
          description="Document any equipment or property damage"
          icon={Plane}
        >
          {formData.equipmentDamage.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <Plane className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 mb-3">No equipment damage documented</p>
              <button
                type="button"
                onClick={addEquipmentDamage}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Equipment
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.equipmentDamage.map((item, index) => (
                <div key={item.id} className="p-4 bg-gray-50 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeEquipmentDamage(item.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h4 className="font-medium text-gray-700 mb-3">Item {index + 1}</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Equipment/Item</label>
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => updateEquipmentDamage(item.id, 'item', e.target.value)}
                        className="input"
                        placeholder="e.g., DJI Mavic 3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Estimated Cost ($)</label>
                      <input
                        type="number"
                        value={item.estimatedCost}
                        onChange={(e) => updateEquipmentDamage(item.id, 'estimatedCost', parseFloat(e.target.value) || 0)}
                        className="input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Damage Description</label>
                      <input
                        type="text"
                        value={item.damageDescription}
                        onChange={(e) => updateEquipmentDamage(item.id, 'damageDescription', e.target.value)}
                        className="input"
                        placeholder="Describe the damage"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.repairable}
                          onChange={(e) => updateEquipmentDamage(item.id, 'repairable', e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Repairable</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addEquipmentDamage}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Item
              </button>
            </div>
          )}
        </FormSection>

        {/* Witnesses */}
        <FormSection 
          title="Witnesses" 
          description="Document any witnesses to the incident"
          icon={User}
        >
          {formData.witnesses.length === 0 ? (
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 mb-3">No witnesses documented</p>
              <button
                type="button"
                onClick={addWitness}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Witness
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.witnesses.map((witness, index) => (
                <div key={witness.id} className="p-4 bg-gray-50 rounded-lg relative">
                  <button
                    type="button"
                    onClick={() => removeWitness(witness.id)}
                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <h4 className="font-medium text-gray-700 mb-3">Witness {index + 1}</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Name</label>
                      <input
                        type="text"
                        value={witness.name}
                        onChange={(e) => updateWitness(witness.id, 'name', e.target.value)}
                        className="input"
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Contact</label>
                      <input
                        type="text"
                        value={witness.contact}
                        onChange={(e) => updateWitness(witness.id, 'contact', e.target.value)}
                        className="input"
                        placeholder="Phone or email"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Statement</label>
                      <textarea
                        value={witness.statement}
                        onChange={(e) => updateWitness(witness.id, 'statement', e.target.value)}
                        className="input"
                        rows={2}
                        placeholder="Witness statement..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addWitness}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Witness
              </button>
            </div>
          )}
        </FormSection>

        {/* Reporter Info */}
        <FormSection 
          title="Reporter Information" 
          description="Who is reporting this incident?"
          icon={User}
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reported By *
              </label>
              <input
                type="text"
                value={formData.reportedBy}
                onChange={(e) => handleChange('reportedBy', e.target.value)}
                className="input"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.reportedByEmail}
                onChange={(e) => handleChange('reportedByEmail', e.target.value)}
                className="input"
                placeholder="your.email@example.com"
              />
            </div>
          </div>
        </FormSection>

        {/* Final Notification Warning */}
        {(notifications.tsbRequired || notifications.tcRequired || notifications.worksafebcRequired) && (
          <NotificationWarning notifications={notifications} />
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="btn-primary inline-flex items-center gap-2"
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Report Incident
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
