-- Add venue and game_date fields to scoreboards table
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS venue TEXT;
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS game_date DATE;

-- Create indexes for venue and game_date queries
CREATE INDEX IF NOT EXISTS idx_scoreboards_venue ON scoreboards(venue);
CREATE INDEX IF NOT EXISTS idx_scoreboards_game_date ON scoreboards(game_date);
