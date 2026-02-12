import React from 'react'
import { Button } from '../button'

interface FeatureCardProps {
  imageSrc: string
  imageAlt: string
  title: string
  description: string
  buttonText?: string
  buttonOnClick?: () => void
  buttonTo?: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  imageSrc,
  imageAlt,
  title,
  description,
  buttonText,
  buttonOnClick,
  buttonTo
}) => {
  return (
    <div className="bg-white rounded-lg p-6">
      <div className="mb-4">
        <img 
          src={imageSrc} 
          alt={imageAlt} 
          className="w-full h-auto rounded-3xl shadow-3xl"
        />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2 text-left">
        {title}
      </h3>
      <p className="text-gray-600 mb-4 text-left">
        {description}
      </p>
      {buttonText && (
        <div className="flex justify-start">
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
  )
}

interface FeatureGridProps {
  features: FeatureCardProps[]
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              imageSrc={feature.imageSrc}
              imageAlt={feature.imageAlt}
              title={feature.title}
              description={feature.description}
              buttonText={feature.buttonText}
              buttonOnClick={feature.buttonOnClick}
              buttonTo={feature.buttonTo}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
