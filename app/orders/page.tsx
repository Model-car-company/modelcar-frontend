'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'
import { Package, MapPin, CalendarDays, DollarSign } from 'lucide-react'

type ShipOrder = {
  id: string
  payment_intent_id?: string | null
  model_id?: string | null
  material_id?: string | null
  finish_id?: string | null
  quantity?: number | null
  scale?: number | null
  total_price?: number | null
  currency?: string | null
  shipping_address?: any
  shipping_name?: string | null
  shipping_phone?: string | null
  created_at?: string | null
}

export default function OrdersPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<ShipOrder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        window.location.href = '/sign-in'
        return
      }
      setUser(user)
      const [{ data: profile }, { data: orders }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('ship_orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      if (profile) setProfile(profile)
      if (orders) setOrders(orders)
      setLoading(false)
    }
    load()
  }, [supabase])

  const renderAddress = (addr: any) => {
    if (!addr) return '—'
    const parts = [addr.line1, addr.line2, addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean)
    return parts.join(', ')
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      <CollapsibleSidebar
        currentPage="orders"
        fullName={profile?.full_name || user?.email || 'User'}
        creditsRemaining={profile?.credits_remaining ?? 0}
      />

      <main className="flex-1 lg:ml-56 p-4 sm:p-6 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">Garage</p>
            <h1 className="text-3xl font-thin tracking-tight">Orders</h1>
          </div>
          <Link
            href="/garage"
            className="text-xs font-light px-3 py-2 border border-white/10 rounded hover:border-white/20 hover:bg-white/5 transition"
          >
            Back to Garage
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40 text-gray-400 text-sm">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 border border-white/10 rounded-lg bg-white/[0.02] text-center">
            <p className="text-sm text-gray-300">No orders yet.</p>
            <p className="text-xs text-gray-500 mt-2">Generate a model in your garage and ship it to print.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-white/10 rounded-lg bg-white/[0.02] p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-light text-white">
                      {order.model_id ? `Model: ${order.model_id}` : 'Model Order'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.material_id || 'Material'} • {order.finish_id || 'Finish'} • Qty {order.quantity || 1}{' '}
                      {order.scale ? `• Scale ${order.scale}x` : ''}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 mt-1">
                      <CalendarDays className="w-3 h-3" />
                      {order.created_at ? new Date(order.created_at).toLocaleString() : '—'}
                    </div>
                    <div className="flex items-start gap-2 text-[11px] text-gray-500 mt-1">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span>{renderAddress(order.shipping_address)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-1 text-white">
                    <DollarSign className="w-4 h-4" />
                    <span className="text-lg font-light">
                      {order.total_price != null
                        ? `$${order.total_price.toFixed(2)} ${(order.currency || 'USD').toUpperCase()}`
                        : '--'}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500">Payment: {order.payment_intent_id || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
