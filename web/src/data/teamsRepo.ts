import { supabase } from '../lib/supabase'
import { handleResult } from './handleResult'
import type { TeamInsert, TeamRow, TeamUpdate } from '../types/scoreboard'

export async function getByScoreboard(scoreboardId: string): Promise<TeamRow[]> {
  const result = await supabase
    .from('teams')
    .select('*')
    .eq('scoreboard_id', scoreboardId)
    .order('created_at', { ascending: true })

  return handleResult<TeamRow[]>(result, 'Fetch teams by scoreboard')
}

export async function createMany(teams: TeamInsert[]): Promise<TeamRow[]> {
  if (teams.length === 0) return []
  const result = await supabase.from('teams').insert(teams).select()
  return handleResult<TeamRow[]>(result, 'Create teams')
}

export async function updateTeam(id: string, patch: TeamUpdate): Promise<TeamRow> {
  const result = await supabase.from('teams').update(patch).eq('id', id).select().single()
  return handleResult<TeamRow>(result, 'Update team')
}

