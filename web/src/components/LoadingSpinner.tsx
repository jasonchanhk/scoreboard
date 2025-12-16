import React from 'react'

interface LoadingSpinnerProps {
  message?: string
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message,
  className = ''
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-white ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
        {message && (
          <div className="text-gray-900 text-xl font-medium">{message}</div>
        )}
      </div>
    </div>
  )
}

