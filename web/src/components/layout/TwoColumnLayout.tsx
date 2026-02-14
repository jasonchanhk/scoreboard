import React from 'react'

interface TwoColumnLayoutProps {
  children: React.ReactNode
  backgroundColor?: string
  gap?: string
  maxWidth?: string
  padding?: string
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  children,
  backgroundColor = '',
  gap = 'gap-12',
  maxWidth = 'max-w-6xl',
  padding = 'px-6'
}) => {
  return (
    <div className={backgroundColor ? `${backgroundColor} text-gray-300 py-12` : 'py-12'}>
      <div className={`mx-auto ${maxWidth} ${padding}`}>
        <div className={`flex flex-col lg:flex-row lg:justify-between ${gap}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
