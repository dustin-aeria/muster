/**
 * PolicyAcknowledgment.jsx
 * Modal component for acknowledging/signing policies
 *
 * Features:
 * - Checkbox acknowledgment
 * - Typed signature
 * - Drawn signature (canvas)
 * - Records timestamp and user info
 *
 * @location src/components/policies/PolicyAcknowledgment.jsx
 */

import { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  X,
  Check,
  PenTool,
  Type,
  CheckSquare,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react'
import { createAcknowledgment, checkAcknowledgmentStatus } from '../../lib/firestorePolicies'
import { useAuth } from '../../contexts/AuthContext'

/**
 * Signature pad component for drawn signatures
 */
function SignaturePad({ onSignatureChange, disabled }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  const startDrawing = (e) => {
    if (disabled) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing || disabled) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext('2d')

    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
    setHasSignature(true)
  }

  const stopDrawing = () => {
    if (isDrawing && hasSignature) {
      const canvas = canvasRef.current
      const dataUrl = canvas.toDataURL('image/png')
      onSignatureChange(dataUrl)
    }
    setIsDrawing(false)
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onSignatureChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className={`w-full border-2 border-dashed rounded-lg cursor-crosshair ${
            disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white border-gray-300'
          }`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          role="img"
          aria-label="Signature pad - draw your signature using mouse or touch"
          tabIndex={disabled ? -1 : 0}
        />
        {!hasSignature && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-400 text-sm">Sign here</p>
          </div>
        )}
      </div>
      {hasSignature && (
        <button
          type="button"
          onClick={clearSignature}
          disabled={disabled}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear signature
        </button>
      )}
    </div>
  )
}

SignaturePad.propTypes = {
  onSignatureChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

/**
 * Main PolicyAcknowledgment component
 */
export default function PolicyAcknowledgment({ policy, isOpen, onClose, onAcknowledged }) {
  const { user, userProfile } = useAuth()

  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [alreadyAcknowledged, setAlreadyAcknowledged] = useState(null)

  // Form state
  const [acknowledged, setAcknowledged] = useState(false)
  const [typedName, setTypedName] = useState('')
  const [drawnSignature, setDrawnSignature] = useState(null)

  // Determine signature type from policy settings
  const signatureType = policy?.acknowledgmentSettings?.signatureType || 'checkbox'
  const signatureRequired = policy?.acknowledgmentSettings?.signatureRequired || false

  // Check existing acknowledgment on mount
  useEffect(() => {
    if (isOpen && policy?.id && user?.uid) {
      checkExisting()
    }
  }, [isOpen, policy?.id, user?.uid])

  const checkExisting = async () => {
    try {
      setChecking(true)
      const existing = await checkAcknowledgmentStatus(policy.id, policy.version, user.uid)
      setAlreadyAcknowledged(existing)
    } catch {
      // Intentionally silent - no existing acknowledgment means user can proceed to acknowledge
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!acknowledged) {
      setError('Please acknowledge that you have read and understood the policy')
      return
    }

    if (signatureRequired || signatureType === 'typed') {
      if (signatureType === 'typed' && !typedName.trim()) {
        setError('Please type your name to sign')
        return
      }
      if (signatureType === 'drawn' && !drawnSignature) {
        setError('Please provide your signature')
        return
      }
    }

    try {
      setLoading(true)

      const acknowledgmentData = {
        policyId: policy.id,
        policyVersion: policy.version,
        userId: user.uid,
        userName: userProfile?.displayName || user.email || 'Unknown User',
        userRole: userProfile?.role || 'operator',
        signatureType,
        signatureData: signatureType === 'typed' ? typedName : signatureType === 'drawn' ? drawnSignature : null
      }

      await createAcknowledgment(acknowledgmentData)
      onAcknowledged?.()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to submit acknowledgment')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Policy Acknowledgment
                </h2>
                <p className="text-sm text-gray-500">
                  {policy.number} - {policy.title}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {checking ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : alreadyAcknowledged ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Already Acknowledged
              </h3>
              <p className="text-gray-500 mb-4">
                You acknowledged this policy version on{' '}
                {alreadyAcknowledged.acknowledgedAt?.toDate?.()
                  ? alreadyAcknowledged.acknowledgedAt.toDate().toLocaleDateString()
                  : 'a previous date'}
              </p>
              <button onClick={onClose} className="btn-primary">
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Policy info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Version</p>
                    <p className="font-medium">{policy.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Effective Date</p>
                    <p className="font-medium">
                      {new Date(policy.effectiveDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Acknowledgment statement */}
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  By acknowledging this policy, you confirm that you have:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Read and understood the policy in its entirety</li>
                  <li>Had the opportunity to ask questions about its content</li>
                  <li>Agree to comply with its requirements</li>
                </ul>
              </div>

              {/* Checkbox acknowledgment */}
              <label className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="mt-0.5 w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-sm text-blue-900">
                  I acknowledge that I have read, understood, and agree to comply with{' '}
                  <strong>{policy.title}</strong> (Version {policy.version})
                </span>
              </label>

              {/* Signature section */}
              {(signatureRequired || signatureType !== 'checkbox') && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    {signatureType === 'typed' ? (
                      <Type className="w-4 h-4" />
                    ) : signatureType === 'drawn' ? (
                      <PenTool className="w-4 h-4" />
                    ) : (
                      <CheckSquare className="w-4 h-4" />
                    )}
                    Signature
                  </h3>

                  {signatureType === 'typed' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">
                        Type your full name to sign
                      </label>
                      <input
                        type="text"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                        placeholder="Your full legal name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                      />
                    </div>
                  )}

                  {signatureType === 'drawn' && (
                    <SignaturePad
                      onSignatureChange={setDrawnSignature}
                      disabled={loading}
                    />
                  )}
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer */}
        {!checking && !alreadyAcknowledged && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading || !acknowledged}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {loading ? 'Submitting...' : 'Submit Acknowledgment'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

PolicyAcknowledgment.propTypes = {
  policy: PropTypes.object.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAcknowledged: PropTypes.func
}
