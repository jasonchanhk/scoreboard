import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { HiX } from 'react-icons/hi'
import { BaseDialog } from './BaseDialog'
import { Button } from '../button'

interface ShareDialogProps {
  isOpen: boolean
  shareCode: string | null
  publicViewUrl: string | null
  isOwner: boolean
  showCopied: boolean
  isGeneratingShareCode: boolean
  onClose: () => void
  onCopyShareCode: () => void
  onGenerateShareCode: () => void
  onViewPublic: () => void
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  shareCode,
  publicViewUrl,
  isOwner,
  showCopied,
  isGeneratingShareCode,
  onClose,
  onCopyShareCode,
  onGenerateShareCode,
  onViewPublic
}) => {
  if (!isOpen) return null

  return (
    <BaseDialog
      onCancel={onClose}
      showCancel={false}
      contentClassName="w-11/12 md:w-2/3 lg:w-1/2"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Share</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
          type="button"
        >
          <HiX className="text-2xl" />
        </button>
      </div>
      <div className="flex gap-4 items-start">
        <div className="flex-1 flex flex-col">
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Share Code</div>
            {shareCode ? (
              <div
                className="text-xl font-mono bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-center"
                onClick={onCopyShareCode}
                title="Click to copy share code"
              >
                {showCopied ? 'Copied!' : shareCode}
              </div>
            ) : isOwner ? (
              <Button
                onClick={onGenerateShareCode}
                disabled={isGeneratingShareCode}
                variant="primary"
                size="md"
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isGeneratingShareCode ? 'Generating...' : 'Generate Share Code'}
              </Button>
            ) : (
              <div className="text-sm text-gray-400 text-center">Not available</div>
            )}
          </div>
          <div className="flex-shrink-0">
            <div className="text-xs text-gray-600 mb-1">Public View</div>
            <Button
              onClick={onViewPublic}
              variant="primary"
              size="md"
              className="w-full bg-gray-800 hover:bg-gray-900"
            >
              Go to Public View
            </Button>
          </div>
        </div>
        {publicViewUrl && (
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="text-xs text-gray-600 mb-1">Scan to View</div>
            <div className="bg-white p-2 rounded-lg border">
              <QRCodeSVG value={publicViewUrl} size={120} level="H" includeMargin={false} />
            </div>
          </div>
        )}
      </div>
    </BaseDialog>
  )
}

