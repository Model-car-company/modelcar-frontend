'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { Save, CreditCard, Bell, Lock, Trash2, DollarSign, TrendingUp, Activity } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

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
  const [activeTab, setActiveTab] = useState<'profile' | 'analytics' | 'billing' | 'notifications' | 'security' | 'danger'>('analytics')
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)

  const handleSignOut = async () => {
    await fetch('/auth/sign-out', { method: 'POST' })
    window.location.href = '/'
  }

  useEffect(() => {
    loadUserData()
    loadAnalytics()
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

  const loadAnalytics = async () => {
    try {
      setAnalyticsLoading(true)
      const response = await fetch('/api/v1/creator/analytics')

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      // Silently fail - analytics is non-critical
      console.error('Failed to load analytics:', error)
    } finally {
      setAnalyticsLoading(false)
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
                onClick={() => setActiveTab('analytics')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${activeTab === 'analytics'
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                Analytics
                {activeTab === 'analytics' && (
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-white" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${activeTab === 'profile'
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
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${activeTab === 'billing'
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
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${activeTab === 'notifications'
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
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${activeTab === 'security'
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
                className={`pb-3 text-xs font-light tracking-wide whitespace-nowrap transition-colors relative ${activeTab === 'danger'
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

            {/* Creator Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* Top Stats Row - ALWAYS VISIBLE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Total Earnings - Larger/Featured */}
                  <div className="md:col-span-1 bg-gradient-to-br from-green-500/10 via-green-600/5 to-green-500/10 border border-green-500/20 rounded-sm p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="w-5 h-5 text-green-400" strokeWidth={1.5} />
                      <p className="text-xs font-light uppercase tracking-wide text-gray-400">
                        Total Earnings
                      </p>
                    </div>
                    <p className="text-4xl font-thin text-white mb-1">
                      ${analytics?.total_earnings || '0.00'}
                    </p>
                    <p className="text-xs text-green-400">
                      Your share from sales
                    </p>
                  </div>

                  {/* Total Sales */}
                  <div className="bg-white/5 border border-white/10 rounded-sm p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
                      <p className="text-xs font-light uppercase tracking-wide text-gray-400">
                        Total Sales
                      </p>
                    </div>
                    <p className="text-3xl font-thin text-white mb-1">
                      {analytics?.total_sales || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      purchases
                    </p>
                  </div>

                  {/* Total Revenue */}
                  <div className="bg-white/5 border border-white/10 rounded-sm p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-purple-400" strokeWidth={1.5} />
                      <p className="text-xs font-light uppercase tracking-wide text-gray-400">
                        Total Revenue
                      </p>
                    </div>
                    <p className="text-3xl font-thin text-white mb-1">
                      ${analytics?.total_revenue || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">
                      platform total
                    </p>
                  </div>
                </div>

                {/* Purchases Over Time Chart - ALWAYS VISIBLE */}
                <div className="bg-white/5 border border-white/10 rounded-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-thin tracking-tight text-white mb-1">
                        Purchases Over Time
                      </h3>
                      <p className="text-xs text-gray-500">
                        {analytics && analytics.total_sales > 0
                          ? 'Track your sales performance'
                          : 'Sales activity will appear here'}
                      </p>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analytics?.purchases_by_month || [
                          { date: 'Jan', sales: 2 },
                          { date: 'Feb', sales: 5 },
                          { date: 'Mar', sales: 3 },
                          { date: 'Apr', sales: 8 },
                          { date: 'May', sales: 6 },
                          { date: 'Jun', sales: 10 },
                          { date: 'Jul', sales: 12 },
                          { date: 'Aug', sales: 9 },
                          { date: 'Sep', sales: 15 },
                          { date: 'Oct', sales: 11 },
                          { date: 'Nov', sales: 18 },
                          { date: 'Dec', sales: 20 },
                        ]}
                        margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                          dataKey="date"
                          stroke="rgba(255,255,255,0.3)"
                          style={{ fontSize: '11px', fontWeight: '300' }}
                        />
                        <YAxis
                          stroke="rgba(255,255,255,0.3)"
                          style={{ fontSize: '11px', fontWeight: '300' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '300'
                          }}
                          labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="sales"
                          stroke="#22c55e"
                          strokeWidth={1.5}
                          dot={{ fill: '#22c55e', r: 3 }}
                          activeDot={{ r: 5 }}
                          animationDuration={1500}
                          animationEasing="ease-in-out"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription & Billing */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                {/* Subscription Status Card */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-thin tracking-tight">Subscription & Billing</h2>
                  </div>

                  {/* Current Plan */}
                  <div className="mb-6">
                    <p className="text-xs font-light text-gray-400 mb-3">Current Plan</p>
                    <div className="bg-white/5 border border-white/10 rounded p-4">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-base font-light">
                              {profile?.subscription_tier === 'garage' && 'Garage Parking'}
                              {profile?.subscription_tier === 'showroom' && 'Showroom Floor'}
                              {profile?.subscription_tier === 'dealership' && 'Dealership'}
                              {(!profile?.subscription_tier || profile?.subscription_tier === 'free') && 'Free Tier'}
                            </p>
                            {profile?.subscription_status && (
                              <span className={`px-2 py-0.5 rounded text-[10px] font-light ${profile.subscription_status === 'active' ? 'bg-green-500/20 text-green-400' :
                                profile.subscription_status === 'trialing' ? 'bg-blue-500/20 text-blue-400' :
                                  profile.subscription_status === 'past_due' ? 'bg-yellow-500/20 text-yellow-400' :
                                    profile.subscription_status === 'canceled' ? 'bg-red-500/20 text-red-400' :
                                      'bg-gray-500/20 text-gray-400'
                                }`}>
                                {profile.subscription_status.toUpperCase()}
                              </span>
                            )}
                          </div>

                          {/* Credits */}
                          <div className="flex items-center gap-2 mt-3">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[10px] text-gray-500">Credits Remaining</p>
                                <p className="text-[10px] font-light">{profile?.credits_remaining || 0}</p>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1.5">
                                <div
                                  className="bg-white rounded-full h-1.5 transition-all"
                                  style={{
                                    width: `${Math.min(
                                      ((profile?.credits_remaining || 0) /
                                        (
                                          profile?.subscription_tier === 'garage' ? 50 :
                                            profile?.subscription_tier === 'showroom' ? 200 :
                                              profile?.subscription_tier === 'dealership' ? 500 :
                                                10
                                        )) * 100,
                                      100
                                    )}%`
                                  }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Renewal Date */}
                          {profile?.subscription_status === 'active' && profile?.current_period_end && (
                            <div className="mt-3 pt-3 border-t border-white/10">
                              <p className="text-[10px] text-gray-500">Next billing date</p>
                              <p className="text-xs font-light mt-1">
                                {new Date(profile.current_period_end).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}

                          {/* Period Dates for Active Subscription */}
                          {profile?.subscription_status === 'active' && profile?.current_period_start && (
                            <div className="mt-2">
                              <p className="text-[10px] text-gray-600">
                                Current period: {new Date(profile.current_period_start).toLocaleDateString()} - {new Date(profile.current_period_end).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          {/* Cancellation Notice */}
                          {profile?.subscription_status === 'canceled' && profile?.current_period_end && (
                            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded">
                              <p className="text-[10px] text-yellow-400">
                                Your subscription will end on {new Date(profile.current_period_end).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>


                      </div>
                    </div>
                  </div>

                  {/* Plan Features */}
                  {profile?.subscription_tier && profile.subscription_tier !== 'free' && (
                    <div>
                      <p className="text-xs font-light text-gray-400 mb-3">Plan Features</p>
                      <div className="bg-white/5 border border-white/10 rounded p-4">
                        <ul className="space-y-2 text-xs font-light text-gray-300">
                          {profile.subscription_tier === 'garage' && (
                            <>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                50 AI generations per month
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                10 GB cloud storage
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                STL, OBJ, GLB exports
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                Community support
                              </li>
                            </>
                          )}
                          {profile.subscription_tier === 'showroom' && (
                            <>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                200 AI generations per month
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                100 GB cloud storage
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                All export formats
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                Priority support
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                Commercial license
                              </li>
                            </>
                          )}
                          {profile.subscription_tier === 'dealership' && (
                            <>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                Unlimited AI generations
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                1 TB cloud storage
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                API access
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                Team collaboration (5 seats)
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                Premium support
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                {/* Billing Portal Card */}
                {profile?.stripe_customer_id && (
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded p-4 sm:p-6">
                    <h3 className="text-sm font-light mb-4">Billing Portal</h3>
                    <p className="text-xs text-gray-400 mb-4">
                      Access your Stripe billing portal to:
                    </p>
                    <ul className="space-y-2 text-xs text-gray-400 mb-6">
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        Update payment methods
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        View billing history and invoices
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        Update billing information
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-400" />
                        Cancel subscription
                      </li>
                    </ul>
                    <button
                      onClick={async () => {
                        const loadingToast = toast.loading('Opening billing portal...')
                        try {
                          const response = await fetch('/api/create-portal-session', { method: 'POST' })
                          const data = await response.json()
                          toast.dismiss(loadingToast)
                          if (data.url) {
                            window.location.href = data.url
                          } else {
                            toast.error(data.error || 'Failed to open billing portal')
                          }
                        } catch (error) {
                          toast.dismiss(loadingToast)
                          toast.error('Failed to open billing portal')
                        }
                      }}
                      className="w-full bg-white text-black border border-white rounded p-3 text-xs font-light hover:bg-gray-100 transition-colors"
                    >
                      Open Stripe Billing Portal →
                    </button>
                  </div>
                )}

                {/* No Subscription Message */}
                {(!profile?.subscription_tier || profile?.subscription_tier === 'free') && !profile?.stripe_customer_id && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded p-6 text-center">
                    <p className="text-sm font-light mb-2">You're on the free plan</p>
                    <p className="text-xs text-gray-400 mb-4">
                      Upgrade to unlock more features and credits
                    </p>
                    <Link
                      href="/pricing"
                      className="inline-block px-6 py-2 bg-white text-black rounded text-xs font-light hover:bg-gray-100 transition-colors"
                    >
                      View Plans
                    </Link>
                  </div>
                )}
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
                      className={`relative w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-white' : 'bg-white/20'
                        }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0'
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
                      className={`relative w-12 h-6 rounded-full transition-colors ${marketingEmails ? 'bg-white' : 'bg-white/20'
                        }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform ${marketingEmails ? 'translate-x-6' : 'translate-x-0'
                          }`}
                      />
                    </button>
                  </div>

                  {/* Generation Notifications Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
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

                  {/* Purchase Notifications Toggle */}
                  <div className="flex items-center justify-between py-3 border-b border-white/10">
                    <div>
                      <p className="text-sm font-light">Design Purchased</p>
                      <p className="text-[10px] text-gray-500 mt-1">Notify when someone purchases your design</p>
                    </div>
                    <button
                      className="relative w-12 h-6 rounded-full bg-white"
                    >
                      <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-black translate-x-6" />
                    </button>
                  </div>

                  {/* Shipping Notifications Toggle */}
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-light">Shipping Updates</p>
                      <p className="text-[10px] text-gray-500 mt-1">Get updates on order shipping status</p>
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
