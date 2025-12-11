-- Add support for uploaded designs (009_upload_design_support.sql)
-- Users can now upload their own STL files to sell on the marketplace

-- Source column to distinguish generated vs uploaded designs
ALTER TABLE user_assets ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'generated' 
  CHECK (source IN ('generated', 'uploaded'));

-- Creator's custom price/commission per sale (in USD)
ALTER TABLE user_assets ADD COLUMN IF NOT EXISTS creator_price DECIMAL(10,2);

-- Description for uploaded designs
ALTER TABLE user_assets ADD COLUMN IF NOT EXISTS description TEXT;

-- Explicit name field (previously used 'prompt' for this)
ALTER TABLE user_assets ADD COLUMN IF NOT EXISTS name TEXT;

-- Index for filtering by source type
CREATE INDEX IF NOT EXISTS idx_user_assets_source ON user_assets(source);

-- Update existing assets to have source = 'generated' (already default, but explicit)
UPDATE user_assets SET source = 'generated' WHERE source IS NULL;
