import { useEffect, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { logout } from '../services/authApi'
import { getInquiries } from '../services/inquiryApi'

const statusLabels = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

function formatDate(value, options = {}) {
  if (!value) return 'Date not set'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', ...options }).format(new Date(value))
}

function getStats(inquiries) {
  return [
    { label: 'Total Inquiries', value: inquiries.length, detail: 'All time', icon: '◎' },
    { label: 'New Inquiries', value: inquiries.filter((item) => item.status === 'NEW').length, detail: 'Needs attention', icon: '✦' },
    { label: 'Contacted', value: inquiries.filter((item) => item.status === 'CONTACTED').length, detail: 'In progress', icon: '◷' },
    { label: 'Confirmed', value: inquiries.filter((item) => item.status === 'CONFIRMED').length, detail: 'Ready to capture', icon: '♡' },
  ]
}

function AdminDashboard({ user, onLogout, onNavigate }) {
  const [inquiries, setInquiries] = useState([])
  const [dataState, setDataState] = useState('loading')
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    let isActive = true
    getInquiries()
      .then((items) => {
        if (!isActive) return
        setInquiries(items)
        setDataState('ready')
      })
      .catch(() => {
        if (isActive) setDataState('error')
      })

    return () => {
      isActive = false
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      onLogout()
      onNavigate('/admin/login', true)
      setIsLoggingOut(false)
    }
  }

  const firstName = user.name.trim().split(/\s+/)[0]
  const stats = getStats(inquiries)

  return (
    <main className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}
      <section className="admin-main-content">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy">
            <p className="eyebrow warm">Overview</p>
            <h1>Good morning, <em>{firstName}.</em></h1>
            <p>Here&apos;s what&apos;s happening with your photography business.</p>
          </div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        {dataState === 'loading' && <div className="admin-data-state">Loading dashboard...</div>}
        {dataState === 'error' && <div className="admin-data-state admin-data-error"><strong>Unable to load dashboard data.</strong><span>Please refresh and try again.</span></div>}
        {dataState === 'ready' && <>
          <section className="admin-stats-grid" aria-label="Inquiry statistics">
            {stats.map((stat) => <article className="admin-stat-card" key={stat.label}><span className="admin-stat-icon">{stat.icon}</span><div><p>{stat.label}</p><strong>{stat.value}</strong><small>{stat.detail}</small></div></article>)}
          </section>
          <section className="admin-inquiries-section">
            <div className="admin-section-heading"><div><p className="eyebrow warm">Latest activity</p><h2>Recent inquiries</h2></div><span>{inquiries.length} total</span></div>
            {inquiries.length === 0 ? <div className="admin-empty-state"><strong>No inquiries yet.</strong><p>Customer inquiries will appear here when someone submits the website form.</p></div> : <div className="admin-inquiry-list">
              {inquiries.slice(0, 5).map((inquiry) => <article className="admin-inquiry-row" key={inquiry.id}><div className="admin-inquiry-main"><strong>{inquiry.name}</strong><span>{inquiry.service}</span></div><div className="admin-inquiry-date"><small>Preferred date</small><span>{formatDate(inquiry.preferred_date)}</span></div><div className="admin-inquiry-created"><small>Received</small><span>{formatDate(inquiry.created_at, { day: '2-digit', month: 'short' })}</span></div><span className={`admin-status status-${inquiry.status.toLowerCase()}`}>{statusLabels[inquiry.status] || inquiry.status}</span></article>)}
            </div>}
          </section>
        </>}
      </section>
    </main>
  )
}

export default AdminDashboard
