-- Expand subscription_tier allowed values to match app tiers

-- Normalize legacy tiers before constraint change
UPDATE profiles SET subscription_tier = 'showroom' WHERE subscription_tier = 'pro';
UPDATE profiles SET subscription_tier = 'factory' WHERE subscription_tier = 'enterprise';

-- Drop old constraint if exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'profiles' AND constraint_name = 'profiles_subscription_tier_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_subscription_tier_check;
  END IF;
END$$;

-- Add new constraint with all supported tiers
ALTER TABLE profiles
ADD CONSTRAINT profiles_subscription_tier_check
CHECK (subscription_tier IN ('free','garage','showroom','dealership','factory'));
