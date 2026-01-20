import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal, { ModalFooter } from './Modal'
import { createProject, getClients, createClient } from '../lib/firestore'
import { useAuth } from '../contexts/AuthContext'
import { Plus, Building2, AlertCircle } from 'lucide-react'

export default function NewProjectModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [showNewClient, setShowNewClient] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    projectCode: '',
    clientId: '',
    clientName: '', // For display and new client creation
    dateType: 'single',
    startDate: '',
    endDate: '',
    description: ''
  })
  
  // New client form
  const [newClient, setNewClient] = useState({
    name: '',
    shortName: ''
  })

  // Load clients on mount
  useEffect(() => {
    if (isOpen) {
      loadClients()
    }
  }, [isOpen])

  const loadClients = async () => {
    setLoadingClients(true)
    try {
      const data = await getClients()
      setClients(data)
    } catch {
      // Client loading failed - empty dropdown will be shown
    } finally {
      setLoadingClients(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate project code when client changes
    if (name === 'clientId' && value) {
      const client = clients.find(c => c.id === value)
      if (client) {
        const year = new Date().getFullYear()
        const code = `${client.shortName || client.name.substring(0, 3).toUpperCase()}-${year}-001`
        setFormData(prev => ({ 
          ...prev, 
          clientId: value,
          clientName: client.name,
          projectCode: prev.projectCode || code 
        }))
      }
    }
  }

  const handleNewClientChange = (e) => {
    const { name, value } = e.target
    setNewClient(prev => ({ ...prev, [name]: value }))
    
    // Auto-generate short name
    if (name === 'name' && !newClient.shortName) {
      const short = value.split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .substring(0, 4)
      setNewClient(prev => ({ ...prev, shortName: short }))
    }
  }

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return
    
    try {
      const client = await createClient({
        name: newClient.name.trim(),
        shortName: newClient.shortName.trim() || newClient.name.substring(0, 3).toUpperCase()
      })
      
      setClients(prev => [...prev, client])
      setFormData(prev => ({
        ...prev,
        clientId: client.id,
        clientName: client.name
      }))
      setShowNewClient(false)
      setNewClient({ name: '', shortName: '' })
    } catch (err) {
      setError('Failed to create client')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Validate
      if (!formData.name.trim()) {
        throw new Error('Project name is required')
      }
      if (!formData.startDate) {
        throw new Error('Start date is required')
      }
      if (formData.dateType === 'range' && !formData.endDate) {
        throw new Error('End date is required for date range')
      }
      if (formData.dateType === 'range' && formData.endDate < formData.startDate) {
        throw new Error('End date must be after start date')
      }

      const projectData = {
        name: formData.name.trim(),
        projectCode: formData.projectCode.trim() || generateProjectCode(),
        clientId: formData.clientId || null,
        clientName: formData.clientName || 'No Client',
        dates: {
          type: formData.dateType,
          startDate: formData.startDate,
          endDate: formData.dateType === 'range' ? formData.endDate : formData.startDate
        },
        description: formData.description.trim(),
        objectives: '',
        deliverables: '',
        authorization: '',
        createdBy: user.uid
      }

      const project = await createProject(projectData)
      onClose()
      navigate(`/projects/${project.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateProjectCode = () => {
    const year = new Date().getFullYear()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    return `PRJ-${year}-${random}`
  }

  const resetForm = () => {
    setFormData({
      name: '',
      projectCode: '',
      clientId: '',
      clientName: '',
      dateType: 'single',
      startDate: '',
      endDate: '',
      description: ''
    })
    setError('')
    setShowNewClient(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Project" size="lg">
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          {/* Project Name */}
          <div>
            <label htmlFor="name" className="label">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="e.g., Quintette Mine Survey"
              autoFocus
            />
          </div>

          {/* Client Selection */}
          <div>
            <label htmlFor="clientId" className="label">Client</label>
            {showNewClient ? (
              <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                <div>
                  <label className="label text-xs">Client Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newClient.name}
                    onChange={handleNewClientChange}
                    className="input"
                    placeholder="e.g., Pacific Salmon Foundation"
                  />
                </div>
                <div>
                  <label className="label text-xs">Short Name (for project codes)</label>
                  <input
                    type="text"
                    name="shortName"
                    value={newClient.shortName}
                    onChange={handleNewClientChange}
                    className="input"
                    placeholder="e.g., PSF"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    className="btn-primary text-sm"
                    disabled={!newClient.name.trim()}
                  >
                    Add Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewClient(false)}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  id="clientId"
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="input flex-1"
                  disabled={loadingClients}
                >
                  <option value="">Select a client...</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowNewClient(true)}
                  className="btn-secondary inline-flex items-center gap-1"
                  title="Add new client"
                >
                  <Plus className="w-4 h-4" />
                  <Building2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Project Code */}
          <div>
            <label htmlFor="projectCode" className="label">
              Project Code
              <span className="text-gray-400 font-normal ml-1">(auto-generated if blank)</span>
            </label>
            <input
              id="projectCode"
              name="projectCode"
              type="text"
              value={formData.projectCode}
              onChange={handleChange}
              className="input"
              placeholder="e.g., PSF-2026-001"
            />
          </div>

          {/* Date Type */}
          <div>
            <label className="label">Project Date(s) <span className="text-red-500">*</span></label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateType"
                  value="single"
                  checked={formData.dateType === 'single'}
                  onChange={handleChange}
                  className="w-4 h-4 text-aeria-navy"
                />
                <span className="text-sm">Single Day</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="dateType"
                  value="range"
                  checked={formData.dateType === 'range'}
                  onChange={handleChange}
                  className="w-4 h-4 text-aeria-navy"
                />
                <span className="text-sm">Date Range</span>
              </label>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="startDate" className="label text-xs">
                  {formData.dateType === 'single' ? 'Date' : 'Start Date'}
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
              {formData.dateType === 'range' && (
                <div className="flex-1">
                  <label htmlFor="endDate" className="label text-xs">End Date</label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    min={formData.startDate}
                    className="input"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="label">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input min-h-[100px]"
              placeholder="Brief overview of the project scope and purpose..."
            />
          </div>
        </div>

        <ModalFooter>
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
