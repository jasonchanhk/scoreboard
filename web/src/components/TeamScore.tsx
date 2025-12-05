import React from 'react'
import { IoAdd, IoRemove } from 'react-icons/io5'

interface TeamScoreProps {
  teamName: string
  score: number
  color: string | null
  isOwner?: boolean
  onScoreUpdate?: (delta: number) => void
}

export const TeamScore: React.FC<TeamScoreProps> = ({
  teamName,
  score,
  color,
  isOwner = false,
  onScoreUpdate
}) => {
  const defaultColor = color || '#ef4444'
  const borderColor = color || '#fca5a5'
  // Use larger font size for non-owner views (public view)
  const scoreFontSize = isOwner ? 'min(30vh, 28vw)' : 'min(50vh, 45vw)'

  return (
    <div 
      className="rounded-3xl overflow-hidden flex flex-col h-full border-4"
      style={{ 
        borderColor: borderColor,
      }}
    >
      <div 
        className="text-black text-3xl font-extrabold py-3 text-center"
        style={{ 
          backgroundColor: defaultColor,
        }}
      >
        {teamName}
      </div>
      <div className="flex-1 flex items-center justify-center overflow-hidden px-2 bg-white">
        <div 
          className="font-extrabold leading-none" 
          style={{ 
            fontSize: scoreFontSize,
            color: defaultColor,
          }}
        >
          {score}
        </div>
      </div>
      {isOwner && onScoreUpdate && (
        <div className="bg-white py-4 flex items-center justify-center gap-4">
          <button
            onClick={() => onScoreUpdate(1)}
            className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold flex items-center justify-center"
            aria-label="Add 1 point"
          >
            <IoAdd className="text-gray-900 text-xl" />
          </button>
          <button
            onClick={() => onScoreUpdate(-1)}
            className="w-12 h-12 rounded-full bg-gray-200 hover:bg-gray-300 text-2xl font-bold flex items-center justify-center"
            aria-label="Subtract 1 point"
          >
            <IoRemove className="text-gray-900 text-xl" />
          </button>
        </div>
      )}
    </div>
  )
}

