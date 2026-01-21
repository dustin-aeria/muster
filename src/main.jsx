import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './styles/index.css'

// Import admin utils for console access (dev only)
import './lib/adminUtils'
import { auth } from './lib/firebase'

// Expose auth for console access
if (typeof window !== 'undefined') {
  window.firebaseAuth = auth
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
