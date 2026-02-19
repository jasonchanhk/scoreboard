import React from 'react'
import { HiLink, HiClock, HiShare } from 'react-icons/hi'
import { Hero, QuickStart, FAQ, Feature, FeatureGrid } from '../components/landing'
import { Button } from '../components/button'
import { SEOHead } from '../components/SEOHead'

export const LandingPage: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Pretty Scoreboard - Free Basketball Scoreboard App | Real-Time Game Tracking"
        description="Free basketball scoreboard app for real-time game tracking. Manage scores, timers, and team stats. Share live updates with QR codes. No download required. Perfect for coaches, referees, and sports enthusiasts."
        keywords="basketball scoreboard, live scoreboard, basketball score tracker, game score tracker, basketball timer, team scoreboard, free scoreboard app, real-time scoreboard, basketball game management"
        canonical="https://prettyscoreboard.com/"
      />
      <section className="relative overflow-hidden bg-white">
        {/* Left glow */}
        <div
          className="pointer-events-none absolute -left-20 top-10 h-[200px] w-[200px] sm:h-[300px] sm:w-[300px] rounded-full blur-2xl opacity-60 z-0"
          style={{ background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.3))' }}
        />
        
        {/* Right glow */}
        <div
          className="pointer-events-none absolute -right-60 top-10 h-[300px] w-[300px] sm:h-[520px] sm:w-[520px] rounded-full blur-2xl opacity-60 z-0"
          style={{ background: 'radial-gradient(circle at center, rgba(79, 70, 229, 0.3))' }}
        />
        
        <div className="relative z-10">
          <Hero
            badge="Now Available"
            headline={
                <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900">
                  Pretty In-sync, Pretty Simple<br/><span className="text-indigo-600 mt-2">Pretty Scoreboard </span>
                </h1>
            }
            paragraph="The ultimate scoreboard for real-time basketball game management. Track scores, manage teams, and share live updates — all in one beautiful interface."
            backgroundColor="bg-transparent"
          >
            <div className="flex flex-row items-center justify-center gap-4 mt-8 lg:mt-0">
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  const element = document.getElementById('sync-devices')
                  element?.scrollIntoView({ behavior: 'smooth' })
                }}
              >
                Explore Features
              </Button>
              <Button
                variant="primary"
                size="md"
                to="/dashboard"
              >
                Get Started
              </Button>
             </div>
          </Hero>

          <QuickStart />
        </div>
      </section>
      
      {/* Hero Section: Sync Score to Multiple Devices */}
      <section id="sync-devices">
        <Hero
          badge="Features"
          headline={
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900">
              Sync Score to Multiple Devices
            </h2>
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
      </section>

      {/* Feature Section 1: Choose Team Color */}
      <Feature
        imageSrc="features/connect-to-scoreboard.png"
        imageAlt="Connect to Scoreboard"
        title="Connect to Scoreboard"
        description="Use share code, QR code, or public link to connect to your scoreboard. No need to install any software. Anywhere around the court."
        icon={HiLink}
        buttonText="Get Started"
        buttonTo="/dashboard"
        imagePosition="left"
        backgroundColor="indigo"
      />

      {/* Feature Section 2: Manage Quarter Timer */}
      <Feature
        imageSrc="features/manage-quarter-timer.png"
        imageAlt="Manage Quarter Timer Feature"
        title="Manage quarter timer"
        description="Control game time with precision. Start, pause, and reset the timer for each quarter. Keep everyone synchronized with real time."
        icon={HiClock}
        buttonText="Get Started"
        buttonTo="/dashboard"
        imagePosition="right"
        backgroundColor="white"
      />

      {/* Feature Section 3: Share with Other Devices */}
      <Feature
        imageSrc="features/share-game-summary.png"
        imageAlt="Share your game summary"
        title="Share your Game Summary"
        description="Download your game summary as a PNG image. Share your wins on social media."
        icon={HiShare}
        buttonText="Get Started"
        buttonTo="/dashboard"
        imagePosition="left"
        backgroundColor="indigo"
      />

      {/* Feature Grid: Full Screen, Quarter History, Team Colors */}
      <Hero
        headline={
          <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900">
            Other features ready to use
          </h2>
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
              buttonText: "Get Started",
              buttonTo: "/dashboard"
            },
            {
              imageSrc: "/features/view-quarter-history.png",
              imageAlt: "View quarter history",
              title: "View Quarter History",
              description: "Track and review the history of each quarter. See detailed statistics and scores for every period of the game.",
              buttonText: "Get Started",
              buttonTo: "/dashboard"
            },
            {
              imageSrc: "/features/choose-team-color.png",
              imageAlt: "Choose team color",
              title: "Choose Team Colors",
              description: "Customize team colors to match your team's branding. Make your scoreboard visually distinct and easy to follow.",
              buttonText: "Get Started",
              buttonTo: "/dashboard"
            }
          ]}
        />
      </Hero>

      <FAQ />
    </>
  )
}

