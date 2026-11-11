import { initializeApp } from 'firebase/app'
import { getAuth, setPersistence, browserSessionPersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL
}

if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.databaseURL) {
  throw new Error('Firebase configuration is missing. Check your root .env file.')
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)

// DEV ONLY: by default Firebase shares one login across every tab of the
// same browser, so logging in as another account in a second tab switches
// the first tab too. In development we keep the login per tab instead, so
// two accounts can be tested side by side. Production is unchanged.
if (import.meta.env.DEV) {
  setPersistence(auth, browserSessionPersistence).catch((error) => {
    console.error('Could not set per-tab auth persistence:', error)
  })
}
export const db = getFirestore(app)
export const realtimeDb = getDatabase(app)

export default app