-- Failed webhook events table for error recovery
-- This table stores webhook events that failed to process, allowing manual recovery

CREATE TABLE IF NOT EXISTS failed_webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT NOT NULL,
  payment_intent_id TEXT,
  event_data JSONB,
  error_message TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quickly finding unresolved events
CREATE INDEX IF NOT EXISTS idx_failed_webhook_events_unresolved 
  ON failed_webhook_events(created_at DESC) 
  WHERE resolved = FALSE;

-- Index for looking up by payment intent
CREATE INDEX IF NOT EXISTS idx_failed_webhook_events_pi 
  ON failed_webhook_events(payment_intent_id);

-- Enable Row Level Security
ALTER TABLE failed_webhook_events ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (via API)
CREATE POLICY "Service role only access"
  ON failed_webhook_events
  FOR ALL
  USING (false);
