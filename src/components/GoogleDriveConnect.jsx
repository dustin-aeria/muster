/**
 * GoogleDriveConnect Component
 * OAuth connection UI for Google Drive integration
 *
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Cloud,
  CheckCircle,
  XCircle,
  Loader2,
  FolderOpen,
  Settings,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  getGoogleDriveStatus,
  getGoogleAuthUrl,
  disconnectGoogleDrive,
  updateGoogleDrivePreferences,
  listDriveFolders,
  getGoogleDriveTokens,
  saveGoogleDriveTokens,
} from '../lib/googleDrive'

/**
 * Folder selector component
 */
function FolderSelector({ accessToken, currentFolderId, onSelect, onClose }) {
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [parentStack, setParentStack] = useState([{ id: 'root', name: 'My Drive' }])

  const loadFolders = async (parentId) => {
    setLoading(true)
    setError(null)
    try {
      const folderList = await listDriveFolders(accessToken, parentId)
      setFolders(folderList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const currentParent = parentStack[parentStack.length - 1]
    loadFolders(currentParent.id)
  }, [parentStack])

  const navigateToFolder = (folder) => {
    setParentStack([...parentStack, { id: folder.id, name: folder.name }])
  }

  const navigateUp = () => {
    if (parentStack.length > 1) {
      setParentStack(parentStack.slice(0, -1))
    }
  }

  const currentParent = parentStack[parentStack.length - 1]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Select Default Folder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Breadcrumb */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center gap-2 text-sm overflow-x-auto">
          {parentStack.map((item, index) => (
            <span key={item.id} className="flex items-center gap-2">
              {index > 0 && <span className="text-gray-400">/</span>}
              <button
                onClick={() => setParentStack(parentStack.slice(0, index + 1))}
                className={index === parentStack.length - 1 ? 'font-medium text-gray-900' : 'text-blue-600 hover:underline'}
              >
                {item.name}
              </button>
            </span>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FolderOpen className="w-8 h-8 mx-auto mb-2" />
              <p>No folders here</p>
            </div>
          ) : (
            <div className="space-y-2">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => navigateToFolder(folder)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                    folder.id === currentFolderId ? 'bg-blue-50 border border-blue-200' : ''
                  }`}
                >
                  <FolderOpen className="w-5 h-5 text-gray-400" />
                  <span className="flex-1 truncate">{folder.name}</span>
                  {folder.id === currentFolderId && (
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => onSelect(currentParent.id, currentParent.name)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Use "{currentParent.name}"
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * GoogleDriveConnect - Main component
 */
export default function GoogleDriveConnect() {
  const { user } = useAuth()
  const { organization } = useOrganization()
  const [searchParams, setSearchParams] = useSearchParams()

  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState(null)
  const [showFolderSelector, setShowFolderSelector] = useState(false)
  const [accessToken, setAccessToken] = useState(null)

  // Load status
  useEffect(() => {
    async function loadStatus() {
      if (!user?.uid) return

      setLoading(true)
      try {
        const driveStatus = await getGoogleDriveStatus(user.uid)
        setStatus(driveStatus)

        if (driveStatus.connected) {
          const tokens = await getGoogleDriveTokens(user.uid)
          setAccessToken(tokens?.accessToken)
        }
      } catch (err) {
        console.error('Error loading Drive status:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStatus()
  }, [user?.uid])

  // Handle OAuth callback
  useEffect(() => {
    async function handleCallback() {
      const code = searchParams.get('code')
      const oauthError = searchParams.get('error')

      if (oauthError) {
        setError(`Google authentication failed: ${oauthError}`)
        setSearchParams({})
        return
      }

      if (code && user?.uid && organization?.id) {
        setConnecting(true)
        setError(null)

        try {
          // In production, exchange code server-side
          // For now, show instructions
          setError(
            'OAuth callback received. To complete setup, implement a server-side ' +
            'function to exchange the authorization code for tokens.'
          )

          // Mock successful connection for development
          // Remove this in production
          /*
          await saveGoogleDriveTokens(user.uid, organization.id, {
            access_token: 'mock_token',
            refresh_token: 'mock_refresh',
            expires_in: 3600,
            email: 'user@example.com',
          })
          setStatus({
            connected: true,
            email: 'user@example.com',
            defaultFolder: null,
            autoUpload: false,
          })
          */
        } catch (err) {
          setError(err.message)
        } finally {
          setConnecting(false)
          setSearchParams({})
        }
      }
    }

    handleCallback()
  }, [searchParams, user?.uid, organization?.id])

  const handleConnect = () => {
    try {
      const state = btoa(JSON.stringify({
        userId: user.uid,
        timestamp: Date.now(),
      }))
      const authUrl = getGoogleAuthUrl(state)
      window.location.href = authUrl
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDisconnect = async () => {
    if (!window.confirm('Are you sure you want to disconnect Google Drive?')) return

    setDisconnecting(true)
    try {
      await disconnectGoogleDrive(user.uid)
      setStatus({ connected: false })
      setAccessToken(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setDisconnecting(false)
    }
  }

  const handleToggleAutoUpload = async () => {
    try {
      const newValue = !status.autoUpload
      await updateGoogleDrivePreferences(user.uid, { autoUpload: newValue })
      setStatus({ ...status, autoUpload: newValue })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSelectFolder = async (folderId, folderName) => {
    try {
      await updateGoogleDrivePreferences(user.uid, {
        defaultFolderId: folderId === 'root' ? null : folderId,
        defaultFolderName: folderId === 'root' ? null : folderName,
      })
      setStatus({
        ...status,
        defaultFolderId: folderId === 'root' ? null : folderId,
        defaultFolder: folderId === 'root' ? null : folderName,
      })
      setShowFolderSelector(false)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <span className="text-gray-600">Loading Google Drive status...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
          <Cloud className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Google Drive</h3>
          <p className="text-sm text-gray-500">
            Automatically upload form PDFs to your Google Drive
          </p>
        </div>
        {status?.connected ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400">
            <XCircle className="w-5 h-5" />
            <span className="text-sm">Not connected</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-sm text-red-600 hover:text-red-800 mt-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-6 py-4">
        {status?.connected ? (
          <div className="space-y-4">
            {/* Account info */}
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-gray-500">Connected account</div>
                <div className="font-medium text-gray-900">
                  {status.email || 'Google Account'}
                </div>
              </div>
              <a
                href="https://drive.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                Open Drive
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Default folder */}
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <div className="text-sm text-gray-500">Default upload folder</div>
                <div className="font-medium text-gray-900">
                  {status.defaultFolder || 'Root folder'}
                </div>
              </div>
              <button
                onClick={() => setShowFolderSelector(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <FolderOpen className="w-4 h-4" />
                Change
              </button>
            </div>

            {/* Auto-upload toggle */}
            <div className="flex items-center justify-between py-2 border-t border-gray-100">
              <div>
                <div className="text-sm font-medium text-gray-900">Auto-upload forms</div>
                <div className="text-sm text-gray-500">
                  Automatically upload form PDFs when submitted
                </div>
              </div>
              <button
                onClick={handleToggleAutoUpload}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  status.autoUpload ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    status.autoUpload ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Disconnect */}
            <div className="pt-4 border-t border-gray-100">
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                {disconnecting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Disconnect Google Drive
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Connect your Google Drive to automatically save form PDFs
            </p>
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {connecting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Cloud className="w-5 h-5" />
              )}
              Connect Google Drive
            </button>
          </div>
        )}
      </div>

      {/* Folder selector modal */}
      {showFolderSelector && accessToken && (
        <FolderSelector
          accessToken={accessToken}
          currentFolderId={status.defaultFolderId}
          onSelect={handleSelectFolder}
          onClose={() => setShowFolderSelector(false)}
        />
      )}
    </div>
  )
}
