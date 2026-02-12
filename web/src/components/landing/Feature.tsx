import React from 'react'
import { Button } from '../button'

interface FeatureProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  buttonText?: string
  buttonOnClick?: () => void
  buttonTo?: string
  imagePosition?: 'left' | 'right'
  backgroundColor?: 'white' | 'gray'
}

export const Feature: React.FC<FeatureProps> = ({
  imageSrc,
  imageAlt,
  title,
  description,
  buttonText,
  buttonOnClick,
  buttonTo,
  imagePosition = 'left',
  backgroundColor = 'white',
}) => {
  const isImageLeft = imagePosition === 'left'
  const bgColor = backgroundColor === 'gray' ? 'bg-gray-200/50' : 'bg-white'

  return (
    <section className={`${bgColor} py-24`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className={`flex flex-col ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
          {/* Image */}
          <div className="flex-1 max-w-2xl">
            <img 
              src={imageSrc} 
              alt={imageAlt} 
              className="w-full h-auto rounded-lg shadow-xl"
            />
          </div>
          {/* Content */}
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-bold text-gray-900 text-center lg:text-left">
              {title}
            </h2>
            <p className="text-lg text-gray-600 text-center lg:text-left">
              {description}
            </p>
            {buttonText && (
              <div className="flex justify-center lg:justify-start">
                <Button
                  variant="primary"
                  size="md"
                  onClick={buttonOnClick}
                  to={buttonTo}
                >
                  {buttonText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
