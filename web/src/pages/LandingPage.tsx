import React from 'react'
import { Hero, QuickStart, FAQ, Feature, FeatureGrid } from '../components/landing'
import { Button } from '../components/button'

export const LandingPage: React.FC = () => {

  return (
    <>
      <Hero
        badge="Now Available"
        headline={
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900">
              Pretty In-sync, Pretty Simple<br/><span className="text-indigo-600 mt-2">Pretty Scoreboard </span>
            </h1>
        }
        paragraph="The ultimate scoreboard for real-time basketball game management. Track scores, manage teams, and share live updates — all in one beautiful interface."
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 lg:mt-0">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              const element = document.getElementById('features')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
          >
            Explore Features
          </Button>
          <Button
            variant="primary"
            size="md"
            to="/auth"
          >
            Get Started
          </Button>
         </div>
      </Hero>

      <QuickStart />
      
      {/* Hero Section: Sync Score to Multiple Devices */}
      <Hero
      badge="Features"
        headline={
            <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900">
              Sync Score to Multiple Devices
            </h1>
        }
        paragraph="Sync your score to multiple devices in real-time. View updates in real-time on any device—phones, tablets, or large displays. Anywhere around the court.">
        <div className="mb-8">
          <img 
            src="/sync-score-to-multiple-devices.png" 
            alt="Sync score to multiple devices" 
            className="w-full max-w-7xl mx-auto"
          />
        </div>
      </Hero>

      {/* Feature Section 1: Choose Team Color */}
      <Feature
        imageSrc="features/connect-to-scoreboard.png"
        imageAlt="Choose Team Color Feature"
        title="Connect to Scoreboard"
        description="Use share code, QR code, or public link to connect to your scoreboard. No need to install any software."
        buttonText="Get Started"
        imagePosition="left"
        backgroundColor="gray"
      />

      {/* Feature Section 2: Manage Quarter Timer */}
      <Feature
        imageSrc="features/manage-quarter-timer.png"
        imageAlt="Manage Quarter Timer Feature"
        title="Manage quarter timer"
        description="Control game time with precision. Start, pause, and reset the timer for each quarter. Track game progress and keep everyone synchronized with real-time updates."
        buttonText="Get Started"
        imagePosition="right"
        backgroundColor="white"
      />

      {/* Feature Section 3: Share with Other Devices */}
      <Feature
        imageSrc="features/share-game-summary.png"
        imageAlt="Share your game summary"
        title="Share your Game Summary"
        description="Download your game summary as a PNG image. Share your wins on social media."
        buttonText="Get Started"
        imagePosition="left"
        backgroundColor="gray"
      />

      {/* Feature Grid: Full Screen, Quarter History, Team Colors */}
      <Hero
        headline={
          <h1 className="text-5xl sm:text-6xl lg:text-5xl font-bold tracking-tight text-grey-900">
            More features ready to use
          </h1>
        }
        paragraph="Discover additional powerful features that enhance your scoreboard experience. From full-screen displays to detailed game history, we've got everything you need."
      >
        <FeatureGrid
          features={[
            {
              imageSrc: "/features/full-screen-option.png",
              imageAlt: "Full screen option",
              title: "Full Screen Option",
              description: "Display your scoreboard in full screen mode for a distraction-free viewing experience. Perfect for large displays and presentations.",
              buttonText: "Get Started"
            },
            {
              imageSrc: "/features/view-quarter-history.png",
              imageAlt: "View quarter history",
              title: "View Quarter History",
              description: "Track and review the history of each quarter. See detailed statistics and scores for every period of the game.",
              buttonText: "Get Started"
            },
            {
              imageSrc: "/features/choose-team-color.png",
              imageAlt: "Choose team color",
              title: "Choose Team Colors",
              description: "Customize team colors to match your team's branding. Make your scoreboard visually distinct and easy to follow.",
              buttonText: "Get Started"
            }
          ]}
        />
      </Hero>

      <FAQ />
    </>
  )
}

