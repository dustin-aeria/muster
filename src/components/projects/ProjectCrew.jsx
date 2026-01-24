import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { getOperators } from '../../lib/firestore'
import { 
  Plus, 
  Users, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  ChevronDown,
  Award,
  Phone,
  User
} from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { logger } from '../../lib/logger'

const roleOptions = [
  { value: 'PIC', label: 'Pilot in Command', description: 'Primary flight operations authority' },
  { value: 'VO', label: 'Visual Observer', description: 'Maintains visual contact with aircraft' },
  { value: 'Safety Lead', label: 'Safety Lead', description: 'Oversees HSE compliance' },
  { value: 'Project Lead', label: 'Project Lead', description: 'Overall project coordination' },
  { value: 'First Aid', label: 'First Aid Attendant', description: 'Designated first aid responder' },
  { value: 'Ground Support', label: 'Ground Support', description: 'Equipment and logistics' },
  { value: 'Other', label: 'Other', description: 'Custom role' }
]

const roleColors = {
  PIC: 'bg-blue-100 text-blue-700 border-blue-200',
  VO: 'bg-green-100 text-green-700 border-green-200',
  'Safety Lead': 'bg-orange-100 text-orange-700 border-orange-200',
  'Project Lead': 'bg-purple-100 text-purple-700 border-purple-200',
  'First Aid': 'bg-red-100 text-red-700 border-red-200',
  'Ground Support': 'bg-gray-100 text-gray-700 border-gray-200',
  'Other': 'bg-gray-100 text-gray-700 border-gray-200'
}

