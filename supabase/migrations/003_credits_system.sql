-- Credits System Migration
-- Ensures credits_remaining column exists and has proper constraints

-- Add credits_remaining if it doesn't exist (safe migration)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'credits_remaining'
  ) THEN
    ALTER TABLE profiles ADD COLUMN credits_remaining INTEGER DEFAULT 10 NOT NULL;
  END IF;
END $$;

-- Ensure credits can't be negative
ALTER TABLE profiles 
ADD CONSTRAINT credits_non_negative 
CHECK (credits_remaining >= 0);

-- Create index for faster credit checks
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits_remaining);

-- Create a function to deduct credits safely
CREATE OR REPLACE FUNCTION deduct_credits(user_id UUID, amount INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits_remaining INTO current_credits
  FROM profiles
  WHERE id = user_id
  FOR UPDATE;
  
  -- Check if user has enough credits
  IF current_credits < amount THEN
    RETURN FALSE;
  END IF;
  
  -- Deduct credits
  UPDATE profiles
  SET credits_remaining = credits_remaining - amount
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create a function to add credits
CREATE OR REPLACE FUNCTION add_credits(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET credits_remaining = credits_remaining + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Create credits transaction log table for audit
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deduct', 'add', 'purchase', 'refund', 'bonus')),
  reason TEXT,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on credit transactions
CREATE INDEX IF NOT EXISTS idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created ON credit_transactions(created_at DESC);

-- Create trigger to log credit transactions
CREATE OR REPLACE FUNCTION log_credit_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.credits_remaining != NEW.credits_remaining) THEN
    INSERT INTO credit_transactions (user_id, amount, type, balance_after, reason)
    VALUES (
      NEW.id,
      NEW.credits_remaining - OLD.credits_remaining,
      CASE 
        WHEN NEW.credits_remaining > OLD.credits_remaining THEN 'add'
        ELSE 'deduct'
      END,
      NEW.credits_remaining,
      'Auto-logged from profiles update'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to profiles table
DROP TRIGGER IF EXISTS profile_credits_change_trigger ON profiles;
CREATE TRIGGER profile_credits_change_trigger
AFTER UPDATE OF credits_remaining ON profiles
FOR EACH ROW
EXECUTE FUNCTION log_credit_transaction();

-- Grant permissions
GRANT SELECT, INSERT ON credit_transactions TO authenticated;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- Comment on tables
COMMENT ON TABLE credit_transactions IS 'Audit log for all credit changes';
COMMENT ON COLUMN profiles.credits_remaining IS 'Number of AI generation credits available to user';
