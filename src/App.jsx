/**
 * App.jsx
 * Main application component with routing
 * 
 * Batch 3 Fix:
 * - Added ErrorBoundary for graceful error handling (M-07)
 * 
 * @location src/App.jsx
 * @action REPLACE
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectView from './pages/ProjectView'
import Forms from './pages/Forms'
import Operators from './pages/Operators'
import Aircraft from './pages/Aircraft'
import Clients from './pages/Clients'
import Settings from './pages/Settings'
import PolicyLibrary from './components/PolicyLibrary'

// Safety Module Pages
import SafetyDashboard from './pages/SafetyDashboard'
import Incidents from './pages/Incidents'
import IncidentReport from './pages/IncidentReport'
import IncidentDetail from './pages/IncidentDetail'
import Capas from './pages/Capas'
import CapaNew from './pages/CapaNew'
import CapaDetail from './pages/CapaDetail'

// Protected route wrapper
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-aeria-navy border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }
  
  return children
}

function App() {
  return (
    <ErrorBoundary>
      <Routes>
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
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectView />} />
          <Route path="forms" element={<Forms />} />
          <Route path="policies" element={<PolicyLibrary />} />
          <Route path="operators" element={<Operators />} />
          <Route path="aircraft" element={<Aircraft />} />
          <Route path="clients" element={<Clients />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Safety Module Routes */}
          <Route path="safety" element={<SafetyDashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="incidents/new" element={<IncidentReport />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="incidents/:id/edit" element={<IncidentReport />} />
          <Route path="capas" element={<Capas />} />
          <Route path="capas/new" element={<CapaNew />} />
          <Route path="capas/:id" element={<CapaDetail />} />
          <Route path="capas/:id/edit" element={<CapaNew />} />
        </Route>
        
        {/* Catch all - redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}

export default App
