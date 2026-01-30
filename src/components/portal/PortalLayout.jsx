/**
 * PortalLayout.jsx
 * Layout wrapper for client portal pages
 *
 * @location src/components/portal/PortalLayout.jsx
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Building2,
  LayoutDashboard,
  FolderKanban,
  FileText,
  LogOut,
  User,
  ChevronDown,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, path: '/portal/projects' },
  { id: 'documents', label: 'Documents', icon: FileText, path: '/portal/documents' }
]

export default function PortalLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { portalUser, client, logout } = usePortalAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/portal/login')
  }

  // Get branding colors (or defaults)
  const primaryColor = client?.branding?.primaryColor || '#1e3a5f'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-gray-200"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Company */}
            <div className="flex items-center gap-3">
              {client?.logo ? (
                <img
                  src={client.logo}
                  alt={client.name}
                  className="h-10 w-10 rounded-lg object-cover bg-white"
                />
              ) : (
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <div className="text-white font-semibold">
                  {client?.name || 'Client Portal'}
                </div>
                <div className="text-white/60 text-xs">
                  Powered by Aeria Ops
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path ||
                  (item.path !== '/portal' && location.pathname.startsWith(item.path))

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center gap-2">
              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden sm:block text-sm">
                    {portalUser?.name || portalUser?.email}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-3 border-b border-gray-100">
                        <div className="font-medium text-gray-900">
                          {portalUser?.name || 'Client User'}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {portalUser?.email}
                        </div>
                      </div>
                      <div className="p-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="md:hidden p-2 text-white/80 hover:text-white"
              >
                {showMobileMenu ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-4 py-2 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon
                const isActive = location.pathname === item.path ||
                  (item.path !== '/portal' && location.pathname.startsWith(item.path))

                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    onClick={() => setShowMobileMenu(false)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Building2 className="w-4 h-4" />
              <span>Powered by Aeria Ops</span>
            </div>
            <div className="text-gray-400 text-sm">
              © {new Date().getFullYear()} All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
