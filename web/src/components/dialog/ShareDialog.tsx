import React, { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { BaseDialog } from './BaseDialog'
import { Button, CloseButton } from '../button'
import { ScoreboardSummary } from '../ScoreboardSummary'
import { generateScoreboardPNG } from '../../utils/generateScoreboardImage'
import type { Team, Quarter } from '../../types/scoreboard'

interface ShareDialogProps {
  isOpen: boolean
  shareCode: string | null
  publicViewUrl: string | null
  isOwner: boolean
  showCopied: boolean
  isGeneratingShareCode: boolean
  teams?: Team[]
  allQuarters?: Quarter[]
  currentQuarter?: number
  gameDate?: string | null
  venue?: string | null
  onClose: () => void
  onCopyShareCode: () => void
  onGenerateShareCode: () => void
}

export const ShareDialog: React.FC<ShareDialogProps> = ({
  isOpen,
  shareCode,
  publicViewUrl,
  isOwner,
  showCopied,
  isGeneratingShareCode,
  teams = [],
  allQuarters = [],
  currentQuarter = 1,
  gameDate,
  venue,
  onClose,
  onCopyShareCode,
  onGenerateShareCode
}) => {
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [urlCopied, setUrlCopied] = useState(false)
  const [isSharingEnabled, setIsSharingEnabled] = useState(false)

  // If share code already exists, enable sharing immediately
  useEffect(() => {
    if (shareCode) {
      setIsSharingEnabled(true)
    } else {
      setIsSharingEnabled(false)
    }
  }, [shareCode])

  const handleEnableSharing = async () => {
    if (!shareCode && isOwner) {
      await onGenerateShareCode()
    }
    setIsSharingEnabled(true)
  }

  const handleGeneratePNG = async () => {
    if (!teams || teams.length < 2) return

    setIsGeneratingImage(true)
    try {
      await generateScoreboardPNG({
        teams,
        allQuarters,
        currentQuarter,
        gameDate,
        venue
      })
    } catch (error) {
      console.error('Error generating PNG:', error)
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!publicViewUrl || !teams || teams.length < 2) return

    const teamAName = teams[0]?.name || 'Team A'
    const teamBName = teams[1]?.name || 'Team B'
    const message = `See scoreboard for ${teamAName} vs ${teamBName} on Pretty Scoreboard\n\n${publicViewUrl}`

    try {
      await navigator.clipboard.writeText(message)
      setUrlCopied(true)
      setTimeout(() => setUrlCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy URL:', error)
    }
  }

  if (!isOpen) return null

  return (
    <BaseDialog
      onCancel={onClose}
      showCancel={false}
      contentClassName="w-11/12 md:w-4/5 lg:w-3/4 max-w-6xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Share</h3>
        <CloseButton onClick={onClose} />
      </div>
      <div className="flex gap-6">
        {/* Left Side: Share Code and QR Code */}
        <div className="flex-1 flex flex-col min-w-0">
          {!isSharingEnabled ? (
            /* Initial state: Show "Share with public" button */
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Share with Public</h4>
                <p className="text-sm text-gray-600">
                  Enable public sharing to generate a share code and display link that anyone can use to view this scoreboard.
                </p>
              </div>
              {isOwner ? (
                <Button
                  onClick={handleEnableSharing}
                  disabled={isGeneratingShareCode}
                  variant="primary"
                  size="md"
                  className="w-full max-w-xs"
                >
                  {isGeneratingShareCode ? 'Generating...' : 'Share with Public'}
                </Button>
              ) : (
                <div className="text-sm text-gray-400 text-center">
                  Only the owner can enable public sharing
                </div>
              )}
            </div>
          ) : (
            /* Sharing enabled: Show share code, link, and QR code */
            <>
              <div className="mb-6">
                <div className="text-xs text-gray-600 mb-2">Share Code</div>
                {shareCode ? (
                  <div
                    className="text-xl font-mono bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors text-center"
                    onClick={onCopyShareCode}
                    title="Click to copy share code"
                  >
                    {showCopied ? 'Copied!' : shareCode}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 text-center">Generating...</div>
                )}
              </div>
              {publicViewUrl && (
                <div className="mb-6">
                  <div className="text-xs text-gray-600 mb-2">Display Link</div>
                  <div
                    className="text-sm bg-gray-100 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors break-all"
                    onClick={handleCopyUrl}
                    title="Click to copy link"
                  >
                    {urlCopied ? 'Copied!' : publicViewUrl}
                  </div>
                </div>
              )}
              {publicViewUrl && (
                <div className="flex flex-col items-center">
                  <div className="text-xs text-gray-600 mb-2">Scan to View</div>
                  <div className="bg-white p-2 rounded-lg border">
                    <QRCodeSVG value={publicViewUrl} size={120} level="H" includeMargin={false} />
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Vertical Divider */}
        <div className="w-px bg-gray-200 flex-shrink-0" />

        {/* Right Side: Preview and Download Button */}
        {teams && teams.length >= 2 ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="mb-4">
              <div className="text-xs text-gray-600 mb-2">Preview</div>
              <div 
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 overflow-hidden flex justify-center items-start"
                style={{ 
                  height: `${1350 * 0.35 + 32}px`,
                  minHeight: `${1350 * 0.35 + 32}px`
                }}
              >
                <div 
                  style={{ 
                    width: '1050px', 
                    height: '1350px',
                    transform: 'scale(0.35)',
                    transformOrigin: 'top center'
                  }}
                >
                  <ScoreboardSummary
                    teams={teams}
                    allQuarters={allQuarters}
                    currentQuarter={currentQuarter}
                    gameDate={gameDate}
                    venue={venue}
                  />
                </div>
              </div>
            </div>
            <Button
              onClick={handleGeneratePNG}
              disabled={isGeneratingImage}
              variant="secondary"
              size="md"
              className="w-full"
            >
              {isGeneratingImage ? 'Generating...' : 'Download PNG'}
            </Button>
          </div>
        ) : null}
      </div>
    </BaseDialog>
  )
}

