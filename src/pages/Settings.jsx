/**
 * Settings.jsx
 * Account, Company, and Branding Settings with save functionality
 *
 * @location src/pages/Settings.jsx
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import { usePermissions } from '../hooks/usePermissions'
import { User, Building, Shield, Bell, Palette, Check, Loader2, Database, AlertCircle, CheckCircle2, Phone, Users, Plug, Eye, EyeOff } from 'lucide-react'
import { updateOperator } from '../lib/firestore'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { updatePassword, updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../lib/firebase'
import BrandingSettings from '../components/BrandingSettings'
import EmergencyContactsManager from '../components/settings/EmergencyContactsManager'
import OrganizationSettings from './settings/OrganizationSettings'
import TeamMembers from './settings/TeamMembers'
import { RequireAdmin, AccessDeniedMessage } from '../components/PermissionGuard'
import { logger } from '../lib/logger'
import { autoElevateToAdmin } from '../lib/adminUtils'
import { getClaudeApiKey, saveClaudeApiKey } from '../lib/claudeService'

export default function Settings() {
  const { userProfile, user } = useAuth()
  const { organizationId } = useOrganization()
  const { canManageTeam, canManageSettings, isAdmin } = usePermissions()
  const [activeTab, setActiveTab] = useState('profile')

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    certifications: ''
  })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  // Company state
  const [companyData, setCompanyData] = useState({
    name: '',
    operatorNumber: '',
    email: '',
    phone: '',
    address: '',
    regulatoryAuthority: 'tc' // Default to Transport Canada
  })
  const [companySaving, setCompanySaving] = useState(false)
  const [companySaved, setCompanySaved] = useState(false)

  // Notification state
  const [notificationData, setNotificationData] = useState({
    projectUpdates: true,
    approvalRequests: true,
    maintenanceReminders: true,
    weeklySummary: false
  })
  const [notificationSaving, setNotificationSaving] = useState(false)
  const [notificationSaved, setNotificationSaved] = useState(false)

  // Security state
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  })
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // Email change state
  const [emailData, setEmailData] = useState({
    newEmail: '',
    password: ''
  })
  const [emailSaving, setEmailSaving] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [emailSuccess, setEmailSuccess] = useState(false)
  const [showEmailChange, setShowEmailChange] = useState(false)

  // Permission elevation state
  const [elevating, setElevating] = useState(false)
  const [elevateResult, setElevateResult] = useState(null)

  // Claude API key state
  const [claudeApiKey, setClaudeApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeySaving, setApiKeySaving] = useState(false)
  const [apiKeySaved, setApiKeySaved] = useState(false)
  const [apiKeyLoading, setApiKeyLoading] = useState(true)

  // Handle elevate to admin
  const handleElevateToAdmin = async () => {
    setElevating(true)
    setElevateResult(null)
    try {
      const result = await autoElevateToAdmin(auth)
      setElevateResult(result)
      if (result.success) {
        // Reload page to refresh permissions
        setTimeout(() => window.location.reload(), 1500)
      }
    } catch (err) {
      setElevateResult({ success: false, error: err.message })
    } finally {
      setElevating(false)
    }
  }

  // Load profile data
  useEffect(() => {
    if (userProfile) {
      setProfileData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        phone: userProfile.phone || '',
        certifications: userProfile.certifications || ''
      })
    }
  }, [userProfile])

  // Load company data
  useEffect(() => {
    loadCompanyData()
  }, [])

  const loadCompanyData = async () => {
    try {
      const docRef = doc(db, 'settings', 'company')
      const snapshot = await getDoc(docRef)
      if (snapshot.exists()) {
        setCompanyData(prev => ({ ...prev, ...snapshot.data() }))
      }
    } catch {
      // Intentionally silent - company settings may not exist yet, use defaults
    }
  }

  // Load notification preferences
  useEffect(() => {
    if (user) {
      loadNotificationPrefs()
    }
  }, [user])

  // Load Claude API key
  useEffect(() => {
    if (user) {
      loadClaudeApiKey()
    }
  }, [user])

  const loadClaudeApiKey = async () => {
    setApiKeyLoading(true)
    try {
      const key = await getClaudeApiKey(user.uid)
      if (key) {
        setClaudeApiKey(key)
      }
    } catch (error) {
      console.error('Error loading Claude API key:', error)
    } finally {
      setApiKeyLoading(false)
    }
  }

  const handleSaveClaudeApiKey = async () => {
    setApiKeySaving(true)
    setApiKeySaved(false)
    try {
      await saveClaudeApiKey(user.uid, claudeApiKey)
      setApiKeySaved(true)
      setTimeout(() => setApiKeySaved(false), 3000)
    } catch (err) {
      logger.error('Failed to save Claude API key:', err)
      alert('Failed to save API key. Please try again.')
    } finally {
      setApiKeySaving(false)
    }
  }

  const loadNotificationPrefs = async () => {
    try {
      const docRef = doc(db, 'userPreferences', user.uid)
      const snapshot = await getDoc(docRef)
      if (snapshot.exists() && snapshot.data().notifications) {
        setNotificationData(prev => ({ ...prev, ...snapshot.data().notifications }))
      }
    } catch {
      // Intentionally silent - notification prefs may not exist yet, use defaults
    }
  }

  // Save handlers
  const handleSaveProfile = async () => {
    setProfileSaving(true)
    setProfileSaved(false)
    try {
      await updateOperator(userProfile.id, profileData)
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 3000)
    } catch (err) {
      logger.error('Failed to save profile:', err)
      alert('Failed to save profile. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleSaveCompany = async (data = null) => {
    setCompanySaving(true)
    setCompanySaved(false)
    try {
      const docRef = doc(db, 'settings', 'company')
      const dataToSave = data || companyData
      await setDoc(docRef, dataToSave, { merge: true })
      setCompanySaved(true)
      setTimeout(() => setCompanySaved(false), 3000)
    } catch (err) {
      logger.error('Failed to save company settings:', err)
      alert('Failed to save company settings. Please try again.')
    } finally {
      setCompanySaving(false)
    }
  }

  const handleSaveNotifications = async () => {
    setNotificationSaving(true)
    setNotificationSaved(false)
    try {
      const docRef = doc(db, 'userPreferences', user.uid)
      await setDoc(docRef, { notifications: notificationData }, { merge: true })
      setNotificationSaved(true)
      setTimeout(() => setNotificationSaved(false), 3000)
    } catch (err) {
      logger.error('Failed to save notification preferences:', err)
      alert('Failed to save notification preferences. Please try again.')
    } finally {
      setNotificationSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordData.new.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    setPasswordSaving(true)
    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, passwordData.current)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update password
      await updatePassword(auth.currentUser, passwordData.new)

      setPasswordSuccess(true)
      setPasswordData({ current: '', new: '', confirm: '' })
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setPasswordError('Current password is incorrect')
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('Password is too weak. Please use a stronger password.')
      } else if (err.code === 'auth/requires-recent-login') {
        setPasswordError('Please log out and log back in before changing your password.')
      } else {
        setPasswordError('Failed to update password. Please try again.')
      }
    } finally {
      setPasswordSaving(false)
    }
  }

  const handleUpdateEmail = async () => {
    setEmailError('')
    setEmailSuccess(false)

    if (!emailData.newEmail || !emailData.newEmail.includes('@')) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (!emailData.password) {
      setEmailError('Please enter your current password to confirm')
      return
    }

    setEmailSaving(true)
    try {
      // Re-authenticate user first
      const credential = EmailAuthProvider.credential(user.email, emailData.password)
      await reauthenticateWithCredential(auth.currentUser, credential)

      // Update email in Firebase Auth
      await updateEmail(auth.currentUser, emailData.newEmail)

      // Also update email in the operator profile
      if (userProfile?.id) {
        await updateOperator(userProfile.id, { email: emailData.newEmail })
      }

      setEmailSuccess(true)
      setEmailData({ newEmail: '', password: '' })
      setShowEmailChange(false)
      setTimeout(() => setEmailSuccess(false), 5000)
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setEmailError('Password is incorrect')
      } else if (err.code === 'auth/email-already-in-use') {
        setEmailError('This email is already in use by another account')
      } else if (err.code === 'auth/invalid-email') {
        setEmailError('Please enter a valid email address')
      } else if (err.code === 'auth/requires-recent-login') {
        setEmailError('Please log out and log back in before changing your email')
      } else {
        setEmailError('Failed to update email. Please try again.')
        logger.error('Email update error:', err)
      }
    } finally {
      setEmailSaving(false)
    }
  }

  const allTabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Your personal information' },
    { id: 'organization', label: 'Organization', icon: Building, description: 'Company & organization settings', requiresAdmin: true },
    { id: 'team', label: 'Team', icon: Users, description: 'Team members & roles', requiresAdmin: true },
    { id: 'emergency', label: 'Emergency', icon: Phone, description: 'Emergency contacts', requiresSettings: true },
    { id: 'branding', label: 'Branding', icon: Palette, description: 'PDF export branding', requiresSettings: true },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
    { id: 'integrations', label: 'Integrations', icon: Plug, description: 'AI & external services' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & authentication' },
    { id: 'data', label: 'Data', icon: Database, description: 'Data management', requiresAdmin: true }
  ]

  // Filter tabs based on permissions
  const tabs = allTabs.filter(tab => {
    if (tab.requiresAdmin && !isAdmin) return false
    if (tab.requiresSettings && !canManageSettings) return false
    return true
  })

  const SaveButton = ({ saving, saved, onClick, label = 'Save Changes' }) => (
    <button
      onClick={onClick}
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
        label
      )}
    </button>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-4">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-aeria-navy text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="grid gap-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <User className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile</h2>
                <p className="text-sm text-gray-500">Your personal information</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">First Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input
                    type="text"
                    className="input"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                {!showEmailChange ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900">
                      {user?.email || 'No email set'}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmailChange(true)}
                      className="btn-secondary text-sm"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">
                      Current email: <strong>{user?.email}</strong>
                    </p>
                    <div>
                      <label className="label text-sm">New Email</label>
                      <input
                        type="email"
                        className="input"
                        value={emailData.newEmail}
                        onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                        placeholder="Enter new email address"
                      />
                    </div>
                    <div>
                      <label className="label text-sm">Confirm with Password</label>
                      <input
                        type="password"
                        className="input"
                        value={emailData.password}
                        onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                        placeholder="Enter your current password"
                      />
                    </div>
                    {emailError && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {emailError}
                      </p>
                    )}
                    {emailSuccess && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        Email updated successfully!
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleUpdateEmail}
                        disabled={emailSaving}
                        className="btn-primary text-sm"
                      >
                        {emailSaving ? 'Updating...' : 'Update Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEmailChange(false)
                          setEmailData({ newEmail: '', password: '' })
                          setEmailError('')
                        }}
                        className="btn-secondary text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="tel"
                  className="input"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="label">Certifications</label>
                <input
                  type="text"
                  className="input"
                  value={profileData.certifications}
                  onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
                  placeholder="Advanced RPAS, etc."
                />
              </div>
              <div className="pt-4">
                <SaveButton
                  saving={profileSaving}
                  saved={profileSaved}
                  onClick={handleSaveProfile}
                />
              </div>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <RequireAdmin fallback={<AccessDeniedMessage message="Only admins can manage organization settings." />}>
            <OrganizationSettings />
          </RequireAdmin>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <RequireAdmin fallback={<AccessDeniedMessage message="Only admins can manage team members." />}>
            <TeamMembers />
          </RequireAdmin>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'emergency' && (
          <div className="card">
            <EmergencyContactsManager />
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <BrandingSettings />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <Bell className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">Email and alert preferences</p>
              </div>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Project Updates</p>
                  <p className="text-sm text-gray-500">Get notified when projects are updated</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationData.projectUpdates}
                  onChange={(e) => setNotificationData({ ...notificationData, projectUpdates: e.target.checked })}
                  className="w-5 h-5 text-aeria-navy rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Approval Requests</p>
                  <p className="text-sm text-gray-500">Get notified when approval is needed</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationData.approvalRequests}
                  onChange={(e) => setNotificationData({ ...notificationData, approvalRequests: e.target.checked })}
                  className="w-5 h-5 text-aeria-navy rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Reminders</p>
                  <p className="text-sm text-gray-500">Get reminders for aircraft maintenance</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationData.maintenanceReminders}
                  onChange={(e) => setNotificationData({ ...notificationData, maintenanceReminders: e.target.checked })}
                  className="w-5 h-5 text-aeria-navy rounded"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Weekly Summary</p>
                  <p className="text-sm text-gray-500">Receive weekly activity summary</p>
                </div>
                <input
                  type="checkbox"
                  checked={notificationData.weeklySummary}
                  onChange={(e) => setNotificationData({ ...notificationData, weeklySummary: e.target.checked })}
                  className="w-5 h-5 text-aeria-navy rounded"
                />
              </label>
              <div className="pt-4">
                <SaveButton
                  saving={notificationSaving}
                  saved={notificationSaved}
                  onClick={handleSaveNotifications}
                  label="Save Preferences"
                />
              </div>
            </div>
          </div>
        )}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <Plug className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Integrations</h2>
                <p className="text-sm text-gray-500">AI assistants and external services</p>
              </div>
            </div>
            <div className="space-y-6">
              {/* Claude AI Section */}
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-purple-900">Claude AI Assistant</h3>
                    <p className="text-sm text-purple-700 mt-1">
                      Connect your Anthropic API key to enable AI-powered study assistance in Q-Cards.
                      Ask questions, get explanations, and explore examples.
                    </p>
                    <a
                      href="https://console.anthropic.com/settings/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-600 hover:text-purple-800 underline mt-2 inline-block"
                    >
                      Get your API key from Anthropic Console
                    </a>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Claude API Key</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showApiKey ? 'text' : 'password'}
                        className="input pr-10 font-mono text-sm"
                        value={claudeApiKey}
                        onChange={(e) => setClaudeApiKey(e.target.value)}
                        placeholder="sk-ant-api03-..."
                        disabled={apiKeyLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <SaveButton
                      saving={apiKeySaving}
                      saved={apiKeySaved}
                      onClick={handleSaveClaudeApiKey}
                      label="Save Key"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Your API key is stored securely and only used for Q-Cards AI assistance.
                  </p>
                </div>
              </div>

              {/* Future Integrations Placeholder */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-700">More integrations coming soon</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Weather services, flight planning APIs, and more.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <Shield className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Password and authentication</p>
              </div>
            </div>
            <div className="space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Password updated successfully!
                </div>
              )}
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter current password"
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                />
              </div>
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Enter new password"
                  value={passwordData.new}
                  onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Confirm new password"
                  value={passwordData.confirm}
                  onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                />
              </div>
              <div className="pt-4">
                <button
                  onClick={handleUpdatePassword}
                  disabled={passwordSaving || !passwordData.current || !passwordData.new || !passwordData.confirm}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {passwordSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Add an extra layer of security to your account
                </p>
                <button className="btn-secondary">Enable 2FA</button>
              </div>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <Database className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Data Management</h2>
                <p className="text-sm text-gray-500">Database and migration tools</p>
              </div>
            </div>
            <div className="space-y-6">
              {/* Permission Fix Section */}
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-medium text-purple-900 mb-2">Fix Permissions</h3>
                <p className="text-sm text-purple-700 mb-4">
                  If you're the application admin and seeing "Contact administrator" messages,
                  click below to elevate your account to Admin role with full access.
                </p>
                <button
                  onClick={handleElevateToAdmin}
                  disabled={elevating}
                  className="btn-primary inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
                >
                  {elevating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating permissions...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      Make Me Admin
                    </>
                  )}
                </button>
                {elevateResult && (
                  <div className={`mt-3 p-3 rounded-lg ${
                    elevateResult.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`text-sm ${
                      elevateResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {elevateResult.success
                        ? elevateResult.message || 'Success! Reloading page...'
                        : elevateResult.error || 'Failed to update permissions'}
                    </p>
                  </div>
                )}
              </div>

              {/* Data Info Section */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Data Storage</h3>
                <p className="text-sm text-blue-700">
                  Your data is securely stored in Google Firebase Firestore with automatic backups.
                  All file attachments are stored in Firebase Cloud Storage.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
