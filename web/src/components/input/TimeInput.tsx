import React from 'react'

const HOURS = Array.from({ length: 24 }, (_, index) => index.toString().padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

interface TimeInputProps {
  label: string
  value: string // Format: "HH:MM" or empty string
  onChange: (value: string) => void // Callback with "HH:MM" format or empty string
  id?: string
  className?: string
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  id,
  className = ''
}) => {
  // Parse the time value into hour and minute
  const [hour, minute] = value ? value.split(':') : ['', '']
  
  const handleHourChange = (newHour: string) => {
    if (newHour && minute) {
      onChange(`${newHour}:${minute}`)
    } else if (!newHour && !minute) {
      onChange('')
    } else {
      // Keep the current minute if hour is cleared
      onChange('')
    }
  }
  
  const handleMinuteChange = (newMinute: string) => {
    if (hour && newMinute) {
      onChange(`${hour}:${newMinute}`)
    } else if (!hour && !newMinute) {
      onChange('')
    } else {
      // Keep the current hour if minute is cleared
      onChange('')
    }
  }

  const inputId = id || `time-input-${label.toLowerCase().replace(/\s+/g, '-')}`

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-2 flex items-center gap-3">
        <select
          id={`${inputId}-hour`}
          value={hour}
          onChange={(e) => handleHourChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">HH</option>
          {!HOURS.includes(hour) && hour && <option value={hour}>{hour}</option>}
          {HOURS.map(h => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <span className="text-lg text-gray-500">:</span>
        <select
          id={`${inputId}-minute`}
          value={minute}
          onChange={(e) => handleMinuteChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">MM</option>
          {!MINUTES.includes(minute) && minute && <option value={minute}>{minute}</option>}
          {MINUTES.map(m => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

