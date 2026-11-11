import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase'
import { ACTIVITY_LABELS, MAX_ACTIVITY_SECONDS } from '../utils/wellness'

// Completed wellness sessions live in a private subcollection:
// users/{uid}/activities/{activityId}
const getUserActivities = (userId) =>
  collection(db, 'users', userId, 'activities')

// CREATE - log a completed session.
export const logActivity = async (userId, { type, durationSeconds = 0 }) => {
  if (!ACTIVITY_LABELS[type]) {
    throw new Error('Unknown activity type.')
  }

  const seconds = Math.min(
    MAX_ACTIVITY_SECONDS,
    Math.max(0, Math.round(Number(durationSeconds) || 0))
  )

  return addDoc(getUserActivities(userId), {
    type,
    durationSeconds: seconds,
    createdAt: serverTimestamp()
  })
}

// READ (real-time) - newest sessions first.
export const subscribeToActivities = (userId, callback, onError, maxEntries = 100) => {
  const activitiesQuery = query(
    getUserActivities(userId),
    orderBy('createdAt', 'desc'),
    limit(maxEntries)
  )

  return onSnapshot(
    activitiesQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((document) => {
          const data = document.data({ serverTimestamps: 'estimate' })

          return {
            id: document.id,
            type: data.type,
            durationSeconds: data.durationSeconds || 0,
            createdAt: data.createdAt?.toDate?.() ?? new Date()
          }
        })
      )
    },
    onError
  )
}