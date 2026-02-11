import React from 'react'

interface FeatureProps {
  imageSrc: string
  imageAlt: string
  icon: React.ReactNode
  title: string
  description: string
  imagePosition?: 'left' | 'right'
  backgroundColor?: 'white' | 'gray'
}

export const Feature: React.FC<FeatureProps> = ({
  imageSrc,
  imageAlt,
  icon,
  title,
  description,
  imagePosition = 'left',
}) => {
  const isImageLeft = imagePosition === 'left'

  return (
    <section className={"bg-white py-12"}>
      <div className="mx-auto max-w-7xl px-6">
        <div className={`flex flex-col lg:flex-row${isImageLeft ? '' : '-reverse'} items-center gap-12`}>
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
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                {icon}
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 text-center lg:text-left">
              {title}
            </h2>
            <p className="text-lg text-gray-600 text-center lg:text-left">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
