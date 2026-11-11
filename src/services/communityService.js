import { collection, onSnapshot } from 'firebase/firestore'
import { ref, onValue } from 'firebase/database'

import { db, realtimeDb } from './firebase'

// Listen for all registered student profiles
export const subscribeToStudents = (callback, onError) => {
  const usersRef = collection(db, 'users')

  return onSnapshot(
    usersRef,
    (snapshot) => {
      const students = snapshot.docs.map((document) => ({
        uid: document.id,
        ...document.data()
      }))

      callback(students)
    },
    (error) => {
      console.error('Student loading error:', error)
      onError?.(error)
    }
  )
}

// A connection counts as live only if its lastSeen heartbeat is recent.
const STALE_AFTER_MS = 120000

// Listen for real-time student presence
export const subscribeToPresence = (callback, onError) => {
  let raw = {}
  let offset = 0

  const compute = () => {
    const now = Date.now() + offset
    const presence = {}

    Object.entries(raw).forEach(([uid, userStatus]) => {
      const connections = Object.values(userStatus?.connections || {})

      presence[uid] = connections.some(
        (c) =>
          typeof c?.lastSeen === 'number' &&
          now - c.lastSeen < STALE_AFTER_MS
      )
    })

    callback(presence)
  }

  const offsetUnsub = onValue(
    ref(realtimeDb, '.info/serverTimeOffset'),
    (snapshot) => {
      offset = snapshot.val() || 0
      compute()
    }
  )

  const statusUnsub = onValue(
    ref(realtimeDb, 'status'),
    (snapshot) => {
      raw = snapshot.val() || {}
      compute()
    },
    (error) => {
      console.error('Presence loading error:', error)
      onError?.(error)
    }
  )

  // Re-evaluate so ghost connections expire even with no database event.
  const timer = setInterval(compute, 30000)

  return () => {
    offsetUnsub()
    statusUnsub()
    clearInterval(timer)
  }
}