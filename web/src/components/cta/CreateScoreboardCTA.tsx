import React from 'react'
import { Button } from '../button'

interface CreateScoreboardCTAProps {
  onCreateClick: () => void
}

export const CreateScoreboardCTA: React.FC<CreateScoreboardCTAProps> = ({ onCreateClick }) => {
  return (
    <div className="flex flex-col h-full rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
      <div className="space-y-3 sm:space-y-4 flex-grow">
        <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">Create a new scoreboard</h3>
        <p className="text-sm text-gray-600">
          Launch a fresh game center with teams, timers, and live controls. Perfect for league games or pickup matches.
        </p>
      </div>
      <div className="mt-6 sm:mt-8">
        <Button onClick={onCreateClick} variant="primary" size="md" className="w-full sm:w-auto">
          Create new scoreboard
        </Button>
      </div>
    </div>
  )
}

