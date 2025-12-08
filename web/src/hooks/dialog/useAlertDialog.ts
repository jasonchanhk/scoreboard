import { useState, useCallback } from 'react'

export type AlertVariant = 'error' | 'success' | 'warning' | 'info'

export interface AlertDialogState {
  isOpen: boolean
  title: string
  message: string
  variant?: AlertVariant
}

export const useAlertDialog = () => {
  const [alert, setAlert] = useState<AlertDialogState>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'error',
  })

  const showAlert = useCallback((
    title: string,
    message: string,
    variant: AlertVariant = 'error'
  ) => {
    setAlert({ isOpen: true, title, message, variant })
  }, [])

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, isOpen: false }))
  }, [])

  const showError = useCallback((title: string, message: string) => {
    showAlert(title, message, 'error')
  }, [showAlert])

  const showSuccess = useCallback((title: string, message: string) => {
    showAlert(title, message, 'success')
  }, [showAlert])

  const showWarning = useCallback((title: string, message: string) => {
    showAlert(title, message, 'warning')
  }, [showAlert])

  const showInfo = useCallback((title: string, message: string) => {
    showAlert(title, message, 'info')
  }, [showAlert])

  return {
    alert,
    showAlert,
    hideAlert,
    showError,
    showSuccess,
    showWarning,
    showInfo,
  }
}

