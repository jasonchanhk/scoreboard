import React from 'react'

interface AuthToggleLinkProps {
  prompt: string
  linkText: string
  onToggle: () => void
}

export const AuthToggleLink: React.FC<AuthToggleLinkProps> = ({ prompt, linkText, onToggle }) => {
  return (
    <div className="text-center">
      <p className="text-sm text-gray-600">
        {prompt}{' '}
        <button
          onClick={onToggle}
          className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
        >
          {linkText}
        </button>
      </p>
    </div>
  )
}

