'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { Save, CreditCard, Bell, Lock, Trash2 } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [marketingEmails, setMarketingEmails] = useState(false)
  
  // Active tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'notifications' | 'security' | 'danger'>('profile')

  const handleSignOut = async () => {
    await fetch('/auth/sign-out', { method: 'POST' })
    window.location.href = '/'
  }

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/sign-in')
        return
      }

      setUser(user)
      setEmail(user.email || '')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || '')
      }
    } catch (error: any) {
      toast.error('Error loading profile', {
        style: {
          background: '#0a0a0a',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
      router.push('/sign-in')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      // Update local state immediately
      if (data) {
        setProfile(data)
      }

      toast.success('Profile updated successfully!', {
        style: {
          background: '#0a0a0a',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
    } catch (error: any) {
      toast.error('Error updating profile: ' + error.message, {
        style: {
          background: '#0a0a0a',
          color: '#ef4444',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          fontSize: '12px',
          fontWeight: '300',
        },
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  const fullNameDisplay = profile?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-black text-white flex">
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

      {/* Sidebar */}
      <CollapsibleSidebar
        currentPage="profile"
        fullName={profile?.full_name || user?.email?.split('@')[0] || 'User'}
        creditsRemaining={profile?.credits_remaining ?? 0}
        onCollapseChange={setIsCollapsed}
      />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-56'}`}>
        <div className="p-4 sm:p-6 lg:p-12 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-thin tracking-tight mb-2">Settings</h1>
            <p className="text-xs font-light text-gray-500">Manage your account settings and preferences</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8 border-b border-white/10">
            <div className="flex gap-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${
                  activeTab === 'profile' 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Profile
                {activeTab === 'profile' && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('billing')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${
                  activeTab === 'billing' 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Subscription & Billing
                {activeTab === 'billing' && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${
                  activeTab === 'notifications' 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Notifications
                {activeTab === 'notifications' && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${
                  activeTab === 'security' 
                    ? 'text-white' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Security
                {activeTab === 'security' && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                )}
              </button>
              
              <button
                onClick={() => setActiveTab('danger')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${
                  activeTab === 'danger' 
                    ? 'text-red-400' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Danger Zone
                {activeTab === 'danger' && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-red-400" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {/* Profile Information */}
            {activeTab === 'profile' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-base sm:text-lg font-thin tracking-tight">Profile Information</h2>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Full Name */}
                <div>
                  <label className="text-xs font-light text-gray-400 mb-2 block">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light focus:outline-none focus:border-white/30 transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="text-xs font-light text-gray-400 mb-2 block">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light opacity-50 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
            )}

            {/* Subscription & Billing */}
            {activeTab === 'billing' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-white" />
                <h2 className="text-lg font-thin tracking-tight">Subscription & Billing</h2>
              </div>

              <div className="space-y-6">
                {/* Current Plan */}
                <div>
                  <p className="text-xs font-light text-gray-400 mb-3">Current Plan</p>
                  <div className="bg-white/5 border border-white/10 rounded p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-light capitalize">
                          {profile?.subscription_tier === 'garage' && 'Garage Parking'}
                          {profile?.subscription_tier === 'showroom' && 'Showroom Floor'}
                          {profile?.subscription_tier === 'dealership' && 'Dealership'}
                          {(!profile?.subscription_tier || profile?.subscription_tier === 'free') && 'Free'}
                          {' '}Plan
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          {profile?.credits_remaining || 0} credits remaining
                        </p>
                        {profile?.subscription_status === 'active' && profile?.current_period_end && (
                          <p className="text-[10px] text-gray-600 mt-1">
                            Renews {new Date(profile.current_period_end).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <Link 
                        href="/pricing"
                        className="px-4 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-100 transition-colors"
                      >
                        {profile?.subscription_status === 'active' ? 'Change Plan' : 'Upgrade Plan'}
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div>
                  <p className="text-xs font-light text-gray-400 mb-3">Billing History</p>
                  <div className="bg-white/5 border border-white/10 rounded p-4">
                    <p className="text-xs text-gray-500 text-center py-4">No billing history yet</p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <p className="text-xs font-light text-gray-400 mb-3">Payment Method</p>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/create-portal-session', { method: 'POST' })
                        const data = await response.json()
                        if (data.url) {
                          window.location.href = data.url
                        } else {
                          toast.error(data.error || 'Failed to open billing portal')
                        }
                      } catch (error) {
                        toast.error('Failed to open billing portal')
                      }
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded p-4 text-xs font-light text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    Manage Billing & Payment Methods
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-white" />
                <h2 className="text-lg font-thin tracking-tight">Notifications</h2>
              </div>

              <div className="space-y-4">
                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div>
                    <p className="text-sm font-light">Email Notifications</p>
                    <p className="text-[10px] text-gray-500 mt-1">Receive updates about your account</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      emailNotifications ? 'bg-white' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                        emailNotifications ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Marketing Emails Toggle */}
                <div className="flex items-center justify-between py-3 border-b border-white/10">
                  <div>
                    <p className="text-sm font-light">Marketing Emails</p>
                    <p className="text-[10px] text-gray-500 mt-1">Receive news and promotional offers</p>
                  </div>
                  <button
                    onClick={() => setMarketingEmails(!marketingEmails)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      marketingEmails ? 'bg-white' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${
                        marketingEmails ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Generation Notifications Toggle */}
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-light">Generation Complete</p>
                    <p className="text-[10px] text-gray-500 mt-1">Notify when 3D models are ready</p>
                  </div>
                  <button
                    className="relative w-12 h-6 rounded-full bg-white"
                  >
                    <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Security */}
            {activeTab === 'security' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-6">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="w-5 h-5 text-white" />
                <h2 className="text-lg font-thin tracking-tight">Security</h2>
              </div>

              <div className="space-y-4">
                <button className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light text-left hover:bg-white/10 transition-colors">
                  Change Password
                </button>
                <button className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light text-left hover:bg-white/10 transition-colors">
                  Two-Factor Authentication
                </button>
                <button className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-sm font-light text-left hover:bg-white/10 transition-colors">
                  Active Sessions
                </button>
              </div>
            </div>
            )}

            {/* Danger Zone */}
            {activeTab === 'danger' && (
            <div className="bg-red-500/5 border border-red-500/20 rounded p-6">
              <div className="flex items-center gap-3 mb-6">
                <Trash2 className="w-5 h-5 text-red-400" />
                <h2 className="text-lg font-thin tracking-tight text-red-400">Danger Zone</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-light">Delete Account</p>
                    <p className="text-[10px] text-gray-500 mt-1">Permanently delete your account and all data</p>
                  </div>
                  <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs font-light hover:bg-red-500/30 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
