import { useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { logout } from '../services/authApi'
import { deleteInquiry, getInquiry, getInquiries, updateInquiry } from '../services/inquiryApi'

const statuses = ['ALL', 'NEW', 'CONTACTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']
const statusLabels = { ALL: 'All', NEW: 'New', CONTACTED: 'Contacted', CONFIRMED: 'Confirmed', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }

function formatDate(value, options = {}) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', ...options }).format(new Date(value))
}

function AdminInquiries({ user, onLogout, onNavigate }) {
  const [inquiries, setInquiries] = useState([])
  const [dataState, setDataState] = useState('loading')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [actionState, setActionState] = useState('')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function loadInquiries() {
    setDataState('loading')
    try {
      setInquiries(await getInquiries())
      setDataState('ready')
    } catch {
      setDataState('error')
    }
  }

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

  const filteredInquiries = useMemo(() => {
    const query = search.trim().toLowerCase()
    return inquiries.filter((inquiry) => {
      const matchesStatus = statusFilter === 'ALL' || inquiry.status === statusFilter
      const haystack = [inquiry.name, inquiry.email, inquiry.phone, inquiry.service].join(' ').toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [inquiries, search, statusFilter])

  async function handleView(id) {
    setIsLoadingDetail(true)
    setFeedback({ type: '', message: '' })
    try {
      setSelectedInquiry(await getInquiry(id))
    } catch {
      setFeedback({ type: 'error', message: 'Unable to load that inquiry. Please try again.' })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  async function handleStatusChange(event) {
    const nextStatus = event.target.value
    if (!selectedInquiry || !nextStatus || nextStatus === selectedInquiry.status) return
    setActionState('status')
    setFeedback({ type: '', message: '' })
    try {
      const updated = await updateInquiry(selectedInquiry.id, { status: nextStatus })
      setSelectedInquiry(updated)
      setInquiries((current) => current.map((inquiry) => inquiry.id === updated.id ? updated : inquiry))
      setFeedback({ type: 'success', message: 'Inquiry status updated.' })
    } catch {
      setFeedback({ type: 'error', message: 'Unable to update the inquiry status. Please try again.' })
    } finally {
      setActionState('')
    }
  }

  async function handleDelete() {
    if (!selectedInquiry || !window.confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) return
    setActionState('delete')
    setFeedback({ type: '', message: '' })
    try {
      await deleteInquiry(selectedInquiry.id)
      setInquiries((current) => current.filter((inquiry) => inquiry.id !== selectedInquiry.id))
      setSelectedInquiry(null)
      setFeedback({ type: 'success', message: 'Inquiry deleted successfully.' })
    } catch {
      setFeedback({ type: 'error', message: 'Unable to delete the inquiry. Please try again.' })
    } finally {
      setActionState('')
    }
  }

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

  return (
    <main className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin/inquiries" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}
      <section className="admin-main-content inquiries-page">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy"><p className="eyebrow warm">Owner workspace</p><h1>Inquiries</h1><p>Manage customer inquiries and booking requests.</p></div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        <div className="inquiries-toolbar">
          <label className="inquiry-search"><span className="sr-only">Search inquiries</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone or service" /></label>
          <label className="inquiry-filter"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statuses.map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label>
        </div>
        {feedback.message && !selectedInquiry && <p className={`inquiry-feedback ${feedback.type}`} role="status">{feedback.message}</p>}

        {dataState === 'loading' && <div className="admin-data-state">Loading inquiries...</div>}
        {dataState === 'error' && <div className="admin-data-state admin-data-error"><strong>Unable to load inquiries.</strong><span>Please try again.</span><button type="button" onClick={loadInquiries}>Retry</button></div>}
        {dataState === 'ready' && inquiries.length === 0 && <div className="admin-empty-state inquiries-empty"><strong>No inquiries yet.</strong><p>Customer inquiries submitted from the website will appear here.</p></div>}
        {dataState === 'ready' && inquiries.length > 0 && filteredInquiries.length === 0 && <div className="admin-empty-state inquiries-empty"><strong>No inquiries found.</strong><p>Try a different search or status filter.</p></div>}
        {dataState === 'ready' && filteredInquiries.length > 0 && <div className="inquiries-table-wrap"><table className="inquiries-table"><thead><tr><th>Customer</th><th>Contact</th><th>Service</th><th>Preferred date</th><th>Status</th><th>Submitted</th><th>Action</th></tr></thead><tbody>{filteredInquiries.map((inquiry) => <tr key={inquiry.id}><td><strong>{inquiry.name}</strong></td><td><a href={`mailto:${inquiry.email}`}>{inquiry.email}</a><a href={`tel:${inquiry.phone}`}>{inquiry.phone}</a></td><td>{inquiry.service}</td><td>{formatDate(inquiry.preferred_date)}</td><td><span className={`admin-status status-${inquiry.status.toLowerCase()}`}>{statusLabels[inquiry.status] || inquiry.status}</span></td><td>{formatDate(inquiry.created_at)}</td><td><button className="inquiry-view-button" type="button" onClick={() => handleView(inquiry.id)} disabled={isLoadingDetail}>{isLoadingDetail ? 'Loading...' : 'View'}</button></td></tr>)}</tbody></table></div>}
      </section>

      {selectedInquiry && <div className="inquiry-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedInquiry(null) }}><section className="inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-detail-title"><div className="inquiry-modal-header"><div><p className="eyebrow warm">Inquiry details</p><h2 id="inquiry-detail-title">{selectedInquiry.name}</h2></div><button className="inquiry-close" type="button" aria-label="Close inquiry details" onClick={() => setSelectedInquiry(null)}>×</button></div><div className="inquiry-detail-grid"><div><small>Email</small><a href={`mailto:${selectedInquiry.email}`}>{selectedInquiry.email}</a></div><div><small>Phone</small><a href={`tel:${selectedInquiry.phone}`}>{selectedInquiry.phone}</a></div><div><small>Service</small><strong>{selectedInquiry.service}</strong></div><div><small>Preferred date</small><strong>{formatDate(selectedInquiry.preferred_date)}</strong></div><div><small>Submitted</small><strong>{formatDate(selectedInquiry.created_at)}</strong></div><div><small>Last updated</small><strong>{formatDate(selectedInquiry.updated_at)}</strong></div></div><div className="inquiry-message"><small>Message</small><p>{selectedInquiry.message}</p></div><div className="inquiry-modal-actions"><label>Status<select value={selectedInquiry.status} onChange={handleStatusChange} disabled={actionState === 'status'}>{statuses.slice(1).map((status) => <option value={status} key={status}>{statusLabels[status]}</option>)}</select></label><button className="inquiry-delete-button" type="button" onClick={handleDelete} disabled={actionState === 'delete'}>{actionState === 'delete' ? 'Deleting...' : 'Delete inquiry'}</button></div>{feedback.message && <p className={`inquiry-feedback ${feedback.type}`} role="status">{feedback.message}</p>}</section></div>}
    </main>
  )
}

export default AdminInquiries
