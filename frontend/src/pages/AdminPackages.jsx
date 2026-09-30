import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { logout } from '../services/authApi'
import { createPackage, deletePackage, getPackages, updatePackage } from '../services/packageApi'

const MAX_FEATURES = 30

function formatPrice(value) {
  return `NPR ${Number(value || 0).toLocaleString('en-IN')}`
}

function normalizeFeatures(features) {
  if (Array.isArray(features)) return features.map((feature) => String(feature))
  return []
}

function formatDate(value) {
  if (!value) return 'Not set'
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value))
}

function AdminPackages({ user, onLogout, onNavigate }) {
  const [packages, setPackages] = useState([])
  const [dataState, setDataState] = useState('loading')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [toggleId, setToggleId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    features: [''],
    is_active: true,
  })

  const loadPackages = useCallback(async () => {
    setDataState('loading')
    setFeedback({ type: '', message: '' })

    try {
      setPackages(await getPackages())
      setDataState('ready')
    } catch {
      setDataState('error')
    }
  }, [])

  useEffect(() => {
    let isActive = true
    getPackages()
      .then((items) => {
        if (!isActive) return
        setPackages(items)
        setDataState('ready')
      })
      .catch(() => {
        if (isActive) setDataState('error')
      })

    return () => {
      isActive = false
    }
  }, [])

  const filteredPackages = useMemo(() => {
    const query = search.trim().toLowerCase()
    return packages.filter((packageItem) => {
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? packageItem.is_active : !packageItem.is_active)
      const haystack = [packageItem.name, packageItem.description].join(' ').toLowerCase()
      return matchesStatus && (!query || haystack.includes(query))
    })
  }, [packages, search, statusFilter])

  const resetForm = useCallback(() => {
    setFormData({ name: '', description: '', price: '', features: [''], is_active: true })
    setEditingPackage(null)
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
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  function handleFeatureChange(index, value) {
    setFormData((current) => ({
      ...current,
      features: current.features.map((feature, featureIndex) => featureIndex === index ? value : feature),
    }))
  }

  function addFeature() {
    if (formData.features.length < MAX_FEATURES) {
      setFormData((current) => ({ ...current, features: [...current.features, ''] }))
    }
  }

  function removeFeature(index) {
    setFormData((current) => {
      const features = current.features.filter((_, featureIndex) => featureIndex !== index)
      return { ...current, features: features.length ? features : [''] }
    })
  }

  function validateForm() {
    const name = formData.name.trim()
    const description = formData.description.trim()
    const price = Number(formData.price)
    const features = formData.features.map((feature) => feature.trim()).filter(Boolean)

    if (!name) return 'Please enter a package name.'
    if (name.length < 2 || name.length > 150) return 'Name must be between 2 and 150 characters.'
    if (!description) return 'Please enter a description.'
    if (description.length < 10 || description.length > 3000) return 'Description must be between 10 and 3000 characters.'
    if (formData.price === '' || !Number.isFinite(price) || price < 0 || price > 999999999999) return 'Please enter a valid price of 0 or more.'
    if (features.length === 0) return 'Add at least one package feature.'
    if (features.some((feature) => feature.length > 200)) return 'Each feature must be 200 characters or fewer.'

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
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        features: formData.features.map((feature) => feature.trim()).filter(Boolean),
        is_active: Boolean(formData.is_active),
      }
      const savedPackage = editingPackage
        ? await updatePackage(editingPackage.id, payload)
        : await createPackage(payload)

      setPackages((current) => editingPackage
        ? current.map((packageItem) => packageItem.id === savedPackage.id ? savedPackage : packageItem)
        : [savedPackage, ...current])
      setFeedback({ type: 'success', message: editingPackage ? 'Package updated successfully.' : 'Package added successfully.' })
      closeModal()
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to save this package. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(id) {
    const packageItem = packages.find((item) => item.id === id)
    if (!packageItem) return
    const confirmed = window.confirm(`Delete Package?\n\nAre you sure you want to delete "${packageItem.name}"?\n\nThis action cannot be undone.`)
    if (!confirmed) return

    setDeletingId(id)
    setFeedback({ type: '', message: '' })
    try {
      await deletePackage(id)
      setPackages((current) => current.filter((item) => item.id !== id))
      setFeedback({ type: 'success', message: 'Package deleted successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to delete this package. Please try again.' })
    } finally {
      setDeletingId(null)
    }
  }

  async function togglePackageActive(packageItem) {
    const nextValue = !packageItem.is_active
    setToggleId(packageItem.id)
    setFeedback({ type: '', message: '' })
    try {
      const updated = await updatePackage(packageItem.id, { is_active: nextValue })
      setPackages((current) => current.map((item) => item.id === updated.id ? updated : item))
      setFeedback({ type: 'success', message: nextValue ? 'Package activated.' : 'Package deactivated.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to update that package status. Please try again.' })
    } finally {
      setToggleId(null)
    }
  }

  function openAddModal() {
    resetForm()
    setFeedback({ type: '', message: '' })
    setIsModalOpen(true)
  }

  function openEditModal(packageItem) {
    setEditingPackage(packageItem)
    setFormData({
      name: packageItem.name || '',
      description: packageItem.description || '',
      price: packageItem.price === null || packageItem.price === undefined ? '' : String(packageItem.price),
      features: normalizeFeatures(packageItem.features).length ? normalizeFeatures(packageItem.features) : [''],
      is_active: Boolean(packageItem.is_active),
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

  return (
    <main className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin/packages" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}

      <section className="admin-main-content">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy"><p className="eyebrow warm">Package management</p><h1>Packages</h1><p>Manage photography packages, pricing and included features.</p></div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        <div className="package-toolbar"><button className="solid-button" type="button" onClick={openAddModal}>+ Add Package</button></div>
        <div className="package-toolbar package-controls">
          <label className="package-search"><span className="sr-only">Search packages</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search packages..." /></label>
          <label className="package-filter"><span>Status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="ALL">All</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
        </div>

        {feedback.message && <p className={`package-feedback ${feedback.type}`} role="status">{feedback.message}</p>}
        {dataState === 'loading' && <div className="admin-data-state">Loading packages...</div>}
        {dataState === 'error' && <div className="admin-data-state admin-data-error"><strong>Unable to load packages.</strong><span>Please check your connection and try again.</span><button type="button" onClick={loadPackages}>Retry</button></div>}
        {dataState === 'ready' && packages.length === 0 && <div className="admin-empty-state"><strong>No packages yet.</strong><p>Add your first photography package to get started.</p><button className="solid-button" type="button" onClick={openAddModal}>+ Add Package</button></div>}
        {dataState === 'ready' && packages.length > 0 && filteredPackages.length === 0 && <div className="admin-empty-state"><strong>No matching packages found.</strong><p>Try adjusting your search or status filter.</p></div>}
        {dataState === 'ready' && filteredPackages.length > 0 && <div className="package-grid">{filteredPackages.map((packageItem) => <article className="package-card" key={packageItem.id}><div className="package-card-header"><div><h3>{packageItem.name}</h3><p>Created {formatDate(packageItem.created_at)}</p></div><span className={`package-badge ${packageItem.is_active ? 'active' : 'inactive'}`}>{packageItem.is_active ? 'Active' : 'Inactive'}</span></div><p className="package-description">{packageItem.description}</p><strong className="package-price">{formatPrice(packageItem.price)}</strong><ul className="package-features">{normalizeFeatures(packageItem.features).map((feature) => <li key={feature}>✓ {feature}</li>)}</ul><div className="package-card-actions"><button type="button" onClick={() => openEditModal(packageItem)}>Edit</button><button type="button" onClick={() => togglePackageActive(packageItem)} disabled={toggleId === packageItem.id}>{toggleId === packageItem.id ? 'Updating...' : packageItem.is_active ? 'Deactivate' : 'Activate'}</button><button type="button" className="danger" onClick={() => handleDelete(packageItem.id)} disabled={deletingId === packageItem.id}>{deletingId === packageItem.id ? 'Deleting...' : 'Delete'}</button></div></article>)}</div>}
      </section>

      {isModalOpen && <div className="package-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><section className="package-modal" role="dialog" aria-modal="true" aria-labelledby="package-modal-title"><div className="package-modal-header"><div><p className="eyebrow warm">{editingPackage ? 'Edit package' : 'Add package'}</p><h2 id="package-modal-title">{editingPackage ? 'Edit Package' : 'Add Package'}</h2></div><button className="package-close" type="button" aria-label="Close form" onClick={closeModal}>×</button></div><form className="package-form" onSubmit={handleSubmit}><label><span>Package Name</span><input name="name" value={formData.name} onChange={handleFieldChange} placeholder="Premium Newborn" maxLength={150} /></label><label><span>Description</span><textarea name="description" value={formData.description} onChange={handleFieldChange} placeholder="A complete newborn photography session designed to capture your baby's earliest memories." maxLength={3000} rows={5} /></label><label><span>Price (NPR)</span><input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleFieldChange} placeholder="25000" /></label><fieldset className="package-features-fieldset"><legend>Features</legend>{formData.features.map((feature, index) => <div className="package-feature-row" key={`feature-${index}`}><input value={feature} onChange={(event) => handleFeatureChange(index, event.target.value)} maxLength={200} placeholder={`Feature ${index + 1}`} /><button type="button" onClick={() => removeFeature(index)} aria-label={`Remove feature ${index + 1}`}>Remove</button></div>)}<button type="button" className="package-add-feature" onClick={addFeature} disabled={formData.features.length >= MAX_FEATURES}>+ Add Feature</button></fieldset><label className="package-checkbox-row"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleFieldChange} /><span>Active</span></label>{feedback.message && feedback.type === 'error' && <p className="package-feedback error" role="status">{feedback.message}</p>}<div className="package-modal-actions"><button type="button" className="gallery-secondary-button" onClick={closeModal}>Cancel</button><button type="submit" className="solid-button" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : editingPackage ? 'Save Package' : 'Create Package'}</button></div></form></section></div>}
    </main>
  )
}

export default AdminPackages
