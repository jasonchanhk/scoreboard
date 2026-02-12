import React, { useState } from 'react'
import { Hero } from './Hero'
import { HiChevronDown } from 'react-icons/hi'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  faqs?: FAQItem[]
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

export const FAQ: React.FC<FAQProps> = ({ faqs = defaultFAQs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <>
      {/* FAQ Section */}
      <section id="faq" className="bg-gray-200/50 py-24">
        <Hero
          badge="FAQ"
          headline={
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900 pb-8">
              Common questions
            </h2>
          }
          backgroundColor="bg-transparent"
        >
          <div className="mx-auto max-w-6xl px-6">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                      aria-expanded={openIndex === index}
                    >
                      <span className="text-lg font-semibold text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      <HiChevronDown
                        className={`shrink-0 w-5 h-5 text-gray-500 transition-transform ${
                          openIndex === index ? 'transform rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openIndex === index && (
                      <div className="px-6 py-6 text-gray-600 leading-relaxed text-left border-t border-gray-200/50">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Hero>
      </section>
    </>
  )
}
