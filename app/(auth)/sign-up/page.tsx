'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { ArrowLeft, Mail, Lock, User } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'

export default function SignUpPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check if user is already signed in
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }
    checkAuth()
  }, [router, supabase])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      // Success - show email confirmation screen
      setSubmittedEmail(email)
      setEmailSent(true)
    } catch (error: any) {
      setError(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
    }
  }

  const handleDiscordSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Discord')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#0a0a0a',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            fontWeight: '300',
          },
        }}
      />

      {/* Background gradient */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-white/5 via-white/2 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-white/5 via-white/2 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Email Confirmation Screen */}
        {emailSent ? (
          <div className="text-center">
            {/* Back to home */}
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-xs font-light text-gray-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Home
            </Link>

            {/* Email Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Mail className="w-10 h-10 text-white" strokeWidth={1} />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-thin tracking-tight mb-4">
              Check Your Email
            </h1>

            {/* Message */}
            <p className="text-sm font-light text-gray-400 mb-2">
              We've sent a confirmation link to
            </p>
            <p className="text-white font-light mb-6">
              {submittedEmail}
            </p>

            {/* Instructions */}
            <div className="bg-white/5 border border-white/10 p-4 mb-8 text-left">
              <p className="text-xs font-light text-gray-400 mb-3">
                Click the link in the email to verify your account and get started.
              </p>
              <p className="text-xs font-light text-gray-500">
                <span className="text-gray-400">Didn't receive it?</span> Check your spam folder or wait a few minutes for it to arrive.
              </p>
            </div>

            {/* Resend Button */}
            <button
              onClick={async () => {
                setResending(true)
                try {
                  const { error } = await supabase.auth.resend({
                    type: 'signup',
                    email: submittedEmail,
                    options: {
                      emailRedirectTo: `${window.location.origin}/auth/callback`,
                    },
                  })
                  if (error) throw error
                  toast.success('Confirmation email resent! Check your inbox.')
                } catch (err: any) {
                  console.error('Resend error:', err)
                  toast.error(err.message || 'Failed to resend email')
                } finally {
                  setResending(false)
                }
              }}
              disabled={resending}
              className="w-full py-2.5 px-4 text-sm bg-white/5 border border-white/10 text-gray-300 font-light tracking-wide hover:bg-white/10 hover:border-white/20 transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? 'Sending...' : 'Resend Confirmation Email'}
            </button>

            {/* Back to Sign In */}
            <p className="text-xs font-light text-gray-500">
              Wrong email?{' '}
              <button
                onClick={() => {
                  setEmailSent(false)
                  setSubmittedEmail('')
                }}
                className="text-white hover:underline"
              >
                Try again
              </button>
            </p>

            {/* Footer */}
            <div className="mt-12 text-center">
              <p className="text-[10px] font-light text-gray-600 tracking-wide">
                TANGIBEL © 2026 · SECURE AUTHENTICATION
              </p>
            </div>
          </div>
        ) : (
        <>
        {/* Back to home */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-light text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Home
        </Link>

        {/* Sign up card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-thin tracking-tight mb-2">Create Account</h1>
            <p className="text-sm font-light text-gray-400">Get started with 10 free credits</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Google Sign In - COMMENTED OUT */}
          {/* 
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded font-light text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-3 mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          */}

          {/* Discord Sign In - COMMENTED OUT */}
          {/* 
          <button
            onClick={handleDiscordSignIn}
            type="button"
            className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-3 rounded font-light text-sm transition-colors flex items-center justify-center gap-3 mt-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Continue with Discord
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black px-2 text-gray-500">or</span>
            </div>
          </div>
          */}

          <form onSubmit={handleSignUp} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="text-xs font-light text-gray-400 mb-2 block">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-10 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-light text-gray-400 mb-2 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-10 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-light text-gray-400 mb-2 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-10 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="••••••••"
                />
              </div>
              <p className="text-[10px] text-gray-500 mt-1">At least 6 characters</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-light text-gray-400 mb-2 block">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full bg-white/5 border border-white/10 rounded px-10 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Sign up button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded font-light text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-[10px] font-light text-gray-500 mt-4 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-xs font-light text-gray-400">
              Already have an account?{' '}
              <Link href="/sign-in" className="text-white hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[10px] font-light text-gray-600 tracking-wide">
            TANGIBEL © 2026 · SECURE AUTHENTICATION
          </p>
        </div>
        </>
        )}
      </div>
    </div>
  )
}
