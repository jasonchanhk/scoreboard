import React from 'react'

interface TextInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  required?: boolean
  className?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'url'
  rightComponent?: React.ReactNode
  onBlur?: () => void
  disabled?: boolean
  autoComplete?: string
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  id,
  placeholder,
  required = false,
  className = '',
  type = 'text',
  rightComponent,
  onBlur,
  disabled = false,
  autoComplete
}) => {
  const inputId = id || `text-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={className}>
      <div className="relative">
        <label 
          htmlFor={inputId} 
          className="absolute left-4 top-3 text-sm text-gray-900 pointer-events-none font-semibold z-10"
        >
          {label}
          {!required && <span className="text-gray-400 ml-1">*</span>}
        </label>
        <div className="relative">
          <input
            type={type}
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            autoComplete={autoComplete}
            className={`block w-full rounded-lg border border-gray-400 bg-white px-4 pt-8 pb-3 text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:outline-none sm:text-lg transition-all ${
              rightComponent ? 'pr-12' : ''
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {rightComponent && (
            <>
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-px h-6 bg-gray-300 z-10"></div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center z-10">
                {rightComponent}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

