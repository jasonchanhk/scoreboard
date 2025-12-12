import React from 'react'
import { HiExclamation, HiQuestionMarkCircle } from 'react-icons/hi'
import { BaseDialog } from './BaseDialog'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  variant?: 'error' | 'warning' | 'info'
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  variant = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null

  const variantStyles = {
    error: {
      Icon: HiExclamation,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      confirmButtonBg: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      Icon: HiExclamation,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-900',
      confirmButtonBg: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      Icon: HiQuestionMarkCircle,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      confirmButtonBg: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const styles = variantStyles[variant]
  const Icon = styles.Icon

  return (
    <BaseDialog
      onCancel={onCancel}
      cancelText={cancelText}
      actionButton={{
        text: confirmText,
        onClick: onConfirm,
        className: `${styles.confirmButtonBg} text-white`,
      }}
      contentClassName="w-11/12 md:w-2/3 lg:w-1/3"
    >
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
      </div>
    </BaseDialog>
  )
}

