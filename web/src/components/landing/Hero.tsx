import React from 'react'
import { Badge } from '../Badge'

interface HeroProps {
  badge?: string
  headline?: React.ReactNode
  paragraph?: React.ReactNode
  children?: React.ReactNode
  backgroundColor?: string
}

export const Hero: React.FC<HeroProps> = ({ 
  badge,
  headline,
  paragraph,
  children,
  backgroundColor = 'bg-white'
}) => {
  return (
    <header className={`relative overflow-hidden ${backgroundColor}`}>
      <div className="relative mx-auto px-6 py-10 lg:py-16">
        <div className="text-center">
          {badge && <Badge>{badge}</Badge>}
          {headline && (
            <div className="space-y-2 mt-2 mb-6">
              {headline}
            </div>
          )}
          {paragraph && (
            <div className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {paragraph}
            </div>
          )}
          {children}
        </div>
      </div>
    </header>
  )
}
