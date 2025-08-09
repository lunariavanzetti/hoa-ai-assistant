import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toaster'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ViolationGenerator } from '@/pages/ViolationGenerator'
import { ComplaintInbox } from '@/pages/ComplaintInbox'
import { ComplaintDetail } from '@/pages/ComplaintDetail'
import { ComplaintReply } from '@/pages/ComplaintReply'
import { MeetingSummary } from '@/pages/MeetingSummary'
import { Reports } from '@/pages/Reports'
import { DataMonitor } from '@/pages/DataMonitor'
import { OnboardingDesigner } from '@/pages/OnboardingDesigner'
import { Pricing } from '@/pages/Pricing'
import { Settings } from '@/pages/Settings'
import { SimpleCheckout } from '@/pages/SimpleCheckout'
import { TermsOfService } from '@/pages/TermsOfService'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { RefundPolicy } from '@/pages/RefundPolicy'
import { Templates } from '@/pages/Templates'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { AuthCallback } from '@/pages/AuthCallback'
import { useAuthStore } from '@/stores/auth'
import { Analytics } from '@vercel/analytics/react'

function App() {
  const { user, loading } = useAuthStore()

  // Show loading state while checking authentication
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
        <Analytics />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen">
            <Routes>
              {!user ? (
                <>
                  <Route path="/" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="*" element={<Landing />} />
                </>
              ) : (
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="violations" element={<ViolationGenerator />} />
                  <Route path="complaints" element={<ComplaintInbox />} />
                  <Route path="complaints/:id" element={<ComplaintDetail />} />
                  <Route path="complaint-reply" element={<ComplaintReply />} />
                  <Route path="meetings" element={<MeetingSummary />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="data-monitor" element={<DataMonitor />} />
                  <Route path="onboarding" element={<OnboardingDesigner />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="paddle-test" element={<SimpleCheckout />} />
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="refund-policy" element={<RefundPolicy />} />
                  <Route path="templates" element={<Templates />} />
                  <Route path="auth/callback" element={<AuthCallback />} />
                </Route>
              )}
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
      <Analytics />
    </ThemeProvider>
  )
}

export default App