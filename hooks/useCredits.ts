import { useState, useEffect } from 'react'
import { createClient } from '../lib/supabase/client'
import { checkCredits, deductCredits, addCredits, getCreditBalance, CREDIT_COSTS, CreditAction } from '../lib/credits'

export function useCredits(userId: string | null) {
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Load initial credits
  useEffect(() => {
    if (userId) {
      loadCredits()
    } else {
      setLoading(false)
    }
  }, [userId])

  const loadCredits = async () => {
    if (!userId) return
    
    try {
      const balance = await getCreditBalance(userId)
      setCredits(balance)
    } catch (error) {
      // Failed to load credits
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time credit updates
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('credit-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`,
        },
        (payload: any) => {
          if (payload.new.credits_remaining !== undefined) {
            setCredits(payload.new.credits_remaining)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const hasEnough = (action: CreditAction): boolean => {
    return credits >= CREDIT_COSTS[action]
  }

  const check = async (action: CreditAction) => {
    if (!userId) {
      return { hasEnough: false, current: 0, required: CREDIT_COSTS[action] }
    }
    return await checkCredits(userId, action)
  }

  const deduct = async (amount: number, reason?: string) => {
    if (!userId) {
      return { success: false, newBalance: 0, error: 'No user ID' }
    }
    const result = await deductCredits(userId, amount, reason)
    if (result.success) {
      setCredits(result.newBalance)
    }
    return result
  }

  const add = async (amount: number, reason?: string) => {
    if (!userId) {
      return { success: false, newBalance: 0, error: 'No user ID' }
    }
    const result = await addCredits(userId, amount, reason)
    if (result.success) {
      setCredits(result.newBalance)
    }
    return result
  }

  const refresh = async () => {
    await loadCredits()
  }

  return {
    credits,
    loading,
    hasEnough,
    check,
    deduct,
    add,
    refresh,
  }
}
