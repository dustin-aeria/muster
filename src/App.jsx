/**
 * App.jsx
 * Main application component with routing
 *
 * Batch 3 Fix:
 * - Added ErrorBoundary for graceful error handling (M-07)
 *
 * Batch 8 Fix:
 * - Added React.lazy() for bundle size optimization
 * - Core pages remain synchronous for fast initial load
 * - Secondary modules (Safety, Compliance, Admin) are lazy-loaded
 *
 * @location src/App.jsx
 * @action REPLACE
 */

import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { PortalAuthProvider, usePortalAuth } from './contexts/PortalAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import Layout from './components/Layout'

// Core pages - keep synchronous for fast initial load
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectView from './pages/ProjectView'

// Client Portal pages - lazy-loaded
const PortalLogin = lazy(() => import('./pages/portal/PortalLogin'))
const PortalVerify = lazy(() => import('./pages/portal/PortalVerify'))
const PortalDashboard = lazy(() => import('./pages/portal/PortalDashboard'))
const PortalProjects = lazy(() => import('./pages/portal/PortalProjects'))
const PortalProjectView = lazy(() => import('./pages/portal/PortalProjectView'))
const PortalDocuments = lazy(() => import('./pages/portal/PortalDocuments'))

// Lazy-loaded pages - secondary features
const Forms = lazy(() => import('./pages/Forms'))
const TimeTracking = lazy(() => import('./pages/TimeTracking'))
const TimeApproval = lazy(() => import('./pages/TimeApproval'))
const Operators = lazy(() => import('./pages/Operators'))
const Aircraft = lazy(() => import('./pages/Aircraft'))
const Equipment = lazy(() => import('./pages/Equipment'))
const EquipmentView = lazy(() => import('./pages/EquipmentView'))
const Clients = lazy(() => import('./pages/Clients'))
const Services = lazy(() => import('./pages/Services'))
const Insurance = lazy(() => import('./pages/Insurance'))
const Settings = lazy(() => import('./pages/Settings'))
const PolicyProcedureLibrary = lazy(() => import('./pages/PolicyProcedureLibrary'))
const PolicyDetail = lazy(() => import('./pages/PolicyDetail'))
const ProcedureDetail = lazy(() => import('./pages/ProcedureDetail'))
const MyAcknowledgments = lazy(() => import('./pages/MyAcknowledgments'))
const MasterPolicyAdmin = lazy(() => import('./pages/MasterPolicyAdmin'))

// Safety Module Pages - lazy-loaded
const SafetyDashboard = lazy(() => import('./pages/SafetyDashboard'))
const Incidents = lazy(() => import('./pages/Incidents'))
const IncidentReport = lazy(() => import('./pages/IncidentReport'))
const IncidentDetail = lazy(() => import('./pages/IncidentDetail'))
const Capas = lazy(() => import('./pages/Capas'))
const CapaNew = lazy(() => import('./pages/CapaNew'))
const CapaDetail = lazy(() => import('./pages/CapaDetail'))
const FormalHazardLibrary = lazy(() => import('./pages/FormalHazardLibrary'))
const JHSC = lazy(() => import('./pages/JHSC'))
const Training = lazy(() => import('./pages/Training'))
const CORAuditManagement = lazy(() => import('./pages/CORAuditManagement'))
const Inspections = lazy(() => import('./pages/Inspections'))
const CORDashboard = lazy(() => import('./pages/CORDashboard'))
const Calendar = lazy(() => import('./pages/Calendar'))

// Compliance Module Pages - lazy-loaded
const ComplianceHub = lazy(() => import('./pages/ComplianceHub'))
const ComplianceApplicationEditor = lazy(() => import('./pages/ComplianceApplicationEditor'))
const ComplianceProjectView = lazy(() => import('./pages/ComplianceProjectView'))

// Maintenance Module Pages - lazy-loaded
const MaintenanceDashboard = lazy(() => import('./pages/MaintenanceDashboard'))
const MaintenanceItemList = lazy(() => import('./pages/MaintenanceItemList'))
const MaintenanceSchedulesPage = lazy(() => import('./pages/MaintenanceSchedulesPage'))
const MaintenanceItemDetail = lazy(() => import('./pages/MaintenanceItemDetail'))
// MaintenanceCalendar removed - now redirects to unified Calendar

// Suspense fallback component
function PageLoader() {
  return <LoadingSpinner size="lg" message="Loading..." />
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading..." fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Public route wrapper (redirect to dashboard if already logged in)
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

// Portal protected route wrapper
function PortalProtectedRoute({ children }) {
  const { isAuthenticated, loading } = usePortalAuth()

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading..." fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />
  }

  return children
}

// Portal public route wrapper
function PortalPublicRoute({ children }) {
  const { isAuthenticated, loading } = usePortalAuth()

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />
  }

  if (isAuthenticated) {
    return <Navigate to="/portal" replace />
  }

  return children
}

