export interface Team {
  id: string
  name: string
  scoreboard_id: string
  position: 'home' | 'away'
  color: string | null
  created_at: string
}

export interface Quarter {
  id: string
  team_id: string
  quarter_number: number
  points: number
  fouls: number
  timeouts: number
  created_at: string
}

export interface ScoreboardData {
  id: string
  owner_id: string
  share_code: string | null
  current_quarter: number
  timer: string
  timer_duration: number
  timer_started_at: string | null
  timer_state: 'stopped' | 'running' | 'paused'
  timer_paused_duration: number
  venue: string | null
  game_date: string | null
  game_start_time: string | null
  game_end_time: string | null
  created_at: string
  teams: Team[]
}

export interface QuarterHistoryItem {
  quarter: number
  teamAScore: number
  teamBScore: number
  teamAName: string
  teamBName: string
}
