import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertDialog } from '../dialog'
import { Button } from '../button'
import { findByShareCode } from '../../data/scoreboardsRepo'

export const JoinScoreboardCTA: React.FC = () => {
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const [alert, setAlert] = useState<{ isOpen: boolean; title: string; message: string; variant?: 'error' | 'success' | 'warning' | 'info' }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error',
  })
  const navigate = useNavigate()

  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = joinCode.trim().toUpperCase()
    if (/^[A-Z0-9]{6}$/.test(code)) {
      setJoining(true)
      try {
        const data = await findByShareCode(code)
        if (!data) {
          setAlert({
            isOpen: true,
            title: 'Not Found',
            message: 'Scoreboard not found or not shared',
            variant: 'error',
          })
          return
        }

        navigate(`/scoreboard/${data.id}/view`)
      } catch (error) {
        console.error('Error joining scoreboard:', error)
        setAlert({
          isOpen: true,
          title: 'Error',
          message: 'Failed to join scoreboard',
          variant: 'error',
        })
      } finally {
        setJoining(false)
      }
    }
  }

  return (
    <>
      <AlertDialog
        isOpen={alert.isOpen}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
        onClose={() => setAlert({ ...alert, isOpen: false })}
      />
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
          <Button
            type="submit"
            disabled={!/^[A-Z0-9]{6}$/.test(joinCode) || joining}
            variant="primary"
            size="md"
          >
            {joining ? 'Joining...' : 'Join scoreboard'}
          </Button>
        </div>
      </form>
    </div>
    </>
  )
}

