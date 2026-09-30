import { useCallback, useEffect, useState } from 'react'

import Hero from './components/Hero'
import Portfolio from './components/Portfolio'
import Services from './components/Services'
import About from './components/About'
import CTA from './components/CTA'
import Footer from './components/Footer'

import AuthGuard from './components/AuthGuard'

import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminInquiries from './pages/AdminInquiries'
import AdminGallery from './pages/AdminGallery'
import AdminServices from './pages/AdminServices'
import AdminPackages from './pages/AdminPackages'
import AdminReviews from './pages/AdminReviews'
import AdminSettings from './pages/AdminSettings'

import { getPublicSettings } from './api/settingsApi'

import './App.css'

function App() {
  const [path, setPath] = useState(
    window.location.hash.slice(1) || '/'
  )

  const [user, setUser] = useState(null)
  const [publicSettings, setPublicSettings] = useState(null)

  useEffect(() => {
    const handleHashChange = () => {
      setPath(window.location.hash.slice(1) || '/')
    }

    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        setPublicSettings(settings)

        if (settings?.business_name) {
          document.title = `${settings.business_name} | Photography`
        }
      })
      .catch(() => {
        setPublicSettings(null)
      })
  }, [])

  const navigate = useCallback((nextPath, replace = false) => {
    if (replace) {
      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}#${nextPath}`
      )

      setPath(nextPath)
    } else {
      window.location.hash = nextPath
    }
  }, [])

  const handleUnauthenticated = useCallback(() => {
    navigate('/admin/login', true)
  }, [navigate])

  const handleUserLoaded = useCallback((currentUser) => {
    setUser(currentUser)
  }, [])

  if (path === '/admin/login') {
    return (
      <AdminLogin
        onLogin={setUser}
        onNavigate={navigate}
      />
    )
  }

  if (path === '/admin') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminDashboard
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  if (path === '/admin/inquiries') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminInquiries
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  if (path === '/admin/gallery') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminGallery
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  if (path === '/admin/services') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminServices
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  if (path === '/admin/packages') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminPackages
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  if (path === '/admin/reviews') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminReviews
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  if (path === '/admin/settings') {
    return (
      <AuthGuard
        onUnauthenticated={handleUnauthenticated}
        onUserLoaded={handleUserLoaded}
      >
        {user && (
          <AdminSettings
            user={user}
            onLogout={() => setUser(null)}
            onNavigate={navigate}
          />
        )}
      </AuthGuard>
    )
  }

  return (
    <main>
      <Hero settings={publicSettings} />
      <Portfolio />
      <Services />
      <About settings={publicSettings} />
      <CTA settings={publicSettings} />
      <Footer settings={publicSettings} />
    </main>
  )
}

export default App