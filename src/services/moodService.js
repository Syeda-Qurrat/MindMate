import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

import { db } from './firebase'
import { getMood, MAX_NOTE_LENGTH } from '../utils/moods'

// Each user's mood entries live in a private subcollection:
// users/{uid}/moods/{moodId}
const getUserMoods = (userId) => collection(db, 'users', userId, 'moods')

const getMoodRef = (userId, moodId) =>
  doc(db, 'users', userId, 'moods', moodId)

// CREATE - record a new mood entry.
export const addMood = async (userId, { mood, note = '' }) => {
  const moodInfo = getMood(mood)

  if (!moodInfo) {
    throw new Error('Please choose a valid mood.')
  }

  return addDoc(getUserMoods(userId), {
    mood: moodInfo.key,
    score: moodInfo.score,
    note: note.trim().slice(0, MAX_NOTE_LENGTH),
    createdAt: serverTimestamp()
  })
}

// READ (real-time) - calls `callback` with the newest entries first,
// again every time they change. Returns an unsubscribe function.
export const subscribeToMoods = (userId, callback, onError, maxEntries = 200) => {
  const moodsQuery = query(
    getUserMoods(userId),
    orderBy('createdAt', 'desc'),
    limit(maxEntries)
  )

  return onSnapshot(
    moodsQuery,
    (snapshot) => {
      callback(
        snapshot.docs.map((document) => {
          const data = document.data({ serverTimestamps: 'estimate' })

          return {
            id: document.id,
            mood: data.mood,
            score: data.score,
            note: data.note || '',
            createdAt: data.createdAt?.toDate?.() ?? new Date()
          }
        })
      )
    },
    onError
  )
}

// UPDATE - edit the journal note of an entry.
export const updateMoodNote = async (userId, moodId, note) => {
  await updateDoc(getMoodRef(userId, moodId), {
    note: note.trim().slice(0, MAX_NOTE_LENGTH)
  })
}

// DELETE - remove an entry.
export const deleteMood = async (userId, moodId) => {
  await deleteDoc(getMoodRef(userId, moodId))
}