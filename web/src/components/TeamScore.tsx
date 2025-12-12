import React, { useRef, useEffect, useState } from 'react'
import { IoAdd, IoRemove } from 'react-icons/io5'
import { CircleButton } from './button'

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
  const scoreContainerRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState<string>('4rem')

  // Calculate font size based on container dimensions - maximize space usage
  useEffect(() => {
    const updateFontSize = () => {
      if (scoreContainerRef.current) {
        const container = scoreContainerRef.current
        const containerHeight = container.clientHeight
        
        // Use a large percentage of the container to maximize visibility
        // Use 70% of height to ensure the score is prominent
        const heightPercentage = 0.7
        const calculatedSize = containerHeight * heightPercentage
        
        // Set reasonable min and max to ensure readability
        const minSize = 48 // pixels
        const maxSize = 400 // pixels
        const finalSize = Math.max(minSize, Math.min(maxSize, calculatedSize))
        
        setFontSize(`${finalSize}px`)
      }
    }

    updateFontSize()
    
    // Update on resize
    const resizeObserver = new ResizeObserver(updateFontSize)
    if (scoreContainerRef.current) {
      resizeObserver.observe(scoreContainerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [score])

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
      <div 
        ref={scoreContainerRef}
        className="flex-1 flex items-center justify-center px-2 bg-white min-w-0"
      >
        <div 
          className="font-extrabold leading-none whitespace-nowrap" 
          style={{ 
            fontSize: fontSize,
            color: defaultColor,
          }}
        >
          {score}
        </div>
      </div>
      {isOwner && onScoreUpdate && (
        <div className="bg-white py-4 flex items-center justify-center gap-4">
          <CircleButton
            onClick={() => onScoreUpdate(1)}
            variant="secondary"
            size="md"
            ariaLabel="Add 1 point"
          >
            <IoAdd className="text-gray-900 text-xl" />
          </CircleButton>
          <CircleButton
            onClick={() => onScoreUpdate(-1)}
            variant="secondary"
            size="md"
            ariaLabel="Subtract 1 point"
          >
            <IoRemove className="text-gray-900 text-xl" />
          </CircleButton>
        </div>
      )}
    </div>
  )
}

