import React from 'react'

interface TimeInputProps {
  label: string
  value: string // Format: "HH:MM" or empty string
  onChange: (value: string) => void // Callback with "HH:MM" format or empty string
  id?: string
  required?: boolean
  className?: string
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  id,
  required = false,
  className = ''
}) => {
  const inputId = id || `time-input-${label.toLowerCase().replace(/\s+/g, '-')}`

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
          <input
            type="time"
            id={inputId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="block w-full rounded-lg border border-gray-400 bg-white px-4 pt-8 pb-3 text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:outline-none sm:text-lg transition-all"
          />
        </div>
      </div>
    </div>
  )
}

