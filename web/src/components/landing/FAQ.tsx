import React, { useState } from 'react'
import { Hero } from './Hero'
import { Question } from './Question'

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
    answer: "Basic accounts can create up to 2 scoreboards. Upgrade to Plus or Premium plans for unlimited scoreboards and additional features."
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

  // Generate FAQ structured data for SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  }

  return (
    <>
      {/* FAQ Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />
      
      {/* FAQ Section */}
      <section id="faq" className="bg-indigo-50 py-12">
        <Hero
          badge="FAQ"
          headline={
            <h2 className="text-5xl sm:text-6xl font-bold tracking-tight text-grey-900 pb-8">
              Common questions
            </h2>
          }
          backgroundColor="bg-transparent"
        >
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq, index) => (
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
        </Hero>
      </section>
    </>
  )
}
