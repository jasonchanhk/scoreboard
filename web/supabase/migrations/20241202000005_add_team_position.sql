-- Add position column to teams table to identify home/away teams
ALTER TABLE teams ADD COLUMN IF NOT EXISTS position TEXT CHECK (position IN ('home', 'away'));

-- Update existing teams to have position based on creation order
-- First team created = home, second team created = away
WITH team_positions AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY scoreboard_id ORDER BY created_at) as rn
  FROM teams
)
UPDATE teams 
SET position = CASE 
  WHEN rn = 1 THEN 'home'
  WHEN rn = 2 THEN 'away'
  ELSE NULL
END
FROM team_positions
WHERE teams.id = team_positions.id;

-- Create index for position queries
CREATE INDEX IF NOT EXISTS idx_teams_position ON teams(position);
CREATE INDEX IF NOT EXISTS idx_teams_scoreboard_position ON teams(scoreboard_id, position);
