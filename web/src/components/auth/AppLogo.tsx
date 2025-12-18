import React from 'react'
import { FaBasketballBall } from 'react-icons/fa'

export const AppLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="flex items-center justify-center w-20 h-20 bg-indigo-700 rounded-full mb-4 shadow-lg">
        <FaBasketballBall className="text-white text-4xl" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Pretty Scoreboard</h1>
    </div>
  )
}

