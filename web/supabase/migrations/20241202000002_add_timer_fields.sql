-- Add timer fields to scoreboards table
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS timer_duration INTEGER DEFAULT 720; -- Default 12 minutes (720 seconds)
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS timer_state TEXT DEFAULT 'stopped' CHECK (timer_state IN ('stopped', 'running', 'paused'));
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS timer_paused_duration INTEGER DEFAULT 0; -- Total paused time in seconds

-- Create index for timer queries
CREATE INDEX IF NOT EXISTS idx_scoreboards_timer_state ON scoreboards(timer_state);
