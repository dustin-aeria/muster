import { useState, useEffect, useCallback } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useOrganization } from '../hooks/useOrganization'
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Users,
  Plane,
  Package,
  Building2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield,
  AlertTriangle,
  Target,
  BookOpen,
  ClipboardCheck,
  FileCheck,
  UserCheck,
  GraduationCap,
  ListChecks,
  MessageSquarePlus,
  CalendarDays,
  ShieldCheck,
  Briefcase,
  Wrench,
  Clock,
  CheckSquare,
  Sparkles
} from 'lucide-react'
import FeedbackModal from './FeedbackModal'
import NotificationBell from './NotificationBell'
import CommandPalette from './CommandPalette'
import KeyboardShortcuts from './KeyboardShortcuts'
import ActiveTimerWidget from './activities/ActiveTimerWidget'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Time Tracking', href: '/time-tracking', icon: Clock },
  { name: 'Time Approval', href: '/time-approval', icon: ClipboardCheck },
  { name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { name: 'Forms', href: '/forms', icon: ClipboardList },
]

const safetyNavigation = [
  { name: 'Safety Dashboard', href: '/safety', icon: Shield },
  { name: 'Hazard Library', href: '/hazards', icon: FileCheck },
  { name: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { name: 'CAPAs', href: '/capas', icon: Target },
  { name: 'JHSC', href: '/jhsc', icon: UserCheck },
  { name: 'Inspections', href: '/inspections', icon: ListChecks },
]

const trainingNavigation = [
  { name: 'Training Records', href: '/training', icon: GraduationCap },
]

const complianceNavigation = [
  { name: 'Policies & Procedures', href: '/policies', icon: BookOpen },
  { name: 'Document Generator', href: '/document-projects', icon: Sparkles },
]

const maintenanceNavigation = [
  { name: 'Dashboard', href: '/maintenance', icon: Wrench },
  { name: 'All Items', href: '/maintenance/items', icon: Package },
  { name: 'Schedules', href: '/maintenance/schedules', icon: Settings },
]

const libraries = [
  { name: 'Operators', href: '/operators', icon: Users },
  { name: 'Fleet', href: '/aircraft', icon: Plane },
  { name: 'Equipment', href: '/equipment', icon: Package },
  { name: 'Services', href: '/services', icon: Briefcase },
  { name: 'Clients', href: '/clients', icon: Building2 },
  { name: 'Insurance', href: '/insurance', icon: ShieldCheck },
]

function Sidebar({ mobile, onClose }) {
  const { userProfile, signOut } = useAuth()
  const { organization, membership } = useOrganization()
  const navigate = useNavigate()
  const [librariesOpen, setLibrariesOpen] = useState(true)
  const [safetyOpen, setSafetyOpen] = useState(true)
  const [trainingOpen, setTrainingOpen] = useState(true)
  const [complianceOpen, setComplianceOpen] = useState(true)
  const [maintenanceOpen, setMaintenanceOpen] = useState(true)

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
          <div className="flex flex-col">
            <span className="font-semibold text-aeria-navy leading-tight">Muster</span>
            {organization && (
              <span className="text-xs text-gray-500 truncate max-w-[140px]" title={organization.name}>
                {organization.name}
              </span>
            )}
          </div>
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

        {/* Training section */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setTrainingOpen(!trainingOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            aria-expanded={trainingOpen}
            aria-controls="training-nav"
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              Training
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${trainingOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
          </button>
          {trainingOpen && (
            <div id="training-nav" className="mt-1 space-y-1">
              {trainingNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Compliance section */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setComplianceOpen(!complianceOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            aria-expanded={complianceOpen}
            aria-controls="compliance-nav"
          >
            <span className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4" aria-hidden="true" />
              Compliance
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${complianceOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
          </button>
          {complianceOpen && (
            <div id="compliance-nav" className="mt-1 space-y-1">
              {complianceNavigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Maintenance section */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setMaintenanceOpen(!maintenanceOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700"
            aria-expanded={maintenanceOpen}
            aria-controls="maintenance-nav"
          >
            <span className="flex items-center gap-2">
              <Wrench className="w-4 h-4" aria-hidden="true" />
              Maintenance
            </span>
            <ChevronDown className={`w-4 h-4 transition-transform ${maintenanceOpen ? '' : '-rotate-90'}`} aria-hidden="true" />
          </button>
          {maintenanceOpen && (
            <div id="maintenance-nav" className="mt-1 space-y-1">
              {maintenanceNavigation.map((item) => (
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

        {/* Settings */}
        <div className="pt-4">
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
        </div>
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-3">
        <div className="flex items-center gap-3 px-3 py-2">
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
  const [showFeedback, setShowFeedback] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [keySequence, setKeySequence] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { organization } = useOrganization()

  // Global keyboard shortcuts
  useEffect(() => {
    let sequenceTimeout

    const handleKeyDown = (e) => {
      // Skip if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return
      }

      // "?" opens keyboard shortcuts
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        setShowShortcuts(true)
        return
      }

      // "c" creates new project
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey && !keySequence) {
        clearTimeout(sequenceTimeout)
        navigate('/projects')
        return
      }

      // Handle key sequences (g+h, g+p, etc.)
      if (keySequence === 'g') {
        clearTimeout(sequenceTimeout)
        setKeySequence('')

        if (e.key === 'h') {
          e.preventDefault()
          navigate('/')
        } else if (e.key === 'p') {
          e.preventDefault()
          navigate('/projects')
        } else if (e.key === 's') {
          e.preventDefault()
          navigate('/settings')
        } else if (e.key === 'c') {
          e.preventDefault()
          navigate('/calendar')
        }
        return
      }

      if (keySequence === 'n') {
        clearTimeout(sequenceTimeout)
        setKeySequence('')

        if (e.key === 'p') {
          e.preventDefault()
          navigate('/projects')
        } else if (e.key === 'i') {
          e.preventDefault()
          navigate('/incidents/new')
        }
        return
      }

      // Start key sequence
      if (e.key === 'g' || e.key === 'n') {
        setKeySequence(e.key)
        sequenceTimeout = setTimeout(() => setKeySequence(''), 1000)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      clearTimeout(sequenceTimeout)
    }
  }, [keySequence, navigate])

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
        <div className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center">
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
              <span className="font-semibold text-aeria-navy">Muster</span>
            </div>
          </div>
          <NotificationBell />
        </div>

        {/* Desktop header bar */}
        <div className="hidden lg:flex items-center justify-between h-14 px-8 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            {organization && (
              <span className="text-sm font-medium text-gray-600">
                {organization.name}
              </span>
            )}
          </div>
          <NotificationBell />
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Active Timer Widget - floating in bottom-left */}
      <ActiveTimerWidget />

      {/* Floating Feedback Button */}
      <button
        onClick={() => setShowFeedback(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 bg-aeria-navy text-white rounded-full shadow-lg hover:bg-aeria-navy/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-aeria-navy focus:ring-offset-2"
        aria-label="Send feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Feedback</span>
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        currentPage={location.pathname}
        userId={user?.uid}
        userEmail={user?.email}
      />

      {/* Command Palette */}
      <CommandPalette />

      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  )
}
