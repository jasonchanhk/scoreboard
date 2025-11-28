import React, { useEffect } from 'react'
import { HiExclamation, HiCheck, HiQuestionMarkCircle } from 'react-icons/hi'

interface AlertProps {
  isOpen: boolean
  title: string
  message: string
  variant?: 'error' | 'success' | 'warning' | 'info'
  onClose: () => void
}

export const Alert: React.FC<AlertProps> = ({
  isOpen,
  title,
  message,
  variant = 'info',
  onClose,
}) => {
  // Handle escape key to close modal
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Handle click outside to close modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen) return null

  const variantStyles = {
    error: {
      Icon: HiExclamation,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      buttonBg: 'bg-red-600 hover:bg-red-700',
    },
    success: {
      Icon: HiCheck,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      titleColor: 'text-green-900',
      buttonBg: 'bg-green-600 hover:bg-green-700',
    },
    warning: {
      Icon: HiExclamation,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      Icon: HiQuestionMarkCircle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      buttonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const styles = variantStyles[variant]
  const Icon = styles.Icon

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={handleBackdropClick}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="relative top-20 mx-auto p-6 w-11/12 md:w-2/3 lg:w-1/3 shadow-2xl rounded-lg bg-white">
        <div className="flex flex-col items-center text-center">
          <div className={`${styles.iconBg} rounded-full w-16 h-16 flex items-center justify-center mb-4`}>
            <Icon className={`text-3xl ${styles.iconColor}`} />
          </div>
          <h3 className={`text-xl font-semibold ${styles.titleColor} mb-3`}>
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
          <div className="flex justify-center w-full">
            <button
              onClick={onClose}
              className={`${styles.buttonBg} text-white px-6 py-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

