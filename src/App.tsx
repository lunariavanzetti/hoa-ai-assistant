import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toaster'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ViolationGenerator } from '@/pages/ViolationGenerator'
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
import { History } from '@/pages/History'
import { Analytics as AnalyticsPage } from '@/pages/Analytics'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { AuthCallback } from '@/pages/AuthCallback'
import { useAuthStore } from '@/stores/auth'
import { Analytics } from '@vercel/analytics/react'
// import React from 'react'

function App() {
  const { user } = useAuthStore()

  console.log('🎯 App render - User state:', user ? 'Authenticated' : 'Not authenticated')

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
                  <Route path="complaint-reply" element={<ComplaintReply />} />
                  <Route path="meetings" element={<MeetingSummary />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="history" element={<History />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
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