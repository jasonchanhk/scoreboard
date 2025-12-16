import React from 'react'
import { HiX } from 'react-icons/hi'

interface CloseButtonProps {
  onClick: () => void
  ariaLabel?: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  ariaLabel = 'Close',
  className = '',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  }

  return (
    <button
      onClick={onClick}
      className={`text-gray-500 hover:text-gray-700 font-bold cursor-pointer transition-colors ${sizeClasses[size]} ${className}`}
      aria-label={ariaLabel}
      type="button"
    >
      <HiX className={sizeClasses[size]} />
    </button>
  )
}

