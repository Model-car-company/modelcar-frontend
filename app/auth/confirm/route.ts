import { createClient } from '../../../lib/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

// Handle email confirmation links from Supabase
// These come in the format: /auth/confirm?token_hash=xxx&type=signup
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as 'signup' | 'recovery' | 'invite' | 'email' | null
  const next = searchParams.get('next') ?? '/dashboard'

  // Helper to get redirect URL
  const getRedirectUrl = (path: string) => {
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    if (isLocalEnv) {
      return `${origin}${path}`
    } else if (forwardedHost) {
      return `https://${forwardedHost}${path}`
    } else {
      return `${origin}${path}`
    }
  }

  if (token_hash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type,
    })

    if (!error) {
      return NextResponse.redirect(getRedirectUrl(next))
    }
    
    console.error('Email confirmation error:', error.message)
  }

  // Redirect to error page if verification fails
  return NextResponse.redirect(getRedirectUrl('/auth/auth-code-error'))
}
