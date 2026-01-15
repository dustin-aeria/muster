import { useState, useEffect } from 'react'
import { getClients, createClient } from '../../lib/firestore'
import { format } from 'date-fns'
import { Plus, Building2, Calendar, FileText, Target, Package, Shield } from 'lucide-react'

export default function ProjectOverview({ project, onUpdate }) {
  const [clients, setClients] = useState([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', shortName: '' })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      const data = await getClients()
      setClients(data)
    } catch (err) {
      console.error('Error loading clients:', err)
    } finally {
      setLoadingClients(false)
    }
  }

  const handleChange = (field, value) => {
    onUpdate({ [field]: value })
  }

  const handleDateChange = (field, value) => {
    onUpdate({
      dates: {
        ...project.dates,
        [field]: value
      }
    })
  }

  const handleClientChange = (clientId) => {
    const client = clients.find(c => c.id === clientId)
    onUpdate({
      clientId: clientId || null,
      clientName: client?.name || ''
    })
  }

  const handleCreateClient = async () => {
    if (!newClient.name.trim()) return
    
    try {
      const client = await createClient({
        name: newClient.name.trim(),
        shortName: newClient.shortName.trim() || newClient.name.substring(0, 3).toUpperCase()
      })
      
      setClients(prev => [...prev, client])
      onUpdate({
        clientId: client.id,
        clientName: client.name
      })
      setShowNewClient(false)
      setNewClient({ name: '', shortName: '' })
    } catch (err) {
      console.error('Error creating client:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-aeria-blue" />
          Basic Information
        </h2>
        
        <div className="grid gap-4">
          {/* Project Name */}
          <div>
            <label className="label">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={project.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="input"
              placeholder="e.g., Quintette Mine Survey"
            />
          </div>

          {/* Project Code & Client - side by side on larger screens */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Project Code</label>
              <input
                type="text"
                value={project.projectCode || ''}
                onChange={(e) => handleChange('projectCode', e.target.value)}
                className="input font-mono"
                placeholder="e.g., PSF-2026-001"
              />
            </div>
            
            <div>
              <label className="label">Client</label>
              {showNewClient ? (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    className="input text-sm"
                    placeholder="Client name"
                  />
                  <input
                    type="text"
                    value={newClient.shortName}
                    onChange={(e) => setNewClient(prev => ({ ...prev, shortName: e.target.value }))}
                    className="input text-sm"
                    placeholder="Short name (e.g., PSF)"
                    maxLength={6}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateClient}
                      className="btn-primary text-xs py-1"
                      disabled={!newClient.name.trim()}
                    >
                      Add
                    </button>
                    <button
                      onClick={() => setShowNewClient(false)}
                      className="btn-secondary text-xs py-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={project.clientId || ''}
                    onChange={(e) => handleClientChange(e.target.value)}
                    className="input flex-1"
                    disabled={loadingClients}
                  >
                    <option value="">No client selected</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setShowNewClient(true)}
                    className="btn-secondary p-2"
                    title="Add new client"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dates Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-aeria-blue" />
          Project Dates
        </h2>
        
        <div className="space-y-4">
          {/* Date Type Toggle */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={project.dates?.type === 'single'}
                onChange={() => handleDateChange('type', 'single')}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className="text-sm">Single Day</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={project.dates?.type === 'range'}
                onChange={() => handleDateChange('type', 'range')}
                className="w-4 h-4 text-aeria-navy"
              />
              <span className="text-sm">Date Range</span>
            </label>
          </div>

          {/* Date Inputs */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">
                {project.dates?.type === 'single' ? 'Date' : 'Start Date'}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={project.dates?.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                className="input"
              />
            </div>
            
            {project.dates?.type === 'range' && (
              <div>
                <label className="label">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={project.dates?.endDate || ''}
                  onChange={(e) => handleDateChange('endDate', e.target.value)}
                  min={project.dates?.startDate}
                  className="input"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-aeria-blue" />
          Description
        </h2>
        
        <textarea
          value={project.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          className="input min-h-[120px]"
          placeholder="Provide an overview of the project scope and purpose..."
        />
      </div>

      {/* Objectives Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-aeria-blue" />
          Objectives
        </h2>
        <p className="text-sm text-gray-500 mb-3">What are we trying to accomplish?</p>
        
        <textarea
          value={project.objectives || ''}
          onChange={(e) => handleChange('objectives', e.target.value)}
          className="input min-h-[100px]"
          placeholder="List the key objectives for this project..."
        />
      </div>

      {/* Deliverables Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-aeria-blue" />
          Deliverables
        </h2>
        <p className="text-sm text-gray-500 mb-3">What will the client receive?</p>
        
        <textarea
          value={project.deliverables || ''}
          onChange={(e) => handleChange('deliverables', e.target.value)}
          className="input min-h-[100px]"
          placeholder="Describe the expected deliverables..."
        />
      </div>

      {/* Authorization Card */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-aeria-blue" />
          Authorization & Permits
        </h2>
        <p className="text-sm text-gray-500 mb-3">SFOCs, land access permissions, regulatory approvals, etc.</p>
        
        <textarea
          value={project.authorization || ''}
          onChange={(e) => handleChange('authorization', e.target.value)}
          className="input min-h-[100px]"
          placeholder="Document any required authorizations, permits, or access agreements..."
        />
      </div>
    </div>
  )
}
