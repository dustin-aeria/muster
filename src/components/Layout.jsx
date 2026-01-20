import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  LayoutDashboard, 
  FolderKanban, 
  ClipboardList, 
  Users, 
  Plane, 
  Building2, 
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  AlertTriangle,
  Target,
  BookOpen
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Forms', href: '/forms', icon: ClipboardList },
  { name: 'Policies', href: '/policies', icon: BookOpen },
]

const safetyNavigation = [
  { name: 'Safety Dashboard', href: '/safety', icon: Shield },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'CAPAs', href: '/capas', icon: Target },
]

const libraries = [
  { name: 'Operators', href: '/operators', icon: Users },
  { name: 'Aircraft', href: '/aircraft', icon: Plane },
  { name: 'Clients', href: '/clients', icon: Building2 },
]

function Sidebar({ mobile, onClose }) {
  const { userProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [librariesOpen, setLibrariesOpen] = useState(true)
  const [safetyOpen, setSafetyOpen] = useState(true)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavItem = ({ item }) => (
    <NavLink
      to={item.href}
      onClick={mobile ? onClose : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isActive
            ? 'bg-aeria-sky text-aeria-navy'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      {item.name}
    </NavLink>
  )

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-aeria-navy rounded-lg flex items-center justify-center" aria-hidden="true">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-aeria-navy">Aeria Ops</span>
        </div>
        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main navigation">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* Safety section */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setSafetyOpen(!safetyOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            aria-expanded={safetyOpen}
            aria-controls="safety-nav"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4" aria-hidden="true" />
              Safety
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${safetyOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
          </button>
          {safetyOpen && (
            <div id="safety-nav" className="mt-1 space-y-1">
              {safetyNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Libraries section */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setLibrariesOpen(!librariesOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            aria-expanded={librariesOpen}
            aria-controls="libraries-nav"
          >
            Libraries
            <ChevronDown className={`w-4 h-4 transition-transform ${librariesOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
          </button>
          {librariesOpen && (
            <div id="libraries-nav" className="mt-1 space-y-1">
              {libraries.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-3">
        <NavLink
          to="/settings"
          onClick={mobile ? onClose : undefined}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-aeria-sky text-aeria-navy'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          Settings
        </NavLink>
        
        <div className="flex items-center gap-3 px-3 py-2 mt-1">
          <div className="w-8 h-8 bg-aeria-blue rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userProfile?.firstName?.[0] || userProfile?.email?.[0]?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userProfile?.firstName 
                ? `${userProfile.firstName} ${userProfile.lastName}`
                : userProfile?.email
              }
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 w-64 z-50 lg:hidden transform transition-transform duration-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar mobile onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:block border-r border-gray-200">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <div className="sticky top-0 z-30 flex items-center h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Open navigation menu"
            aria-expanded={sidebarOpen}
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <div className="w-7 h-7 bg-aeria-navy rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <span className="font-semibold text-aeria-navy">Aeria Ops</span>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
