/**
 * PolicyUpdateNotification.jsx
 * Component to display when master policy updates are available
 *
 * Features:
 * - Shows badge when updates are available
 * - Preview changes before applying
 * - Option to update or keep current version
 * - Handles customized policies differently
 *
 * @location src/components/policies/PolicyUpdateNotification.jsx
 */

import { useState, useEffect } from 'react'
import {
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ArrowRight,
  Edit,
  Loader2,
  Info
} from 'lucide-react'
import { checkForMasterUpdates, updateFromMaster } from '../../lib/firestorePolicies'
import { getMasterPolicy } from '../../lib/firestoreMasterPolicies'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Badge component showing number of available updates
 */
export function UpdateBadge({ count, onClick }) {
  if (count === 0) return null

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
    >
      <RefreshCw className="w-4 h-4" />
      <span className="font-medium">{count} Update{count > 1 ? 's' : ''} Available</span>
    </button>
  )
}

/**
 * Single policy update item
 */
function UpdateItem({ update, onApply, onDismiss, applying }) {
  const [expanded, setExpanded] = useState(false)
  const [masterPreview, setMasterPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)

  const loadPreview = async () => {
    if (masterPreview || loadingPreview) return

    setLoadingPreview(true)
    try {
      const master = await getMasterPolicy(update.masterPolicyId)
      setMasterPreview(master)
    } catch (err) {
      console.error('Error loading preview:', err)
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleExpand = () => {
    if (!expanded) {
      loadPreview()
    }
    setExpanded(!expanded)
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div
        onClick={handleExpand}
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-700 rounded-lg font-bold text-sm">
            {update.operatorPolicyNumber}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{update.operatorPolicyTitle}</h4>
            <p className="text-sm text-gray-500">
              v{update.currentSourceVersion} <ArrowRight className="w-3 h-3 inline mx-1" /> v{update.masterVersion}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {update.isCustomized && (
            <span className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
              <Edit className="w-3 h-3" />
              Customized
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="p-4 border-t border-gray-200 space-y-4">
          {loadingPreview ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : masterPreview ? (
            <>
              {/* Preview section */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-medium text-blue-900 mb-2">Updated Content Preview</h5>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Title:</strong> {masterPreview.title}
                </p>
                <p className="text-sm text-blue-800">
                  <strong>Description:</strong> {masterPreview.description}
                </p>
              </div>

              {/* Warning for customized policies */}
              {update.isCustomized && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium">This policy has been customized</p>
                    <p>
                      Applying this update will replace your customizations with the master content.
                      Consider reviewing changes carefully before updating.
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => onDismiss(update.operatorPolicyId)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Keep Current
                </button>
                <button
                  onClick={() => onApply(update.operatorPolicyId, !update.isCustomized)}
                  disabled={applying}
                  className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      Apply Update
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-4">Unable to load preview</p>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Full updates panel showing all available updates
 */
export function PolicyUpdatesPanel({ onClose }) {
  const { user } = useAuth()
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(null)
  const [dismissed, setDismissed] = useState(new Set())

  useEffect(() => {
    loadUpdates()
  }, [])

  const loadUpdates = async () => {
    setLoading(true)
    try {
      const data = await checkForMasterUpdates()
      setUpdates(data)
    } catch (err) {
      console.error('Error loading updates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async (policyId, preserveCustomizations) => {
    setApplying(policyId)
    try {
      const result = await updateFromMaster(policyId, preserveCustomizations, user?.uid)
      if (result.success) {
        // Remove from updates list
        setUpdates(prev => prev.filter(u => u.operatorPolicyId !== policyId))
      } else {
        console.error('Update failed:', result.error)
      }
    } catch (err) {
      console.error('Error applying update:', err)
    } finally {
      setApplying(null)
    }
  }

  const handleDismiss = (policyId) => {
    setDismissed(prev => new Set([...prev, policyId]))
  }

  const visibleUpdates = updates.filter(u => !dismissed.has(u.operatorPolicyId))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Policy Updates Available</h2>
            <p className="text-sm text-gray-500 mt-1">
              Master policies have been updated. Review and apply changes.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : visibleUpdates.length === 0 ? (
            <div className="text-center py-12">
              <Check className="w-12 h-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All Up to Date</h3>
              <p className="text-gray-500">Your policies are in sync with the latest master versions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info banner */}
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">About Policy Updates</p>
                  <p>
                    Platform administrators have updated the master policies.
                    You can apply these updates to keep your policies current,
                    or keep your existing versions if you've made customizations.
                  </p>
                </div>
              </div>

              {/* Update items */}
              {visibleUpdates.map((update) => (
                <UpdateItem
                  key={update.operatorPolicyId}
                  update={update}
                  onApply={handleApply}
                  onDismiss={handleDismiss}
                  applying={applying === update.operatorPolicyId}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {visibleUpdates.length} update{visibleUpdates.length !== 1 ? 's' : ''} available
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Hook to get update count for badge display
 */
export function usePolicyUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkForMasterUpdates()
      .then(setUpdates)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return {
    count: updates.length,
    updates,
    loading,
    refresh: async () => {
      setLoading(true)
      try {
        const data = await checkForMasterUpdates()
        setUpdates(data)
      } finally {
        setLoading(false)
      }
    }
  }
}

export default PolicyUpdatesPanel
