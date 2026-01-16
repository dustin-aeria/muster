// ============================================
// SETTINGS PAGE
// Account, Company, and Branding Settings
// ============================================

import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Building, Shield, Bell, Palette, ChevronRight } from 'lucide-react'
import BrandingSettings from './components/BrandingSettings'

export default function Settings() {
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User, description: 'Your personal information' },
    { id: 'company', label: 'Company', icon: Building, description: 'Organization settings' },
    { id: 'branding', label: 'Branding', icon: Palette, description: 'PDF export branding' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert preferences' },
    { id: 'security', label: 'Security', icon: Shield, description: 'Password & authentication' }
  ]

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
                    defaultValue={userProfile?.firstName || ''} 
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="label">Last Name</label>
                  <input 
                    type="text" 
                    className="input" 
                    defaultValue={userProfile?.lastName || ''} 
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
                  defaultValue={userProfile?.phone || ''} 
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="label">Certifications</label>
                <input 
                  type="text" 
                  className="input" 
                  defaultValue={userProfile?.certifications || ''} 
                  placeholder="Advanced RPAS, etc."
                />
              </div>
              <div className="pt-4">
                <button className="btn btn-primary">Save Changes</button>
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
                  defaultValue="Aeria Solutions Ltd."
                />
              </div>
              <div>
                <label className="label">Transport Canada Operator Number</label>
                <input 
                  type="text" 
                  className="input" 
                  defaultValue="930355"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Primary Contact Email</label>
                  <input 
                    type="email" 
                    className="input" 
                    defaultValue="ops@aeriasolutions.ca"
                  />
                </div>
                <div>
                  <label className="label">Primary Contact Phone</label>
                  <input 
                    type="tel" 
                    className="input" 
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <textarea 
                  className="input min-h-[80px]" 
                  placeholder="Street Address, City, Province, Postal Code"
                />
              </div>
              <div className="pt-4">
                <button className="btn btn-primary">Save Changes</button>
              </div>
            </div>
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
                <input type="checkbox" defaultChecked className="w-5 h-5 text-aeria-navy rounded" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Approval Requests</p>
                  <p className="text-sm text-gray-500">Get notified when approval is needed</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-aeria-navy rounded" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Maintenance Reminders</p>
                  <p className="text-sm text-gray-500">Get reminders for aircraft maintenance</p>
                </div>
                <input type="checkbox" defaultChecked className="w-5 h-5 text-aeria-navy rounded" />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium text-gray-900">Weekly Summary</p>
                  <p className="text-sm text-gray-500">Receive weekly activity summary</p>
                </div>
                <input type="checkbox" className="w-5 h-5 text-aeria-navy rounded" />
              </label>
              <div className="pt-4">
                <button className="btn btn-primary">Save Preferences</button>
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
              <div>
                <label className="label">Current Password</label>
                <input type="password" className="input" placeholder="Enter current password" />
              </div>
              <div>
                <label className="label">New Password</label>
                <input type="password" className="input" placeholder="Enter new password" />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" className="input" placeholder="Confirm new password" />
              </div>
              <div className="pt-4">
                <button className="btn btn-primary">Update Password</button>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-6">
                <h3 className="font-medium text-gray-900 mb-3">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Add an extra layer of security to your account
                </p>
                <button className="btn btn-secondary">Enable 2FA</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
