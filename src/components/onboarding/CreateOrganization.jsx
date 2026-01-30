/**
 * CreateOrganization.jsx
 * Onboarding component for new users to create their organization
 *
 * @location src/components/onboarding/CreateOrganization.jsx
 */

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useOrganization } from '../../hooks/useOrganization'
import { createOrganization } from '../../lib/firestoreOrganizations'
import {
  Building2,
  Loader2,
  Check,
  AlertCircle,
  Rocket
} from 'lucide-react'

export default function CreateOrganization() {
  const { user, userProfile } = useAuth()
  const { refreshMemberships } = useOrganization()

  const [formData, setFormData] = useState({
    name: '',
    timezone: 'America/Toronto',
    measurementSystem: 'imperial'
  })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !user) return

    setCreating(true)
    setError(null)

    try {
      // Create the organization
      const orgData = {
        name: formData.name.trim(),
        slug: formData.name.trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50),
        branding: {
          logoUrl: null,
          primaryColor: '#3B82F6'
        },
        settings: {
          timezone: formData.timezone,
          dateFormat: 'YYYY-MM-DD',
          measurementSystem: formData.measurementSystem
        },
        subscription: {
          plan: 'starter',
          status: 'active',
          maxUsers: 5
        },
        createdBy: user.uid
      }

      // createOrganization automatically creates owner membership
      await createOrganization(orgData, user.uid)

      // Refresh to pick up the new organization
      await refreshMemberships()

    } catch (err) {
      console.error('Error creating organization:', err)
      setError(err.message || 'Failed to create organization')
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-aeria-sky rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-aeria-navy" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Aeria Ops!</h1>
          <p className="text-gray-600 mt-2">
            Let's set up your organization to get started.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organization Name *
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-aeria-navy"
                placeholder="Your Company Name"
                required
                disabled={creating}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              This is how your team will identify your organization.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-aeria-navy"
                disabled={creating}
              >
                <option value="America/Vancouver">Pacific</option>
                <option value="America/Edmonton">Mountain</option>
                <option value="America/Winnipeg">Central</option>
                <option value="America/Toronto">Eastern</option>
                <option value="America/Halifax">Atlantic</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Units
              </label>
              <select
                value={formData.measurementSystem}
                onChange={(e) => setFormData({ ...formData, measurementSystem: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-aeria-navy focus:border-aeria-navy"
                disabled={creating}
              >
                <option value="metric">Metric (m, km)</option>
                <option value="imperial">Imperial (ft, mi)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || !formData.name.trim()}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {creating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Organization...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Create Organization
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          You'll be set as the owner and can invite team members after setup.
        </p>
      </div>
    </div>
  )
}
