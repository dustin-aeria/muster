/**
 * BrandingPreview.jsx
 * Preview and edit branding settings for documents
 */

import { useState, useEffect } from 'react'
import {
  X,
  Palette,
  Upload,
  Trash2,
  Eye,
  Save,
  Loader2,
  Image,
  RefreshCw
} from 'lucide-react'

const DEFAULT_COLORS = {
  primary: '#1e3a5f',
  secondary: '#2563eb',
  accent: '#3b82f6'
}

const COLOR_PRESETS = [
  { name: 'Navy Blue', primary: '#1e3a5f', secondary: '#2563eb', accent: '#3b82f6' },
  { name: 'Forest Green', primary: '#166534', secondary: '#22c55e', accent: '#4ade80' },
  { name: 'Royal Purple', primary: '#581c87', secondary: '#9333ea', accent: '#a855f7' },
  { name: 'Crimson Red', primary: '#991b1b', secondary: '#dc2626', accent: '#ef4444' },
  { name: 'Ocean Teal', primary: '#115e59', secondary: '#14b8a6', accent: '#2dd4bf' },
  { name: 'Charcoal', primary: '#1f2937', secondary: '#4b5563', accent: '#9ca3af' }
]

export default function BrandingPreview({
  isOpen,
  onClose,
  branding,
  onSave,
  saving = false,
  clientName = ''
}) {
  const [localBranding, setLocalBranding] = useState({
    name: '',
    logo: null,
    colors: { ...DEFAULT_COLORS }
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [logoPreview, setLogoPreview] = useState(null)

  useEffect(() => {
    if (branding) {
      setLocalBranding({
        name: branding.name || clientName || '',
        logo: branding.logo || null,
        colors: {
          ...DEFAULT_COLORS,
          ...(branding.colors || {})
        }
      })
      setLogoPreview(branding.logo || null)
      setHasChanges(false)
    }
  }, [branding, clientName])

  const handleColorChange = (colorKey, value) => {
    setLocalBranding(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value
      }
    }))
    setHasChanges(true)
  }

  const handlePresetSelect = (preset) => {
    setLocalBranding(prev => ({
      ...prev,
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent
      }
    }))
    setHasChanges(true)
  }

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result)
      setLocalBranding(prev => ({
        ...prev,
        logo: reader.result
      }))
      setHasChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setLocalBranding(prev => ({
      ...prev,
      logo: null
    }))
    setHasChanges(true)
  }

  const handleNameChange = (value) => {
    setLocalBranding(prev => ({
      ...prev,
      name: value
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    await onSave?.(localBranding)
    setHasChanges(false)
  }

  const handleReset = () => {
    setLocalBranding({
      name: branding?.name || clientName || '',
      logo: branding?.logo || null,
      colors: {
        ...DEFAULT_COLORS,
        ...(branding?.colors || {})
      }
    })
    setLogoPreview(branding?.logo || null)
    setHasChanges(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Document Branding
              </h2>
              <p className="text-sm text-gray-500">
                Customize how your documents look
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col lg:flex-row">
            {/* Settings Panel */}
            <div className="flex-1 p-6 space-y-6 border-r border-gray-200">
              {/* Client/Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={localBranding.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter brand name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Displayed on document headers and cover pages
                </p>
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-start gap-4">
                  {logoPreview ? (
                    <div className="relative group">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="h-20 w-auto rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="h-20 w-32 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                      <Image className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG or JPG, max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand Colors
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-gray-600">Primary</label>
                    <input
                      type="color"
                      value={localBranding.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={localBranding.colors.primary}
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-200 rounded"
                    />
                    <span className="text-xs text-gray-500">Headers, titles</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-gray-600">Secondary</label>
                    <input
                      type="color"
                      value={localBranding.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={localBranding.colors.secondary}
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-200 rounded"
                    />
                    <span className="text-xs text-gray-500">Subheadings, links</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="w-24 text-sm text-gray-600">Accent</label>
                    <input
                      type="color"
                      value={localBranding.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={localBranding.colors.accent}
                      onChange={(e) => handleColorChange('accent', e.target.value)}
                      className="w-28 px-2 py-1 text-sm border border-gray-200 rounded"
                    />
                    <span className="text-xs text-gray-500">Highlights, accents</span>
                  </div>
                </div>
              </div>

              {/* Color Presets */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset)}
                      className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex">
                        <div
                          className="w-4 h-4 rounded-l"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <div
                          className="w-4 h-4"
                          style={{ backgroundColor: preset.secondary }}
                        />
                        <div
                          className="w-4 h-4 rounded-r"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                      <span className="text-xs text-gray-700">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="w-80 p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Preview</span>
              </div>

              {/* Mini Document Preview */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div
                  className="h-16 flex items-center justify-center"
                  style={{ backgroundColor: localBranding.colors.primary }}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo"
                      className="h-10 w-auto"
                    />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {localBranding.name || 'Company Name'}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3
                    className="text-lg font-bold"
                    style={{ color: localBranding.colors.primary }}
                  >
                    Document Title
                  </h3>
                  <h4
                    className="text-sm font-medium"
                    style={{ color: localBranding.colors.secondary }}
                  >
                    Section Heading
                  </h4>
                  <p className="text-xs text-gray-600">
                    This is sample body text that shows how content will appear in your document.
                  </p>
                  <div
                    className="text-xs px-2 py-1 rounded inline-block"
                    style={{
                      backgroundColor: `${localBranding.colors.accent}20`,
                      color: localBranding.colors.accent
                    }}
                  >
                    Accent Element
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="h-6 flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: localBranding.colors.primary,
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  Page 1
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between rounded-b-xl">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            )}
            {hasChanges && (
              <span className="text-sm text-yellow-600">Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Branding
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
