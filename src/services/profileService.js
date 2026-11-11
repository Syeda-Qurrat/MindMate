import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { updateProfile, sendPasswordResetEmail } from 'firebase/auth'

import { auth, db } from './firebase'
import { normalizeProfile, validateProfile } from '../utils/profile'

// Public profile (name only) - readable by other signed-in students so the
// Community page can list them:   users/{uid}
const getPublicRef = (userId) => doc(db, 'users', userId)

// Private profile details - readable only by the owner:
//   users/{uid}/private/details
const getPrivateRef = (userId) => doc(db, 'users', userId, 'private', 'details')

const EMPTY_DETAILS = { course: '', yearOfStudy: '', about: '' }

// READ - the private details (course, year, about).
export const getPrivateDetails = async (userId) => {
  const snapshot = await getDoc(getPrivateRef(userId))

  if (!snapshot.exists()) return { ...EMPTY_DETAILS }

  const data = snapshot.data()

  return {
    course: data.course || '',
    yearOfStudy: data.yearOfStudy || '',
    about: data.about || ''
  }
}

// UPDATE - validates, then saves the name to Firebase Auth and Firestore
// and the private details to the private document.
export const saveProfile = async (user, values) => {
  const errors = validateProfile(values)

  if (Object.keys(errors).length > 0) {
    const error = new Error('Please fix the highlighted fields.')
    error.fieldErrors = errors
    throw error
  }

  const clean = normalizeProfile(values)

  await updateProfile(user, { displayName: clean.displayName })

  await setDoc(
    getPublicRef(user.uid),
    { displayName: clean.displayName },
    { merge: true }
  )

  await setDoc(getPrivateRef(user.uid), {
    course: clean.course,
    yearOfStudy: clean.yearOfStudy,
    about: clean.about,
    updatedAt: serverTimestamp()
  })

  return clean
}

// Sends Firebase's password-reset email to the signed-in user's address.
export const sendResetEmail = async (email) => {
  await sendPasswordResetEmail(auth, email)
}