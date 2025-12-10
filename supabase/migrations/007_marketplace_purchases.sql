-- Create marketplace_purchases table to track all purchases and creator earnings
CREATE TABLE IF NOT EXISTS marketplace_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID REFERENCES user_assets(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  purchase_type TEXT CHECK (purchase_type IN ('digital', 'print')),
  material_id TEXT,
  finish_id TEXT,
  quantity INTEGER DEFAULT 1,
  total_price DECIMAL(10,2),
  creator_earnings DECIMAL(10,2),
  platform_earnings DECIMAL(10,2),
  payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_creator ON marketplace_purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_buyer ON marketplace_purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_asset ON marketplace_purchases(asset_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_purchases_created ON marketplace_purchases(created_at DESC);

-- Enable Row Level Security
ALTER TABLE marketplace_purchases ENABLE ROW LEVEL SECURITY;

-- Creators can view purchases of their own designs
CREATE POLICY "Creators can view their own sales"
  ON marketplace_purchases
  FOR SELECT
  USING (auth.uid() = creator_id);

-- Buyers can view their own purchases
CREATE POLICY "Buyers can view their own purchases"
  ON marketplace_purchases
  FOR SELECT
  USING (auth.uid() = buyer_id);

-- Service role can insert purchases (via API)
CREATE POLICY "Service can insert purchases"
  ON marketplace_purchases
  FOR INSERT
  WITH CHECK (true);
