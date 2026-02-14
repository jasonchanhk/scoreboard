import React from 'react'
import { HiChevronDown } from 'react-icons/hi'

interface QuestionProps {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
}

export const Question: React.FC<QuestionProps> = ({
  question,
  answer,
  isOpen,
  onToggle
}) => {
  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-gray-900 pr-4">
          {question}
        </span>
        <HiChevronDown
          className={`shrink-0 w-5 h-5 text-gray-500 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 py-6 text-gray-600 leading-relaxed text-left border-t border-gray-200/50">
          {answer}
        </div>
      )}
    </div>
  )
}