function App() {
  return (
    <ErrorBoundary>
      <PortalAuthProvider>
        <Routes>
          {/* Client Portal routes - outside main auth */}
          <Route
            path="/portal/login"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
                <PortalPublicRoute>
                  <PortalLogin />
                </PortalPublicRoute>
              </Suspense>
            }
          />
          <Route
            path="/portal/verify"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
                <PortalVerify />
              </Suspense>
            }
          />
          <Route
            path="/portal"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
                <PortalProtectedRoute>
                  <PortalDashboard />
                </PortalProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/portal/projects"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
                <PortalProtectedRoute>
                  <PortalProjects />
                </PortalProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/portal/projects/:projectId"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
                <PortalProtectedRoute>
                  <PortalProjectView />
                </PortalProtectedRoute>
              </Suspense>
            }
          />
          <Route
            path="/portal/documents"
            element={
              <Suspense fallback={<LoadingSpinner size="lg" fullScreen />}>
                <PortalProtectedRoute>
                  <PortalDocuments />
                </PortalProtectedRoute>
              </Suspense>
            }
          />

          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Core pages - no Suspense needed (not lazy) */}
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectView />} />

          {/* Lazy-loaded pages - wrapped in Suspense */}
          <Route path="time-tracking" element={<Suspense fallback={<PageLoader />}><TimeTracking /></Suspense>} />
          <Route path="time-approval" element={<Suspense fallback={<PageLoader />}><TimeApproval /></Suspense>} />
          <Route path="forms" element={<Suspense fallback={<PageLoader />}><Forms /></Suspense>} />
          <Route path="policies" element={<Suspense fallback={<PageLoader />}><PolicyProcedureLibrary /></Suspense>} />
          <Route path="policies/:id" element={<Suspense fallback={<PageLoader />}><PolicyDetail /></Suspense>} />
          <Route path="procedures" element={<Suspense fallback={<PageLoader />}><PolicyProcedureLibrary /></Suspense>} />
          <Route path="procedures/:id" element={<Suspense fallback={<PageLoader />}><ProcedureDetail /></Suspense>} />
          <Route path="my-acknowledgments" element={<Suspense fallback={<PageLoader />}><MyAcknowledgments /></Suspense>} />
          <Route path="admin/master-policies" element={<Suspense fallback={<PageLoader />}><MasterPolicyAdmin /></Suspense>} />
          <Route path="operators" element={<Suspense fallback={<PageLoader />}><Operators /></Suspense>} />
          <Route path="aircraft" element={<Suspense fallback={<PageLoader />}><Aircraft /></Suspense>} />
          <Route path="equipment" element={<Suspense fallback={<PageLoader />}><Equipment /></Suspense>} />
          <Route path="equipment/:equipmentId" element={<Suspense fallback={<PageLoader />}><EquipmentView /></Suspense>} />
          <Route path="clients" element={<Suspense fallback={<PageLoader />}><Clients /></Suspense>} />
          <Route path="services" element={<Suspense fallback={<PageLoader />}><Services /></Suspense>} />
          <Route path="insurance" element={<Suspense fallback={<PageLoader />}><Insurance /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<PageLoader />}><Calendar /></Suspense>} />

          {/* Safety Module Routes - lazy-loaded */}
          <Route path="safety" element={<Suspense fallback={<PageLoader />}><SafetyDashboard /></Suspense>} />
          <Route path="incidents" element={<Suspense fallback={<PageLoader />}><Incidents /></Suspense>} />
          <Route path="incidents/new" element={<Suspense fallback={<PageLoader />}><IncidentReport /></Suspense>} />
          <Route path="incidents/:id" element={<Suspense fallback={<PageLoader />}><IncidentDetail /></Suspense>} />
          <Route path="incidents/:id/edit" element={<Suspense fallback={<PageLoader />}><IncidentReport /></Suspense>} />
          <Route path="capas" element={<Suspense fallback={<PageLoader />}><Capas /></Suspense>} />
          <Route path="capas/new" element={<Suspense fallback={<PageLoader />}><CapaNew /></Suspense>} />
          <Route path="capas/:id" element={<Suspense fallback={<PageLoader />}><CapaDetail /></Suspense>} />
          <Route path="capas/:id/edit" element={<Suspense fallback={<PageLoader />}><CapaNew /></Suspense>} />
          <Route path="hazards" element={<Suspense fallback={<PageLoader />}><FormalHazardLibrary /></Suspense>} />
          <Route path="jhsc" element={<Suspense fallback={<PageLoader />}><JHSC /></Suspense>} />
          <Route path="training" element={<Suspense fallback={<PageLoader />}><Training /></Suspense>} />
          <Route path="cor-audit" element={<Suspense fallback={<PageLoader />}><CORAuditManagement /></Suspense>} />
          <Route path="inspections" element={<Suspense fallback={<PageLoader />}><Inspections /></Suspense>} />
          <Route path="cor-dashboard" element={<Suspense fallback={<PageLoader />}><CORDashboard /></Suspense>} />

          {/* Compliance Module Routes - lazy-loaded */}
          <Route path="compliance" element={<Suspense fallback={<PageLoader />}><ComplianceHub /></Suspense>} />
          <Route path="compliance/templates" element={<Suspense fallback={<PageLoader />}><ComplianceHub /></Suspense>} />
          <Route path="compliance/application/:id" element={<Suspense fallback={<PageLoader />}><ComplianceApplicationEditor /></Suspense>} />
          <Route path="compliance/project/:id" element={<Suspense fallback={<PageLoader />}><ComplianceProjectView /></Suspense>} />

          {/* Maintenance Module Routes - lazy-loaded */}
          <Route path="maintenance" element={<Suspense fallback={<PageLoader />}><MaintenanceDashboard /></Suspense>} />
          <Route path="maintenance/items" element={<Suspense fallback={<PageLoader />}><MaintenanceItemList /></Suspense>} />
          <Route path="maintenance/schedules" element={<Suspense fallback={<PageLoader />}><MaintenanceSchedulesPage /></Suspense>} />
          {/* Maintenance calendar now redirects to unified calendar */}
          <Route path="maintenance/calendar" element={<Navigate to="/calendar" replace />} />
          <Route path="maintenance/item/:itemType/:itemId" element={<Suspense fallback={<PageLoader />}><MaintenanceItemDetail /></Suspense>} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </PortalAuthProvider>
    </ErrorBoundary>
  )
}

export default App
