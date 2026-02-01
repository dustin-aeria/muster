/**
 * OrganizationSettings.jsx
 * Organization settings page for managing business details and preferences
 *
 * @location src/pages/settings/OrganizationSettings.jsx
 */

import { useState, useEffect } from 'react'
import { useOrganization } from '../../hooks/useOrganization'
import { useAuth } from '../../contexts/AuthContext'
import { updateOrganization } from '../../lib/firestoreOrganizations'
import {
  Building2,
  Globe,
  Clock,
  Ruler,
  Save,
  Loader2,
  Check,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  FileText,
  Plane
} from 'lucide-react'

const TIMEZONES = [
  { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
  { value: 'America/Edmonton', label: 'Mountain Time (Edmonton)' },
  { value: 'America/Winnipeg', label: 'Central Time (Winnipeg)' },
  { value: 'America/Toronto', label: 'Eastern Time (Toronto)' },
  { value: 'America/Halifax', label: 'Atlantic Time (Halifax)' },
  { value: 'America/St_Johns', label: 'Newfoundland Time (St. John\'s)' },
  { value: 'UTC', label: 'UTC' }
]

const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (International)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' }
]

const MEASUREMENT_SYSTEMS = [
  { value: 'metric', label: 'Metric (meters, km)' },
  { value: 'imperial', label: 'Imperial (feet, miles)' }
]

const PROVINCES = [
  { value: '', label: 'Select Province/Territory' },
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' }
]

export default function OrganizationSettings() {
  const { organization, refreshOrganization, canManageSettings } = useOrganization()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    legalName: '',
    slug: '',
    phone: '',
    email: '',
    website: '',
    taxNumber: '',
    operatorNumber: '',
    address: {
      street: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Canada'
    },
    settings: {
      timezone: 'America/Toronto',
      dateFormat: 'MM/DD/YYYY',
      measurementSystem: 'imperial'
    }
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || '',
        legalName: organization.legalName || '',
        slug: organization.slug || '',
        phone: organization.phone || '',
        email: organization.email || '',
        website: organization.website || '',
        taxNumber: organization.taxNumber || '',
        operatorNumber: organization.operatorNumber || '',
        address: {
          street: organization.address?.street || '',
          city: organization.address?.city || '',
          province: organization.address?.province || '',
          postalCode: organization.address?.postalCode || '',
          country: organization.address?.country || 'Canada'
        },
        settings: {
          timezone: organization.settings?.timezone || 'America/Toronto',
          dateFormat: organization.settings?.dateFormat || 'MM/DD/YYYY',
          measurementSystem: organization.settings?.measurementSystem || 'imperial'
        }
      })
    }
  }, [organization])

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    setSaved(false)
  }

  const handleSave = async () => {
    if (!organization?.id || !canManageSettings) return

    setSaving(true)
    setError(null)

    try {
      await updateOrganization(organization.id, {
        name: formData.name,
        legalName: formData.legalName,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        taxNumber: formData.taxNumber,
        operatorNumber: formData.operatorNumber,
        address: formData.address,
        settings: formData.settings
      })

      await refreshOrganization()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving organization settings:', err)
      setError(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No organization found</p>
        </div>
      </div>
    )
  }

  if (!canManageSettings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <p className="text-gray-600">You don't have permission to manage organization settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Business Information */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Building2 className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
            <p className="text-sm text-gray-500">Legal and operating details for your organization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operating Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange(null, 'name', e.target.value)}
              className="input"
              placeholder="Your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Name
            </label>
            <input
              type="text"
              value={formData.legalName}
              onChange={(e) => handleChange(null, 'legalName', e.target.value)}
              className="input"
              placeholder="Registered legal name"
            />
            <p className="text-xs text-gray-500 mt-1">As registered with government</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FileText className="w-4 h-4 inline mr-1" />
              Business Number / Tax ID
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => handleChange(null, 'taxNumber', e.target.value)}
              className="input"
              placeholder="123456789 RT0001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Plane className="w-4 h-4 inline mr-1" />
              Transport Canada Operator Number
            </label>
            <input
              type="text"
              value={formData.operatorNumber}
              onChange={(e) => handleChange(null, 'operatorNumber', e.target.value)}
              className="input"
              placeholder="TC operator certificate number"
            />
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Phone className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
            <p className="text-sm text-gray-500">Primary contact details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange(null, 'phone', e.target.value)}
              className="input"
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange(null, 'email', e.target.value)}
              className="input"
              placeholder="contact@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange(null, 'website', e.target.value)}
              className="input"
              placeholder="https://www.company.com"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <MapPin className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Business Address</h2>
            <p className="text-sm text-gray-500">Primary place of business</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleChange('address', 'street', e.target.value)}
              className="input"
              placeholder="123 Main Street, Suite 100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleChange('address', 'city', e.target.value)}
                className="input"
                placeholder="Toronto"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <select
                value={formData.address.province}
                onChange={(e) => handleChange('address', 'province', e.target.value)}
                className="input"
              >
                {PROVINCES.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.address.postalCode}
                onChange={(e) => handleChange('address', 'postalCode', e.target.value.toUpperCase())}
                className="input"
                placeholder="M5V 1A1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => handleChange('address', 'country', e.target.value)}
                className="input"
                placeholder="Canada"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Globe className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Regional Settings</h2>
            <p className="text-sm text-gray-500">Configure timezone, date format, and units</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Clock className="w-4 h-4 inline mr-1" />
              Timezone
            </label>
            <select
              value={formData.settings.timezone}
              onChange={(e) => handleChange('settings', 'timezone', e.target.value)}
              className="input"
            >
              {TIMEZONES.map(tz => (
                <option key={tz.value} value={tz.value}>{tz.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Format
            </label>
            <select
              value={formData.settings.dateFormat}
              onChange={(e) => handleChange('settings', 'dateFormat', e.target.value)}
              className="input"
            >
              {DATE_FORMATS.map(df => (
                <option key={df.value} value={df.value}>{df.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Ruler className="w-4 h-4 inline mr-1" />
              Measurement System
            </label>
            <select
              value={formData.settings.measurementSystem}
              onChange={(e) => handleChange('settings', 'measurementSystem', e.target.value)}
              className="input"
            >
              {MEASUREMENT_SYSTEMS.map(ms => (
                <option key={ms.value} value={ms.value}>{ms.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subscription Info (Read-only) */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-aeria-sky rounded-lg">
            <Building2 className="w-5 h-5 text-aeria-navy" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Subscription</h2>
            <p className="text-sm text-gray-500">Your current plan details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Plan</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {organization.subscription?.plan || 'Starter'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">
              {organization.subscription?.status || 'Active'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500">Max Users</p>
            <p className="text-lg font-semibold text-gray-900">
              {organization.subscription?.maxUsers || 5}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between">
        <div>
          {error && (
            <p className="text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  )
}
