import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      scoreboards: {
        Row: {
          id: string
          owner_id: string
          share_code: string | null
          current_quarter: number
          timer: string
          created_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          share_code?: string | null
          current_quarter?: number
          timer?: string
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          share_code?: string | null
          current_quarter?: number
          timer?: string
          created_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          scoreboard_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          scoreboard_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          scoreboard_id?: string
          name?: string
          created_at?: string
        }
      }
      quarters: {
        Row: {
          id: string
          team_id: string
          quarter_number: number
          points: number
          fouls: number
          timeouts: number
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          quarter_number: number
          points?: number
          fouls?: number
          timeouts?: number
          created_at?: string
        }
        Update: {
          id?: string
          team_id?: string
          quarter_number?: number
          points?: number
          fouls?: number
          timeouts?: number
          created_at?: string
        }
      }
    }
  }
}
