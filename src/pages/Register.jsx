import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock
} from 'lucide-react'

import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../services/firebase'

import {
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth'

import AuthLayout from '../components/auth/AuthLayout'
import { auth } from '../services/firebase'

function Register() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const form = e.currentTarget
    const name = form.name.value.trim()
    const email = form.email.value.trim()
    const password = form.password.value
    const confirmPassword = form.confirmPassword.value

    if (password !== confirmPassword) {
      setMessage('Passwords do not match. Please try again.')
      return
    }

    setLoading(true)

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )

      await updateProfile(userCredential.user, {
        displayName: name
      })

      // Save student profile in Firestore
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        {
          displayName: name,
          createdAt: serverTimestamp()
        },
        { merge: true }
      )

      navigate('/dashboard', { replace: true })

    } catch (error) {
      console.error('Registration error:', error)

      const errorMessages = {
        'auth/email-already-in-use':
          'An account with this email already exists.',
        'auth/invalid-email':
          'Please enter a valid email address.',
        'auth/weak-password':
          'Your password must contain at least 6 characters.',
        'auth/network-request-failed':
          'Network error. Please check your internet connection.'
      }

      setMessage(
        errorMessages[error.code] ||
        'Unable to create your account. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building healthier habits and make your well-being a priority."
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Full Name */}
        <div>
          <label className="block text-sm font-semibold text-[#302747] mb-2">
            Full name
          </label>

          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49bb0]" />

            <input
              name="name"
              type="text"
              required
              minLength={2}
              placeholder="Enter your full name"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-semibold text-[#302747] mb-2">
            Email address
          </label>

          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49bb0]" />

            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-semibold text-[#302747] mb-2">
            Password
          </label>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49bb0]" />

            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#827991]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-semibold text-[#302747] mb-2">
            Confirm password
          </label>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49bb0]" />

            <input
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Re-enter your password"
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#827991]"
              aria-label="Toggle confirm password visibility"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Terms */}
        <label className="flex items-start gap-2 text-xs text-[#827991] leading-5">
          <input type="checkbox" required className="mt-1 accent-[#9878d4]" />
          <span>
            I agree to the Terms of Service and Privacy Policy.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition"
        >
          {loading ? 'Creating account...' : 'Create My Account'}
        </button>

        {message && (
          <p
            role="alert"
            className="text-sm text-[#7955b5] bg-[#f3effb] p-3 rounded-xl"
          >
            {message}
          </p>
        )}

      </form>

      <p className="text-center text-sm text-[#827991] mt-7">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-[#7955b5] font-semibold hover:underline"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Register