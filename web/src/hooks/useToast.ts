import { useState, useCallback } from 'react'
import type { ToastVariant } from '../components/Toast'

interface ToastState {
  message: string
  variant: ToastVariant
  isVisible: boolean
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    variant: 'error',
    isVisible: false,
  })

  const showToast = useCallback((message: string, variant: ToastVariant = 'error') => {
    setToast({
      message,
      variant,
      isVisible: true,
    })
  }, [])

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }, [])

  const showError = useCallback((message: string) => {
    showToast(message, 'error')
  }, [showToast])

  const showSuccess = useCallback((message: string) => {
    showToast(message, 'success')
  }, [showToast])

  const showWarning = useCallback((message: string) => {
    showToast(message, 'warning')
  }, [showToast])

  const showInfo = useCallback((message: string) => {
    showToast(message, 'info')
  }, [showToast])

  return {
    toast,
    showToast,
    hideToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  }
}

