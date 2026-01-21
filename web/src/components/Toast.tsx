import React, { useEffect } from 'react'
import { HiX, HiExclamation, HiCheck, HiInformationCircle } from 'react-icons/hi'

export type ToastVariant = 'error' | 'success' | 'warning' | 'info'

interface ToastProps {
  message: string
  variant?: ToastVariant
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'error',
  isVisible,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const variantStyles = {
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: HiExclamation,
      iconColor: 'text-red-600',
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: HiCheck,
      iconColor: 'text-green-600',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: HiExclamation,
      iconColor: 'text-yellow-600',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: HiInformationCircle,
      iconColor: 'text-blue-600',
    },
  }

  const styles = variantStyles[variant]
  const Icon = styles.icon

  return (
    <div
      className={`fixed bottom-0 right-4 z-50 max-w-sm w-full ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 flex items-start gap-3 transform transition-all duration-300 ease-in-out translate-y-0 opacity-100`}
      role="alert"
    >
      <Icon className={`${styles.iconColor} flex-shrink-0 w-5 h-5 mt-0.5`} />
      <p className={`${styles.text} text-sm font-medium flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        aria-label="Close"
      >
        <HiX className="w-5 h-5" />
      </button>
    </div>
  )
}

