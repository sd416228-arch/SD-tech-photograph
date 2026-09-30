import { useEffect, useState } from 'react'
import { getPublicSettings } from '../api/settingsApi'

const navigationItems = [
  { label: 'Overview', path: '/admin', enabled: true },
  { label: 'Inquiries', path: '/admin/inquiries', enabled: true },
  { label: 'Gallery', path: '/admin/gallery', enabled: true },
  { label: 'Services', path: '/admin/services', enabled: true },
  { label: 'Packages', path: '/admin/packages', enabled: true },
  { label: 'Reviews', path: '/admin/reviews', enabled: true },
  { label: 'Business Settings', path: '/admin/settings', enabled: true },
]

function AdminSidebar({ onLogout, isLoggingOut, isOpen, onClose, onNavigate, currentPath = '/admin' }) {
  const [businessName, setBusinessName] = useState('PicturesSquad Studio Nepal')

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        if (settings?.business_name) setBusinessName(settings.business_name)
      })
      .catch(() => {})
  }, [])

  return (
    <aside className={`admin-sidebar ${isOpen ? 'is-open' : ''}`}>
      <div className="admin-sidebar-top">
        <a className="brand admin-sidebar-brand" href="/admin" aria-label={`${businessName} dashboard`}>
          <span className="brand-mark">PS</span>
          <span><strong>{businessName}</strong><small>PHOTOGRAPHY STUDIO</small></span>
        </a>
        <p className="admin-sidebar-label">Owner Dashboard</p>
      </div>
      <nav className="admin-nav" aria-label="Owner dashboard navigation">
        {navigationItems.map((item) => (
          <button className={`admin-nav-item ${item.enabled ? 'enabled' : 'upcoming'} ${currentPath === item.path ? 'selected' : ''}`} type="button" key={item.label} disabled={!item.enabled} onClick={() => { if (item.path) onNavigate(item.path); onClose() }}>
            <span className="admin-nav-dot" aria-hidden="true" />
            {item.label}
            {!item.enabled && <small>Soon</small>}
          </button>
        ))}
      </nav>
      <button className="admin-logout" type="button" onClick={onLogout} disabled={isLoggingOut}>
        <span aria-hidden="true">↗</span>{isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </aside>
  )
}

export default AdminSidebar
