-- Add billing interval to profiles so all subscription data lives in one table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_billing_interval TEXT DEFAULT 'month';

-- Ensure only valid values
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_subscription_billing_interval_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_subscription_billing_interval_check;
  END IF;
END$$;

ALTER TABLE profiles
ADD CONSTRAINT profiles_subscription_billing_interval_check
CHECK (subscription_billing_interval IN ('month','year'));
