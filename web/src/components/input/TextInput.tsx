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
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  id,
  placeholder,
  required = false,
  className = '',
  type = 'text'
}) => {
  const inputId = id || `text-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">- Optional</span>}
      </label>
      <input
        type={type}
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-2 block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      />
    </div>
  )
}

