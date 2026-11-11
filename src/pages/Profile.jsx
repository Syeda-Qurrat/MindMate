import { useEffect, useMemo, useState } from 'react'
import {
  Mail,
  CalendarDays,
  ShieldCheck,
  Lock,
  Eye,
  KeyRound,
  GraduationCap
} from 'lucide-react'

import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../context/AuthContext'
import {
  getPrivateDetails,
  saveProfile,
  sendResetEmail
} from '../services/profileService'
import {
  NAME_MAX,
  COURSE_MAX,
  ABOUT_MAX,
  YEAR_OPTIONS,
  validateProfile,
  isSameProfile
} from '../utils/profile'

const inputClass = (hasError) =>
  `w-full px-4 py-3 rounded-xl border bg-[#faf8ff] outline-none text-sm text-[#302747] focus:ring-2 focus:ring-[#eee6fc] disabled:opacity-60 ${
    hasError
      ? 'border-[#d97883] focus:border-[#d97883]'
      : 'border-[#eae4f2] focus:border-[#9878d4]'
  }`

function FieldError({ id, message }) {
  if (!message) return null

  return (
    <p id={id} role="alert" className="text-xs text-[#b04b5a] mt-1.5">
      {message}
    </p>
  )
}

function Profile() {
  const { currentUser, refreshUser } = useAuth()
  const userId = currentUser?.uid
  const email = currentUser?.email || ''

  const [form, setForm] = useState({
    displayName: currentUser?.displayName || '',
    course: '',
    yearOfStudy: '',
    about: ''
  })
  const [baseline, setBaseline] = useState(form)

  const [loadingDetails, setLoadingDetails] = useState(true)
  const [detailsError, setDetailsError] = useState(false)

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  const [reset, setReset] = useState({ status: 'idle', text: '' })

  // Load the private details (course, year, about) once.
  useEffect(() => {
    if (!userId) return undefined

    let active = true

    getPrivateDetails(userId)
      .then((details) => {
        if (!active) return
        setForm((previous) => ({ ...previous, ...details }))
        setBaseline((previous) => ({ ...previous, ...details }))
        setLoadingDetails(false)
      })
      .catch((error) => {
        console.error('Profile details error:', error)
        if (!active) return
        setDetailsError(true)
        setLoadingDetails(false)
      })

    return () => {
      active = false
    }
  }, [userId])

  const dirty = useMemo(() => !isSameProfile(form, baseline), [form, baseline])

  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric'
      })
    : null

  const initial = (form.displayName || email || '?').trim().charAt(0).toUpperCase()

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((previous) => ({ ...previous, [field]: value }))
    setFeedback(null)
    if (errors[field]) {
      setErrors((previous) => ({ ...previous, [field]: undefined }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving || !dirty) return

    const found = validateProfile(form)
    setErrors(found)

    if (Object.keys(found).length > 0) {
      setFeedback({ type: 'error', text: 'Please fix the highlighted fields.' })
      return
    }

    setSaving(true)
    setFeedback(null)

    try {
      const saved = await saveProfile(currentUser, form)
      setForm(saved)
      setBaseline(saved)
      refreshUser()
      setFeedback({ type: 'success', text: 'Your profile has been updated.' })
    } catch (error) {
      console.error('Profile save error:', error)

      if (error.fieldErrors) {
        setErrors(error.fieldErrors)
      }

      setFeedback({
        type: 'error',
        text:
          error.message === 'Please fix the highlighted fields.'
            ? error.message
            : 'We could not save your profile. Please check your connection and try again.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDiscard = () => {
    setForm(baseline)
    setErrors({})
    setFeedback(null)
  }

  const handleReset = async () => {
    if (!email || reset.status === 'sending') return

    setReset({ status: 'sending', text: '' })

    try {
      await sendResetEmail(email)
      setReset({
        status: 'sent',
        text: `We sent a password reset link to ${email}. Check your inbox (and spam folder).`
      })
    } catch (error) {
      console.error('Password reset error:', error)
      setReset({
        status: 'error',
        text:
          error.code === 'auth/too-many-requests'
            ? 'Too many attempts. Please wait a few minutes and try again.'
            : 'We could not send the email. Please try again.'
      })
    }
  }

  return (
    <DashboardLayout>
      <section className="mb-8">
        <p className="text-sm text-[#9878d4] font-medium">MY PROFILE</p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#302747] mt-2">
          Your profile
        </h1>
        <p className="text-sm text-[#827991] mt-2 max-w-xl">
          Manage how you appear to other students and keep your account details up to date.
        </p>
      </section>

      {/* Identity card */}
      <section className="bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8 mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
        <div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8f70ca] to-[#b39ae7] text-white flex items-center justify-center text-3xl font-bold shrink-0"
          aria-hidden="true"
        >
          {initial}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[#302747] break-words">
            {currentUser?.displayName || 'MindMate Student'}
          </h2>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-[#827991]">
            <span className="flex items-center gap-2 break-all">
              <Mail size={15} className="text-[#9878d4] shrink-0" />
              {email || 'No email'}
            </span>
            {memberSince && (
              <span className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#9878d4] shrink-0" />
                Member since {memberSince}
              </span>
            )}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Edit form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-2 bg-white border border-[#eee8f5] rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-lg font-bold text-[#302747] mb-6">Profile details</h2>

          {detailsError && (
            <div role="alert" className="bg-[#fff2df] text-[#a8742a] text-sm rounded-xl p-4 mb-6">
              We could not load your saved course details. You can still update your name.
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-[#302747] mb-2">
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange('displayName')}
                maxLength={NAME_MAX + 10}
                autoComplete="name"
                aria-invalid={!!errors.displayName}
                aria-describedby={`name-hint${errors.displayName ? ' name-error' : ''}`}
                className={inputClass(errors.displayName)}
              />
              <p id="name-hint" className="text-xs text-[#a49bb0] mt-1.5">
                Other students see this name in the Community.
              </p>
              <FieldError id="name-error" message={errors.displayName} />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#302747] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                readOnly
                className={inputClass(false)}
              />
              <p className="text-xs text-[#a49bb0] mt-1.5">
                Your email is used to sign in and cannot be changed here.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="course" className="flex items-center gap-2 text-sm font-medium text-[#302747] mb-2">
                  <GraduationCap size={16} className="text-[#9878d4]" />
                  Course (optional)
                </label>
                <input
                  id="course"
                  type="text"
                  value={form.course}
                  onChange={handleChange('course')}
                  disabled={loadingDetails}
                  maxLength={COURSE_MAX + 10}
                  placeholder="e.g. B.Tech Computer Science"
                  aria-invalid={!!errors.course}
                  aria-describedby={errors.course ? 'course-error' : undefined}
                  className={inputClass(errors.course)}
                />
                <FieldError id="course-error" message={errors.course} />
              </div>

              <div>
                <label htmlFor="yearOfStudy" className="block text-sm font-medium text-[#302747] mb-2">
                  Year of study (optional)
                </label>
                <select
                  id="yearOfStudy"
                  value={form.yearOfStudy}
                  onChange={handleChange('yearOfStudy')}
                  disabled={loadingDetails}
                  aria-invalid={!!errors.yearOfStudy}
                  aria-describedby={errors.yearOfStudy ? 'year-error' : undefined}
                  className={inputClass(errors.yearOfStudy)}
                >
                  <option value="">Prefer not to say</option>
                  {YEAR_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <FieldError id="year-error" message={errors.yearOfStudy} />
              </div>
            </div>

            <div>
              <label htmlFor="about" className="block text-sm font-medium text-[#302747] mb-2">
                About me / what I want from MindMate (optional)
              </label>
              <textarea
                id="about"
                value={form.about}
                onChange={handleChange('about')}
                disabled={loadingDetails}
                rows={4}
                maxLength={ABOUT_MAX + 20}
                placeholder="e.g. I want to manage exam stress and sleep better."
                aria-invalid={!!errors.about}
                aria-describedby={`about-count${errors.about ? ' about-error' : ''}`}
                className={`${inputClass(errors.about)} resize-none`}
              />
              <p id="about-count" className="text-xs text-[#a49bb0] text-right mt-1">
                {form.about.trim().length}/{ABOUT_MAX}
              </p>
              <FieldError id="about-error" message={errors.about} />
            </div>
          </div>

          {feedback && (
            <div
              role={feedback.type === 'error' ? 'alert' : 'status'}
              className={`mt-6 text-sm rounded-xl p-4 ${
                feedback.type === 'error'
                  ? 'bg-[#fbe9ec] text-[#b04b5a]'
                  : 'bg-[#e6f4ed] text-[#3f8466]'
              }`}
            >
              {feedback.text}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleDiscard}
              disabled={!dirty || saving}
              className="px-6 py-3 rounded-xl bg-[#f5f0fc] text-[#7955b5] hover:bg-[#eee6fc] disabled:opacity-40 disabled:cursor-not-allowed text-sm font-semibold transition"
            >
              Discard changes
            </button>
            <button
              type="submit"
              disabled={!dirty || saving}
              className="px-6 py-3 rounded-xl bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>

        {/* Side cards */}
        <div className="space-y-6">
          <section className="bg-white border border-[#eee8f5] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#eee6fc] flex items-center justify-center">
                <KeyRound size={20} className="text-[#9878d4]" />
              </div>
              <h2 className="font-bold text-[#302747]">Password</h2>
            </div>
            <p className="text-sm text-[#827991] leading-6">
              We will email you a secure link to choose a new password.
            </p>
            <button
              type="button"
              onClick={handleReset}
              disabled={!email || reset.status === 'sending'}
              className="mt-4 w-full px-5 py-3 rounded-xl border border-[#d9cdf0] text-[#7955b5] hover:bg-[#f5f0fc] disabled:opacity-50 text-sm font-semibold transition"
            >
              {reset.status === 'sending' ? 'Sending...' : 'Send password reset email'}
            </button>
            {reset.text && (
              <p
                role={reset.status === 'error' ? 'alert' : 'status'}
                className={`mt-3 text-xs rounded-lg p-3 ${
                  reset.status === 'error'
                    ? 'bg-[#fbe9ec] text-[#b04b5a]'
                    : 'bg-[#e6f4ed] text-[#3f8466]'
                }`}
              >
                {reset.text}
              </p>
            )}
          </section>

          <section className="bg-[#eee6fc] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#9878d4]" />
              </div>
              <h2 className="font-bold text-[#49366c]">Your privacy</h2>
            </div>
            <ul className="space-y-3 text-sm text-[#5a4d73] leading-6">
              <li className="flex gap-3">
                <Eye size={17} className="text-[#7955b5] shrink-0 mt-1" />
                <span>
                  <strong>Visible to students:</strong> your display name and whether you are online.
                </span>
              </li>
              <li className="flex gap-3">
                <Lock size={17} className="text-[#7955b5] shrink-0 mt-1" />
                <span>
                  <strong>Only you:</strong> your email, course details, mood entries and AI conversations.
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Profile