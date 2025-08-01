import React from 'react'
import { motion } from 'framer-motion'

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <h1 className="heading-1 text-center mb-8">Privacy Policy</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="heading-2">1. Introduction</h2>
              <p>
                Kateriss ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you use our HOA management service ("Service").
              </p>
              <p>
                Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, 
                please do not access the Service.
              </p>
            </section>

            <section>
              <h2 className="heading-2">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Personal Information</h3>
              <p>We may collect personally identifiable information, such as:</p>
              <ul>
                <li>Name and contact information (email address, phone number)</li>
                <li>HOA and property information</li>
                <li>Billing and payment information</li>
                <li>User account credentials</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Usage Data</h3>
              <p>We automatically collect certain information when you use our Service:</p>
              <ul>
                <li>Log data (IP address, browser type, access times)</li>
                <li>Device information (device type, operating system)</li>
                <li>Usage patterns and feature interactions</li>
                <li>Service performance metrics</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">HOA Management Data</h3>
              <p>In the course of providing our Service, we process:</p>
              <ul>
                <li>Property violation reports and photos</li>
                <li>Resident complaints and communications</li>
                <li>Meeting recordings and transcripts</li>
                <li>Financial and compliance reports</li>
                <li>Community member information</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">3. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Provide, operate, and maintain our Service</li>
                <li>Process transactions and manage billing</li>
                <li>Generate automated reports and communications</li>
                <li>Improve our Service and develop new features</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Send administrative information and updates</li>
                <li>Monitor and analyze usage and trends</li>
                <li>Detect, prevent, and address technical issues</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">4. How We Share Your Information</h2>
              <p>We may share your information in the following situations:</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Service Providers</h3>
              <p>
                We may share your information with third-party service providers who perform services on our behalf, 
                such as payment processing, data analysis, email delivery, hosting services, and customer service.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Legal Requirements</h3>
              <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Business Transfers</h3>
              <p>
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred 
                as part of that transaction.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">Consent</h3>
              <p>We may share your information with your explicit consent for any other purpose.</p>
            </section>

            <section>
              <h2 className="heading-2">5. Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information against 
                unauthorized or unlawful processing, accidental loss, destruction, or damage. These measures include:
              </p>
              <ul>
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure, 
                and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="heading-2">6. Data Retention</h2>
              <p>
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this 
                Privacy Policy, unless a longer retention period is required or permitted by law. When we no longer need 
                your personal information, we will securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="heading-2">7. Your Privacy Rights</h2>
              <p>Depending on your location, you may have the following rights regarding your personal information:</p>
              <ul>
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your information in a structured format</li>
                <li><strong>Restriction:</strong> Request restriction of processing under certain circumstances</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p>To exercise these rights, please contact us using the information provided below.</p>
            </section>

            <section>
              <h2 className="heading-2">8. Third-Party Services</h2>
              <p>Our Service may contain links to third-party websites or integrate with third-party services, including:</p>
              <ul>
                <li>Payment processors (Paddle)</li>
                <li>Analytics services</li>
                <li>Cloud storage providers</li>
                <li>Communication platforms</li>
              </ul>
              <p>
                This Privacy Policy does not apply to third-party services. We encourage you to review the privacy policies 
                of any third-party services you interact with.
              </p>
            </section>

            <section>
              <h2 className="heading-2">9. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal information 
                from children under 13. If we become aware that we have collected personal information from a child under 13, 
                we will take steps to delete such information.
              </p>
            </section>

            <section>
              <h2 className="heading-2">10. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your own. We ensure that such 
                transfers are subject to appropriate safeguards, such as standard contractual clauses or adequacy decisions.
              </p>
            </section>

            <section>
              <h2 className="heading-2">11. California Privacy Rights</h2>
              <p>
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul>
                <li>Right to know what personal information is collected, used, shared, or sold</li>
                <li>Right to delete personal information</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to non-discrimination for exercising privacy rights</li>
              </ul>
              <p>We do not sell personal information to third parties.</p>
            </section>

            <section>
              <h2 className="heading-2">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new 
                Privacy Policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy 
                periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="heading-2">13. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Email:</strong> privacy@kateriss.com</p>
                <p><strong>Support Email:</strong> support@kateriss.com</p>
                <p><strong>Website:</strong> https://hoa-ai-assistant.vercel.app</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              This Privacy Policy was last updated on {new Date().toLocaleDateString()}.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}