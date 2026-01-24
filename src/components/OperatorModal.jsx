import { useState, useEffect } from 'react'
import Modal, { ModalFooter } from './Modal'
import { createOperator, updateOperator } from '../lib/firestore'
import { Plus, Trash2, AlertCircle, Award, DollarSign } from 'lucide-react'

const availableRoles = [
  'PIC',
  'VO', 
  'Safety Lead',
  'Project Lead',
  'First Aid',
  'Ground Support',
  'Data Processor'
]

const certificationTypes = [
  'Advanced RPAS Certificate',
  'Basic RPAS Certificate', 
  'ROC-A (Restricted Operator Certificate - Aeronautical)',
  'Wilderness First Aid',
  'Standard First Aid',
  'OFA Level 1',
  'OFA Level 2',
  'OFA Level 3',
  'H2S Alive',
  'WHMIS',
  'Ground Disturbance',
  'Bear Awareness',
  'Transportation of Dangerous Goods',
  'SECOR',
  'Fall Protection',
  'Other'
]

const issuingBodies = [
  'Transport Canada',
  'Red Cross',
  'St. John Ambulance',
  'WorkSafe BC',
  'Energy Safety Canada',
  'Other'
]

// Validation helpers
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const isValidPhone = (phone) => {
  // Accept various formats: (555) 555-5555, 555-555-5555, +1 555 555 5555, etc.
  const phoneRegex = /^[\d\s\-+().]{10,}$/
  const digitsOnly = phone.replace(/\D/g, '')
  return phoneRegex.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15
}

