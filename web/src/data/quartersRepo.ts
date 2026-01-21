import { supabase } from '../lib/supabase'
import { handleResult } from './handleResult'
import type { QuarterRow, QuarterUpdate } from '../types/scoreboard'

export async function getByTeamIds(teamIds: string[]): Promise<QuarterRow[]> {
  if (teamIds.length === 0) return []

  const result = await supabase
    .from('quarters')
    .select('id, team_id, quarter_number, points, fouls, timeouts, created_at')
    .in('team_id', teamIds)
    .order('quarter_number', { ascending: true })

  return handleResult<QuarterRow[]>(result, 'Fetch quarters by team ids')
}

export async function getByTeamIdsAndQuarter(teamIds: string[], quarterNumber: number): Promise<QuarterRow[]> {
  if (teamIds.length === 0) return []

  const result = await supabase
    .from('quarters')
    .select('id, team_id, quarter_number, points, fouls, timeouts, created_at')
    .in('team_id', teamIds)
    .eq('quarter_number', quarterNumber)

  return handleResult<QuarterRow[]>(result, 'Fetch quarters by team ids and quarter')
}

export async function upsertQuarters(rows: QuarterUpdate[]): Promise<QuarterRow[]> {
  if (rows.length === 0) return []

  const result = await supabase.from('quarters').upsert(rows, { onConflict: 'team_id,quarter_number' }).select()
  return handleResult<QuarterRow[]>(result, 'Upsert quarters')
}

