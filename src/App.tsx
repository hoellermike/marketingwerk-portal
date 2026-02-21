import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Campaigns from './pages/Campaigns'
import Applicants from './pages/Applicants'
import Credits from './pages/Credits'
import Resources from './pages/Resources'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import WebhookStatus from './pages/WebhookStatus'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <ToastProvider>
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/:category?"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  {(tab) => {
                    switch (tab) {
                      case 'campaigns': return <Campaigns />
                      case 'applicants': return <Applicants />
                      case 'credits': return <Credits />
                      case 'resources': return <Resources />
                      default: return <Overview />
                    }
                  }}
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/webhooks" element={<WebhookStatus />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
