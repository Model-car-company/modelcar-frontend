-- Add gallery support fields to user_assets table
-- This enables public sharing and community gallery functionality

-- Add is_public column (defaults to false for privacy)
ALTER TABLE user_assets 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;

-- Add creator_name column for display in gallery
ALTER TABLE user_assets 
ADD COLUMN IF NOT EXISTS creator_name TEXT;

-- Create index on is_public for efficient gallery queries
CREATE INDEX IF NOT EXISTS idx_user_assets_is_public ON user_assets(is_public) 
WHERE is_public = true;

-- Create composite index for gallery queries (public models ordered by creation date)
CREATE INDEX IF NOT EXISTS idx_user_assets_public_created 
ON user_assets(is_public, created_at DESC) 
WHERE is_public = true;

-- Add RLS policy to allow users to view public assets from other users
CREATE POLICY "Users can view public assets from all users"
  ON user_assets
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own assets" ON user_assets;