export default function ProjectCrew({ project, onUpdate }) {
  const [operators, setOperators] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedOperator, setSelectedOperator] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [customRole, setCustomRole] = useState('')

  useEffect(() => {
    loadOperators()
  }, [])

  const loadOperators = async () => {
    try {
      const data = await getOperators()
      setOperators(data.filter(op => op.status === 'active'))
    } catch (err) {
      logger.error('Error loading operators:', err)
    } finally {
      setLoading(false)
    }
  }

  const getOperatorById = (id) => {
    return operators.find(op => op.id === id)
  }

  const addCrewMember = () => {
    if (!selectedOperator || !selectedRole) return
    
    const role = selectedRole === 'Other' ? customRole : selectedRole
    if (!role) return

    const operator = getOperatorById(selectedOperator)
    if (!operator) return

    const newCrewMember = {
      operatorId: selectedOperator,
      operatorName: `${operator.firstName} ${operator.lastName}`,
      role: role,
      isPrimary: !project.crew?.some(c => c.role === role)
    }

    onUpdate({
      crew: [...(project.crew || []), newCrewMember]
    })

    // Reset form
    setSelectedOperator('')
    setSelectedRole('')
    setCustomRole('')
    setShowAddForm(false)
  }

  const removeCrewMember = (index) => {
    const newCrew = [...(project.crew || [])]
    newCrew.splice(index, 1)
    onUpdate({ crew: newCrew })
  }

  const togglePrimary = (index) => {
    const member = project.crew[index]
    const newCrew = project.crew.map((c, i) => {
      if (c.role === member.role) {
        return { ...c, isPrimary: i === index }
      }
      return c
    })
    onUpdate({ crew: newCrew })
  }

  // Get certification status for an operator
  const getCertStatus = (operator) => {
    if (!operator?.certifications?.length) return null
    
    let hasExpired = false
    let hasExpiring = false
    
    operator.certifications.forEach(cert => {
      if (!cert.expiryDate) return
      const daysUntilExpiry = differenceInDays(new Date(cert.expiryDate), new Date())
      if (daysUntilExpiry < 0) hasExpired = true
      else if (daysUntilExpiry <= 90) hasExpiring = true
    })
    
    if (hasExpired) return { status: 'expired', color: 'text-red-500', icon: XCircle }
    if (hasExpiring) return { status: 'expiring', color: 'text-amber-500', icon: AlertTriangle }
    return { status: 'valid', color: 'text-green-500', icon: CheckCircle2 }
  }

  // Get operators not yet assigned
  const availableOperators = operators.filter(op => 
    !project.crew?.some(c => c.operatorId === op.id)
  )

  // Check for required roles
  const hasPIC = project.crew?.some(c => c.role === 'PIC')
  const hasFirstAid = project.crew?.some(c => c.role === 'First Aid')
  const flightPlanEnabled = project.sections?.flightPlan !== false // Default to true

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {flightPlanEnabled && !hasPIC && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-amber-800">PIC Required</p>
            <p className="text-sm text-amber-700">Flight Plan is enabled. At least one Pilot in Command must be assigned.</p>
          </div>
        </div>
      )}
      
      {!hasFirstAid && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-800">First Aid Attendant Recommended</p>
            <p className="text-sm text-blue-700">Consider assigning a designated First Aid attendant for field operations.</p>
          </div>
        </div>
      )}

      {/* Crew List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-aeria-blue" />
            Crew Members
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary text-sm inline-flex items-center gap-1"
            disabled={availableOperators.length === 0}
          >
            <Plus className="w-4 h-4" />
            Add Crew
          </button>
        </div>

        {project.crew?.length === 0 || !project.crew ? (
          <div className="text-center py-8">
            <Users className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500">No crew members assigned yet.</p>
            {availableOperators.length > 0 ? (
              <button
                onClick={() => setShowAddForm(true)}
                className="text-sm text-aeria-blue hover:underline mt-2"
              >
                Add your first crew member
              </button>
            ) : (
              <p className="text-sm text-gray-400 mt-2">
                <Link to="/operators" className="text-aeria-blue hover:underline">Add operators</Link> first to assign them to projects.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {project.crew.map((member, index) => {
              const operator = getOperatorById(member.operatorId)
              const certStatus = getCertStatus(operator)
              const CertIcon = certStatus?.icon
              
              return (
                <div 
                  key={index}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-aeria-blue rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">
                      {operator ? `${operator.firstName?.[0]}${operator.lastName?.[0]}` : '??'}
                    </span>
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {member.operatorName}
                      </span>
                      {certStatus && (
                        <CertIcon className={`w-4 h-4 ${certStatus.color}`} title={`Certifications: ${certStatus.status}`} />
                      )}
                      {member.isPrimary && (
                        <span className="px-1.5 py-0.5 text-xs bg-aeria-navy text-white rounded">Primary</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${roleColors[member.role] || roleColors.Other}`}>
                        {member.role}
                      </span>
                      {operator?.phone && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {operator.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {!member.isPrimary && project.crew.filter(c => c.role === member.role).length > 1 && (
                      <button
                        onClick={() => togglePrimary(index)}
                        className="px-2 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      onClick={() => removeCrewMember(index)}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Crew Form */}
      {showAddForm && (
        <div className="card border-aeria-light-blue">
          <h3 className="font-medium text-gray-900 mb-4">Add Crew Member</h3>
          
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Operator</label>
              <select
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                className="input"
              >
                <option value="">Select operator...</option>
                {availableOperators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.firstName} {op.lastName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="label">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="input"
              >
                <option value="">Select role...</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>
            
            {selectedRole === 'Other' && (
              <div className="sm:col-span-2">
                <label className="label">Custom Role Name</label>
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="input"
                  placeholder="Enter custom role..."
                />
              </div>
            )}
          </div>
          
          {/* Selected operator preview */}
          {selectedOperator && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              {(() => {
                const op = getOperatorById(selectedOperator)
                const certStatus = getCertStatus(op)
                
                return op ? (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{op.firstName} {op.lastName}</p>
                      {op.roles?.length > 0 && (
                        <p className="text-sm text-gray-500">
                          Qualified: {op.roles.join(', ')}
                        </p>
                      )}
                      {op.certifications?.length > 0 && (
                        <div className="flex items-center gap-1 mt-1 text-sm">
                          <Award className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-gray-500">
                            {op.certifications.length} certification{op.certifications.length !== 1 ? 's' : ''}
                          </span>
                          {certStatus && certStatus.status !== 'valid' && (
                            <span className={`ml-1 ${certStatus.color}`}>
                              ({certStatus.status})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ) : null
              })()}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowAddForm(false)
                setSelectedOperator('')
                setSelectedRole('')
                setCustomRole('')
              }}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={addCrewMember}
              disabled={!selectedOperator || !selectedRole || (selectedRole === 'Other' && !customRole)}
              className="btn-primary text-sm"
            >
              Add to Crew
            </button>
          </div>
        </div>
      )}

      {/* Emergency Contact Summary */}
      {project.crew?.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-3">Emergency Contacts (from crew)</h3>
          <div className="space-y-3">
            {project.crew.map((member, index) => {
              const operator = getOperatorById(member.operatorId)
              if (!operator?.emergencyContact?.name) return null
              
              return (
                <div key={index} className="py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {member.operatorName}'s emergency contact
                    </span>
                    <span className="text-gray-900 font-medium">
                      {operator.emergencyContact.name}
                      {operator.emergencyContact.relationship && (
                        <span className="text-gray-500 font-normal ml-1">
                          ({operator.emergencyContact.relationship})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    {operator.emergencyContact.phone && (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {operator.emergencyContact.phone}
                      </span>
                    )}
                    {operator.emergencyContact.email && (
                      <span className="inline-flex items-center gap-1">
                        <span>✉</span>
                        {operator.emergencyContact.email}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

ProjectCrew.propTypes = {
  project: PropTypes.shape({
    crew: PropTypes.arrayOf(PropTypes.shape({
      operatorId: PropTypes.string,
      operatorName: PropTypes.string,
      role: PropTypes.string,
      responsibilities: PropTypes.string
    }))
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
}
