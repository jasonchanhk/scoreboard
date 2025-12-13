import React from 'react'

interface DurationInputProps {
  label: string
  value: number // Duration in minutes
  onChange: (value: number) => void // Callback with minutes
  id?: string
  min?: number
  max?: number
  required?: boolean
  className?: string
  quickOptions?: number[] // Array of quick option minutes (e.g., [12, 10, 5])
  disabled?: boolean // If true, input and buttons are disabled
}

export const DurationInput: React.FC<DurationInputProps> = ({
  label,
  value,
  onChange,
  id,
  min = 1,
  max = 60,
  required = false,
  className = '',
  quickOptions = [12, 10, 5],
  disabled = false
}) => {
  const inputId = id || `duration-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={`space-y-3 ${className}`}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">- Optional</span>}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="number"
          id={inputId}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          min={min}
          max={max}
          required={required}
          disabled={disabled}
          className={`block w-32 rounded-lg border border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            disabled 
              ? 'bg-gray-100 text-gray-900 cursor-not-allowed' 
              : 'bg-white text-gray-900'
          }`}
        />
        <div className="text-sm text-gray-500">minutes</div>
        {quickOptions.length > 0 && !disabled && (
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((minutes) => (
              <button
                key={minutes}
                type="button"
                onClick={() => onChange(minutes)}
                className="rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 transition hover:bg-gray-200"
              >
                {minutes} min
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

