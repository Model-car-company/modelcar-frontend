'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '../../lib/supabase/client'
import CollapsibleSidebar from '../../components/CollapsibleSidebar'
import { Package, MapPin, CalendarDays, DollarSign, Truck, Check, Clock3, Link2 } from 'lucide-react'

type ShipOrderEvent = {
  id?: string
  order_id?: string | null
  status?: string | null
  detail?: string | null
  location?: string | null
  progress_index?: number | null
  eta?: string | null
  created_at?: string | null
}

type ShipOrder = {
  id: string
  payment_intent_id?: string | null
  session_id?: string | null
  slant3d_order_id?: string | null
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
  status?: string | null
  tracking_url?: string | null
  events?: ShipOrderEvent[]
}

const STATUS_FLOW = [
  { key: 'paid', label: 'Paid', helper: 'Payment confirmed' },
  { key: 'processing', label: 'Processing', helper: 'Queued for printing' },
  { key: 'printing', label: 'Printing', helper: 'Parts in production' },
  { key: 'shipped', label: 'Shipped', helper: 'Handed to carrier' },
  { key: 'delivered', label: 'Delivered', helper: 'Package arrived' },
]

const formatStatusLabel = (status?: string | null) => {
  if (!status) return 'Pending'
  const normalized = status.toLowerCase()
  const mapped = STATUS_FLOW.find((s) => s.key === normalized)
  if (mapped) return mapped.label
  return status.replace(/_/g, ' ')
}

const formatDate = (value?: string | null) => {
  if (!value) return '--'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '--' : date.toLocaleString()
}

const renderAddress = (addr: any) => {
  if (!addr) return '--'
  if (typeof addr === 'string') return addr
  const parts = [
    addr.name,
    addr.line1 || addr.address_line1,
    addr.line2 || addr.address_line2,
    addr.city,
    addr.state || addr.region,
    addr.postal_code || addr.zip,
    addr.country,
  ].filter(Boolean)
  const joined = parts.join(', ')
  return joined || '--'
}

const sortEvents = (events: ShipOrderEvent[] = []) =>
  [...events].sort((a, b) => {
    const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
    const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
    return aTime - bTime
  })

const deriveTimeline = (order: ShipOrder): ShipOrderEvent[] => {
  if (order.events && order.events.length > 0) {
    return sortEvents(order.events)
  }

  return [
    {
      id: `fallback-${order.id}`,
      order_id: order.id,
      status: order.status || 'paid',
      detail: order.status ? 'Status updated' : 'Order created',
      created_at: order.created_at,
    },
  ]
}

const deriveActiveIndex = (order: ShipOrder) => {
  const timeline = deriveTimeline(order)
  const lastStatus = timeline[timeline.length - 1]?.status?.toLowerCase()
  const idx = STATUS_FLOW.findIndex((step) => step.key === lastStatus)
  if (idx >= 0) return idx
  return Math.max(0, Math.min(timeline.length - 1, STATUS_FLOW.length - 1))
}

