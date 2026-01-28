/**
 * Settings.jsx
 * Account, Company, and Branding Settings with save functionality
 * 
 * @location src/pages/Settings.jsx
 * @action REPLACE
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Building, Shield, Bell, Palette, Check, Loader2, Database, AlertCircle, CheckCircle2, Globe, Phone, FolderOpen } from 'lucide-react'
import { updateOperator } from '../lib/firestore'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { auth } from '../lib/firebase'
import BrandingSettings from '../components/BrandingSettings'
import InsuranceManager from '../components/insurance/InsuranceManager'
import RegulatoryFrameworkSelector from '../components/settings/RegulatoryFrameworkSelector'
import EmergencyContactsManager from '../components/settings/EmergencyContactsManager'
import CategoryManager from '../components/policies/CategoryManager'
import { seedPolicies, isPoliciesSeeded } from '../lib/seedPolicies'
import { logger } from '../lib/logger'

export default function Settings() {
  const { userProfile, user } = useAuth()
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

  // Data migration state
  const [policiesSeeded, setPoliciesSeeded] = useState(null)
  const [seedingPolicies, setSeedingPolicies] = useState(false)
  const [seedProgress, setSeedProgress] = useState({ current: 0, total: 0 })
  const [seedResult, setSeedResult] = useState(null)

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

  // Check if policies are seeded
  useEffect(() => {
    checkPoliciesSeeded()
  }, [])

  const checkPoliciesSeeded = async () => {
    const seeded = await isPoliciesSeeded()
    setPoliciesSeeded(seeded)
  }

  const handleSeedPolicies = async () => {
    setSeedingPolicies(true)
    setSeedResult(null)

    try {
      const result = await seedPolicies((current, total) => {
        setSeedProgress({ current, total })
      })
      setSeedResult(result)
      setPoliciesSeeded(true)
    } catch (err) {
      setSeedResult({ success: 0, failed: 1, errors: [err.message] })
    } finally {
      setSeedingPolicies(false)
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

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Your personal information' },
    { id: 'company', label: 'Company', icon: Building, description: 'Organization settings' },
    { id: 'regulatory', label: 'Regulatory', icon: Globe, description: 'Aviation authority & regulations' },
    { id: 'emergency', label: 'Emergency', icon: Phone, description: 'Emergency contacts' },
    { id: 'policies', label: 'Policy Categories', icon: FolderOpen, description: 'Manage policy categories' },
    { id: 'insurance', label: 'Insurance', icon: Shield, description: 'Insurance policies & documents' },
    { id: 'branding', label: 'Branding', icon: Palette, description: 'PDF export branding' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & authentication' },
    { id: 'data', label: 'Data', icon: Database, description: 'Data management' }
  ]

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
                <input 
                  type="email" 
                  className="input bg-gray-50" 
                  value={userProfile?.email || ''} 
                  disabled 
                />
                <p className="text-xs text-gray-500 mt-1">Contact administrator to change email</p>
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

        {/* Company Tab */}
        {activeTab === 'company' && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-aeria-sky rounded-lg">
                <Building className="w-5 h-5 text-aeria-navy" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Company</h2>
                <p className="text-sm text-gray-500">Organization settings</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Company Name</label>
                <input 
                  type="text" 
                  className="input" 
                  value={companyData.name}
                  onChange={(e) => setCompanyData({ ...companyData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Transport Canada Operator Number</label>
                <input 
                  type="text" 
                  className="input" 
                  value={companyData.operatorNumber}
                  onChange={(e) => setCompanyData({ ...companyData, operatorNumber: e.target.value })}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Primary Contact Email</label>
                  <input 
                    type="email" 
                    className="input" 
                    value={companyData.email}
                    onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Primary Contact Phone</label>
                  <input 
                    type="tel" 
                    className="input" 
                    value={companyData.phone}
                    onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <textarea 
                  className="input min-h-[80px]" 
                  value={companyData.address}
                  onChange={(e) => setCompanyData({ ...companyData, address: e.target.value })}
                  placeholder="Street Address, City, Province, Postal Code"
                />
              </div>
              <div className="pt-4">
                <SaveButton 
                  saving={companySaving} 
                  saved={companySaved} 
                  onClick={handleSaveCompany} 
                />
              </div>
            </div>
          </div>
        )}

        {/* Insurance Tab */}
        {activeTab === 'insurance' && (
          <div className="card">
            <InsuranceManager operatorId={user?.uid} />
          </div>
        )}

        {/* Regulatory Tab */}
        {activeTab === 'regulatory' && (
          <div className="card">
            <RegulatoryFrameworkSelector
              value={companyData.regulatoryAuthority}
              onChange={(value) => {
                setCompanyData({ ...companyData, regulatoryAuthority: value })
                // Auto-save regulatory selection
                handleSaveCompany({ ...companyData, regulatoryAuthority: value })
              }}
              showDetails={true}
            />
          </div>
        )}

        {/* Emergency Contacts Tab */}
        {activeTab === 'emergency' && (
          <div className="card">
            <EmergencyContactsManager />
          </div>
        )}

        {/* Policy Categories Tab */}
        {activeTab === 'policies' && (
          <div className="card">
            <CategoryManager />
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
              {/* Policy Migration Section */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Policy Library Migration</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Migrate the default 45 policies from the template into your Firestore database.
                  This allows you to customize and manage these policies.
                </p>

                {policiesSeeded === null ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Checking migration status...</span>
                  </div>
                ) : policiesSeeded ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Policies have been migrated</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Policies not yet migrated</span>
                    </div>
                    <button
                      onClick={handleSeedPolicies}
                      disabled={seedingPolicies}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      {seedingPolicies ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Migrating... ({seedProgress.current}/{seedProgress.total})
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          Migrate Policies
                        </>
                      )}
                    </button>
                  </div>
                )}

                {seedResult && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    seedResult.failed > 0
                      ? 'bg-amber-50 border border-amber-200'
                      : 'bg-green-50 border border-green-200'
                  }`}>
                    <p className={`text-sm font-medium ${
                      seedResult.failed > 0 ? 'text-amber-800' : 'text-green-800'
                    }`}>
                      Migration Complete
                    </p>
                    <p className={`text-sm mt-1 ${
                      seedResult.failed > 0 ? 'text-amber-700' : 'text-green-700'
                    }`}>
                      {seedResult.success} policies migrated successfully
                      {seedResult.failed > 0 && `, ${seedResult.failed} failed`}
                    </p>
                    {seedResult.errors?.length > 0 && (
                      <ul className="mt-2 text-xs text-amber-600">
                        {seedResult.errors.map((err, i) => (
                          <li key={i}>• {err}</li>
                        ))}
                      </ul>
                    )}
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
