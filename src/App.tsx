import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from '@/components/ui/Toaster'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Dashboard } from '@/pages/Dashboard'
import { VideoGenerator } from '@/pages/VideoGenerator'
import { VideoTemplates } from '@/pages/VideoTemplates'
import { VideoHistory } from '@/pages/VideoHistory'
import { Pricing } from '@/pages/Pricing'
import { Settings } from '@/pages/Settings'
import { TermsOfService } from '@/pages/TermsOfService'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { RefundPolicy } from '@/pages/RefundPolicy'
import { Landing } from '@/pages/Landing'
import { Auth } from '@/pages/Auth'
import { AuthCallback } from '@/pages/AuthCallback'
import { useAuthStore } from '@/stores/auth'
import { Analytics } from '@vercel/analytics/react'
import { Analytics as AnalyticsPage } from '@/pages/Analytics'

function App() {
  const { user } = useAuthStore()


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
                  <Route path="/templates" element={<VideoTemplates />} />
                  <Route path="*" element={<Landing />} />
                </>
              ) : (
                <>
                  {/* Dashboard and Video Generator without sidebar layout */}
                  <Route index element={<Dashboard />} />
                  <Route path="generate" element={<VideoGenerator />} />
                  <Route path="templates" element={<VideoTemplates />} />
                  <Route path="videos" element={<VideoHistory />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="analytics" element={<AnalyticsPage />} />

                  {/* Standalone pages without layout */}
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="refund-policy" element={<RefundPolicy />} />
                  <Route path="auth/callback" element={<AuthCallback />} />

                  {/* Redirect any other routes to dashboard */}
                  <Route path="*" element={<Dashboard />} />
                </>
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