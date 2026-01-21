import { supabase } from '../lib/supabase'
import { handleResult } from './handleResult'
import type {
  ScoreboardInsert,
  ScoreboardUpdate,
  ScoreboardWithTeams,
  ScoreboardRow,
} from '../types/scoreboard'

export async function getByOwner(ownerId: string): Promise<ScoreboardWithTeams[]> {
  const result = await supabase
    .from('scoreboards')
    .select('*, teams (*)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  const data = handleResult<ScoreboardWithTeams[]>(result, 'Fetch scoreboards by owner')
  return data.map((sb) => ({
    ...sb,
    teams: sb.teams || [],
  }))
}

export async function getByIdWithTeams(id: string): Promise<ScoreboardWithTeams | null> {
  const result = await supabase
    .from('scoreboards')
    .select('*, teams (*)')
    .eq('id', id)
    .maybeSingle()

  const data = handleResult<ScoreboardWithTeams | null>(result, 'Fetch scoreboard by id')
  if (!data) return null
  return { ...data, teams: data.teams || [] }
}

export async function getByShareCodeWithTeams(code: string): Promise<ScoreboardWithTeams | null> {
  const result = await supabase
    .from('scoreboards')
    .select('*, teams (*)')
    .eq('share_code', code)
    .maybeSingle()

  const data = handleResult<ScoreboardWithTeams | null>(result, 'Fetch scoreboard by share code')
  if (!data) return null
  return { ...data, teams: data.teams || [] }
}

export async function findByShareCode(code: string): Promise<Pick<ScoreboardRow, 'id'> | null> {
  const result = await supabase
    .from('scoreboards')
    .select('id')
    .eq('share_code', code)
    .maybeSingle()

  return handleResult<Pick<ScoreboardRow, 'id'> | null>(result, 'Find scoreboard by share code')
}

export async function create(payload: ScoreboardInsert): Promise<ScoreboardRow> {
  const result = await supabase.from('scoreboards').insert(payload).select().single()
  return handleResult<ScoreboardRow>(result, 'Create scoreboard')
}

export async function update(id: string, patch: ScoreboardUpdate): Promise<ScoreboardRow> {
  const result = await supabase
    .from('scoreboards')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  return handleResult<ScoreboardRow>(result, 'Update scoreboard')
}

export async function remove(id: string, ownerId?: string): Promise<void> {
  let query = supabase.from('scoreboards').delete().eq('id', id)
  if (ownerId) {
    query = query.eq('owner_id', ownerId)
  }
  const { error } = await query
  if (error) {
    throw new Error(`Delete scoreboard: ${error.message}`)
  }
}

export async function countByOwner(ownerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('scoreboards')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', ownerId)
  
  if (error) {
    throw new Error(`Count scoreboards: ${error.message}`)
  }
  
  return count || 0
}

