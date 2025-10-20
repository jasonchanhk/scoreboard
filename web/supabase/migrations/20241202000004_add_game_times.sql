-- Add game start and end time fields to scoreboards table
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS game_start_time TIME;
ALTER TABLE scoreboards ADD COLUMN IF NOT EXISTS game_end_time TIME;

-- Create indexes for game time queries
CREATE INDEX IF NOT EXISTS idx_scoreboards_game_start_time ON scoreboards(game_start_time);
CREATE INDEX IF NOT EXISTS idx_scoreboards_game_end_time ON scoreboards(game_end_time);
