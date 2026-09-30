import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { logout } from '../services/authApi'
import { createReview, deleteReview, getReviews, updateReview } from '../api/reviewApi'

const EMPTY_FORM = { customer_name: '', rating: 5, review_text: '', is_approved: false }

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function renderStars(rating) {
  const value = Number(rating)
  return `${'★'.repeat(value)}${'☆'.repeat(5 - value)}`
}

function AdminReviews({ user, onLogout, onNavigate }) {
  const [reviews, setReviews] = useState([])
  const [dataState, setDataState] = useState('loading')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReview, setEditingReview] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [actionState, setActionState] = useState('')

  const loadReviews = useCallback(async () => {
    setDataState('loading')
    setFeedback({ type: '', message: '' })
    try {
      setReviews(await getReviews())
      setDataState('ready')
    } catch {
      setDataState('error')
    }
  }, [])

  useEffect(() => {
    let isActive = true
    getReviews()
      .then((items) => {
        if (!isActive) return
        setReviews(items)
        setDataState('ready')
      })
      .catch(() => {
        if (isActive) setDataState('error')
      })
    return () => { isActive = false }
  }, [])

  const filteredReviews = useMemo(() => {
    const query = search.trim().toLowerCase()
    return reviews.filter((review) => {
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'APPROVED' ? review.is_approved : !review.is_approved)
      const haystack = [review.customer_name, review.review_text].join(' ').toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [reviews, search, statusFilter])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditingReview(null)
    setFormData(EMPTY_FORM)
  }, [])

  useEffect(() => {
    if (!isModalOpen) return undefined
    const handleKeyDown = (event) => { if (event.key === 'Escape') closeModal() }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeModal, isModalOpen])

  function openAddModal() {
    setEditingReview(null)
    setFormData(EMPTY_FORM)
    setFeedback({ type: '', message: '' })
    setIsModalOpen(true)
  }

  function openEditModal(review) {
    setEditingReview(review)
    setFormData({
      customer_name: review.customer_name || '',
      rating: Number(review.rating),
      review_text: review.review_text || '',
      is_approved: Boolean(review.is_approved),
    })
    setFeedback({ type: '', message: '' })
    setIsModalOpen(true)
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value }))
  }

  function validateForm() {
    const name = formData.customer_name.trim()
    const text = formData.review_text.trim()
    if (!name) return 'Please enter the customer name.'
    if (name.length < 2 || name.length > 120) return 'Customer name must be between 2 and 120 characters.'
    if (!Number.isInteger(Number(formData.rating)) || Number(formData.rating) < 1 || Number(formData.rating) > 5) return 'Please select a rating from 1 to 5.'
    if (!text) return 'Please enter the review text.'
    if (text.length < 10 || text.length > 3000) return 'Review text must be between 10 and 3000 characters.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationMessage = validateForm()
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setActionState('save')
    setFeedback({ type: '', message: '' })
    const payload = {
      customer_name: formData.customer_name.trim(),
      rating: Number(formData.rating),
      review_text: formData.review_text.trim(),
      is_approved: Boolean(formData.is_approved),
    }

    try {
      const savedReview = editingReview ? await updateReview(editingReview.id, payload) : await createReview(payload)
      setReviews((current) => editingReview
        ? current.map((review) => review.id === savedReview.id ? savedReview : review)
        : [savedReview, ...current])
      closeModal()
      setFeedback({ type: 'success', message: editingReview ? 'Review updated successfully.' : 'Review added successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to save this review. Please try again.' })
    } finally {
      setActionState('')
    }
  }

  async function handleApproval(review) {
    setActionState(`approval-${review.id}`)
    setFeedback({ type: '', message: '' })
    try {
      const updatedReview = await updateReview(review.id, { is_approved: !review.is_approved })
      setReviews((current) => current.map((item) => item.id === updatedReview.id ? updatedReview : item))
      setFeedback({ type: 'success', message: updatedReview.is_approved ? 'Review approved.' : 'Review moved to pending.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to update the review approval. Please try again.' })
    } finally {
      setActionState('')
    }
  }

  async function handleDelete(review) {
    if (!window.confirm(`Are you sure you want to delete this review from "${review.customer_name}"?\n\nThis action cannot be undone.`)) return
    setActionState(`delete-${review.id}`)
    setFeedback({ type: '', message: '' })
    try {
      await deleteReview(review.id)
      setReviews((current) => current.filter((item) => item.id !== review.id))
      setFeedback({ type: 'success', message: 'Review deleted successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to delete this review. Please try again.' })
    } finally {
      setActionState('')
    }
  }

  async function handleLogout() {
    setIsLoggingOut(true)
    try { await logout() } finally {
      onLogout()
      onNavigate('/admin/login', true)
      setIsLoggingOut(false)
    }
  }

  const firstName = user.name.trim().split(/\s+/)[0]
  const emptyMessage = reviews.length === 0
    ? 'Add your first customer review.'
    : search.trim() ? 'No reviews match your search.'
      : statusFilter === 'APPROVED' ? 'No approved reviews yet.'
        : statusFilter === 'PENDING' ? 'No pending reviews.' : 'No reviews found.'

  return (
    <main className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin/reviews" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}
      <section className="admin-main-content reviews-page">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy"><p className="eyebrow warm">Review management</p><h1>Reviews</h1><p>Manage customer feedback and approval status.</p></div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        <div className="reviews-toolbar"><button className="solid-button" type="button" onClick={openAddModal}>+ Add Review</button></div>
        <div className="reviews-controls">
          <label className="review-search"><span className="sr-only">Search reviews</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or review text" /></label>
          <label className="review-filter"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All</option><option value="APPROVED">Approved</option><option value="PENDING">Pending</option></select></label>
        </div>
        {feedback.message && <p className={`review-feedback ${feedback.type}`} role="status">{feedback.message}</p>}
        {dataState === 'loading' && <div className="admin-data-state">Loading reviews...</div>}
        {dataState === 'error' && <div className="admin-data-state admin-data-error"><strong>Unable to load reviews.</strong><span>Please check your connection and try again.</span><button type="button" onClick={loadReviews}>Retry</button></div>}
        {dataState === 'ready' && filteredReviews.length === 0 && <div className="admin-empty-state reviews-empty"><strong>{emptyMessage}</strong><p>{reviews.length === 0 ? 'Customer feedback added here will be available for approval.' : 'Try adjusting your search or status filter.'}</p>{reviews.length === 0 && <button className="solid-button" type="button" onClick={openAddModal}>+ Add Review</button>}</div>}
        {dataState === 'ready' && filteredReviews.length > 0 && <div className="review-list">{filteredReviews.map((review) => <article className="review-card" key={review.id}><div className="review-card-top"><div><h2>{review.customer_name}</h2><div className="review-rating" aria-label={`${review.rating} out of 5 stars`}>{renderStars(review.rating)}</div></div><span className={`review-status ${review.is_approved ? 'approved' : 'pending'}`}>{review.is_approved ? 'Approved' : 'Pending'}</span></div><p className="review-text">{review.review_text}</p><p className="review-date">Added {formatDate(review.created_at)}</p><div className="review-actions"><button type="button" onClick={() => openEditModal(review)}>Edit</button><button type="button" onClick={() => handleApproval(review)} disabled={actionState === `approval-${review.id}`}>{actionState === `approval-${review.id}` ? 'Updating...' : review.is_approved ? 'Unapprove' : 'Approve'}</button><button className="danger" type="button" onClick={() => handleDelete(review)} disabled={actionState === `delete-${review.id}`}>{actionState === `delete-${review.id}` ? 'Deleting...' : 'Delete'}</button></div></article>)}</div>}
      </section>

      {isModalOpen && <div className="review-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-modal-title"><div className="review-modal-header"><div><p className="eyebrow warm">{editingReview ? 'Edit review' : 'Add review'}</p><h2 id="review-modal-title">{editingReview ? 'Edit Review' : 'Add Review'}</h2></div><button className="review-close" type="button" aria-label="Close form" onClick={closeModal}>×</button></div><form className="review-form" onSubmit={handleSubmit}><label><span>Customer Name</span><input name="customer_name" value={formData.customer_name} onChange={handleChange} maxLength={120} placeholder="Anita Sharma" /></label><label><span>Rating</span><select name="rating" value={formData.rating} onChange={handleChange}>{[5, 4, 3, 2, 1].map((rating) => <option value={rating} key={rating}>{renderStars(rating)} ({rating}/5)</option>)}</select></label><label><span>Review Text</span><textarea name="review_text" value={formData.review_text} onChange={handleChange} maxLength={3000} rows={6} placeholder="A beautiful experience from start to finish." /></label><label className="review-checkbox-row"><input type="checkbox" name="is_approved" checked={formData.is_approved} onChange={handleChange} /><span>Approved</span></label>{feedback.message && feedback.type === 'error' && <p className="review-feedback error" role="status">{feedback.message}</p>}<div className="review-modal-actions"><button type="button" className="gallery-secondary-button" onClick={closeModal}>Cancel</button><button className="solid-button" type="submit" disabled={actionState === 'save'}>{actionState === 'save' ? 'Saving...' : editingReview ? 'Save Review' : 'Create Review'}</button></div></form></section></div>}
    </main>
  )
}

export default AdminReviews
