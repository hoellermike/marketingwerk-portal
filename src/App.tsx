import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Overview from './pages/Overview'
import Campaigns from './pages/Campaigns'
import Applicants from './pages/Applicants'
import Credits from './pages/Credits'
import Resources from './pages/Resources'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
