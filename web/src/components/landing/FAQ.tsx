import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
      {/* CTA Section */}
      <section className="border-t border-gray-200 bg-white py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-10 px-6 lg:flex-row">
          <div className="space-y-4 text-center lg:text-left">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
              Ready to modernize your game day?
            </h2>
            <p className="text-lg text-gray-600">
              Join teams that deliver a professional-grade experience—start your first game in just
              a few clicks.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-600"
            >
              Launch the Dashboard
            </Link>
            <a
              href="mailto:hello@scoreboard.app"
              className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
            >
              Talk to Sales
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-gray-200 bg-white py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <span className="inline-flex rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700 mb-4">
                FAQ
              </span>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
                Common questions
              </h2>
              <p className="text-lg text-gray-600">
                If your question isn't answered here, you can{' '}
                <a href="mailto:support@scoreboard.app" className="text-indigo-600 hover:text-indigo-700 underline">
                  email us
                </a>
                .
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    aria-expanded={openIndex === index}
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    <HiChevronDown
                      className={`flex-shrink-0 w-5 h-5 text-gray-500 transition-transform ${
                        openIndex === index ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openIndex === index && (
                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
