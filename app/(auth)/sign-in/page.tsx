'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../../lib/supabase/client'
import { ArrowLeft, Mail, Lock } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { analytics, AnalyticsEvents } from '../../../lib/analytics'

export default function SignInPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        // Handle invalid credentials specifically
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password.')
        }
        throw error
      }

      // Track successful sign-in
      analytics.track(AnalyticsEvents.SIGN_IN, {
        method: 'email',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
      
      // Track failed sign-in
      analytics.track('sign_in_failed', {
        error: error.message,
      })
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
      
      // Track Google sign-in attempt
      analytics.track(AnalyticsEvents.SIGN_IN, {
        method: 'google',
      })
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
      
      // Track Discord sign-in attempt
      analytics.track(AnalyticsEvents.SIGN_IN, {
        method: 'discord',
      })
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
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-white/5 via-white/2 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-white/5 via-white/2 to-transparent blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        {/* Back to home */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-xs font-light text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Home
        </Link>

        {/* Sign in card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 sm:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-thin tracking-tight mb-2">Welcome Back</h1>
            <p className="text-sm font-light text-gray-400">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Google Sign In - TEMPORARILY DISABLED */}
          {/* 
          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full bg-white/5 border border-white/10 text-white py-3 rounded font-light text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-3 mb-6"
            aria-label="Continue with Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black px-2 text-gray-500">or</span>
            </div>
          </div>
          */}

          <form onSubmit={handleSignIn} className="space-y-4">
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
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link 
                href="/forgot-password"
                className="text-xs font-light text-gray-400 hover:text-white transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black py-3 rounded font-light text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-xs font-light text-gray-400">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-white hover:underline">
                Sign up
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
      </div>
    </div>
  )
}
