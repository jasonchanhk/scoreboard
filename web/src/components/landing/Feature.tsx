import React from 'react'
import type { IconType } from 'react-icons'
import { Button } from '../button'

interface FeatureProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  icon?: IconType
  buttonText?: string
  buttonOnClick?: () => void
  buttonTo?: string
  imagePosition?: 'left' | 'right'
  backgroundColor?: 'white' | 'indigo'
}

export const Feature: React.FC<FeatureProps> = ({
  imageSrc,
  imageAlt,
  title,
  description,
  icon: Icon,
  buttonText,
  buttonOnClick,
  buttonTo,
  imagePosition = 'left',
  backgroundColor = 'white',
}) => {
  const isImageLeft = imagePosition === 'left'
  const bgColor = backgroundColor === 'indigo' ? 'bg-indigo-50' : 'bg-white'

  return (
    <section className={`${bgColor} py-24`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className={`flex flex-col ${isImageLeft ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-12`}>
          {/* Image */}
          <div className="flex-1 max-w-2xl">
            <img 
              src={imageSrc} 
              alt={imageAlt} 
              className="w-full h-auto rounded-3xl"
              style={{ boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.3)' }}
            />
          </div>
          {/* Content */}
          <div className="flex-1 space-y-8">
            {Icon && (
              <div className="flex justify-center lg:justify-start">
                <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full">
                  <Icon className="text-2xl text-indigo-600" />
                </div>
              </div>
            )}
            <h2 className="text-5xl font-bold text-gray-900 text-center lg:text-left">
              {title}
            </h2>
            <p className="text-lg text-gray-600 text-center pb-2 lg:text-left">
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
