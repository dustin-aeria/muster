import { useState, useEffect } from 'react'
import { 
  ShieldAlert, 
  Plus,
  Trash2,
  Phone,
  MapPin,
  Users,
  Route,
  Stethoscope,
  Flame,
  Plane,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Building,
  Clock,
  Navigation
} from 'lucide-react'

const contactTypes = [
  { value: 'emergency', label: 'Emergency Services', icon: Phone },
  { value: 'fic', label: 'Flight Information Centre', icon: Plane },
  { value: 'hospital', label: 'Hospital', icon: Stethoscope },
  { value: 'client', label: 'Client Contact', icon: Building },
  { value: 'company', label: 'Company Contact', icon: Users },
  { value: 'site', label: 'Site Contact', icon: MapPin },
  { value: 'other', label: 'Other', icon: Phone }
]

const defaultContacts = [
  { type: 'emergency', name: 'Emergency Services', phone: '911', notes: 'Police, Fire, Ambulance' },
  { type: 'fic', name: 'FIC Edmonton', phone: '1-866-541-4102', notes: 'For fly-away reporting, lost link incidents' },
  { type: 'company', name: 'Aeria Solutions', phone: '', notes: 'Company emergency contact' }
]

const procedureTypes = [
  { 
    id: 'medical', 
    label: 'Medical Emergency', 
    icon: Stethoscope,
    defaultSteps: [
      'Cease all flight operations immediately',
      'Ensure scene safety before approaching',
      'Call 911 if serious injury',
      'Administer first aid within training level',
      'Designate someone to meet emergency responders',
      'Do not move injured person unless immediate danger',
      'Document incident details for reporting'
    ]
  },
  { 
    id: 'fire', 
    label: 'Fire Emergency', 
    icon: Flame,
    defaultSteps: [
      'Alert all personnel - evacuate to muster point',
      'Call 911',
      'Only attempt to extinguish small fires if safe and trained',
      'Do not re-enter area until cleared by fire services',
      'Account for all personnel at muster point',
      'Notify client/site contact'
    ]
  },
  { 
    id: 'aircraft_incident', 
    label: 'Aircraft Incident/Crash', 
    icon: Plane,
    defaultSteps: [
      'Note last known position and time',
      'Do not approach if fire/smoke present',
      'Secure the area - prevent unauthorized access',
      'Do not disturb wreckage (potential TSB investigation)',
      'Document scene with photos from safe distance',
      'Report to FIC Edmonton if fly-away',
      'Complete incident report within 24 hours',
      'Notify Transport Canada if required by CARs 901.50'
    ]
  },
  { 
    id: 'weather', 
    label: 'Severe Weather', 
    icon: AlertTriangle,
    defaultSteps: [
      'Monitor weather continuously during operations',
      'Land aircraft immediately if conditions deteriorate',
      'Seek shelter in vehicle or substantial structure',
      'If lightning: avoid high ground, isolated trees, water',
      'Wait 30 minutes after last thunder before resuming',
      'Do not resume operations until conditions improve to minimums'
    ]
  },
  { 
    id: 'wildlife', 
    label: 'Wildlife Encounter', 
    icon: AlertTriangle,
    defaultSteps: [
      'Do not approach or feed wildlife',
      'Make noise to alert animals to your presence',
      'If bear encounter: speak calmly, back away slowly',
      'Do not run - this may trigger chase response',
      'If attack imminent: bear spray if available, fight back for black bear, play dead for grizzly',
      'Report aggressive wildlife to site contact'
    ]
  }
]

