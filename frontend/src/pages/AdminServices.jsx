import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { logout } from '../services/authApi'
import { createService, deleteService, getServices, updateService } from '../services/serviceApi'

function getFallbackImage() {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <rect width="640" height="420" fill="#e9e4de"/>
      <rect x="48" y="44" width="544" height="332" rx="18" fill="#f4f0ea" stroke="#d2c6b5" stroke-width="2"/>
      <circle cx="256" cy="172" r="78" fill="#d8cdc0"/>
      <path d="M176 290c34-58 90-87 156-87s123 29 156 87" fill="#d8cdc0"/>
      <text x="50%" y="336" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6f655d">No image</text>
    </svg>
  `)}`
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function AdminServices({ user, onLogout, onNavigate }) {
  const [services, setServices] = useState([])
  const [dataState, setDataState] = useState('loading')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toggleId, setToggleId] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
  })

  const loadServices = useCallback(async () => {
    setDataState('loading')
    setFeedback({ type: '', message: '' })

    try {
      const items = await getServices()
      setServices(items)
      setDataState('ready')
    } catch {
      setDataState('error')
    }
  }, [])

  useEffect(() => {
    let isActive = true

    const fetchServices = async () => {
      try {
        const items = await getServices()
        if (!isActive) return
        setServices(items)
        setDataState('ready')
      } catch {
        if (isActive) setDataState('error')
      }
    }

    fetchServices()

    return () => {
      isActive = false
    }
  }, [])

  const filteredServices = useMemo(() => {
    const query = search.trim().toLowerCase()
    return services.filter((service) => {
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? service.is_active : !service.is_active)
      const haystack = [service.title, service.description].join(' ').toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [services, search, statusFilter])

  const resetForm = useCallback(() => {
    setFormData({ title: '', description: '', image_url: '', is_active: true })
    setEditingService(null)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    resetForm()
  }, [resetForm])

  useEffect(() => {
    if (!isModalOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeModal()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeModal, isModalOpen])

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function validateForm() {
    const title = formData.title.trim()
    const description = formData.description.trim()
    const imageUrl = formData.image_url.trim()

    if (!title) return 'Please enter a service title.'
    if (title.length < 2 || title.length > 150) return 'Title must be between 2 and 150 characters.'
    if (!description) return 'Please enter a description.'
    if (description.length < 10 || description.length > 3000) return 'Description must be between 10 and 3000 characters.'
    if (!imageUrl) return 'Please enter an image URL.'
    if (!isValidUrl(imageUrl)) return 'Please enter a valid image URL.'

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationMessage = validateForm()
    if (validationMessage) {
      setFeedback({ type: 'error', message: validationMessage })
      return
    }

    setIsSubmitting(true)
    setFeedback({ type: '', message: '' })

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image_url: formData.image_url.trim(),
        is_active: Boolean(formData.is_active),
      }

      const savedService = editingService
        ? await updateService(editingService.id, payload)
        : await createService(payload)

      setServices((current) => {
        if (editingService) {
          return current.map((service) => service.id === savedService.id ? savedService : service)
        }
        return [savedService, ...current]
      })

      setFeedback({
        type: 'success',
        message: editingService ? 'Service updated successfully.' : 'Service added successfully.',
      })
      closeModal()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to save this service. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const service = services.find((item) => item.id === id)
    if (!service) return

    const confirmed = window.confirm(`Delete service?\n\nAre you sure you want to delete "${service.title}"?\nThis action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(id)
    setFeedback({ type: '', message: '' })

    try {
      await deleteService(id)
      setServices((current) => current.filter((item) => item.id !== id))
      setFeedback({ type: 'success', message: 'Service deleted successfully.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to delete this service. Please try again.',
      })
    } finally {
      setDeletingId(null)
    }
  }

  async function toggleServiceActive(service) {
    const nextValue = !service.is_active
    setToggleId(service.id)
    setFeedback({ type: '', message: '' })

    try {
      const updated = await updateService(service.id, { is_active: nextValue })
      setServices((current) => current.map((item) => item.id === service.id ? updated : item))
      setFeedback({ type: 'success', message: nextValue ? 'Service activated.' : 'Service deactivated.' })
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to update that service status. Please try again.',
      })
    } finally {
      setToggleId(null)
    }
  }

  function openAddModal() {
    resetForm()
    setIsModalOpen(true)
    setFeedback({ type: '', message: '' })
  }

  function openEditModal(service) {
    setEditingService(service)
    setFormData({
      title: service.title || '',
      description: service.description || '',
      image_url: service.image_url || '',
      is_active: Boolean(service.is_active),
    })
    setFeedback({ type: '', message: '' })
    setIsModalOpen(true)
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
  const imagePreview = formData.image_url.trim() || ''

  return (
    <main className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin/services" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}

      <section className="admin-main-content">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy">
            <p className="eyebrow warm">Service management</p>
            <h1>Services</h1>
            <p>Manage the photography services displayed on the website.</p>
          </div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        <div className="services-toolbar">
          <button className="solid-button" type="button" onClick={openAddModal}>+ Add Service</button>
        </div>

        <div className="services-toolbar controls-toolbar">
          <label className="service-search">
            <span className="sr-only">Search services</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services..." />
          </label>

          <label className="service-filter">
            <span>Status</span>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </div>

        {feedback.message && <p className={`service-feedback ${feedback.type}`} role="status">{feedback.message}</p>}

        {dataState === 'loading' && <div className="admin-data-state">Loading services...</div>}
        {dataState === 'error' && (
          <div className="admin-data-state admin-data-error">
            <strong>Unable to load services.</strong>
            <span>Please check your connection and try again.</span>
            <button type="button" onClick={loadServices}>Retry</button>
          </div>
        )}

        {dataState === 'ready' && services.length === 0 && (
          <div className="admin-empty-state">
            <strong>No services yet.</strong>
            <p>Add your first photography service to get started.</p>
            <button className="solid-button" type="button" onClick={openAddModal}>+ Add Service</button>
          </div>
        )}

        {dataState === 'ready' && services.length > 0 && filteredServices.length === 0 && (
          <div className="admin-empty-state">
            <strong>No matching services found.</strong>
            <p>Try adjusting your search or status filter.</p>
          </div>
        )}

        {dataState === 'ready' && filteredServices.length > 0 && (
          <div className="service-grid">
            {filteredServices.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="service-card-image-wrap">
                  <img
                    src={service.image_url || getFallbackImage()}
                    alt={service.title}
                    onError={(event) => {
                      event.currentTarget.src = getFallbackImage()
                    }}
                  />
                </div>

                <div className="service-card-body">
                  <div className="service-card-header">
                    <div>
                      <h3>{service.title}</h3>
                      <p>{service.is_active ? 'Active' : 'Inactive'}</p>
                    </div>
                    <span className={`service-badge ${service.is_active ? 'active' : 'inactive'}`}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <p className="service-description">{service.description}</p>
                  <p className="service-date">Created {formatDate(service.created_at)}</p>

                  <div className="service-card-actions">
                    <button type="button" onClick={() => openEditModal(service)}>Edit</button>
                    <button type="button" onClick={() => toggleServiceActive(service)} disabled={toggleId === service.id}>
                      {toggleId === service.id ? 'Updating...' : service.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button type="button" className="danger" onClick={() => handleDelete(service.id)} disabled={deletingId === service.id}>
                      {deletingId === service.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="service-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
          <section className="service-modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
            <div className="service-modal-header">
              <div>
                <p className="eyebrow warm">{editingService ? 'Edit service' : 'Add service'}</p>
                <h2 id="service-modal-title">{editingService ? 'Edit Service' : 'Add Service'}</h2>
              </div>
              <button className="service-close" type="button" aria-label="Close form" onClick={closeModal}>×</button>
            </div>

            <form className="service-form" onSubmit={handleSubmit}>
              <label>
                <span>Service Title</span>
                <input name="title" value={formData.title} onChange={handleFieldChange} placeholder="Newborn Photography" maxLength={150} />
              </label>

              <label>
                <span>Description</span>
                <textarea name="description" value={formData.description} onChange={handleFieldChange} placeholder="Beautiful newborn photography sessions designed to capture your baby's earliest moments." maxLength={3000} rows={5} />
              </label>

              <label>
                <span>Image URL</span>
                <input name="image_url" value={formData.image_url} onChange={handleFieldChange} placeholder="https://example.com/newborn.jpg" />
              </label>

              {imagePreview && (
                <div className="service-image-preview-wrap">
                  <span>Preview</span>
                  <img className="service-image-preview" src={imagePreview} alt="Service preview" onError={(event) => { event.currentTarget.src = getFallbackImage() }} />
                </div>
              )}

              <label className="service-checkbox-row">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFieldChange} />
                <span>Active</span>
              </label>

              {feedback.message && feedback.type === 'error' && <p className="service-feedback error" role="status">{feedback.message}</p>}

              <div className="service-modal-actions">
                <button type="button" className="gallery-secondary-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="solid-button" disabled={isSubmitting}>
                  {isSubmitting ? (editingService ? 'Saving...' : 'Creating...') : (editingService ? 'Save Service' : 'Create Service')}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

export default AdminServices
