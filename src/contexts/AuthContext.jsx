/**
 * AuthContext.jsx
 * Authentication context provider for Firebase Auth
 * 
 * Batch 3 Fix:
 * - Added resetPassword function for password reset flow (M-10)
 * 
 * @location src/contexts/AuthContext.jsx
 * @action REPLACE
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'

const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'operators', firebaseUser.uid))
          if (userDoc.exists()) {
            setUserProfile({ id: userDoc.id, ...userDoc.data() })
          } else {
            // User exists in Auth but not in Firestore yet
            setUserProfile({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              firstName: '',
              lastName: '',
            })
          }
        } catch (err) {
          // User profile fetch failed - basic auth info still available
          setError(err.message || 'Failed to load user profile')
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    setError(null)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const signOut = async () => {
    setError(null)
    try {
      await firebaseSignOut(auth)
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User's email address
   * @returns {Promise<void>}
   * @throws {Error} Firebase auth errors
   */
  const resetPassword = async (email) => {
    setError(null)
    try {
      await sendPasswordResetEmail(auth, email, {
        // Optional: customize the action URL
        // url: window.location.origin + '/login',
      })
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
