// ============================================
// BRANDING SETTINGS COMPONENT
// Manage operator and client branding for PDF exports
// Fixed to use simple settings/branding path
// ============================================

import { useState, useEffect } from 'react'
import {
  Building,
  Image,
  Palette,
  Upload,
  Trash2,
  Save,
  Eye,
  Plus,
  X,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../contexts/AuthContext'
import { logger } from '../lib/logger'

// ============================================
// DEFAULT BRANDING CONFIGURATION
// ============================================
const DEFAULT_OPERATOR_BRANDING = {
  name: 'Your Company Name',
  registration: '',
  tagline: 'Professional RPAS Operations',
  website: '',
  email: '',
  phone: '',
  address: '',
  logo: null,
  colors: {
    primary: '#1e3a5f',
    secondary: '#3b82f6',
    accent: '#10b981',
    light: '#e0f2fe'
  }
}

// ============================================
// COLOR PICKER COMPONENT
// ============================================
const ColorPicker = ({ label, value, onChange }) => {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
      />
      <div className="flex-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input text-xs mt-1"
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

// ============================================
// LOGO UPLOAD COMPONENT
// ============================================
const LogoUpload = ({ logo, onUpload, onRemove, label = "Logo" }) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 500KB for base64 storage)
    if (file.size > 500 * 1024) {
      setError('Image must be under 500KB')
      return
    }

    setUploading(true)
    setError(null)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpload(event.target.result)
        setUploading(false)
      }
      reader.onerror = () => {
        setError('Failed to read file')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      setError('Failed to upload logo')
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>
      
      {logo ? (
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <img 
            src={logo} 
            alt="Logo preview" 
            className="h-16 w-auto max-w-[200px] object-contain"
          />
          <button
            onClick={onRemove}
            type="button"
            className="btn-secondary text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Remove
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-aeria-blue hover:bg-gray-50 transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aeria-blue" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Click to upload logo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 500KB</p>
              </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================
// MAIN BRANDING SETTINGS COMPONENT
// ============================================
export default function BrandingSettings() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('operator')
  
  // Branding state
  const [operatorBranding, setOperatorBranding] = useState(DEFAULT_OPERATOR_BRANDING)
  const [clientBrandings, setClientBrandings] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)

  // Load branding from Firestore - using simple path
  useEffect(() => {
    const loadBranding = async () => {
      try {
        const brandingDoc = await getDoc(doc(db, 'settings', 'branding'))
        
        if (brandingDoc.exists()) {
          const data = brandingDoc.data()
          if (data.operator) {
            setOperatorBranding({ ...DEFAULT_OPERATOR_BRANDING, ...data.operator })
          }
          if (data.clients) {
            setClientBrandings(data.clients)
          }
        }
      } catch (err) {
        logger.error('Failed to load branding:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [])

  // Save branding to Firestore - using simple path
  const saveBranding = async () => {
    setSaving(true)
    setSaved(false)

    try {
      await setDoc(
        doc(db, 'settings', 'branding'),
        {
          operator: operatorBranding,
          clients: clientBrandings,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.uid || 'unknown'
        },
        { merge: true }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      logger.error('Failed to save branding:', err)
      alert('Failed to save branding settings')
    } finally {
      setSaving(false)
    }
  }

  // Update operator branding
  const updateOperator = (field, value) => {
    setOperatorBranding(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateOperatorColor = (colorKey, value) => {
    setOperatorBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
  }

  // Client branding management
  const addClientBranding = () => {
    const newClient = {
      id: `client_${Date.now()}`,
      name: 'New Client',
      logo: null,
      colors: null // Will inherit operator colors
    }
    setClientBrandings(prev => [...prev, newClient])
    setSelectedClient(newClient.id)
  }

  const updateClientBranding = (clientId, field, value) => {
    setClientBrandings(prev => prev.map(c => 
      c.id === clientId ? { ...c, [field]: value } : c
    ))
  }

  const removeClientBranding = (clientId) => {
    setClientBrandings(prev => prev.filter(c => c.id !== clientId))
    if (selectedClient === clientId) {
      setSelectedClient(null)
    }
  }

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="w-8 h-8 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500">Loading branding settings...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-aeria-sky rounded-lg">
              <Palette className="w-5 h-5 text-aeria-navy" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
              <p className="text-sm text-gray-500">Customize PDF export appearance</p>
            </div>
          </div>
          <button
            onClick={saveBranding}
            disabled={saving}
            className="btn-primary inline-flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Branding
              </>
            )}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('operator')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'operator'
                ? 'bg-aeria-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Building className="w-4 h-4 inline mr-2" />
            Operator Branding
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'clients'
                ? 'bg-aeria-navy text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Image className="w-4 h-4 inline mr-2" />
            Client Branding
          </button>
        </div>
      </div>

      {/* Operator Branding Tab */}
      {activeTab === 'operator' && (
        <div className="space-y-6">
          {/* Company Info */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Company Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">Company Name</label>
                <input
                  type="text"
                  value={operatorBranding.name}
                  onChange={(e) => updateOperator('name', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Registration</label>
                <input
                  type="text"
                  value={operatorBranding.registration}
                  onChange={(e) => updateOperator('registration', e.target.value)}
                  className="input"
                  placeholder="e.g., Transport Canada Operator #123456"
                />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input
                  type="text"
                  value={operatorBranding.tagline}
                  onChange={(e) => updateOperator('tagline', e.target.value)}
                  className="input"
                  placeholder="e.g., Professional RPAS Operations"
                />
              </div>
              <div>
                <label className="label">Website</label>
                <input
                  type="text"
                  value={operatorBranding.website}
                  onChange={(e) => updateOperator('website', e.target.value)}
                  className="input"
                  placeholder="www.yourcompany.com"
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={operatorBranding.email}
                  onChange={(e) => updateOperator('email', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  value={operatorBranding.phone}
                  onChange={(e) => updateOperator('phone', e.target.value)}
                  className="input"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Address</label>
                <textarea
                  value={operatorBranding.address}
                  onChange={(e) => updateOperator('address', e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="Street, City, Province, Postal Code"
                />
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Company Logo</h3>
            <LogoUpload
              logo={operatorBranding.logo}
              onUpload={(logo) => updateOperator('logo', logo)}
              onRemove={() => updateOperator('logo', null)}
              label="Operator Logo"
            />
            <p className="text-xs text-gray-500 mt-2">
              This logo will appear on all PDF exports. For best results, use a transparent PNG.
            </p>
          </div>

          {/* Colors */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Brand Colors</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <ColorPicker
                label="Primary"
                value={operatorBranding.colors.primary}
                onChange={(value) => updateOperatorColor('primary', value)}
              />
              <ColorPicker
                label="Secondary"
                value={operatorBranding.colors.secondary}
                onChange={(value) => updateOperatorColor('secondary', value)}
              />
              <ColorPicker
                label="Accent"
                value={operatorBranding.colors.accent}
                onChange={(value) => updateOperatorColor('accent', value)}
              />
              <ColorPicker
                label="Light"
                value={operatorBranding.colors.light}
                onChange={(value) => updateOperatorColor('light', value)}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview
            </h3>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: operatorBranding.colors.primary }}>
                <div className="flex items-center gap-4">
                  {operatorBranding.logo ? (
                    <img src={operatorBranding.logo} alt="Logo" className="h-12 w-auto" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                      <Image className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold" style={{ color: operatorBranding.colors.primary }}>
                      {operatorBranding.name}
                    </h4>
                    <p className="text-sm text-gray-500">{operatorBranding.tagline}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{operatorBranding.registration}</p>
                  <p>{operatorBranding.website}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <div className="w-8 h-8 rounded" style={{ backgroundColor: operatorBranding.colors.primary }} title="Primary" />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: operatorBranding.colors.secondary }} title="Secondary" />
                <div className="w-8 h-8 rounded" style={{ backgroundColor: operatorBranding.colors.accent }} title="Accent" />
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: operatorBranding.colors.light }} title="Light" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Client Branding Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Client Branding</h3>
              <button
                onClick={addClientBranding}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Client
              </button>
            </div>

            {clientBrandings.length === 0 ? (
              <div className="text-center py-8">
                <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="font-medium text-gray-900 mb-1">No client branding configured</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Add client logos to enable co-branded PDF exports
                </p>
                <button
                  onClick={addClientBranding}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Client
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {clientBrandings.map((client) => (
                  <div 
                    key={client.id} 
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      selectedClient === client.id 
                        ? 'border-aeria-blue bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <input
                        type="text"
                        value={client.name}
                        onChange={(e) => updateClientBranding(client.id, 'name', e.target.value)}
                        className="input font-medium"
                        placeholder="Client name"
                      />
                      <button
                        onClick={() => removeClientBranding(client.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <LogoUpload
                      logo={client.logo}
                      onUpload={(logo) => updateClientBranding(client.id, 'logo', logo)}
                      onRemove={() => updateClientBranding(client.id, 'logo', null)}
                      label="Client Logo"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Usage Instructions */}
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">How Client Branding Works</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Client logos appear alongside your operator branding on PDFs</li>
                  <li>• Select a client when creating a project to enable co-branding</li>
                  <li>• Client branding is optional - your operator branding always appears</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================
// HOOK TO GET BRANDING
// ============================================
export function useBranding() {
  const [branding, setBranding] = useState({
    operator: DEFAULT_OPERATOR_BRANDING,
    clients: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBranding = async () => {
      try {
        const brandingDoc = await getDoc(doc(db, 'settings', 'branding'))

        if (brandingDoc.exists()) {
          const data = brandingDoc.data()
          setBranding({
            operator: { ...DEFAULT_OPERATOR_BRANDING, ...data.operator },
            clients: data.clients || []
          })
        }
      } catch (err) {
        logger.error('Failed to load branding:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBranding()
  }, [])

  const getClientBranding = (clientId) => {
    return branding.clients.find(c => c.id === clientId) || null
  }

  /**
   * Replace company name placeholders in text content
   * Replaces: "the Company", "the Company's", "{companyName}"
   * @param {string} text - Text containing placeholders
   * @returns {string} Text with company name inserted
   */
  const applyCompanyName = (text) => {
    if (!text || typeof text !== 'string') return text
    const companyName = branding.operator.name || 'Your Company'
    return text
      .replace(/the Company's/g, `${companyName}'s`)
      .replace(/the Company/g, companyName)
      .replace(/\{companyName\}/g, companyName)
  }

  /**
   * Apply company name to policy content (sections, description, etc.)
   * @param {Object} policy - Policy object
   * @returns {Object} Policy with company name applied
   */
  const applyBrandingToPolicy = (policy) => {
    if (!policy) return policy

    const branded = { ...policy }

    // Apply to description
    if (branded.description) {
      branded.description = applyCompanyName(branded.description)
    }

    // Apply to sections
    if (branded.sections && Array.isArray(branded.sections)) {
      branded.sections = branded.sections.map(section => ({
        ...section,
        content: applyCompanyName(section.content)
      }))
    }

    // Apply to content object if it has sections
    if (branded.content?.sections && Array.isArray(branded.content.sections)) {
      branded.content = {
        ...branded.content,
        sections: branded.content.sections.map(section => ({
          ...section,
          content: applyCompanyName(section.content)
        }))
      }
    }

    return branded
  }

  return {
    branding,
    loading,
    getClientBranding,
    applyCompanyName,
    applyBrandingToPolicy,
    companyName: branding.operator.name
  }
}

// Export default branding for use in other files
export { DEFAULT_OPERATOR_BRANDING }
