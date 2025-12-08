'use client'

import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-thin tracking-tight text-white mb-3">
          Authentication Error
        </h1>

        {/* Message */}
        <p className="text-sm font-light text-gray-400 mb-8">
          We couldn't verify your email. The link may have expired or already been used.
          Please try signing up again or contact support if the issue persists.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            href="/sign-up"
            className="w-full py-2.5 px-4 text-sm bg-white text-black font-light tracking-wide hover:bg-gray-100 transition-all text-center"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="w-full py-2.5 px-4 text-sm bg-white/5 border border-white/10 text-gray-300 font-light tracking-wide hover:bg-white/10 hover:border-white/20 transition-all text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
