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
import { useOrganization } from './hooks/useOrganization'
import { PortalAuthProvider, usePortalAuth } from './contexts/PortalAuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'
import Layout from './components/Layout'
import CreateOrganization from './components/onboarding/CreateOrganization'

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
const Tasks = lazy(() => import('./pages/Tasks'))
const Expenses = lazy(() => import('./pages/Expenses'))
const Forms = lazy(() => import('./pages/Forms'))
const TimeTracking = lazy(() => import('./pages/TimeTracking'))
const TimeApproval = lazy(() => import('./pages/TimeApproval'))
const ExpenseApproval = lazy(() => import('./pages/ExpenseApproval'))
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
const Inspections = lazy(() => import('./pages/Inspections'))
const Calendar = lazy(() => import('./pages/Calendar'))

// Maintenance Module Pages - lazy-loaded
const MaintenanceDashboard = lazy(() => import('./pages/MaintenanceDashboard'))
const MaintenanceItemList = lazy(() => import('./pages/MaintenanceItemList'))
const MaintenanceSchedulesPage = lazy(() => import('./pages/MaintenanceSchedulesPage'))
const MaintenanceItemDetail = lazy(() => import('./pages/MaintenanceItemDetail'))
// MaintenanceCalendar removed - now redirects to unified Calendar

// Document Generation Module Pages - lazy-loaded
const DocumentProjects = lazy(() => import('./pages/DocumentProjects'))
const DocumentProjectView = lazy(() => import('./pages/DocumentProjectView'))
const DocumentEditor = lazy(() => import('./pages/DocumentEditor'))

// Safety Declaration Module Pages - lazy-loaded
const SafetyDeclarationHub = lazy(() => import('./pages/SafetyDeclarationHub'))
const SafetyDeclarationDetail = lazy(() => import('./pages/SafetyDeclarationDetail'))

// SFOC Module Pages - lazy-loaded
const SFOCHub = lazy(() => import('./pages/SFOCHub'))
const SFOCDetail = lazy(() => import('./pages/SFOCDetail'))

// Manufacturer Declaration Module Pages - lazy-loaded
const ManufacturerDeclarationHub = lazy(() => import('./pages/ManufacturerDeclarationHub'))
const ManufacturerDeclarationDetail = lazy(() => import('./pages/ManufacturerDeclarationDetail'))

// SORA Assessment Module Pages - lazy-loaded
const SORAHub = lazy(() => import('./pages/SORAHub'))
const SORADetail = lazy(() => import('./pages/SORADetail'))

// Suspense fallback component
function PageLoader() {
  return <LoadingSpinner size="lg" message="Loading..." />
}

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { hasOrganization, loading: orgLoading } = useOrganization()

  if (authLoading || orgLoading) {
    return <LoadingSpinner size="lg" message="Loading..." fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated but has no organization - show onboarding
  if (!hasOrganization) {
    return <CreateOrganization />
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
          <Route path="tasks" element={<Suspense fallback={<PageLoader />}><Tasks /></Suspense>} />
          <Route path="expenses" element={<Suspense fallback={<PageLoader />}><Expenses /></Suspense>} />
          <Route path="time-tracking" element={<Suspense fallback={<PageLoader />}><TimeTracking /></Suspense>} />
          <Route path="time-approval" element={<Suspense fallback={<PageLoader />}><TimeApproval /></Suspense>} />
          <Route path="expense-approval" element={<Suspense fallback={<PageLoader />}><ExpenseApproval /></Suspense>} />
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
          <Route path="inspections" element={<Suspense fallback={<PageLoader />}><Inspections /></Suspense>} />

          {/* Maintenance Module Routes - lazy-loaded */}
          <Route path="maintenance" element={<Suspense fallback={<PageLoader />}><MaintenanceDashboard /></Suspense>} />
          <Route path="maintenance/items" element={<Suspense fallback={<PageLoader />}><MaintenanceItemList /></Suspense>} />
          <Route path="maintenance/schedules" element={<Suspense fallback={<PageLoader />}><MaintenanceSchedulesPage /></Suspense>} />
          {/* Maintenance calendar now redirects to unified calendar */}
          <Route path="maintenance/calendar" element={<Navigate to="/calendar" replace />} />
          <Route path="maintenance/item/:itemType/:itemId" element={<Suspense fallback={<PageLoader />}><MaintenanceItemDetail /></Suspense>} />

          {/* Document Generation Module Routes - lazy-loaded */}
          <Route path="document-projects" element={<Suspense fallback={<PageLoader />}><DocumentProjects /></Suspense>} />
          <Route path="document-projects/:projectId" element={<Suspense fallback={<PageLoader />}><DocumentProjectView /></Suspense>} />
          <Route path="document-projects/:projectId/documents/:documentId" element={<Suspense fallback={<PageLoader />}><DocumentEditor /></Suspense>} />

          {/* Safety Declaration Module Routes - lazy-loaded */}
          <Route path="safety-declarations" element={<Suspense fallback={<PageLoader />}><SafetyDeclarationHub /></Suspense>} />
          <Route path="safety-declarations/:declarationId" element={<Suspense fallback={<PageLoader />}><SafetyDeclarationDetail /></Suspense>} />

          {/* SFOC Module Routes - lazy-loaded */}
          <Route path="sfoc" element={<Suspense fallback={<PageLoader />}><SFOCHub /></Suspense>} />
          <Route path="sfoc/:applicationId" element={<Suspense fallback={<PageLoader />}><SFOCDetail /></Suspense>} />

          {/* Manufacturer Declaration Module Routes - lazy-loaded */}
          <Route path="manufacturer-declarations" element={<Suspense fallback={<PageLoader />}><ManufacturerDeclarationHub /></Suspense>} />
          <Route path="manufacturer-declarations/:declarationId" element={<Suspense fallback={<PageLoader />}><ManufacturerDeclarationDetail /></Suspense>} />

          {/* SORA Assessment Module Routes - lazy-loaded */}
          <Route path="sora" element={<Suspense fallback={<PageLoader />}><SORAHub /></Suspense>} />
          <Route path="sora/:assessmentId" element={<Suspense fallback={<PageLoader />}><SORADetail /></Suspense>} />
        </Route>

        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </PortalAuthProvider>
    </ErrorBoundary>
  )
}

export default App