export default function ProjectEmergency({ project, onUpdate }) {
  const [expandedSections, setExpandedSections] = useState({
    contacts: true,
    medical: true,
    muster: true,
    procedures: false
  })

  // Initialize emergency plan if not present
  useEffect(() => {
    if (!project.emergencyPlan) {
      const defaultProcedures = {}
      procedureTypes.forEach(p => {
        defaultProcedures[p.id] = {
          enabled: true,
          steps: [...p.defaultSteps],
          customNotes: ''
        }
      })

      onUpdate({
        emergencyPlan: {
          contacts: [...defaultContacts],
          medicalFacility: {
            name: '',
            address: '',
            phone: '',
            distance: '',
            driveTime: '',
            directions: ''
          },
          firstAid: {
            kitLocation: 'In project vehicle',
            aedAvailable: false,
            aedLocation: '',
            designatedAttendant: ''
          },
          musterPoints: [
            { name: 'Primary Muster Point', location: '', description: 'Main gathering point in case of emergency' }
          ],
          evacuationRoutes: [
            { name: 'Primary Route', description: '' }
          ],
          procedures: defaultProcedures,
          siteSpecificHazards: '',
          additionalNotes: ''
        }
      })
    }
  }, [project.emergencyPlan])

  const emergencyPlan = project.emergencyPlan || {}

  const updateEmergencyPlan = (updates) => {
    onUpdate({
      emergencyPlan: {
        ...emergencyPlan,
        ...updates
      }
    })
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  // Contacts management
  const addContact = () => {
    updateEmergencyPlan({
      contacts: [...(emergencyPlan.contacts || []), {
        type: 'other',
        name: '',
        phone: '',
        notes: ''
      }]
    })
  }

  const updateContact = (index, field, value) => {
    const newContacts = [...(emergencyPlan.contacts || [])]
    newContacts[index] = { ...newContacts[index], [field]: value }
    updateEmergencyPlan({ contacts: newContacts })
  }

  const removeContact = (index) => {
    const newContacts = (emergencyPlan.contacts || []).filter((_, i) => i !== index)
    updateEmergencyPlan({ contacts: newContacts })
  }

  // Medical facility
  const updateMedical = (field, value) => {
    updateEmergencyPlan({
      medicalFacility: { ...(emergencyPlan.medicalFacility || {}), [field]: value }
    })
  }

  // First aid
  const updateFirstAid = (field, value) => {
    updateEmergencyPlan({
      firstAid: { ...(emergencyPlan.firstAid || {}), [field]: value }
    })
  }

  // Muster points
  const addMusterPoint = () => {
    updateEmergencyPlan({
      musterPoints: [...(emergencyPlan.musterPoints || []), {
        name: '',
        location: '',
        description: ''
      }]
    })
  }

  const updateMusterPoint = (index, field, value) => {
    const newPoints = [...(emergencyPlan.musterPoints || [])]
    newPoints[index] = { ...newPoints[index], [field]: value }
    updateEmergencyPlan({ musterPoints: newPoints })
  }

  const removeMusterPoint = (index) => {
    const newPoints = (emergencyPlan.musterPoints || []).filter((_, i) => i !== index)
    updateEmergencyPlan({ musterPoints: newPoints })
  }

  // Evacuation routes
  const addEvacRoute = () => {
    updateEmergencyPlan({
      evacuationRoutes: [...(emergencyPlan.evacuationRoutes || []), {
        name: '',
        description: ''
      }]
    })
  }

  const updateEvacRoute = (index, field, value) => {
    const newRoutes = [...(emergencyPlan.evacuationRoutes || [])]
    newRoutes[index] = { ...newRoutes[index], [field]: value }
    updateEmergencyPlan({ evacuationRoutes: newRoutes })
  }

  const removeEvacRoute = (index) => {
    const newRoutes = (emergencyPlan.evacuationRoutes || []).filter((_, i) => i !== index)
    updateEmergencyPlan({ evacuationRoutes: newRoutes })
  }

  // Procedures
  const updateProcedure = (procedureId, field, value) => {
    updateEmergencyPlan({
      procedures: {
        ...(emergencyPlan.procedures || {}),
        [procedureId]: {
          ...(emergencyPlan.procedures?.[procedureId] || {}),
          [field]: value
        }
      }
    })
  }

  const updateProcedureStep = (procedureId, stepIndex, value) => {
    const procedure = emergencyPlan.procedures?.[procedureId] || {}
    const newSteps = [...(procedure.steps || [])]
    newSteps[stepIndex] = value
    updateProcedure(procedureId, 'steps', newSteps)
  }

  const addProcedureStep = (procedureId) => {
    const procedure = emergencyPlan.procedures?.[procedureId] || {}
    updateProcedure(procedureId, 'steps', [...(procedure.steps || []), ''])
  }

  const removeProcedureStep = (procedureId, stepIndex) => {
    const procedure = emergencyPlan.procedures?.[procedureId] || {}
    const newSteps = (procedure.steps || []).filter((_, i) => i !== stepIndex)
    updateProcedure(procedureId, 'steps', newSteps)
  }

  return (
    <div className="space-y-6">
      {/* Emergency Contacts */}
      <div className="card">
        <button
          onClick={() => toggleSection('contacts')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-aeria-blue" />
            Emergency Contacts
          </h2>
          {expandedSections.contacts ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.contacts && (
          <div className="mt-4 space-y-3">
            {(emergencyPlan.contacts || []).map((contact, index) => {
              const contactType = contactTypes.find(t => t.value === contact.type) || contactTypes[6]
              const ContactIcon = contactType.icon

              return (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="p-2 bg-white rounded-lg border border-gray-200">
                    <ContactIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 grid sm:grid-cols-4 gap-2">
                    <select
                      value={contact.type}
                      onChange={(e) => updateContact(index, 'type', e.target.value)}
                      className="input text-sm"
                    >
                      {contactTypes.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, 'name', e.target.value)}
                      className="input text-sm"
                      placeholder="Name"
                    />
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      className="input text-sm font-mono"
                      placeholder="Phone"
                    />
                    <input
                      type="text"
                      value={contact.notes}
                      onChange={(e) => updateContact(index, 'notes', e.target.value)}
                      className="input text-sm"
                      placeholder="Notes"
                    />
                  </div>
                  <button
                    onClick={() => removeContact(index)}
                    className="p-1.5 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })}

            <button
              onClick={addContact}
              className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Contact
            </button>
          </div>
        )}
      </div>

      {/* Medical Facility & First Aid */}
      <div className="card">
        <button
          onClick={() => toggleSection('medical')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-aeria-blue" />
            Medical Facility & First Aid
          </h2>
          {expandedSections.medical ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.medical && (
          <div className="mt-4 space-y-6">
            {/* Nearest Hospital */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-gray-500" />
                Nearest Medical Facility
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Facility Name</label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.name || ''}
                    onChange={(e) => updateMedical('name', e.target.value)}
                    className="input"
                    placeholder="e.g., Squamish General Hospital"
                  />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input
                    type="tel"
                    value={emergencyPlan.medicalFacility?.phone || ''}
                    onChange={(e) => updateMedical('phone', e.target.value)}
                    className="input font-mono"
                    placeholder="(555) 555-5555"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.address || ''}
                    onChange={(e) => updateMedical('address', e.target.value)}
                    className="input"
                    placeholder="Full address"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <Navigation className="w-4 h-4" />
                    Distance
                  </label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.distance || ''}
                    onChange={(e) => updateMedical('distance', e.target.value)}
                    className="input"
                    placeholder="e.g., 25 km"
                  />
                </div>
                <div>
                  <label className="label flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Drive Time
                  </label>
                  <input
                    type="text"
                    value={emergencyPlan.medicalFacility?.driveTime || ''}
                    onChange={(e) => updateMedical('driveTime', e.target.value)}
                    className="input"
                    placeholder="e.g., 30 minutes"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Directions</label>
                  <textarea
                    value={emergencyPlan.medicalFacility?.directions || ''}
                    onChange={(e) => updateMedical('directions', e.target.value)}
                    className="input min-h-[60px]"
                    placeholder="Driving directions from site to hospital..."
                  />
                </div>
              </div>
            </div>

            {/* First Aid */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-gray-500" />
                First Aid Equipment
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Aid Kit Location</label>
                  <input
                    type="text"
                    value={emergencyPlan.firstAid?.kitLocation || ''}
                    onChange={(e) => updateFirstAid('kitLocation', e.target.value)}
                    className="input"
                    placeholder="e.g., In project vehicle, rear compartment"
                  />
                </div>
                <div>
                  <label className="label">Designated First Aid Attendant</label>
                  <input
                    type="text"
                    value={emergencyPlan.firstAid?.designatedAttendant || ''}
                    onChange={(e) => updateFirstAid('designatedAttendant', e.target.value)}
                    className="input"
                    placeholder="Name of qualified attendant"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emergencyPlan.firstAid?.aedAvailable || false}
                      onChange={(e) => updateFirstAid('aedAvailable', e.target.checked)}
                      className="w-4 h-4 text-aeria-navy rounded"
                    />
                    <span className="text-sm text-gray-700">AED Available On Site</span>
                  </label>
                </div>
                {emergencyPlan.firstAid?.aedAvailable && (
                  <div>
                    <label className="label">AED Location</label>
                    <input
                      type="text"
                      value={emergencyPlan.firstAid?.aedLocation || ''}
                      onChange={(e) => updateFirstAid('aedLocation', e.target.value)}
                      className="input"
                      placeholder="Where is the AED located?"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Muster Points & Evacuation */}
      <div className="card">
        <button
          onClick={() => toggleSection('muster')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Muster Points & Evacuation
          </h2>
          {expandedSections.muster ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.muster && (
          <div className="mt-4 space-y-6">
            {/* Muster Points */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  Muster Points
                </h3>
                <button
                  onClick={addMusterPoint}
                  className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {(emergencyPlan.musterPoints || []).map((point, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <input
                        type="text"
                        value={point.name}
                        onChange={(e) => updateMusterPoint(index, 'name', e.target.value)}
                        className="input text-sm font-medium flex-1"
                        placeholder="Point name (e.g., Primary Muster Point)"
                      />
                      <button
                        onClick={() => removeMusterPoint(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={point.location}
                        onChange={(e) => updateMusterPoint(index, 'location', e.target.value)}
                        className="input text-sm"
                        placeholder="Coordinates or location reference"
                      />
                      <input
                        type="text"
                        value={point.description}
                        onChange={(e) => updateMusterPoint(index, 'description', e.target.value)}
                        className="input text-sm"
                        placeholder="Description / landmarks"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evacuation Routes */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Route className="w-4 h-4 text-gray-500" />
                  Evacuation Routes
                </h3>
                <button
                  onClick={addEvacRoute}
                  className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

              <div className="space-y-3">
                {(emergencyPlan.evacuationRoutes || []).map((route, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={route.name}
                          onChange={(e) => updateEvacRoute(index, 'name', e.target.value)}
                          className="input text-sm font-medium"
                          placeholder="Route name (e.g., Primary Route)"
                        />
                        <textarea
                          value={route.description}
                          onChange={(e) => updateEvacRoute(index, 'description', e.target.value)}
                          className="input text-sm min-h-[60px]"
                          placeholder="Describe the evacuation route..."
                        />
                      </div>
                      <button
                        onClick={() => removeEvacRoute(index)}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Procedures */}
      <div className="card">
        <button
          onClick={() => toggleSection('procedures')}
          className="flex items-center justify-between w-full text-left"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-aeria-blue" />
            Emergency Procedures
          </h2>
          {expandedSections.procedures ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </button>

        {expandedSections.procedures && (
          <div className="mt-4 space-y-4">
            {procedureTypes.map((procType) => {
              const procedure = emergencyPlan.procedures?.[procType.id] || { enabled: true, steps: procType.defaultSteps }
              const ProcIcon = procType.icon

              return (
                <div key={procType.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between p-3 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <ProcIcon className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-gray-900">{procType.label}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-500">Include</span>
                      <input
                        type="checkbox"
                        checked={procedure.enabled !== false}
                        onChange={(e) => updateProcedure(procType.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 text-aeria-navy rounded"
                      />
                    </label>
                  </div>

                  {procedure.enabled !== false && (
                    <div className="p-3 space-y-2">
                      <ol className="space-y-2">
                        {(procedure.steps || []).map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                              {stepIndex + 1}
                            </span>
                            <input
                              type="text"
                              value={step}
                              onChange={(e) => updateProcedureStep(procType.id, stepIndex, e.target.value)}
                              className="input text-sm flex-1"
                            />
                            <button
                              onClick={() => removeProcedureStep(procType.id, stepIndex)}
                              className="p-1 text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </li>
                        ))}
                      </ol>
                      <button
                        onClick={() => addProcedureStep(procType.id)}
                        className="text-xs text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1 mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Step
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Site-Specific Hazards */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-aeria-blue" />
          Site-Specific Hazards
        </h2>
        <textarea
          value={emergencyPlan.siteSpecificHazards || ''}
          onChange={(e) => updateEmergencyPlan({ siteSpecificHazards: e.target.value })}
          className="input min-h-[100px]"
          placeholder="Document any site-specific hazards that require special emergency considerations (e.g., industrial hazards, remote location challenges, environmental factors)..."
        />
      </div>

      {/* Additional Notes */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
          <ShieldAlert className="w-5 h-5 text-aeria-blue" />
          Additional Emergency Notes
        </h2>
        <textarea
          value={emergencyPlan.additionalNotes || ''}
          onChange={(e) => updateEmergencyPlan({ additionalNotes: e.target.value })}
          className="input min-h-[100px]"
          placeholder="Any additional emergency planning notes, special instructions, or client requirements..."
        />
      </div>
    </div>
  )
}
