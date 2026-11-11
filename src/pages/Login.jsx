
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Mail,
  Lock
} from 'lucide-react'

import { signInWithEmailAndPassword } from 'firebase/auth'

import AuthLayout from '../components/auth/AuthLayout'
import { auth } from '../services/firebase'

function Login() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    const form = e.currentTarget
    const email = form.email.value.trim()
    const password = form.password.value

    setLoading(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)

      navigate('/dashboard', { replace: true })

    } catch (error) {
      console.error('Login error:', error)

      const errorMessages = {
        'auth/invalid-credential':
          'Incorrect email or password. Please try again.',
        'auth/user-not-found':
          'No account found with this email address.',
        'auth/wrong-password':
          'Incorrect password. Please try again.',
        'auth/invalid-email':
          'Please enter a valid email address.',
        'auth/too-many-requests':
          'Too many attempts. Please try again later.',
        'auth/network-request-failed':
          'Network error. Please check your internet connection.'
      }

      setMessage(
        errorMessages[error.code] ||
        'Unable to log in. Please try again.'
      )

    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back!"
      subtitle="We're glad to see you again. Let's continue your wellness journey."
    >
      <form onSubmit={handleSubmit} className="space-y-5">

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
          <div className="flex justify-between mb-2">
            <label className="text-sm font-semibold text-[#302747]">
              Password
            </label>
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a49bb0]" />

            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Enter your password"
              className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-[#eae4f2] bg-[#faf8ff] outline-none focus:border-[#9878d4] focus:ring-2 focus:ring-[#eee6fc] text-sm"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#827991] hover:text-[#7955b5]"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9878d4] hover:bg-[#7955b5] disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold transition"
        >
          {loading ? 'Logging in...' : 'Login to MindMate'}
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

      <div className="relative my-7">
        <div className="border-t border-[#eee8f5]" />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-white px-3 text-xs text-[#a49bb0]">
          NEW TO MINDMATE?
        </span>
      </div>

      <p className="text-center text-sm text-[#827991]">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-[#7955b5] font-semibold hover:underline"
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login
