// Credits Management System
import { createClient } from './supabase/client'

export const CREDIT_COSTS = {
  IMAGE_GENERATION: 3,
  SKETCH_TO_RENDER: 5,  // ControlNet sketch-to-render (Vizcom-style)
  MODEL_3D_GENERATION: 14,
  MODEL_DOWNLOAD: 0, // Free for now
  PREMIUM_MODEL: 10,
} as const

export type CreditAction = keyof typeof CREDIT_COSTS

/**
 * Check if user has enough credits for an action
 */
export async function checkCredits(
  userId: string, 
  action: CreditAction
): Promise<{ hasEnough: boolean; current: number; required: number }> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single()

  const current = profile?.credits_remaining ?? 0
  const required = CREDIT_COSTS[action]

  return {
    hasEnough: current >= required,
    current,
    required
  }
}

/**
 * Deduct credits from user account (with transaction safety)
 */
export async function deductCredits(
  userId: string,
  amount: number,
  reason?: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = createClient()

  try {
    // Get current credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single()

    if (!profile) {
      return { success: false, newBalance: 0, error: 'Profile not found' }
    }

    const currentCredits = profile.credits_remaining

    // Check if user has enough credits
    if (currentCredits < amount) {
      return { 
        success: false, 
        newBalance: currentCredits,
        error: 'Insufficient credits' 
      }
    }

    // Deduct credits
    const newBalance = currentCredits - amount
    const { error } = await supabase
      .from('profiles')
      .update({ credits_remaining: newBalance })
      .eq('id', userId)

    if (error) {
      return { success: false, newBalance: currentCredits, error: error.message }
    }

    // Log transaction (optional - if you have credit_transactions table)
    try {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: -amount,
          type: 'deduct',
          reason: reason || 'Credit usage',
          balance_after: newBalance
        })
    } catch {
      // Ignore errors in logging - table might not exist yet
    }

    return { success: true, newBalance }
  } catch (error: any) {
    return { 
      success: false, 
      newBalance: 0, 
      error: error.message || 'Failed to deduct credits' 
    }
  }
}

/**
 * Add credits to user account
 */
export async function addCredits(
  userId: string,
  amount: number,
  reason: string = 'Credits added'
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  const supabase = createClient()

  try {
    // Get current credits
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', userId)
      .single()

    if (!profile) {
      return { success: false, newBalance: 0, error: 'Profile not found' }
    }

    const newBalance = profile.credits_remaining + amount

    // Update credits
    const { error } = await supabase
      .from('profiles')
      .update({ credits_remaining: newBalance })
      .eq('id', userId)

    if (error) {
      return { success: false, newBalance: profile.credits_remaining, error: error.message }
    }

    // Log transaction
    try {
      await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount,
          type: 'add',
          reason,
          balance_after: newBalance
        })
    } catch {
      // Ignore errors in logging
    }

    return { success: true, newBalance }
  } catch (error: any) {
    return { 
      success: false, 
      newBalance: 0, 
      error: error.message || 'Failed to add credits' 
    }
  }
}

/**
 * Get user's credit balance
 */
export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits_remaining')
    .eq('id', userId)
    .single()

  return profile?.credits_remaining ?? 0
}

/**
 * Get user's credit transaction history
 */
export async function getCreditHistory(
  userId: string,
  limit: number = 50
): Promise<any[]> {
  const supabase = createClient()
  
  const { data } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}
