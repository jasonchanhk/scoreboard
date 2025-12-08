import React from 'react'
import { Button } from '../Button'

interface DialogProps {
  children: React.ReactNode
  onCancel: () => void
  cancelText?: string
  showCancel?: boolean
  actionButton?: {
    text: string
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'outline'
    disabled?: boolean
    className?: string
  }
  buttonAlignment?: 'left' | 'center' | 'right'
  className?: string
  contentClassName?: string
}

export const BaseDialog: React.FC<DialogProps> = ({
  children,
  onCancel,
  cancelText = 'Cancel',
  showCancel = true,
  actionButton,
  buttonAlignment = 'center',
  className = '',
  contentClassName = '',
}) => {
  // Handle escape key to close dialog
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  // Handle click outside to close dialog
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center ${className}`}
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className={`mx-auto p-6 w-11/12 md:w-2/3 lg:w-1/3 shadow-2xl rounded-lg bg-white ${contentClassName}`}>
        {children}
        <div className={`flex gap-3 ${
          buttonAlignment === 'left' ? 'justify-start' :
          buttonAlignment === 'right' ? 'justify-end' :
          'justify-center'
        }`}>
          {showCancel && (
            <Button
              type="button"
              onClick={onCancel}
              variant="secondary"
              size="md"
            >
              {cancelText}
            </Button>
          )}
          {actionButton && (
            <Button
              type="button"
              onClick={actionButton.onClick}
              variant={actionButton.variant || 'primary'}
              size="md"
              disabled={actionButton.disabled}
              className={actionButton.className}
            >
              {actionButton.text}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

