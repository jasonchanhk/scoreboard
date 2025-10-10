-- Create scoreboards table
CREATE TABLE scoreboards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  share_code text unique, -- 6-digit view-only code
  current_quarter int default 1,
  timer text default '00:00',
  created_at timestamp with time zone default now()
);

-- Create teams table
CREATE TABLE teams (
  id uuid primary key default gen_random_uuid(),
  scoreboard_id uuid references scoreboards(id) on delete cascade,
  name text not null,
  -- You could also add metadata here, like logo_url, color, etc.
  created_at timestamp with time zone default now(),
  unique(scoreboard_id, name) -- prevent duplicate team names in one game
);

-- Create quarters table
CREATE TABLE quarters (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references teams(id) on delete cascade,
  quarter_number int not null check (quarter_number between 1 and 4),
  points int default 0,
  fouls int default 0,
  timeouts int default 0,
  created_at timestamp with time zone default now(),
  unique (team_id, quarter_number)
);

-- Enable Row Level Security
ALTER TABLE scoreboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarters ENABLE ROW LEVEL SECURITY;

-- Scoreboards policies
CREATE POLICY "Users can view own scoreboards" ON scoreboards
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own scoreboards" ON scoreboards
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own scoreboards" ON scoreboards
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own scoreboards" ON scoreboards
  FOR DELETE USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can view scoreboards with share_code" ON scoreboards
  FOR SELECT USING (share_code IS NOT NULL);

-- Teams policies
CREATE POLICY "Users can view teams of own scoreboards" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scoreboards 
      WHERE scoreboards.id = teams.scoreboard_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert teams to own scoreboards" ON teams
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM scoreboards 
      WHERE scoreboards.id = teams.scoreboard_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update teams of own scoreboards" ON teams
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM scoreboards 
      WHERE scoreboards.id = teams.scoreboard_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete teams of own scoreboards" ON teams
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM scoreboards 
      WHERE scoreboards.id = teams.scoreboard_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view teams of shared scoreboards" ON teams
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM scoreboards 
      WHERE scoreboards.id = teams.scoreboard_id 
      AND scoreboards.share_code IS NOT NULL
    )
  );

-- Quarters policies
CREATE POLICY "Users can view quarters of own scoreboards" ON quarters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN scoreboards ON scoreboards.id = teams.scoreboard_id
      WHERE teams.id = quarters.team_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert quarters to own scoreboards" ON quarters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN scoreboards ON scoreboards.id = teams.scoreboard_id
      WHERE teams.id = quarters.team_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update quarters of own scoreboards" ON quarters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN scoreboards ON scoreboards.id = teams.scoreboard_id
      WHERE teams.id = quarters.team_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete quarters of own scoreboards" ON quarters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN scoreboards ON scoreboards.id = teams.scoreboard_id
      WHERE teams.id = quarters.team_id 
      AND scoreboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view quarters of shared scoreboards" ON quarters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM teams 
      JOIN scoreboards ON scoreboards.id = teams.scoreboard_id
      WHERE teams.id = quarters.team_id 
      AND scoreboards.share_code IS NOT NULL
    )
  );

-- Create indexes for performance
CREATE INDEX idx_scoreboards_owner_id ON scoreboards(owner_id);
CREATE INDEX idx_scoreboards_share_code ON scoreboards(share_code);
CREATE INDEX idx_teams_scoreboard_id ON teams(scoreboard_id);
CREATE INDEX idx_quarters_team_id ON quarters(team_id);
CREATE INDEX idx_quarters_team_quarter ON quarters(team_id, quarter_number);
