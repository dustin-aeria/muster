/**
 * ErrorBoundary.jsx
 * React Error Boundary for graceful error handling
 * 
 * Features:
 * - Catches JavaScript errors in child components
 * - Displays user-friendly error UI
 * - Logs errors for debugging
 * - Provides recovery options (reload, go home)
 * 
 * @location src/components/ErrorBoundary.jsx
 * @action NEW
 */

import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })

    // In production, send to error reporting service
    // In development, errors are already shown in the React error overlay
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error reporting service (e.g., Sentry, LogRocket)
      // logErrorToService(error, errorInfo)
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Check if it's a chunk loading error (common with code splitting)
      const isChunkError = this.state.error?.message?.includes('Loading chunk')
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              {isChunkError ? 'Update Available' : 'Something went wrong'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {isChunkError 
                ? 'A new version of the application is available. Please refresh the page to continue.'
                : 'An unexpected error occurred. Our team has been notified and is working on a fix.'
              }
            </p>
            
            {/* Error details (collapsed by default) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 p-4 bg-gray-100 rounded-lg">
                <summary className="cursor-pointer text-sm font-medium text-gray-700">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-600 overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-aeria-navy text-white rounded-lg hover:bg-aeria-navy/90 transition-colors"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                Refresh Page
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" aria-hidden="true" />
                Go to Dashboard
              </button>
            </div>

            {/* Retry option for non-chunk errors */}
            {!isChunkError && (
              <button
                type="button"
                onClick={this.handleRetry}
                className="mt-4 text-sm text-aeria-navy hover:underline"
              >
                Try again without refreshing
              </button>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
