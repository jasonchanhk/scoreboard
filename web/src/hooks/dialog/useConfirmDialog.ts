import { useState, useCallback } from 'react'

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  scoreboardId: string | null
}

export const useConfirmDialog = () => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    scoreboardId: null,
  })

  const showConfirmDialog = useCallback((
    title: string,
    message: string,
    scoreboardId: string | null = null
  ) => {
    setConfirmDialog({ isOpen: true, title, message, scoreboardId })
  }, [])

  const hideConfirmDialog = useCallback(() => {
    setConfirmDialog(prev => ({ ...prev, isOpen: false }))
  }, [])

  return {
    confirmDialog,
    showConfirmDialog,
    hideConfirmDialog,
  }
}

