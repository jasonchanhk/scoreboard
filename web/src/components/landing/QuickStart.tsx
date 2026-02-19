import React, { useState } from 'react'
import { Button } from '../button'
import { TextInput } from '../input/TextInput'
import { ColorPicker } from '../input/ColorPicker'
import { DurationInput } from '../input/DurationInput'
import { TeamScore } from '../TeamScore'
import { Timer } from '../Timer'

export const QuickStart: React.FC = () => {
  const [homeTeamName, setHomeTeamName] = useState('Chicago Bulls')
  const [awayTeamName, setAwayTeamName] = useState('Dallas Mavericks')
  const [homeTeamColor, setHomeTeamColor] = useState('#ef4444')
  const [awayTeamColor, setAwayTeamColor] = useState('#3b82f6')
  const [duration, setDuration] = useState(12) // in minutes
  const [homeScore] = useState(0)
  const [awayScore] = useState(0)

  const handleStartGame = () => {
    // Navigate to dashboard - will redirect to auth if not logged in
    window.location.href = '/dashboard'
  }

  return (
    <div className="w-full px-6 pb-10 lg:pb-16">
      <div className="mx-auto max-w-7xl">
        <div className="relative bg-gray-50 rounded-3xl p-4 lg:px-12 lg:py-16 overflow-hidden">
          {/* Bottom-left gradient */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 w-[600px] h-[600px] z-0 blur-2xl"
            style={{ background: 'radial-gradient(circle at bottom left, rgba(79, 70, 229, 0.3), transparent 80%)' }}
          />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-0">
          {/* Quick Start Form - Left side */}
          <div className="w-full lg:w-1/3 relative z-10 lg:-mr-6 lg:ml-6">
            <div className="bg-white rounded-3xl shadow-3xl border border-gray-200 p-8 space-y-2">
              <div className="mb-8">
                <h2 className="text-4xl font-bold text-gray-900">
                  Start your own <br/><span className="text-indigo-600">Scoreboard now</span> 
                </h2>
                <p className="text-md text-gray-600 mt-4 leading-tight">
                  Set up in seconds with your own teams and timer duration.
                </p>
              </div>

              <TextInput
                label="Home"
                value={homeTeamName}
                onChange={setHomeTeamName}
                placeholder="Enter name"
                required
                rightComponent={
                  <ColorPicker
                    value={homeTeamColor}
                    onChange={setHomeTeamColor}
                  />
                }
              />
              
              <TextInput
                label="Away"
                value={awayTeamName}
                onChange={setAwayTeamName}
                placeholder="Enter name"
                required
                rightComponent={
                  <ColorPicker
                    value={awayTeamColor}
                    onChange={setAwayTeamColor}
                  />
                }
              />
              
              <DurationInput
                label="Quarter Duration"
                value={duration}
                onChange={setDuration}
                min={1}
                max={60}
                required
              />
              
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartGame}
                className="w-full mt-2"
              >
                Start
              </Button>
            </div>
          </div>

          {/* Mock Scoreboard Controller - Right side with overlap */}
          <div className="w-full lg:w-2/3 relative z-0 lg:-ml-6 mt-8 lg:mt-0">
            <div className="bg-white rounded-3xl shadow-3xl lg:p-8 h-[600px] flex flex-col pointer-events-none border border-gray-200">
              {/* Main Scoreboard */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Section: Score Container */}
                <div className="flex-1 min-h-0 pb-4 md:pb-8 flex items-center justify-center">
                  <div className="flex items-center justify-center h-full w-full px-4 pt-4 md:px-6 lg:px-8">
                    {/* Team Containers - Stack on mobile portrait, side-by-side on landscape/desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 h-full w-full max-w-[95vw] md:max-w-[70vw]">
                      <TeamScore
                        teamName={homeTeamName || 'Home Team'}
                        score={homeScore}
                        color={homeTeamColor}
                        isOwner={true}
                        onScoreUpdate={() => {}} // No-op, buttons will be visible but non-functional
                      />
                      <TeamScore
                        teamName={awayTeamName || 'Away Team'}
                        score={awayScore}
                        color={awayTeamColor}
                        isOwner={true}
                        onScoreUpdate={() => {}} // No-op, buttons will be visible but non-functional
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Timer */}
                <div className="shrink-0 bg-gray-100 p-3 rounded-lg [&_.text-6xl]:text-6xl [&_.text-9xl]:text-7xl [&_.text-2xl]:text-2xl [&_.text-4xl]:text-3xl [&_.text-3xl]:text-2xl [&_.w-16]:w-14 [&_.h-16]:h-14 [&_.gap-4]:gap-3 [&_.gap-8]:gap-6 [&_.gap-5]:gap-4 [&_.py-2]:py-1">
                  <Timer
                    duration={duration * 60} // Convert minutes to seconds
                    startedAt={null}
                    state="stopped"
                    pausedDuration={0}
                    isOwner={true}
                    onStart={() => {}} // No-op
                    onPause={() => {}} // No-op
                    onReset={() => {}} // No-op
                    currentQuarter={1}
                    onQuarterChange={() => {}} // No-op
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
