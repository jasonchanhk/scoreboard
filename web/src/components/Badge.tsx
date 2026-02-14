import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => {
  return (
    <span className={`inline-flex rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700 mb-4 uppercase tracking-widest ${className}`}>
      {children}
    </span>
  )
}
