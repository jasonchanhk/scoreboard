import React from 'react'
import type { Team, Quarter, QuarterHistoryItem } from '../types/scoreboard'

interface QuarterHistoryProps {
  teams: Team[]
  allQuarters: Quarter[]
  currentQuarter: number
  quarters?: Quarter[] // Optional current quarter data for highlighting
  showCurrentQuarterScores?: boolean
}

export const QuarterHistory: React.FC<QuarterHistoryProps> = ({
  teams,
  allQuarters,
  currentQuarter,
  quarters = [],
  showCurrentQuarterScores = false
}) => {
  // Helper function to get team by index
  const getTeam = (index: number) => {
    if (!teams || teams.length <= index) return null
    return teams[index]
  }

  // Helper function to get team score for current quarter
  const getTeamScore = (teamId: string) => {
    const quarter = quarters.find(q => q.team_id === teamId)
    return quarter?.points || 0
  }

  // Helper function to get quarter scores organized by quarter
  const getQuarterHistory = (): QuarterHistoryItem[] => {
    if (!teams || teams.length < 2) return []
    
    const teamA = teams[0]
    const teamB = teams[1]
    const quarterNumbers = [1, 2, 3, 4]
    
    return quarterNumbers.map(q => {
      const teamAQuarter = allQuarters.find(quarter => 
        quarter.team_id === teamA.id && quarter.quarter_number === q
      )
      const teamBQuarter = allQuarters.find(quarter => 
        quarter.team_id === teamB.id && quarter.quarter_number === q
      )
      
      return {
        quarter: q,
        teamAScore: teamAQuarter?.points || 0,
        teamBScore: teamBQuarter?.points || 0,
        teamAName: teamA.name,
        teamBName: teamB.name,
      }
    })
  }

  if (!teams || teams.length < 2) {
    return null
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold mb-6">Quarter History</h3>
      
      {/* Header */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm font-medium text-gray-300">
        <div>Quarter</div>
        <div className="text-center">{getTeam(0)?.name}</div>
        <div className="text-center">{getTeam(1)?.name}</div>
      </div>

      {/* Quarter rows */}
      {getQuarterHistory().map((q) => (
        <div key={q.quarter} className={`grid grid-cols-3 gap-4 py-2 text-sm rounded ${
          q.quarter === currentQuarter ? 'bg-gray-700' : ''
        }`}>
          <div className="font-medium">Q{q.quarter}</div>
          <div className="text-center">
            {q.quarter === currentQuarter && showCurrentQuarterScores ? (
              <span className="text-green-400 font-bold">
                {getTeam(0) ? getTeamScore(getTeam(0)!.id) : 0}
              </span>
            ) : (
              q.teamAScore
            )}
          </div>
          <div className="text-center">
            {q.quarter === currentQuarter && showCurrentQuarterScores ? (
              <span className="text-green-400 font-bold">
                {getTeam(1) ? getTeamScore(getTeam(1)!.id) : 0}
              </span>
            ) : (
              q.teamBScore
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
