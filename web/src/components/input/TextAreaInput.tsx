import React from 'react'

interface TextAreaInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
  required?: boolean
  className?: string
  rows?: number
  disabled?: boolean
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  value,
  onChange,
  id,
  placeholder,
  required = false,
  className = '',
  rows = 6,
  disabled = false
}) => {
  const inputId = id || `textarea-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={className}>
      <div className="relative">
        <label 
          htmlFor={inputId} 
          className="absolute left-4 top-3 text-sm text-gray-900 pointer-events-none font-semibold z-10"
        >
          {label}
          {required && <span className="text-gray-400 ml-1">*</span>}
        </label>
        <div className="relative">
          <textarea
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            rows={rows}
            className={`block w-full rounded-lg border border-gray-400 bg-white px-4 pt-8 pb-3 text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:outline-none sm:text-lg transition-all resize-y ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />
        </div>
      </div>
    </div>
  )
}
