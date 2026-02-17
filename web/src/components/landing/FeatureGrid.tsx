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
    <div 
      className="bg-white rounded-3xl overflow-hidden flex flex-col "
      style={{ boxShadow: '0 25px 50px -12px rgba(79, 70, 229, 0.3)' }}
    >
      <img 
        src={imageSrc} 
        alt={imageAlt} 
        className="w-full h-auto border-b border-gray-200"
      />
      <div className="p-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-4 text-left">
          {title}
        </h3>
        <p className="text-gray-600 mb-8 text-left text-sm">
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
