import React from 'react'

interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  id?: string
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
  defaultValue?: string
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  value,
  onChange,
  options,
  id,
  placeholder,
  required = false,
  className = '',
  disabled = false,
  defaultValue = ''
}) => {
  const inputId = id || `select-input-${label.toLowerCase().replace(/\s+/g, '-')}`

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
          <select
            id={inputId}
            value={value || defaultValue || ''}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            disabled={disabled}
            className={`block w-full rounded-lg border border-gray-400 bg-white px-4 pt-8 pb-3 text-gray-900 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:outline-none sm:text-lg transition-all appearance-none ${
              disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
