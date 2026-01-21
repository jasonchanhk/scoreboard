import type { Database } from '../lib/supabase'

export type ScoreboardRow = Database['public']['Tables']['scoreboards']['Row']
export type ScoreboardInsert = Database['public']['Tables']['scoreboards']['Insert']
export type ScoreboardUpdate = Database['public']['Tables']['scoreboards']['Update']

export type TeamRow = Database['public']['Tables']['teams']['Row']
export type TeamInsert = Database['public']['Tables']['teams']['Insert']
export type TeamUpdate = Database['public']['Tables']['teams']['Update']

export type QuarterRow = Database['public']['Tables']['quarters']['Row']
export type QuarterInsert = Database['public']['Tables']['quarters']['Insert']
export type QuarterUpdate = Database['public']['Tables']['quarters']['Update']

export type ScoreboardWithTeams = ScoreboardRow & {
  // Some columns (e.g., venue) may exist in DB but not yet in generated types
  venue?: string | null
  game_date?: string | null
  game_start_time?: string | null
  game_end_time?: string | null
  teams: TeamRow[]
}
export interface Team {
  id: string
  name: string
  scoreboard_id: string
  position: 'home' | 'away' | null
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
