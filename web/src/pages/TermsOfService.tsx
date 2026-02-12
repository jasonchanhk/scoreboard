import React from 'react'

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              By accessing and using Pretty Scoreboard ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Pretty Scoreboard is a web-based application that allows users to create, manage, and share real-time basketball scoreboards. The Service enables you to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Create and manage scoreboards for basketball games</li>
              <li>Track scores, quarters, fouls, timeouts, and other game statistics</li>
              <li>Share scoreboards with others via share codes</li>
              <li>Display scoreboards in public view mode</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">To use certain features of the Service, you must register for an account. When you create an account, you agree to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h3>
            <p className="text-gray-700 leading-relaxed mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful, offensive, or inappropriate content</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Attempt to gain unauthorized access to any portion of the Service</li>
              <li>Use the Service for any commercial purpose without our express written consent</li>
              <li>Impersonate any person or entity or falsely state your affiliation with any person or entity</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. User Content</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">You retain ownership of any content you create, upload, or share through the Service ("User Content"). By using the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, store, and display your User Content solely for the purpose of providing the Service.</p>
              <p className="mb-4">You are solely responsible for your User Content and represent and warrant that:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>You own or have the necessary rights to use and share your User Content</li>
                <li>Your User Content does not violate any third-party rights</li>
                <li>Your User Content is not defamatory, obscene, or otherwise objectionable</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Sharing and Public Access</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              When you create a share code for a scoreboard, you understand that anyone with access to that share code can view the scoreboard data. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Protecting your share codes and only sharing them with intended recipients</li>
              <li>Understanding that shared scoreboards are publicly accessible to anyone with the share code</li>
              <li>Removing or regenerating share codes if you no longer want public access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Service Availability</h3>
            <p className="text-gray-700 leading-relaxed">
              We strive to provide reliable service, but we do not guarantee that the Service will be available at all times. The Service may be unavailable due to maintenance, updates, or circumstances beyond our control. We reserve the right to modify, suspend, or discontinue the Service at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Intellectual Property</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Service, including its original content, features, and functionality, is owned by Pretty Scoreboard and is protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may not reproduce, distribute, modify, create derivative works of, publicly display, or otherwise exploit any part of the Service without our prior written permission.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">9. Disclaimer of Warranties</h3>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">10. Limitation of Liability</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL PRETTY SCOREBOARD, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR USE OF THE SERVICE.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">11. Indemnification</h3>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Pretty Scoreboard and its affiliates from any claims, damages, losses, liabilities, and expenses (including attorneys' fees) arising out of or relating to your use of the Service, your User Content, or your violation of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">12. Termination</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason, including if you breach these Terms of Service. Upon termination, your right to use the Service will cease immediately.
            </p>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time by contacting us or using the account deletion features in the Service.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">13. Changes to Terms</h3>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of the Service after such changes constitutes your acceptance of the new Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">14. Governing Law</h3>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of the jurisdiction in which Pretty Scoreboard operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">15. Contact Information</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:support@scoreboard.app" className="text-indigo-600 hover:text-indigo-700 underline">support@scoreboard.app</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

