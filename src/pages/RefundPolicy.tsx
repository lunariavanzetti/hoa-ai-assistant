import React from 'react'
import { motion } from 'framer-motion'

export const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <h1 className="heading-1 text-center mb-8">Refund Policy</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="space-y-8">
            <section>
              <h2 className="heading-2">1. Overview</h2>
              <p>
                At HOA AI Assistant Kateriss, we stand behind our HOA management service and want you to be completely satisfied with your subscription. 
                This Refund Policy outlines the circumstances under which refunds may be provided and the process for requesting them.
              </p>
            </section>

            <section>
              <h2 className="heading-2">2. 30-Day Money-Back Guarantee</h2>
              <p>
                We offer a <strong>30-day money-back guarantee</strong> for all new subscribers to our paid plans. 
                If you are not satisfied with our service within the first 30 days of your initial subscription, 
                you may request a full refund.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">30-Day Guarantee Includes:</h3>
                <ul className="text-blue-700 dark:text-blue-300">
                  <li>Full refund of your first subscription payment</li>
                  <li>No questions asked policy</li>
                  <li>Applies to Pro, Agency, and Enterprise plans</li>
                  <li>Processed within 5-10 business days</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="heading-2">3. Eligibility Requirements</h2>
              <p>To be eligible for a refund under our 30-day money-back guarantee:</p>
              <ul>
                <li>You must be a <strong>new subscriber</strong> (first-time customer)</li>
                <li>The refund request must be made within <strong>30 calendar days</strong> of your initial subscription date</li>
                <li>Your account must be in good standing with no violations of our Terms of Service</li>
                <li>The refund applies only to your <strong>first payment</strong>, not renewal payments</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">4. What's Not Eligible for Refunds</h2>
              <p>The following are not eligible for refunds:</p>
              <ul>
                <li><strong>Renewal payments:</strong> Subscription renewals after the initial 30-day period</li>
                <li><strong>Free plan users:</strong> No payment means no refund applicable</li>
                <li><strong>Partial months:</strong> We do not provide prorated refunds for partial billing periods</li>
                <li><strong>Third-party services:</strong> Any additional services purchased through third parties</li>
                <li><strong>Suspended accounts:</strong> Accounts suspended for Terms of Service violations</li>
                <li><strong>Downgraded plans:</strong> Downgrades do not qualify for partial refunds</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">5. How to Request a Refund</h2>
              <p>To request a refund within the 30-day guarantee period:</p>
              
              <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Step-by-Step Process:</h3>
                <ol className="space-y-2">
                  <li><strong>1. Contact Support:</strong> Email us at support@kateriss.space</li>
                  <li><strong>2. Include Information:</strong> Provide your account email and subscription details</li>
                  <li><strong>3. Reason (Optional):</strong> While not required, feedback helps us improve</li>
                  <li><strong>4. Confirmation:</strong> We'll confirm your refund request within 1 business day</li>
                  <li><strong>5. Processing:</strong> Refunds are processed within 5-10 business days</li>
                </ol>
              </div>

              <p className="mt-4">
                <strong>Required Information for Refund Requests:</strong>
              </p>
              <ul>
                <li>Your account email address</li>
                <li>Subscription start date</li>
                <li>Transaction ID (if available)</li>
                <li>Brief reason for refund request (optional)</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">6. Refund Processing</h2>
              <p>
                Once your refund request is approved:
              </p>
              <ul>
                <li><strong>Processing Time:</strong> 5-10 business days from approval</li>
                <li><strong>Refund Method:</strong> Original payment method used for subscription</li>
                <li><strong>Account Access:</strong> Service access continues until the end of your current billing period</li>
                <li><strong>Data Export:</strong> You may export your data before account deactivation</li>
              </ul>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> Refund processing times may vary depending on your payment method and financial institution. 
                  Credit card refunds typically appear within 5-7 business days, while bank transfers may take up to 10 business days.
                </p>
              </div>
            </section>

            <section>
              <h2 className="heading-2">7. Subscription Cancellation</h2>
              <p>
                If you wish to cancel your subscription without requesting a refund:
              </p>
              <ul>
                <li>You can cancel anytime through your account settings</li>
                <li>Your service will continue until the end of your current billing period</li>
                <li>No refund will be provided for the remaining subscription period</li>
                <li>You can reactivate your subscription at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="heading-2">8. Exceptional Circumstances</h2>
              <p>
                In rare cases, we may consider refund requests outside of our standard policy for:
              </p>
              <ul>
                <li>Extended service outages affecting your usage</li>
                <li>Billing errors on our part</li>
                <li>Duplicate charges</li>
                <li>Technical issues preventing service use</li>
              </ul>
              <p>
                These requests are evaluated on a case-by-case basis and require approval from our management team.
              </p>
            </section>

            <section>
              <h2 className="heading-2">9. Chargebacks and Disputes</h2>
              <p>
                Before initiating a chargeback with your payment provider, please contact our support team. 
                We're committed to resolving any issues directly and can often provide a faster resolution than 
                the chargeback process.
              </p>
              <p>
                Accounts associated with chargebacks may be suspended pending resolution of the dispute.
              </p>
            </section>

            <section>
              <h2 className="heading-2">10. Free Trial</h2>
              <p>
                Our Free plan allows you to test our service without any payment. We encourage you to thoroughly 
                evaluate our features during this period before upgrading to a paid plan.
              </p>
            </section>

            <section>
              <h2 className="heading-2">11. Changes to This Policy</h2>
              <p>
                We reserve the right to modify this Refund Policy at any time. Changes will be effective immediately 
                upon posting on our website. We will notify existing subscribers of any material changes via email 
                or through our service.
              </p>
            </section>

            <section>
              <h2 className="heading-2">12. Contact Information</h2>
              <p>
                For refund requests or questions about this policy, please contact us:
              </p>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                <p><strong>Email:</strong> support@kateriss.space</p>
                <p><strong>Subject Line:</strong> "Refund Request - [Your Account Email]"</p>
                <p><strong>Response Time:</strong> Within 1 business day</p>
                <p><strong>Website:</strong> https://kateriss.space</p>
              </div>
            </section>

            <section>
              <h2 className="heading-2">13. Satisfaction Guarantee</h2>
              <p>
                Our goal is your complete satisfaction with HOA AI Assistant Kateriss. If you're experiencing any issues with our service, 
                please reach out to our support team before considering a refund. We're often able to resolve concerns 
                and help you get the most value from our platform.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  We're confident that HOA AI Assistant Kateriss will save your HOA time and improve your management efficiency. 
                  Try us risk-free for 30 days!
                </p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              This Refund Policy was last updated on {new Date().toLocaleDateString()}.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}