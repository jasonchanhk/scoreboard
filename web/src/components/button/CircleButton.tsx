import React from 'react'

interface CircleButtonProps {
  onClick?: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'white'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  className?: string
  ariaLabel?: string
}

export const CircleButton: React.FC<CircleButtonProps> = ({
  onClick,
  children,
  variant = 'secondary',
  size = 'md',
  disabled = false,
  type = 'button',
  className = '',
  ariaLabel
}) => {
  const baseClasses = 'rounded-full font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer flex items-center justify-center'
  
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-300',
    outline: 'border-2 border-gray-900 bg-white text-gray-900 hover:bg-gray-50 focus:ring-gray-500',
    white: 'bg-white shadow text-gray-900 hover:bg-gray-100 focus:ring-gray-500'
  }
  
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''
  
  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim()

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClasses}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  )
}

