-- Add color column to teams table for custom team colors
ALTER TABLE teams ADD COLUMN IF NOT EXISTS color TEXT;

-- Set default colors for existing teams (red for home, blue for away)
UPDATE teams 
SET color = CASE 
  WHEN position = 'home' THEN '#ef4444'
  WHEN position = 'away' THEN '#3b82f6'
  ELSE '#ef4444'
END
WHERE color IS NULL;

