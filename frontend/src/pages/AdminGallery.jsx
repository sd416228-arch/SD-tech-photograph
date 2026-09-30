import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { logout } from '../services/authApi'
import { createGalleryItem, deleteGalleryItem, getGallery, updateGalleryItem } from '../services/galleryApi'

const DEFAULT_CATEGORIES = ['Newborn', 'Baby', 'Family', 'Maternity', 'Milestone', 'Events', 'Celebrations']

function getFallbackImage() {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800">
      <rect width="600" height="800" fill="#e9e4de"/>
      <rect x="40" y="40" width="520" height="720" rx="12" fill="#f4f0ea" stroke="#d2c6b5" stroke-width="2"/>
      <circle cx="300" cy="300" r="120" fill="#d8cdc0"/>
      <path d="M200 520c32-72 96-108 168-108s126 36 168 108" fill="#d8cdc0"/>
      <text x="50%" y="700" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#6f655d">Image unavailable</text>
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

function AdminGallery({ user, onLogout, onNavigate }) {
  const [galleryItems, setGalleryItems] = useState([])
  const [dataState, setDataState] = useState('loading')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: '',
    is_featured: false,
  })

  async function loadGallery() {
    setDataState('loading')
    setFeedback({ type: '', message: '' })

    try {
      const items = await getGallery()
      setGalleryItems(items)
      setDataState('ready')
      if (categoryFilter !== 'All Categories' && !items.some((item) => item.category === categoryFilter)) {
        setCategoryFilter('All Categories')
      }
    } catch {
      setDataState('error')
    }
  }

  const categories = useMemo(() => {
    const values = new Set(DEFAULT_CATEGORIES)
    galleryItems.forEach((item) => {
      if (item.category) values.add(item.category)
    })
    return Array.from(values)
  }, [galleryItems])

  const resetForm = useCallback(() => {
    setFormData({ title: '', image_url: '', category: categories[0] || '', is_featured: false })
    setEditingItem(null)
  }, [categories])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    resetForm()
  }, [resetForm])

  useEffect(() => {
    let isActive = true

    const fetchGallery = async () => {
      try {
        const items = await getGallery()
        if (!isActive) return
        setGalleryItems(items)
        setDataState('ready')
      } catch {
        if (isActive) setDataState('error')
      }
    }

    fetchGallery()
    return () => {
      isActive = false
    }
  }, [])

  useEffect(() => {
    if (!isModalOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeModal, isModalOpen])

  const filteredGallery = useMemo(() => {
    const query = search.trim().toLowerCase()
    return galleryItems.filter((item) => {
      const matchesCategory = categoryFilter === 'All Categories' || item.category === categoryFilter
      const haystack = [item.title, item.category].join(' ').toLowerCase()
      return matchesCategory && (!query || haystack.includes(query))
    })
  }, [galleryItems, categoryFilter, search])

  function openAddModal() {
    resetForm()
    setIsModalOpen(true)
    setFeedback({ type: '', message: '' })
  }

  function openEditModal(item) {
    setEditingItem(item)
    setFormData({
      title: item.title || '',
      image_url: item.image_url || '',
      category: item.category || categories[0] || '',
      is_featured: Boolean(item.is_featured),
    })
    setFeedback({ type: '', message: '' })
    setIsModalOpen(true)
  }

  function handleFieldChange(event) {
    const { name, value, type, checked } = event.target
    setFormData((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function validateForm() {
    const title = formData.title.trim()
    const imageUrl = formData.image_url.trim()
    const category = formData.category.trim()

    if (!title) return 'Please enter a title.'
    if (!imageUrl) return 'Please enter an image URL.'
    if (!isValidUrl(imageUrl)) return 'Please enter a valid image URL.'
    if (!category) return 'Please enter a category.'

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
    const payload = {
      title: formData.title.trim(),
      image_url: formData.image_url.trim(),
      category: formData.category.trim(),
      is_featured: Boolean(formData.is_featured),
    }

    try {
      const savedItem = editingItem
        ? await updateGalleryItem(editingItem.id, payload)
        : await createGalleryItem(payload)

      setGalleryItems((currentItems) => {
        if (editingItem) {
          return currentItems.map((item) => (item.id === savedItem.id ? savedItem : item))
        }
        return [savedItem, ...currentItems]
      })
      setFeedback({
        type: 'success',
        message: editingItem ? 'Gallery photo updated successfully.' : 'Gallery photo added successfully.',
      })
      closeModal()
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to save this gallery photo. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const item = galleryItems.find((entry) => entry.id === id)
    const confirmed = window.confirm('Are you sure you want to delete this gallery photo?\n\nThis action cannot be undone.')
    if (!confirmed || !item) return

    setDeletingId(id)
    setFeedback({ type: '', message: '' })

    try {
      await deleteGalleryItem(id)
      setGalleryItems((currentItems) => currentItems.filter((entry) => entry.id !== id))
      setFeedback({ type: 'success', message: 'Gallery photo deleted successfully.' })
      if (previewImage === item.image_url) setPreviewImage(null)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error.message || 'Unable to delete this gallery photo. Please try again.',
      })
    } finally {
      setDeletingId(null)
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
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin/gallery" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}

      <section className="admin-main-content gallery-page">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy">
            <p className="eyebrow warm">Studio gallery</p>
            <h1>Gallery</h1>
            <p>Manage the photos displayed across the studio website.</p>
          </div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        <div className="admin-gallery-topbar">
          <button className="solid-button admin-gallery-add-button" type="button" onClick={openAddModal}>Add Photo</button>
        </div>

        <div className="gallery-toolbar">
          <label className="gallery-search">
            <span className="sr-only">Search gallery</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or category" />
          </label>
          <label className="gallery-filter">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="All Categories">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        {feedback.message && <p className={`gallery-feedback ${feedback.type}`} role="status">{feedback.message}</p>}

        {dataState === 'loading' && <div className="admin-data-state">Loading gallery...</div>}
        {dataState === 'error' && (
          <div className="admin-data-state admin-data-error">
            <strong>Unable to load gallery. Please try again.</strong>
            <button type="button" onClick={loadGallery}>Retry</button>
          </div>
        )}

        {dataState === 'ready' && galleryItems.length === 0 && (
          <div className="admin-empty-state gallery-empty-state">
            <strong>No gallery photos yet.</strong>
            <p>Add your first photo to start building the studio gallery.</p>
            <button className="solid-button" type="button" onClick={openAddModal}>Add Photo</button>
          </div>
        )}

        {dataState === 'ready' && galleryItems.length > 0 && filteredGallery.length === 0 && (
          <div className="admin-empty-state gallery-empty-state">
            <strong>No gallery photos found.</strong>
            <p>Try a different search or adjust the selected category.</p>
          </div>
        )}

        {dataState === 'ready' && filteredGallery.length > 0 && (
          <div className="gallery-grid" aria-live="polite">
            {filteredGallery.map((item) => (
              <article className="gallery-card" key={item.id}>
                <button className="gallery-card-image" type="button" aria-label={`Preview ${item.title}`} onClick={() => setPreviewImage(item.image_url)}>
                  <img
                    src={item.image_url || getFallbackImage()}
                    alt={item.title}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = getFallbackImage()
                    }}
                  />
                </button>

                <div className="gallery-card-body">
                  <div className="gallery-card-header">
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.category}</p>
                    </div>
                    {item.is_featured && <span className="gallery-feature-badge">★ Featured</span>}
                  </div>

                  <div className="gallery-card-actions">
                    <button type="button" onClick={() => openEditModal(item)}>Edit</button>
                    <button type="button" className="gallery-delete-button" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}>
                      {deletingId === item.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="gallery-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
          <section className="gallery-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-form-title">
            <div className="gallery-modal-header">
              <div>
                <p className="eyebrow warm">{editingItem ? 'Edit photo' : 'Add photo'}</p>
                <h2 id="gallery-form-title">{editingItem ? 'Update gallery item' : 'Add a new photo'}</h2>
              </div>
              <button className="gallery-close-button" type="button" aria-label="Close photo form" onClick={closeModal}>×</button>
            </div>

            <form className="gallery-form" onSubmit={handleSubmit}>
              <label>
                <span>Title</span>
                <input type="text" name="title" value={formData.title} onChange={handleFieldChange} placeholder="Baby's First Smile" />
              </label>

              <label>
                <span>Image URL</span>
                <input type="url" name="image_url" value={formData.image_url} onChange={handleFieldChange} placeholder="https://example.com/photo.jpg" />
              </label>

              <label>
                <span>Category</span>
                <select name="category" value={formData.category} onChange={handleFieldChange}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label className="gallery-checkbox-row">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleFieldChange} />
                <span>Mark as featured</span>
              </label>

              {feedback.message && feedback.type === 'error' && (
                <p className="gallery-feedback error" role="alert">{feedback.message}</p>
              )}

              <div className="gallery-modal-actions">
                <button type="button" className="gallery-secondary-button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="solid-button" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingItem ? 'Save changes' : 'Create photo'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {previewImage && (
        <div className="gallery-preview-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPreviewImage(null) }}>
          <div className="gallery-preview-modal" role="dialog" aria-modal="true" aria-label="Preview gallery image">
            <button type="button" className="gallery-close-button" aria-label="Close image preview" onClick={() => setPreviewImage(null)}>×</button>
            <img src={previewImage || getFallbackImage()} alt="Preview of gallery item" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = getFallbackImage() }} />
          </div>
        </div>
      )}
    </main>
  )
}

export default AdminGallery
