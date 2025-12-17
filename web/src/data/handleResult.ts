import { PostgrestError } from '@supabase/supabase-js'

type ResultLike<T> = {
  data: T | null
  error: PostgrestError | null
}

/**
 * Normalizes Supabase responses so callers can just handle success/throw.
 */
export function handleResult<T>(result: ResultLike<T>, context?: string): T {
  if (result.error) {
    const prefix = context ? `${context}: ` : ''
    throw new Error(`${prefix}${result.error.message}`)
  }

  if (result.data === null || result.data === undefined) {
    const prefix = context ? `${context}: ` : ''
    throw new Error(`${prefix}No data returned from Supabase`)
  }

  return result.data
}

