import React from 'react'
import { Badge } from '../Badge'

interface HeroProps {
  badge?: string
  headline?: React.ReactNode
  paragraph?: string
  children?: React.ReactNode
}

export const Hero: React.FC<HeroProps> = ({ 
  badge,
  headline,
  paragraph,
  children 
}) => {
  return (
    <header className="relative overflow-hidden bg-white">
      <div className="relative mx-auto px-12 py-10 lg:py-16">
        <div className="text-center">
          {badge && <Badge>{badge}</Badge>}
          {headline && (
            <div className="space-y-2 mt-2 mb-6">
              {headline}
            </div>
          )}
          {paragraph && (
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              {paragraph}
            </p>
          )}
          {children}
        </div>
      </div>
    </header>
  )
}
