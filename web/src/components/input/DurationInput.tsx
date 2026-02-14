import React from 'react'
import { HiChevronUp, HiChevronDown } from 'react-icons/hi'

interface DurationInputProps {
  label: string
  value: number // Duration in minutes
  onChange: (value: number) => void // Callback with minutes
  id?: string
  min?: number
  max?: number
  required?: boolean
  className?: string
  disabled?: boolean
}

export const DurationInput: React.FC<DurationInputProps> = ({
  label,
  value,
  onChange,
  id,
  min = 0,
  max,
  required = false,
  className = '',
  disabled = false
}) => {
  const inputId = id || `duration-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string for clearing
    if (inputValue === '') {
      onChange(0)
      return
    }

    // Only allow digits
    if (!/^\d+$/.test(inputValue)) {
      return
    }

    const numValue = parseInt(inputValue, 10)
    
    // Ensure non-negative
    if (numValue < 0) {
      return
    }

    // Apply max limit if specified
    if (max !== undefined && numValue > max) {
      onChange(max)
      return
    }

    onChange(numValue)
  }

  const handleBlur = () => {
    // Ensure value is at least min on blur
    if (value < min) {
      onChange(min)
    }
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text when input is focused
    e.target.select()
  }

  const handleIncrement = () => {
    if (disabled) return
    const newValue = (value || 0) + 1
    if (max === undefined || newValue <= max) {
      onChange(newValue)
    }
  }

  const handleDecrement = () => {
    if (disabled) return
    const newValue = Math.max(min, (value || 0) - 1)
    onChange(newValue)
  }

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
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            id={inputId}
            value={value || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            min={min}
            max={max}
            required={required}
            disabled={disabled}
            className={`block w-full rounded-lg border border-gray-400 bg-white px-4 pt-8 pb-3 pr-24 text-transparent focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-offset-0 focus:outline-none sm:text-lg transition-all ${
              disabled 
                ? 'bg-gray-100 cursor-not-allowed' 
                : ''
            }`}
            placeholder=""
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pt-4 pointer-events-none">
            <span className="text-gray-900 sm:text-lg">{value || 0}</span>
          </div>
          <div className="absolute right-16 top-1/2 -translate-y-1/2 pt-4 pointer-events-none">
            <span className="text-gray-400 sm:text-lg">minutes</span>
          </div>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col z-10">
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || (max !== undefined && value >= max)}
              className={`p-1 text-gray-500 hover:text-gray-900 transition-colors ${
                disabled || (max !== undefined && value >= max)
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              aria-label="Increment"
            >
              <HiChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || value <= min}
              className={`p-1 text-gray-500 hover:text-gray-900 transition-colors ${
                disabled || value <= min
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              }`}
              aria-label="Decrement"
            >
              <HiChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

