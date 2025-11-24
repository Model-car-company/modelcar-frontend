import { redirect } from 'next/navigation'
import { createClient } from '../../lib/supabase/server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/sign-in')
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const creditsRemaining = profile?.credits_remaining ?? 0
  const fullName = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <DashboardClient 
      fullName={fullName}
      creditsRemaining={creditsRemaining}
    />
  )
}
