import React from 'react'

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

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">- Optional</span>}
      </label>
      <input
        type="date"
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  )
}

