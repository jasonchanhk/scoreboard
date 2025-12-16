import React from 'react'

// Predefined color options for teams
const TEAM_COLORS = [
  { name: 'Red', value: '#ef4444' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Gray', value: '#6b7280' },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#fafafa' }
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  label?: string
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  label = 'Color:'
}) => {
  return (
    <div className="mt-2">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {TEAM_COLORS.map((color) => (
          <button
            key={color.value}
            type="button"
            onClick={() => onChange(color.value)}
            className={`w-6 h-6 rounded-full cursor-pointer border-2 transition-all ${
              value === color.value
                ? 'border-gray-900 scale-110 ring-2 ring-offset-2 ring-gray-400'
                : 'border-gray-300 hover:border-gray-400 hover:scale-105'
            }`}
            style={{ backgroundColor: color.value }}
            title={color.name}
            aria-label={`Select ${color.name} color`}
          />
        ))}
      </div>
    </div>
  )
}

