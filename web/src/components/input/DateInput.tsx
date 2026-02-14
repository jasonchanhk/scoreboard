import React, { useEffect, useRef } from 'react'

interface DateInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  id?: string
  required?: boolean
  className?: string
}

export const DateInput: React.FC<DateInputProps> = ({
  label,
  value,
  onChange,
  id,
  required = false,
  className = ''
}) => {
  const inputId = id || `date-input-${label.toLowerCase().replace(/\s+/g, '-')}`
  const hasInitialized = useRef(false)

  // Set default to today's date if value is empty (only once on mount)
  useEffect(() => {
    if (!hasInitialized.current && !value) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const todayString = `${year}-${month}-${day}`
      onChange(todayString)
      hasInitialized.current = true
    }
  }, [value, onChange])

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
            type="date"
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