export default function OrdersPage() {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [orders, setOrders] = useState<ShipOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEvents, setLoadingEvents] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) {
        window.location.href = '/sign-in?redirect=/orders'
        return
      }

      setUser(auth.user)

      const [{ data: profileData }, { data: orderData, error: ordersError }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', auth.user.id).single(),
        supabase.from('ship_orders').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }),
      ])

      if (profileData) setProfile(profileData)
      if (!ordersError && orderData) setOrders(orderData as ShipOrder[])

      const orderIds = (orderData || []).map((o: any) => o.id).filter(Boolean)

      if (orderIds.length) {
        setLoadingEvents(true)
        try {
          const { data: eventsData, error: eventsError } = await supabase
            .from('ship_order_events')
            .select('*')
            .in('order_id', orderIds)
            .order('created_at', { ascending: true })

          if (!eventsError && eventsData) {
            const grouped = new Map<string, ShipOrderEvent[]>()
            ;(eventsData as ShipOrderEvent[]).forEach((evt) => {
              if (!evt.order_id) return
              const list = grouped.get(evt.order_id) || []
              list.push(evt)
              grouped.set(evt.order_id, list)
            })

            setOrders((prev) =>
              prev.map((order) => ({
                ...order,
                events: grouped.get(order.id) || order.events || [],
              }))
            )
          }
        } catch (err) {
          console.warn('ship_order_events fetch skipped', (err as any)?.message)
        } finally {
          setLoadingEvents(false)
        }
      } else {
        setLoadingEvents(false)
      }

      setLoading(false)
    }

    load()
  }, [supabase])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`ship_orders:${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ship_orders', filter: `user_id=eq.${user.id}` },
        (payload) => {
          setOrders((prev) => {
            if (payload.eventType === 'DELETE') {
              return prev.filter((o) => o.id !== (payload.old as any)?.id)
            }

            const updated = payload.new as ShipOrder
            const idx = prev.findIndex((o) => o.id === updated.id)
            if (idx >= 0) {
              const next = [...prev]
              next[idx] = { ...next[idx], ...updated }
              return next
            }
            return [updated, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, user?.id])

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
            {orders.map((order) => {
              const timeline = deriveTimeline(order)
              const activeIdx = deriveActiveIndex(order)
              const statusLabel = formatStatusLabel(timeline[timeline.length - 1]?.status || order.status)

              return (
                <div
                  key={order.id}
                  className="border border-white/10 rounded-lg bg-white/[0.03] p-4 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded bg-white/5 border border-white/10 flex items-center justify-center">
                        <Package className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-light text-white">
                          {order.model_id ? `Model ${order.model_id}` : 'Custom Model'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {order.material_id || 'Material'} • {order.finish_id || 'Finish'} • Qty {order.quantity || 1}
                          {order.scale ? ` • Scale ${order.scale}x` : ''}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {formatDate(order.created_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {renderAddress(order.shipping_address)}
                          </span>
                          {order.slant3d_order_id && (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <Package className="w-3 h-3" />
                              Slant3D #{order.slant3d_order_id}
                            </span>
                          )}
                          {order.payment_intent_id && (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <Clock3 className="w-3 h-3" />
                              PI {order.payment_intent_id.slice(-8)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="flex items-center justify-end gap-1 text-white">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-lg font-light">
                          {order.total_price != null
                            ? `$${order.total_price.toFixed(2)} ${(order.currency || 'USD').toUpperCase()}`
                            : '--'}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-light">
                        <Truck className="w-3 h-3" />
                        <span>{statusLabel}</span>
                      </div>
                      {order.tracking_url && (
                        <Link
                          href={order.tracking_url}
                          target="_blank"
                          className="text-[11px] text-blue-300 hover:underline inline-flex items-center gap-1 justify-end"
                        >
                          <Link2 className="w-3 h-3" />
                          Track package
                        </Link>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-gray-400">
                      <Truck className="w-3 h-3" />
                      <span>Shipping Progress</span>
                      {loadingEvents && <span className="text-gray-500 normal-case tracking-normal">Live from Supabase</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      {STATUS_FLOW.map((step, idx) => {
                        const reached = idx <= activeIdx
                        const isCurrent = idx === activeIdx
                        return (
                          <div key={step.key} className="flex-1 flex items-center">
                            <div className="flex flex-col items-center w-12">
                              <div
                                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs ${
                                  reached
                                    ? 'bg-white text-black border-white shadow-[0_0_0_4px_rgba(255,255,255,0.08)]'
                                    : 'bg-white/5 text-gray-400 border-white/10'
                                }`}
                              >
                                {reached ? <Check className="w-4 h-4" /> : idx + 1}
                              </div>
                              <div className="mt-2 text-[10px] text-center uppercase tracking-wide text-gray-400 leading-tight">
                                {step.label}
                              </div>
                            </div>
                            {idx < STATUS_FLOW.length - 1 && (
                              <div
                                className={`flex-1 h-[2px] ${
                                  idx < activeIdx
                                    ? 'bg-gradient-to-r from-white via-white/70 to-white/30'
                                    : isCurrent
                                      ? 'bg-white/30'
                                      : 'bg-white/10'
                                }`}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {timeline.map((evt, idx) => (
                        <div
                          key={evt.id || `${order.id}-evt-${idx}`}
                          className="border border-white/10 rounded-md bg-white/[0.02] p-3"
                        >
                          <div className="flex items-center justify-between text-sm text-white">
                            <span className="capitalize">{formatStatusLabel(evt.status || order.status)}</span>
                            <span className="text-[11px] text-gray-400">{formatDate(evt.created_at)}</span>
                          </div>
                          <div className="text-[11px] text-gray-400 mt-1">
                            {evt.detail ||
                              STATUS_FLOW.find((s) => s.key === (evt.status || '').toLowerCase())?.helper ||
                              'In progress'}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-2">
                            {evt.location && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {evt.location}
                              </span>
                            )}
                            {evt.eta && (
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="w-3 h-3" />
                                ETA {formatDate(evt.eta)}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
