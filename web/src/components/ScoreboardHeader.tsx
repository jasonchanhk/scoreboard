import React from 'react'
import { HiChevronLeft, HiEye, HiLocationMarker, HiCalendar } from 'react-icons/hi'
import type { ScoreboardData } from '../types/scoreboard'

interface ScoreboardHeaderProps {
  scoreboard: ScoreboardData
  isOwner?: boolean
  onBackClick: () => void
  onViewPublic?: () => void
  onCopyShareCode?: () => void
  showCopied?: boolean
}

export const ScoreboardHeader: React.FC<ScoreboardHeaderProps> = ({
  scoreboard,
  isOwner = false,
  onBackClick,
  onViewPublic,
  onCopyShareCode,
  showCopied = false
}) => {
  return (
    <div className="bg-gray-800 py-4 px-6">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackClick}
            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <HiChevronLeft className="inline text-xl" /> Back to Dashboard
          </button>
          {isOwner && onViewPublic && (
            <button
              onClick={onViewPublic}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <HiEye className="inline mr-1" /> View Public
            </button>
          )}
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">
            {scoreboard.teams && scoreboard.teams.length >= 2 
              ? `${scoreboard.teams[0].name} vs ${scoreboard.teams[1].name}`
              : 'Loading teams...'
            }
          </h1>
          <div className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <span>
              {isOwner ? 'Owner View' : 'View Only'} • Quarter {scoreboard.current_quarter}
            </span>
          </div>
          {(scoreboard.venue || scoreboard.game_date || scoreboard.game_start_time || scoreboard.game_end_time) && (
            <div className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-4">
              {scoreboard.venue && (
                <div className="flex items-center">
                  <HiLocationMarker className="inline" />
                  <span className="ml-1">{scoreboard.venue}</span>
                </div>
              )}
              {scoreboard.game_date && (
                <div className="flex items-center">
                  <HiCalendar className="inline" />
                  <span className="ml-1">
                    {new Date(scoreboard.game_date).toLocaleDateString()}
                    {(scoreboard.game_start_time || scoreboard.game_end_time) && (
                      <span className="ml-2 text-gray-300">
                        {scoreboard.game_start_time && scoreboard.game_end_time 
                          ? `${scoreboard.game_start_time.substring(0, 5)} - ${scoreboard.game_end_time.substring(0, 5)}`
                          : scoreboard.game_start_time 
                            ? `from ${scoreboard.game_start_time.substring(0, 5)}`
                            : scoreboard.game_end_time 
                              ? `until ${scoreboard.game_end_time.substring(0, 5)}`
                              : ''
                        }
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="w-24 flex justify-end">
          {/* Share Code Display */}
          {scoreboard.share_code && onCopyShareCode && (
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Share Code</div>
              <div 
                className="text-lg font-mono bg-gray-700 px-3 py-1 rounded cursor-pointer hover:bg-gray-600 transition-colors"
                onClick={onCopyShareCode}
                title="Click to copy share code"
              >
                {showCopied ? 'Copied!' : scoreboard.share_code}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
