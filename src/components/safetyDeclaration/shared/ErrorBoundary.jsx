/**
 * ErrorBoundary.jsx
 * Error boundary component for Safety Declaration modules
 *
 * @location src/components/safetyDeclaration/shared/ErrorBoundary.jsx
 */

import { Component } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo })
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log to error tracking service if available
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = false } = this.props

      // Use custom fallback if provided
      if (fallback) {
        return fallback({
          error: this.state.error,
          resetError: this.handleReset
        })
      }

      // Default error UI
      return (
        <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
          <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Something went wrong
          </h3>

          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            {this.state.error?.message || 'An unexpected error occurred. Please try again.'}
          </p>

          {showDetails && this.state.errorInfo && (
            <details className="text-left mb-4 p-4 bg-gray-50 rounded-lg text-sm">
              <summary className="cursor-pointer text-gray-600 font-medium mb-2">
                Technical Details
              </summary>
              <pre className="text-xs text-gray-500 overflow-auto max-h-40">
                {this.state.error?.stack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
