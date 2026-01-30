/**
 * PortalVerify.jsx
 * Verifies magic link token and logs user into portal
 *
 * @location src/pages/portal/PortalVerify.jsx
 */

import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { CheckCircle, XCircle, Loader, Building2 } from 'lucide-react'
import { usePortalAuth } from '../../contexts/PortalAuthContext'
import { Button } from '../../components/ui/Button'

export default function PortalVerify() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyAndLogin, isAuthenticated } = usePortalAuth()

  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [error, setError] = useState(null)

  const token = searchParams.get('token')

  useEffect(() => {
    // If already authenticated, go to portal
    if (isAuthenticated) {
      navigate('/portal')
      return
    }

    // If no token, show error
    if (!token) {
      setStatus('error')
      setError('No login token provided. Please request a new login link.')
      return
    }

    // Verify the token
    verifyToken()
  }, [token, isAuthenticated])

  const verifyToken = async () => {
    const result = await verifyAndLogin(token)

    if (result.success) {
      setStatus('success')
      // Redirect to portal after short delay
      setTimeout(() => {
        navigate('/portal')
      }, 2000)
    } else {
      setStatus('error')
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-7xl mx-auto flex items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">Aeria Ops</div>
              <div className="text-slate-400 text-xs">Client Portal</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            {status === 'verifying' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Your Login
                </h2>
                <p className="text-gray-500">
                  Please wait while we verify your login link...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Login Successful!
                </h2>
                <p className="text-gray-500 mb-4">
                  Redirecting you to the portal...
                </p>
                <div className="flex items-center justify-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Login Failed
                </h2>
                <p className="text-gray-500 mb-6">
                  {error || 'Something went wrong. Please try again.'}
                </p>
                <Link to="/portal/login">
                  <Button className="w-full">
                    Request New Login Link
                  </Button>
                </Link>
              </>
            )}
          </div>
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
