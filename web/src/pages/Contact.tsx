import React, { useState } from 'react'
import { Button } from '../components/button'
import { SEOHead } from '../components/SEOHead'
import { TextInput, SelectInput, TextAreaInput } from '../components/input'

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/.netlify/functions/send-contact-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message')
      }

      setSubmitStatus('success')
      setFormData({ name: '', email: '', subject: '', message: '' })
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setSubmitStatus('error')
      
      // Reset error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <SEOHead
        title="Contact Us - Get in Touch | Pretty Scoreboard"
        description="Have questions or feedback about Pretty Scoreboard? Contact us! We'd love to hear from you. Get support, share feature requests, or report issues."
        keywords="contact pretty scoreboard, scoreboard support, get help, feature request, customer support"
        canonical="https://prettyscoreboard.com/contact"
      />
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-600">Have a question or feedback? We'd love to hear from you!</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <TextInput
              label="Name"
              value={formData.name}
              onChange={(value) => updateField('name', value)}
              id="name"
              required
            />

            <TextInput
              label="Email"
              type="email"
              value={formData.email}
              onChange={(value) => updateField('email', value)}
              id="email"
              required
            />

            <SelectInput
              label="Subject"
              value={formData.subject}
              onChange={(value) => updateField('subject', value)}
              id="subject"
              placeholder="Select a subject"
              required
              options={[
                { value: 'support', label: 'Support Request' },
                { value: 'feature', label: 'Feature Request' },
                { value: 'bug', label: 'Bug Report' },
                { value: 'feedback', label: 'General Feedback' },
                { value: 'other', label: 'Other' }
              ]}
            />

            <TextAreaInput
              label="Message"
              value={formData.message}
              onChange={(value) => updateField('message', value)}
              id="message"
              required
              rows={6}
            />

            {submitStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">Thank you for your message! We'll get back to you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">Something went wrong. Please try again or email us directly at support@prettyscoreboard.com</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h3>
            <p className="text-gray-600">
              You can also reach us directly at{' '}
              <a href="mailto:support@prettyscoreboard.com" className="text-indigo-600 hover:text-indigo-700 underline">
                support@prettyscoreboard.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
