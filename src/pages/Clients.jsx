/**
 * Clients.jsx
 * Client management page with full CRUD functionality
 * Enhanced with logo upload for branded exports
 * 
 * FIXES APPLIED:
 * - Issue #6: Fixed three-button menu click not working (stopPropagation)
 * 
 * @location src/pages/Clients.jsx
 * @action REPLACE
 */

import { useState, useEffect, useRef } from 'react'
import {
  Plus,
  Search,
  Building2,
  MoreVertical,
  Trash2,
  Edit,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  X,
  Upload,
  Image,
  Loader2
} from 'lucide-react'
import { getClients, createClient, updateClient, deleteClient } from '../lib/firestore'
import { useOrganization } from '../hooks/useOrganization'
import { usePermissions } from '../hooks/usePermissions'
import { CanEdit, CanDelete } from '../components/PermissionGuard'
import { logger } from '../lib/logger'
import ClientPortalManager from '../components/clients/ClientPortalManager'
import Modal from '../components/Modal'

// Logo Upload Component
function LogoUpload({ logo, onLogoChange }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  
  const handleFileSelect = async (file) => {
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, GIF)')
      return
    }
    
    // Validate file size (max 500KB for Firestore)
    if (file.size > 500 * 1024) {
      alert('Logo must be less than 500KB. Please resize or compress the image.')
      return
    }
    
    setUploading(true)
    
    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        // Create an image to resize if needed
        const img = new window.Image()
        img.onload = () => {
          // Resize if larger than 200x100
          const maxWidth = 200
          const maxHeight = 100
          let { width, height } = img
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width *= ratio
            height *= ratio
          }
          
          // Create canvas and resize
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to PNG base64
          const resizedBase64 = canvas.toDataURL('image/png', 0.9)
          onLogoChange(resizedBase64)
          setUploading(false)
        }
        img.src = e.target.result
      }
      reader.onerror = () => {
        alert('Error reading file')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      logger.error('Error uploading logo:', err)
      alert('Failed to upload logo')
      setUploading(false)
    }
  }
  
  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }
  
  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }
  
  const handleDragLeave = () => {
    setDragOver(false)
  }
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Company Logo
        <span className="text-gray-400 font-normal ml-1">(for branded exports)</span>
      </label>
      
      {logo ? (
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-20 border rounded-lg bg-gray-50 flex items-center justify-center p-2">
            <img 
              src={logo} 
              alt="Client logo" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary text-sm"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onLogoChange(null)}
              className="text-red-500 text-sm hover:text-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer
            ${dragOver ? 'border-aeria-blue bg-blue-50' : 'border-gray-300 hover:border-aeria-blue'}`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Loader2 className="w-6 h-6 text-aeria-blue animate-spin" />
              <p className="text-sm text-gray-500">Processing...</p>
            </div>
          ) : (
            <>
              <Image className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                Drop logo here or click to upload
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG up to 500KB. Will be resized to fit.
              </p>
            </>
          )}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files[0])}
      />
    </div>
  )
}

// Client Modal Component
function ClientModal({ isOpen, onClose, client, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    logo: null
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        contactName: client.contactName || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || '',
        logo: client.logo || null
      })
    } else {
      setFormData({
        name: '',
        contactName: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        logo: null
      })
    }
  }, [client, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a client name')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (err) {
      logger.error('Error saving client:', err)
      alert('Failed to save client')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {client ? 'Edit Client' : 'Add Client'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Logo Upload */}
          <LogoUpload 
            logo={formData.logo}
            onLogoChange={(logo) => setFormData({ ...formData, logo })}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="Client company name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Primary Contact
            </label>
            <input
              type="text"
              value={formData.contactName}
              onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              className="input"
              placeholder="Contact person name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="email@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows={2}
              placeholder="Street, City, Province, Postal Code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={2}
              placeholder="Any additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Client Card Component
function ClientCard({ client, onEdit, onDelete, onPortalAccess, menuOpen, setMenuOpen, canEdit, canDelete }) {
  // FIX #6: Handle menu button click with stopPropagation
  const handleMenuClick = (e) => {
    e.stopPropagation() // Prevent document click handler from firing
    setMenuOpen(menuOpen === client.id ? null : client.id)
  }

  const handleEditClick = (e) => {
    e.stopPropagation()
    onEdit(client)
    setMenuOpen(null)
  }

  const handlePortalClick = (e) => {
    e.stopPropagation()
    onPortalAccess(client)
    setMenuOpen(null)
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    onDelete(client.id, client.name)
    setMenuOpen(null)
  }

  return (
    <div className="card hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {client.logo ? (
            <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center p-1">
              <img 
                src={client.logo} 
                alt={client.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-aeria-blue to-aeria-navy flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{client.name}</h3>
            {client.contactName && (
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                {client.contactName}
              </p>
            )}
          </div>
        </div>
        
        {/* Only show menu if user has edit or delete permissions */}
        {(canEdit || canDelete) && (
          <div className="relative">
            <button
              onClick={handleMenuClick}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen === client.id && (
              <>
                {/* FIX #6: Backdrop with stopPropagation */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen(null)
                  }}
                />
                <div className="absolute right-0 top-10 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                  {canEdit && (
                    <button
                      onClick={handleEditClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={handlePortalClick}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Portal Access
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-4 space-y-2">
        {client.email && (
          <a 
            href={`mailto:${client.email}`}
            className="text-sm text-gray-600 hover:text-aeria-blue flex items-center gap-2"
          >
            <Mail className="w-4 h-4 text-gray-400" />
            {client.email}
          </a>
        )}
        {client.phone && (
          <a 
            href={`tel:${client.phone}`}
            className="text-sm text-gray-600 hover:text-aeria-blue flex items-center gap-2"
          >
            <Phone className="w-4 h-4 text-gray-400" />
            {client.phone}
          </a>
        )}
        {client.address && (
          <p className="text-sm text-gray-500 flex items-start gap-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{client.address}</span>
          </p>
        )}
      </div>
      
      {client.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 line-clamp-2">{client.notes}</p>
        </div>
      )}
      
      {client.logo && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
            <Image className="w-3 h-3" />
            Logo on file
          </span>
        </div>
      )}
    </div>
  )
}

export default function Clients() {
  const { organizationId } = useOrganization()
  const { canEdit, canDelete } = usePermissions()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [portalClient, setPortalClient] = useState(null)

  useEffect(() => {
    if (organizationId) {
      loadClients()
    }
  }, [organizationId])

  const loadClients = async () => {
    if (!organizationId) return
    setLoading(true)
    try {
      const data = await getClients(organizationId)
      setClients(data)
    } catch (err) {
      logger.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (formData) => {
    if (editingClient) {
      await updateClient(editingClient.id, formData)
    } else {
      await createClient(formData, organizationId)
    }
    await loadClients()
    setEditingClient(null)
  }

  const handleDelete = async (clientId, clientName) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"?`)) {
      return
    }
    
    try {
      await deleteClient(clientId)
      await loadClients()
    } catch (err) {
      logger.error('Error deleting client:', err)
      alert('Failed to delete client')
    }
  }

  const handleEdit = (client) => {
    setEditingClient(client)
    setShowModal(true)
  }

  const handlePortalAccess = (client) => {
    setPortalClient(client)
  }

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase()
    return (
      client.name?.toLowerCase().includes(query) ||
      client.contactName?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    )
  })

  // FIX #6: Removed the problematic document-level click handler
  // Menu closing is now handled by the backdrop overlay in ClientCard

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client companies</p>
        </div>
        <CanEdit>
          <button
            onClick={() => {
              setEditingClient(null)
              setShowModal(true)
            }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </button>
        </CanEdit>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
        <label htmlFor="client-search" className="sr-only">Search clients</label>
        <input
          id="client-search"
          type="search"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Client Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {searchQuery ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Try adjusting your search' 
              : 'Add your first client to get started'
            }
          </p>
          {!searchQuery && (
            <CanEdit>
              <button
                onClick={() => {
                  setEditingClient(null)
                  setShowModal(true)
                }}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Client
              </button>
            </CanEdit>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPortalAccess={handlePortalAccess}
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {!loading && clients.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
          <span>
            Showing {filteredClients.length} of {clients.length} clients
          </span>
          <span>
            {clients.filter(c => c.logo).length} with logo
          </span>
        </div>
      )}

      {/* Client Edit Modal */}
      <ClientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingClient(null)
        }}
        client={editingClient}
        onSave={handleSave}
      />

      {/* Portal Access Modal */}
      <Modal
        isOpen={!!portalClient}
        onClose={() => setPortalClient(null)}
        size="lg"
        showClose={false}
      >
        <div className="-mx-6 -mt-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {portalClient?.logo ? (
                <div className="w-12 h-12 rounded-lg border bg-white flex items-center justify-center p-1">
                  <img
                    src={portalClient.logo}
                    alt={portalClient.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-aeria-blue to-aeria-navy flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{portalClient?.name}</h2>
                <p className="text-sm text-gray-500">Manage portal access for this client</p>
              </div>
            </div>
            <button
              onClick={() => setPortalClient(null)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4">
            {portalClient && (
              <ClientPortalManager
                client={portalClient}
                onUpdate={() => loadClients()}
              />
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}
