import React from 'react'
import { FaBasketballBall } from 'react-icons/fa'

interface BrandingLogoProps {
  variant?: 'default' | 'compact' | 'navbar' | 'summary' | 'footer'
  onClick?: () => void
  className?: string
  borderColor?: 'gray' | 'black'
}

export const BrandingLogo: React.FC<BrandingLogoProps> = ({
  variant = 'default',
  onClick,
  className = '',
  borderColor = 'gray'
}) => {
  const baseClasses = variant === 'summary' 
    ? 'flex items-center space-x-4 bg-white border rounded-lg px-6 py-4'
    : 'flex items-center space-x-2 bg-white border rounded-lg px-3 py-2'
  const borderClass = borderColor === 'black' ? 'border-black' : 'border-gray-200'
  const cursorClass = onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
  
  const iconSize = variant === 'navbar' ? 'w-8 h-8' : variant === 'compact' ? 'w-7 h-7' : variant === 'summary' ? 'w-12 h-12' : 'w-8 h-8'
  const iconTextSize = variant === 'navbar' ? 'text-sm' : variant === 'compact' ? 'text-xs' : variant === 'summary' ? 'text-lg' : 'text-sm'
  const poweredBySize = variant === 'summary' ? 'text-2xl' : variant === 'navbar' ? 'text-xs' : 'text-xs'
  const brandNameSize = variant === 'summary' ? 'text-2xl' : variant === 'navbar' ? 'text-sm' : 'text-sm'

  if (variant === 'navbar') {
    return (
      <div 
        className={`flex items-center space-x-3 ${cursorClass} ${className}`}
        onClick={onClick}
      >
        <div className={`flex items-center justify-center ${iconSize} bg-indigo-600 rounded-full shrink-0`}>
          <FaBasketballBall className={`text-white ${iconTextSize}`} />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Pretty Scoreboard</h1>
      </div>
    )
  }

  if (variant === 'footer') {
    return (
      <div 
        className={`flex items-center space-x-3 ${cursorClass} ${className}`}
        onClick={onClick}
      >
        <div className={`flex items-center justify-center ${iconSize} bg-indigo-600 rounded-full shrink-0`}>
          <FaBasketballBall className={`text-white ${iconTextSize}`} />
        </div>
        <h2 className="text-xl font-bold text-white">Pretty Scoreboard</h2>
      </div>
    )
  }

  return (
    <div 
      className={`${baseClasses} ${borderClass} ${cursorClass} ${className}`}
      onClick={onClick}
    >
      <div className={`flex items-center justify-center ${iconSize} bg-indigo-600 rounded-full shrink-0`}>
        <FaBasketballBall className={`text-white ${iconTextSize}`} />
      </div>
      <div className="flex flex-col">
        <span className={`${poweredBySize} text-gray-700 leading-tight`}>Powered by</span>
        <span className={`${brandNameSize} font-bold text-gray-700`}>Pretty Scoreboard</span>
      </div>
    </div>
  )
}

