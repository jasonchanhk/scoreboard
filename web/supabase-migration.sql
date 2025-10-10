-- Create scoreboards table
CREATE TABLE IF NOT EXISTS scoreboards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_code TEXT UNIQUE,
  team_a_name TEXT NOT NULL,
  team_b_name TEXT NOT NULL,
  score_a INTEGER DEFAULT 0 CHECK (score_a >= 0 AND score_a <= 200),
  score_b INTEGER DEFAULT 0 CHECK (score_b >= 0 AND score_b <= 200),
  current_quarter INTEGER DEFAULT 1,
  timer TEXT DEFAULT '00:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE scoreboards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own scoreboards
CREATE POLICY "Users can view own scoreboards" ON scoreboards
  FOR SELECT USING (auth.uid() = owner_id);

-- Policy: Users can insert their own scoreboards
CREATE POLICY "Users can insert own scoreboards" ON scoreboards
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own scoreboards
CREATE POLICY "Users can update own scoreboards" ON scoreboards
  FOR UPDATE USING (auth.uid() = owner_id);

-- Policy: Users can delete their own scoreboards
CREATE POLICY "Users can delete own scoreboards" ON scoreboards
  FOR DELETE USING (auth.uid() = owner_id);

-- Policy: Anyone can view scoreboards with a share_code (public view)
CREATE POLICY "Anyone can view scoreboards with share_code" ON scoreboards
  FOR SELECT USING (share_code IS NOT NULL);

-- Create index for share_code lookups
CREATE INDEX IF NOT EXISTS idx_scoreboards_share_code ON scoreboards(share_code);

-- Create index for owner_id lookups
CREATE INDEX IF NOT EXISTS idx_scoreboards_owner_id ON scoreboards(owner_id);
