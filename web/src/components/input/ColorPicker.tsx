import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

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
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(target) &&
        menuRef.current &&
        !menuRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [isOpen])

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
    setIsOpen(!isOpen)
  }

  const handleColorSelect = (colorValue: string) => {
    onChange(colorValue)
    setIsOpen(false)
  }

  // Get the selected color name for display
  const selectedColor = TEAM_COLORS.find(c => c.value === value) || TEAM_COLORS[0]

  return (
    <div>
      <div className="relative" ref={containerRef}>
        <button
          ref={buttonRef}
          type="button"
          onClick={toggleMenu}
          className="flex items-center justify-center w-10 h-10 cursor-pointer rounded-full border-2 border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
          style={{ backgroundColor: value }}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label={`Select color, currently ${selectedColor.name}`}
        >
          <span className="sr-only">Open color picker</span>
        </button>
        {isOpen && createPortal(
          <div 
            className="fixed rounded-md shadow-lg bg-white border border-gray-200 w-64" 
            style={{ 
              zIndex: 9999,
              top: `${menuPosition.top}px`,
              right: `${menuPosition.right}px`
            }}
            ref={menuRef}
          >
            <div className="p-4">
              <div className="grid grid-cols-6 gap-3">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorSelect(color.value)}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-all hover:scale-110 ${
                      value === color.value
                        ? 'border-gray-900 scale-110 ring-2 ring-offset-1 ring-gray-400'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                    aria-label={`Select ${color.name} color`}
                  />
                ))}
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}

