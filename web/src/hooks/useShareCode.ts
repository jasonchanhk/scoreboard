import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ScoreboardData } from '../types/scoreboard'

export const useShareCode = (
  scoreboard: ScoreboardData | null,
  isOwner: boolean,
  setScoreboard: (updater: (prev: ScoreboardData | null) => ScoreboardData | null) => void
) => {
  const [showCopied, setShowCopied] = useState(false)
  const [isGeneratingShareCode, setIsGeneratingShareCode] = useState(false)

  const handleCopyShareCode = useCallback(() => {
    if (!scoreboard?.share_code) return
    navigator.clipboard.writeText(scoreboard.share_code)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }, [scoreboard?.share_code])

  const handleGenerateShareCode = useCallback(async () => {
    if (!scoreboard || !isOwner) return

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const generateCode = () => {
      const bytes = new Uint8Array(6)
      window.crypto.getRandomValues(bytes)
      let out = ''
      for (let i = 0; i < bytes.length; i++) {
        out += alphabet[bytes[i] % alphabet.length]
      }
      return out
    }

    const scoreboardId = scoreboard.id
    const maxAttempts = 10
    let lastError: unknown = null
    setIsGeneratingShareCode(true)
    
    try {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          const shareCode = generateCode()
          const { error } = await supabase
            .from('scoreboards')
            .update({ share_code: shareCode })
            .eq('id', scoreboardId)
          if (error) {
            // @ts-ignore - Supabase error code
            if (error.code === '23505') continue // Unique constraint violation
            throw error
          }
          setScoreboard(prev => (prev ? { ...prev, share_code: shareCode } : prev))
          return
        } catch (err) {
          lastError = err
        }
      }
      throw lastError
    } catch (error) {
      console.error('Error generating share code after retries:', error)
      throw error
    } finally {
      setIsGeneratingShareCode(false)
    }
  }, [scoreboard, isOwner, setScoreboard])

  return {
    showCopied,
    isGeneratingShareCode,
    handleCopyShareCode,
    handleGenerateShareCode,
  }
}

