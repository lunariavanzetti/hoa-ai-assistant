import React from 'react'
import { motion } from 'framer-motion'

export const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <h1 className="heading-1 text-center mb-8">Terms of Service</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="heading-2">1. Acceptance of Terms</h2>
              <p>
                By accessing and using HOA AI Assistant Kateriss ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="heading-2">2. Description of Service</h2>
              <p>
                HOA AI Assistant Kateriss is an AI-powered software-as-a-service (SaaS) platform designed for Homeowners Association (HOA) management. 
                Our service provides:
              </p>
              <ul>
                <li>Automated violation letter generation</li>
                <li>AI-powered complaint response system</li>
                <li>Meeting transcription and summary generation</li>
                <li>Compliance and financial reporting</li>
                <li>Data monitoring and analytics</li>
                <li>Multi-property management capabilities</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">3. User Accounts</h2>
              <p>
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul>
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">4. Subscription and Payment</h2>
              <p>
                HOA AI Assistant Kateriss offers subscription-based pricing plans. By subscribing to our service:
              </p>
              <ul>
                <li>You agree to pay all fees associated with your chosen plan</li>
                <li>Subscription fees are billed monthly or annually in advance</li>
                <li>All fees are non-refundable except as stated in our Refund Policy</li>
                <li>We reserve the right to change our pricing with 30 days notice</li>
                <li>Your subscription will automatically renew unless cancelled</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">5. Acceptable Use</h2>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>Upload, post, or transmit any content that is illegal, harmful, or offensive</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Use the service for any commercial purpose outside of HOA management</li>
                <li>Reverse engineer, modify, or create derivative works of our software</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">6. Privacy and Data Protection</h2>
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference. By using our Service, you consent to the collection, 
                use, and disclosure of your information as described in our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="heading-2">7. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are owned by HOA AI Assistant Kateriss and are protected by 
                international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="heading-2">8. Termination</h2>
              <p>
                We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, 
                or for any other reason in our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="heading-2">9. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, 
                INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
            </section>

            <section>
              <h2 className="heading-2">10. Limitation of Liability</h2>
              <p>
                IN NO EVENT SHALL HOA AI ASSISTANT KATERISS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
                INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM 
                YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section>
              <h2 className="heading-2">11. Refund Policy</h2>
              <p>
                We offer a 30-day money-back guarantee for new subscribers. If you are not satisfied with our service within 
                the first 30 days of your subscription, you may request a full refund. Refunds are not available for renewals 
                or after the initial 30-day period. To request a refund, please contact our support team.
              </p>
            </section>

            <section>
              <h2 className="heading-2">12. Governing Law</h2>
              <p>
                These Terms shall be interpreted and governed by the laws of the State of Delaware, United States, 
                without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="heading-2">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of any material changes 
                via email or through our Service. Your continued use of the Service after such modifications constitutes 
                acceptance of the updated Terms.
              </p>
            </section>

            <section>
              <h2 className="heading-2">14. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Email:</strong> support@hoa-ai-assistant.com</p>
                <p><strong>Website:</strong> https://hoa-ai-assistant.vercel.app</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              This Terms of Service agreement was last updated on {new Date().toLocaleDateString()}.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}