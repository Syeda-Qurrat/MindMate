import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import { onAuthStateChanged, beforeAuthStateChanged } from 'firebase/auth'

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore'

import { auth, db } from '../services/firebase'
import { setupPresence, stopPresence } from '../services/presenceService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [, setProfileVersion] = useState(0)

  // Listen for authentication changes
  // and synchronize the Firestore user profile.
  useEffect(() => {
    let isActive = true

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isActive) return

      setLoading(true)

      try {
        if (user) {
          const userRef = doc(db, 'users', user.uid)
          const userSnapshot = await getDoc(userRef)

          // Only create a profile if none exists. Never write the
          // placeholder name, so we can't overwrite the real name that
          // Register saves a moment later (race condition).
          if (!userSnapshot.exists()) {
            await setDoc(
              userRef,
              {
                ...(user.displayName
                  ? { displayName: user.displayName }
                  : {}),
                createdAt: serverTimestamp()
              },
              { merge: true }
            )
          }
        }

        if (isActive) {
          setCurrentUser(user)
        }
      } catch (error) {
        console.error(
          'User profile synchronization error:',
          error
        )

        if (isActive) {
          setCurrentUser(user)
        }
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    })

    return () => {
      isActive = false
      unsubscribe()
    }
  }, [])

  // Remove this tab's presence BEFORE the user is signed out, while the
  // database rules still allow the write. Works for any sign-out path.
  useEffect(() => {
    return beforeAuthStateChanged(auth, async (user) => {
      if (!user) {
        try {
          await stopPresence()
        } catch (error) {
          console.error('Presence cleanup before sign-out failed:', error)
        }
      }
    })
  }, [])

  // Initialize presence for the authenticated user.
  useEffect(() => {
    if (!currentUser?.uid) return

    console.log('Initializing presence for:', currentUser.uid)

    return setupPresence(currentUser.uid)
  }, [currentUser?.uid])

  // Firebase updates the signed-in user object in place (for example after
  // updateProfile), which React cannot detect. Calling this re-renders every
  // consumer so they pick up the new display name.
  const refreshUser = () => setProfileVersion((version) => version + 1)

  const value = {
    currentUser,
    loading,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}