export default function OperatorModal({ isOpen, onClose, operator }) {
  const isEditing = !!operator

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContact: {
      name: '',
      phone: '',
      email: '',
      relationship: ''
    },
    roles: [],
    status: 'active',
    // Billing rates (for cost estimator)
    hourlyRate: '',
    dailyRate: '',
    weeklyRate: ''
  })
  
  const [certifications, setCertifications] = useState([])

  // Populate form when editing
  useEffect(() => {
    if (operator) {
      setFormData({
        firstName: operator.firstName || '',
        lastName: operator.lastName || '',
        email: operator.email || '',
        phone: operator.phone || '',
        emergencyContact: operator.emergencyContact || {
          name: '',
          phone: '',
          email: '',
          relationship: ''
        },
        roles: operator.roles || [],
        status: operator.status || 'active',
        hourlyRate: operator.hourlyRate || '',
        dailyRate: operator.dailyRate || '',
        weeklyRate: operator.weeklyRate || ''
      })
      setCertifications(operator.certifications || [])
    } else {
      resetForm()
    }
  }, [operator, isOpen])

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      emergencyContact: {
        name: '',
        phone: '',
        email: '',
        relationship: ''
      },
      roles: [],
      status: 'active',
      hourlyRate: '',
      dailyRate: '',
      weeklyRate: ''
    })
    setCertifications([])
    setError('')
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleEmergencyContactChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value }
    }))
  }

  const handleRoleToggle = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }))
  }

  const addCertification = () => {
    setCertifications(prev => [...prev, {
      type: '',
      customType: '',
      certificateNumber: '',
      issuedDate: '',
      expiryDate: '',
      issuingBody: '',
      customIssuingBody: ''
    }])
  }

  const updateCertification = (index, field, value) => {
    setCertifications(prev => prev.map((cert, i) => 
      i === index ? { ...cert, [field]: value } : cert
    ))
  }

  const removeCertification = (index) => {
    setCertifications(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate required fields
      if (!formData.firstName.trim()) throw new Error('First name is required')
      if (!formData.lastName.trim()) throw new Error('Last name is required')
      if (!formData.email.trim()) throw new Error('Email is required')
      if (!formData.phone.trim()) throw new Error('Phone is required')
      if (!formData.emergencyContact.name.trim()) throw new Error('Emergency contact name is required')
      if (!formData.emergencyContact.phone.trim()) throw new Error('Emergency contact phone is required')

      // Validate email format
      if (!isValidEmail(formData.email)) throw new Error('Please enter a valid email address')

      // Validate phone format
      if (!isValidPhone(formData.phone)) throw new Error('Please enter a valid phone number (at least 10 digits)')

      // Validate emergency contact phone
      if (!isValidPhone(formData.emergencyContact.phone)) throw new Error('Please enter a valid emergency contact phone number')

      // Validate emergency contact email if provided
      if (formData.emergencyContact.email && !isValidEmail(formData.emergencyContact.email)) {
        throw new Error('Please enter a valid emergency contact email address')
      }

      // Process certifications - use custom values if "Other" selected
      const processedCerts = certifications
        .filter(cert => cert.type) // Only include certs with a type selected
        .map(cert => ({
          type: cert.type === 'Other' ? cert.customType : cert.type,
          certificateNumber: cert.certificateNumber,
          issuedDate: cert.issuedDate,
          expiryDate: cert.expiryDate || null,
          issuingBody: cert.issuingBody === 'Other' ? cert.customIssuingBody : cert.issuingBody
        }))

      const operatorData = {
        ...formData,
        certifications: processedCerts,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        dailyRate: formData.dailyRate ? parseFloat(formData.dailyRate) : null,
        weeklyRate: formData.weeklyRate ? parseFloat(formData.weeklyRate) : null
      }

      if (isEditing) {
        await updateOperator(operator.id, operatorData)
      } else {
        await createOperator(operatorData)
      }

      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isEditing ? 'Edit Operator' : 'Add Operator'} 
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Email <span className="text-red-500">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input"
                placeholder="(555) 555-5555"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Emergency Contact</h3>
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label">Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.emergencyContact.name}
                onChange={handleEmergencyContactChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Relationship</label>
              <input
                type="text"
                name="relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleEmergencyContactChange}
                className="input"
                placeholder="e.g., Spouse, Parent"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                name="phone"
                value={formData.emergencyContact.phone}
                onChange={handleEmergencyContactChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                name="email"
                value={formData.emergencyContact.email}
                onChange={handleEmergencyContactChange}
                className="input"
                placeholder="emergency@email.com"
              />
            </div>
          </div>
        </div>

        {/* Roles */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Roles</h3>
          <div className="flex flex-wrap gap-2">
            {availableRoles.map(role => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleToggle(role)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors ${
                  formData.roles.includes(role)
                    ? 'bg-aeria-navy text-white border-aeria-navy'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Award className="w-4 h-4" />
              Certifications
            </h3>
            <button
              type="button"
              onClick={addCertification}
              className="text-sm text-aeria-blue hover:text-aeria-navy inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Certification
            </button>
          </div>

          {certifications.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No certifications added yet.</p>
          ) : (
            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-medium text-gray-500">Certification {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Type</label>
                      <select
                        value={cert.type}
                        onChange={(e) => updateCertification(index, 'type', e.target.value)}
                        className="input text-sm"
                      >
                        <option value="">Select type...</option>
                        {certificationTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {cert.type === 'Other' && (
                        <input
                          type="text"
                          value={cert.customType}
                          onChange={(e) => updateCertification(index, 'customType', e.target.value)}
                          className="input text-sm mt-2"
                          placeholder="Specify certification type"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="label text-xs">Issuing Body</label>
                      <select
                        value={cert.issuingBody}
                        onChange={(e) => updateCertification(index, 'issuingBody', e.target.value)}
                        className="input text-sm"
                      >
                        <option value="">Select issuing body...</option>
                        {issuingBodies.map(body => (
                          <option key={body} value={body}>{body}</option>
                        ))}
                      </select>
                      {cert.issuingBody === 'Other' && (
                        <input
                          type="text"
                          value={cert.customIssuingBody}
                          onChange={(e) => updateCertification(index, 'customIssuingBody', e.target.value)}
                          className="input text-sm mt-2"
                          placeholder="Specify issuing body"
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="label text-xs">Certificate Number</label>
                      <input
                        type="text"
                        value={cert.certificateNumber}
                        onChange={(e) => updateCertification(index, 'certificateNumber', e.target.value)}
                        className="input text-sm"
                        placeholder="Optional"
                      />
                    </div>
                    
                    <div>
                      <label className="label text-xs">Issued Date</label>
                      <input
                        type="date"
                        value={cert.issuedDate}
                        onChange={(e) => updateCertification(index, 'issuedDate', e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="label text-xs">Expiry Date <span className="text-gray-400 font-normal">(leave blank if no expiry)</span></label>
                      <input
                        type="date"
                        value={cert.expiryDate}
                        onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                        className="input text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status (only when editing) */}
        {isEditing && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="input w-40"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        {/* Billing Rates (for Cost Estimator) */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Billing Rates
            <span className="text-xs font-normal text-gray-500">(Admin only - for cost estimation)</span>
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Hourly Rate ($)</label>
              <input
                type="number"
                name="hourlyRate"
                value={formData.hourlyRate}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="label">Daily Rate ($)</label>
              <input
                type="number"
                name="dailyRate"
                value={formData.dailyRate}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="label">Weekly Rate ($)</label>
              <input
                type="number"
                name="weeklyRate"
                value={formData.weeklyRate}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            These rates are used in the project cost estimator.
          </p>
        </div>

        <ModalFooter>
          <button type="button" onClick={handleClose} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Operator'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
