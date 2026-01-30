/**
 * PortalLogin.jsx
 * Client portal login page with magic link authentication
 *
 * @location src/pages/portal/PortalLogin.jsx
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, ArrowRight, CheckCircle, AlertCircle, Building2 } from 'lucide-react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export default function PortalLogin() {
  const navigate = useNavigate()
  const { requestMagicLink, isAuthenticated } = usePortalAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [devLink, setDevLink] = useState(null)

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/portal')
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await requestMagicLink(email)

    if (result.success) {
      setSent(true)
      // In development, show the magic link for testing
      if (result.magicLinkUrl) {
        setDevLink(result.magicLinkUrl)
      }
    } else {
      setError(result.error)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">Aeria Ops</div>
              <div className="text-slate-400 text-xs">Client Portal</div>
            </div>
          </div>
          <Link
            to="/"
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Back to Main Site
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {!sent ? (
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-slate-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-500">
                  Enter your email to receive a secure login link
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    autoFocus
                    className="w-full"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Login Link
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-500">
                  Don't have access?{' '}
                  <a href="mailto:support@aeriaops.com" className="text-blue-600 hover:text-blue-700">
                    Contact your service provider
                  </a>
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-500 mb-6">
                We've sent a login link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-400 mb-6">
                The link will expire in 24 hours. If you don't see it, check your spam folder.
              </p>

              {/* Development mode - show magic link */}
              {devLink && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg text-left">
                  <div className="text-xs font-medium text-amber-800 mb-2">
                    Development Mode - Magic Link:
                  </div>
                  <a
                    href={devLink}
                    className="text-sm text-blue-600 hover:text-blue-700 break-all"
                  >
                    {devLink}
                  </a>
                </div>
              )}

              <button
                onClick={() => {
                  setSent(false)
                  setError(null)
                  setDevLink(null)
                }}
                className="mt-6 text-sm text-gray-500 hover:text-gray-700"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} Aeria Ops. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
