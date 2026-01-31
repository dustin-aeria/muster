/**
 * ExpiryRemindersWidget.jsx
 * Consolidated widget showing all expiring items (permits, insurance, training)
 *
 * @location src/components/dashboard/ExpiryRemindersWidget.jsx
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  FileCheck,
  Shield,
  Users,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { getPermits, PERMIT_TYPES } from '../../lib/firestorePermits'
import { getInsurancePolicies, INSURANCE_TYPES, calculateInsuranceStatus } from '../../lib/firestoreInsurance'
import { getOperators } from '../../lib/firestore'
import { useOrganization } from '../../hooks/useOrganization'
import { differenceInDays, addDays, isBefore, format } from 'date-fns'

const EXPIRY_THRESHOLD_DAYS = 30

export default function ExpiryRemindersWidget({ operatorId = null }) {
  const { organizationId } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expiringItems, setExpiringItems] = useState([])

  useEffect(() => {
    if (organizationId) {
      loadExpiringItems()
    }
  }, [operatorId, organizationId])

  const loadExpiringItems = async () => {
    if (!organizationId) return
    setLoading(true)
    setError(null)

    try {
      const items = []
      const now = new Date()
      const threshold = addDays(now, EXPIRY_THRESHOLD_DAYS)

      // Load permits
      const permits = await getPermits(organizationId, operatorId ? { operatorId } : {})
      permits.forEach(permit => {
        if (permit.status === 'expiring_soon' || permit.status === 'expired') {
          const expiryDate = permit.expiryDate?.toDate?.() || (permit.expiryDate ? new Date(permit.expiryDate) : null)
          const daysUntil = expiryDate ? differenceInDays(expiryDate, now) : null

          items.push({
            id: `permit-${permit.id}`,
            type: 'permit',
            category: PERMIT_TYPES[permit.type]?.shortName || permit.type,
            name: permit.name,
            expiryDate,
            daysUntil,
            status: permit.status,
            icon: FileCheck,
            color: permit.status === 'expired' ? 'red' : 'amber',
            link: '/compliance?tab=permits'
          })
        }
      })

      // Load insurance policies
      if (organizationId) {
        const insurancePolicies = await getInsurancePolicies(organizationId)
        insurancePolicies.forEach(policy => {
          const status = calculateInsuranceStatus(policy)
          if (status === 'expiring_soon' || status === 'expired') {
            const expiryDate = policy.expiryDate?.toDate?.() || (policy.expiryDate ? new Date(policy.expiryDate) : null)
            const daysUntil = expiryDate ? differenceInDays(expiryDate, now) : null

            items.push({
              id: `insurance-${policy.id}`,
              type: 'insurance',
              category: INSURANCE_TYPES[policy.type]?.label || policy.type,
              name: policy.carrier || 'Insurance Policy',
              expiryDate,
              daysUntil,
              status,
              icon: Shield,
              color: status === 'expired' ? 'red' : 'amber',
              link: '/insurance'
            })
          }
        })
      }

      // Load operator certifications
      const operators = await getOperators(organizationId)
      operators.forEach(op => {
        const certs = op.certifications || []
        certs.forEach(cert => {
          if (!cert.expiryDate) return

          const expiryDate = cert.expiryDate?.toDate?.() || new Date(cert.expiryDate)
          const daysUntil = differenceInDays(expiryDate, now)

          if (daysUntil <= EXPIRY_THRESHOLD_DAYS) {
            items.push({
              id: `cert-${op.id}-${cert.type || cert.name}`,
              type: 'certification',
              category: cert.type || cert.name || 'Certification',
              name: `${op.firstName} ${op.lastName}`,
              expiryDate,
              daysUntil,
              status: daysUntil < 0 ? 'expired' : 'expiring_soon',
              icon: Users,
              color: daysUntil < 0 ? 'red' : 'amber',
              link: '/operators'
            })
          }
        })
      })

      // Sort by urgency (expired first, then by days until expiry)
      items.sort((a, b) => {
        if (a.status === 'expired' && b.status !== 'expired') return -1
        if (a.status !== 'expired' && b.status === 'expired') return 1
        return (a.daysUntil || 999) - (b.daysUntil || 999)
      })

      setExpiringItems(items)
    } catch (err) {
      console.error('Error loading expiring items:', err)
      setError('Failed to load expiry reminders')
    } finally {
      setLoading(false)
    }
  }

  const expiredCount = expiringItems.filter(i => i.status === 'expired').length
  const expiringSoonCount = expiringItems.filter(i => i.status === 'expiring_soon').length

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-aeria-navy" />
          <h2 className="text-lg font-semibold text-gray-900">Expiry Reminders</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-aeria-navy" />
          <h2 className="text-lg font-semibold text-gray-900">Expiry Reminders</h2>
        </div>
        <div className="flex items-center gap-2 text-red-600 py-4">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    )
  }

  if (expiringItems.length === 0) {
    return (
      <div className="card border-green-200 bg-green-50">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-green-900">All Documents Current</h3>
            <p className="text-sm text-green-700 mt-1">
              No permits, insurance, or certifications expiring in the next {EXPIRY_THRESHOLD_DAYS} days.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`card ${expiredCount > 0 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className={`w-5 h-5 ${expiredCount > 0 ? 'text-red-600' : 'text-amber-600'}`} />
          <h2 className="text-lg font-semibold text-gray-900">Expiry Reminders</h2>
        </div>
        <div className="flex gap-2">
          {expiredCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-200 text-red-800 rounded-full">
              {expiredCount} expired
            </span>
          )}
          {expiringSoonCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-amber-200 text-amber-800 rounded-full">
              {expiringSoonCount} expiring soon
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {expiringItems.slice(0, 5).map(item => (
          <Link
            key={item.id}
            to={item.link}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              item.status === 'expired'
                ? 'bg-red-100 hover:bg-red-200'
                : 'bg-amber-100 hover:bg-amber-200'
            }`}
          >
            <div className={`p-1.5 rounded ${
              item.status === 'expired' ? 'bg-red-200' : 'bg-amber-200'
            }`}>
              <item.icon className={`w-4 h-4 ${
                item.status === 'expired' ? 'text-red-700' : 'text-amber-700'
              }`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${
                item.status === 'expired' ? 'text-red-900' : 'text-amber-900'
              }`}>
                {item.name}
              </p>
              <p className={`text-xs ${
                item.status === 'expired' ? 'text-red-700' : 'text-amber-700'
              }`}>
                {item.category} • {item.status === 'expired'
                  ? `Expired ${Math.abs(item.daysUntil)} days ago`
                  : `Expires in ${item.daysUntil} days`
                }
              </p>
            </div>
            <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
              item.status === 'expired' ? 'text-red-500' : 'text-amber-500'
            }`} />
          </Link>
        ))}
      </div>

      {expiringItems.length > 5 && (
        <p className={`text-xs mt-3 ${
          expiredCount > 0 ? 'text-red-700' : 'text-amber-700'
        }`}>
          +{expiringItems.length - 5} more items require attention
        </p>
      )}
    </div>
  )
}
