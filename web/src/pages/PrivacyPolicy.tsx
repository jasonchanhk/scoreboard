import React from 'react'

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 mb-8"></div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Pretty Scoreboard ("we," "our," or "us"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and in using our products and services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our scoreboard application.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Account Information:</strong> When you create an account, we collect your email address and any other information you choose to provide.</li>
                <li><strong>Authentication Data:</strong> If you sign in using Google OAuth, we receive your name, email address, and profile picture from Google.</li>
                <li><strong>Scoreboard Data:</strong> We store the scoreboards you create, including team names, scores, game information, and any other data you input into the application.</li>
                <li><strong>Usage Information:</strong> We automatically collect certain information about how you access and use our service, including device information, browser type, and IP address.</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your transactions and manage your account</li>
                <li>Send you technical notices, updates, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities in connection with our service</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Your data is stored securely using Supabase, a third-party service provider. Supabase provides database hosting, authentication services, and data storage infrastructure. We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p className="text-gray-700 leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">5. Third-Party Services</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">We use the following third-party services:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li><strong>Supabase:</strong> We use Supabase for database hosting, authentication, and backend services. Their privacy policy can be found at <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">https://supabase.com/privacy</a></li>
                <li><strong>Google OAuth:</strong> If you choose to sign in with Google, your authentication is handled by Google. Google's privacy policy can be found at <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700 underline">https://policies.google.com/privacy</a></li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Sharing and Disclosure</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>With service providers who assist us in operating our service (such as Supabase)</li>
              <li>When you share a scoreboard using a share code, the scoreboard data becomes accessible to anyone with the share code</li>
              <li>If required by law or to protect our rights, property, or safety</li>
              <li>In connection with a business transfer (merger, acquisition, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights and Choices</h3>
            <div className="text-gray-700 leading-relaxed">
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of certain data collection practices</li>
                <li>Export your scoreboard data</li>
              </ul>
              <p>
                To exercise these rights, please contact us at <a href="mailto:support@scoreboard.app" className="text-indigo-600 hover:text-indigo-700 underline">support@scoreboard.app</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">8. Children's Privacy</h3>
            <p className="text-gray-700 leading-relaxed">
              Our service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us so we can delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Privacy Policy</h3>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section className="mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact Us</h3>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 text-gray-700">
              <p><strong>Email:</strong> <a href="mailto:support@scoreboard.app" className="text-indigo-600 hover:text-indigo-700 underline">support@scoreboard.app</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

