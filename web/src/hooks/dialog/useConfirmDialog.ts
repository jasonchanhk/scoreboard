import { useState, useCallback } from 'react'

export interface ConfirmDialogState {
  isOpen: boolean
  title: string
  message: string
  scoreboardId: string | null
  variant?: 'error' | 'warning' | 'info'
}

export const useConfirmDialog = () => {
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    scoreboardId: null,
    variant: 'error',
  })

  const showConfirmDialog = useCallback((
    title: string,
    message: string,
    variantOrScoreboardId: 'error' | 'warning' | 'info' | string | null = null
  ) => {
    // Check if the third parameter is a variant or scoreboardId
    const isVariant = variantOrScoreboardId === 'error' || variantOrScoreboardId === 'warning' || variantOrScoreboardId === 'info'
    
    if (isVariant) {
      setConfirmDialog({ 
        isOpen: true, 
        title, 
        message, 
        scoreboardId: null,
        variant: variantOrScoreboardId as 'error' | 'warning' | 'info'
      })
    } else {
      setConfirmDialog({ 
        isOpen: true, 
        title, 
        message, 
        scoreboardId: variantOrScoreboardId as string | null,
        variant: 'error' // default variant
      })
    }
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

