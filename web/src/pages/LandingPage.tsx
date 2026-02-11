import React from 'react'
import { Hero, FAQ, Feature } from '../components/landing'
import { FaPalette, FaClock, FaShareAlt } from 'react-icons/fa'

export const LandingPage: React.FC = () => {

  return (
    <>
      <Hero />

      {/* Feature Section 1: Choose Team Color */}
      <Feature
        imageSrc="/choose-team-color.png"
        imageAlt="Choose Team Color Feature"
        icon={<FaPalette className="text-indigo-600 text-xl" />}
        title="Customize team colors"
        description="Choose unique colors for each team to make your scoreboard visually distinct and easy to follow. Personalize the look to match your team's branding or league colors."
        imagePosition="left"
        backgroundColor="white"
      />

      {/* Feature Section 2: Manage Quarter Timer */}
      <Feature
        imageSrc="/manage-quarter-timer.png"
        imageAlt="Manage Quarter Timer Feature"
        icon={<FaClock className="text-indigo-600 text-xl" />}
        title="Manage quarter timer"
        description="Control game time with precision. Start, pause, and reset the timer for each quarter. Track game progress and keep everyone synchronized with real-time updates."
        imagePosition="right"
        backgroundColor="gray"
      />

      {/* Feature Section 3: Share with Other Devices */}
      <Feature
        imageSrc="/share-with-other-devices.png"
        imageAlt="Share with Other Devices Feature"
        icon={<FaShareAlt className="text-indigo-600 text-xl" />}
        title="Share with other devices"
        description="Share your scoreboard link with fans, media, or display screens. View updates in real-time on any device—phones, tablets, or large displays. Perfect for broadcasting to audiences."
        imagePosition="left"
        backgroundColor="white"
      />


      <FAQ />
    </>
  )
}

