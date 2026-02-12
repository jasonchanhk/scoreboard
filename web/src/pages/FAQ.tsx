import React, { useState } from 'react'
import { Question } from '../components/landing/Question'

interface FAQItem {
  question: string
  answer: string
}

const defaultFAQs: FAQItem[] = [
  {
    question: "How do I create my first scoreboard?",
    answer: "Simply sign up for a free account, click 'Create Scoreboard', and enter your team names. You can start tracking scores immediately—no credit card required."
  },
  {
    question: "Can I share my scoreboard with others?",
    answer: "Yes! Every scoreboard has a shareable link that you can send to fans, media, or display on screens. The public view updates in real-time as you make changes."
  },
  {
    question: "How many scoreboards can I create?",
    answer: "Free accounts can create up to 3 scoreboards. Upgrade to Plus or Premium plans for unlimited scoreboards and additional features."
  },
  {
    question: "Do I need to download any software?",
    answer: "No downloads required! Scoreboard works entirely in your web browser on any device—desktop, tablet, or mobile. Just sign in and start managing your games."
  }
]

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600">Find answers to common questions about Pretty Scoreboard</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <div className="space-y-4">
            {defaultFAQs.map((faq, index) => (
              <Question
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
