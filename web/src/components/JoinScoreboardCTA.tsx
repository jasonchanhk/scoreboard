import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export const JoinScoreboardCTA: React.FC = () => {
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const navigate = useNavigate()

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (/^[A-Z0-9]{6}$/.test(code)) {
      setJoining(true)
      try {
        const { data, error } = await supabase
          .from('scoreboards')
          .select('id')
          .eq('share_code', code)
          .single()

        if (error) throw error
        if (!data) {
          alert('Scoreboard not found or not shared')
          return
        }

        navigate(`/scoreboard/${data.id}/view`)
      } catch (error) {
        console.error('Error joining scoreboard:', error)
        alert('Failed to join scoreboard')
      } finally {
        setJoining(false)
      }
    }
  }

  return (
    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-8 shadow-sm">
      <div className="space-y-4">
        <h3 className="text-2xl font-semibold text-indigo-900">Join with a code</h3>
        <p className="text-sm text-indigo-700">
          Enter the 6-character share code from another host to follow their live scoreboard.
        </p>
      </div>
      <form onSubmit={handleJoinSubmit} className="mt-8 space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wide text-indigo-700">
          Share code
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            inputMode="text"
            maxLength={6}
            placeholder="ABC123"
            value={joinCode}
            onChange={(e) => {
              const cleaned = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
              setJoinCode(cleaned)
            }}
            className="flex-1 rounded-lg border border-indigo-200 bg-white px-4 py-3 text-base tracking-[0.3em] text-indigo-900 shadow-sm focus:border-indigo-400 focus:ring-indigo-400"
          />
          <button
            type="submit"
            disabled={!/^[A-Z0-9]{6}$/.test(joinCode) || joining}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {joining ? 'Joining...' : 'Join scoreboard'}
          </button>
        </div>
      </form>
    </div>
  )
}

