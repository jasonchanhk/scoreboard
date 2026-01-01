import React from 'react'
import { BaseDialog } from './BaseDialog'
import { CloseButton } from '../button'
import { QuarterHistory } from '../QuarterHistory'
import type { Team, Quarter } from '../../types/scoreboard'

interface QuarterHistoryDialogProps {
  isOpen: boolean
  teams: Team[]
  allQuarters: Quarter[]
  currentQuarter: number
  quarters?: Quarter[]
  onClose: () => void
}

export const QuarterHistoryDialog: React.FC<QuarterHistoryDialogProps> = ({
  isOpen,
  teams,
  allQuarters,
  currentQuarter,
  quarters = [],
  onClose
}) => {
  if (!isOpen) return null

  return (
    <BaseDialog
      onCancel={onClose}
      showCancel={false}
      contentClassName="w-11/12 md:w-2/3 lg:w-1/2"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Quarter History</h3>
        <CloseButton onClick={onClose} />
      </div>
      <QuarterHistory
        teams={teams}
        allQuarters={allQuarters}
        currentQuarter={currentQuarter}
        quarters={quarters}
        showCurrentQuarterScores={true}
      />
    </BaseDialog>
  )
}

