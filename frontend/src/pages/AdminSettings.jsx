import { useCallback, useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar'
import { getSettings, updateSettings } from '../api/settingsApi'
import { logout } from '../services/authApi'

const EMPTY_SETTINGS = {
  business_name: '',
  phone: '',
  email: '',
  address: '',
  instagram_url: '',
  facebook_url: '',
  tiktok_url: '',
  about_text: '',
}

function normalizeSettings(settings) {
  return Object.keys(EMPTY_SETTINGS).reduce((values, key) => ({
    ...values,
    [key]: settings?.[key] == null ? '' : String(settings[key]),
  }), {})
}

function isValidUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function AdminSettings({ user, onLogout, onNavigate }) {
  const [formData, setFormData] = useState(EMPTY_SETTINGS)
  const [initialSettings, setInitialSettings] = useState(EMPTY_SETTINGS)
  const [dataState, setDataState] = useState('loading')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const loadSettings = useCallback(async () => {
    setDataState('loading')
    setFeedback({ type: '', message: '' })
    try {
      const settings = await getSettings()
      if (!settings) throw new Error('Business settings were not found.')
      const normalized = normalizeSettings(settings)
      setFormData(normalized)
      setInitialSettings(normalized)
      setDataState('ready')
    } catch (error) {
      setDataState('error')
      setFeedback({ type: 'error', message: error.status === 404 ? 'No business settings record exists yet.' : 'Unable to load business settings. Please try again.' })
    }
  }, [])

  useEffect(() => {
    let isActive = true
    getSettings()
      .then((settings) => {
        if (!isActive) return
        if (!settings) throw new Error('Business settings were not found.')
        const normalized = normalizeSettings(settings)
        setFormData(normalized)
        setInitialSettings(normalized)
        setDataState('ready')
      })
      .catch((error) => {
        if (!isActive) return
        setDataState('error')
        setFeedback({ type: 'error', message: error.status === 404 ? 'No business settings record exists yet.' : 'Unable to load business settings. Please try again.' })
      })

    return () => {
      isActive = false
    }
  }, [])

  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(initialSettings), [formData, initialSettings])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function validateForm() {
    const businessName = formData.business_name.trim()
    const phone = formData.phone.trim()
    const email = formData.email.trim()
    const socialUrls = [formData.instagram_url.trim(), formData.facebook_url.trim(), formData.tiktok_url.trim()]

    if (!businessName) return 'Business name is required.'
    if (businessName.length > 180) return 'Business name must be 180 characters or fewer.'
    if (phone && !/^[0-9+().\-\s]{7,40}$/.test(phone)) return 'Please enter a valid phone number.'
    if (email && !/^\S+@\S+\.\S+$/.test(email)) return 'Please enter a valid email address.'
    if (socialUrls.some((url) => url && !isValidUrl(url))) return 'Please enter valid social media URLs.'
    if (formData.address.trim().length > 500) return 'Address must be 500 characters or fewer.'
    if (formData.about_text.trim().length > 5000) return 'About text must be 5000 characters or fewer.'
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
    const payload = Object.keys(EMPTY_SETTINGS).reduce((values, key) => ({
      ...values,
      [key]: key === 'business_name' ? formData[key].trim() : (formData[key].trim() || null),
    }), {})

    try {
      const savedSettings = await updateSettings(payload)
      if (!savedSettings) throw new Error('The server returned no settings data.')
      const normalized = normalizeSettings(savedSettings)
      setFormData(normalized)
      setInitialSettings(normalized)
      setFeedback({ type: 'success', message: 'Business settings saved successfully.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error.message || 'Unable to save business settings. Please try again.' })
    } finally {
      setIsSubmitting(false)
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

  return (
    <main className="admin-dashboard">
      <AdminSidebar onLogout={handleLogout} onNavigate={onNavigate} currentPath="/admin/settings" isLoggingOut={isLoggingOut} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && <button className="admin-sidebar-backdrop" type="button" aria-label="Close navigation" onClick={() => setIsSidebarOpen(false)} />}
      <section className="admin-main-content settings-page">
        <header className="admin-dashboard-header">
          <button className="admin-menu-button" type="button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>☰</button>
          <div className="admin-header-copy"><p className="eyebrow warm">Studio configuration</p><h1>Business Settings</h1><p>Keep the studio details used across your business presence up to date.</p></div>
          <div className="admin-header-user"><span className="admin-avatar">{firstName.charAt(0)}</span><span>{user.name}</span></div>
        </header>

        {dataState === 'loading' && <div className="admin-data-state">Loading business settings...</div>}
        {dataState === 'error' && <div className="admin-data-state admin-data-error"><strong>{feedback.message || 'Unable to load business settings.'}</strong><span>Please check your connection and try again.</span><button type="button" onClick={loadSettings}>Retry</button></div>}
        {dataState === 'ready' && <form className="settings-form" onSubmit={handleSubmit}>
          <section className="settings-section"><div className="settings-section-heading"><p className="eyebrow warm">Business information</p><h2>Studio details</h2></div><div className="settings-fields"><label><span>Business Name</span><input name="business_name" value={formData.business_name} onChange={handleChange} maxLength={180} placeholder="SD Tech Photograph" /></label><label><span>Phone</span><input name="phone" type="tel" value={formData.phone} onChange={handleChange} maxLength={40} placeholder="+977 98XXXXXXXX" /></label><label><span>Email</span><input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="hello@example.com" /></label><label className="settings-full-field"><span>Address</span><input name="address" value={formData.address} onChange={handleChange} maxLength={500} placeholder="Kathmandu and Pokhara, Nepal" /></label></div></section>
          <section className="settings-section"><div className="settings-section-heading"><p className="eyebrow warm">Social media</p><h2>Stay connected</h2></div><div className="settings-fields"><label><span>Instagram URL</span><input name="instagram_url" type="url" value={formData.instagram_url} onChange={handleChange} placeholder="https://instagram.com/yourstudio" /></label><label><span>Facebook URL</span><input name="facebook_url" type="url" value={formData.facebook_url} onChange={handleChange} placeholder="https://facebook.com/yourstudio" /></label><label><span>TikTok URL</span><input name="tiktok_url" type="url" value={formData.tiktok_url} onChange={handleChange} placeholder="https://tiktok.com/@yourstudio" /></label></div></section>
          <section className="settings-section"><div className="settings-section-heading"><p className="eyebrow warm">About business</p><h2>Your story</h2></div><div className="settings-fields"><label className="settings-full-field"><span>About Text</span><textarea name="about_text" value={formData.about_text} onChange={handleChange} maxLength={5000} rows={7} placeholder="Tell clients what makes your studio and approach special." /></label></div></section>
          {feedback.message && <p className={`settings-feedback ${feedback.type}`} role="status">{feedback.message}</p>}
          <div className="settings-actions"><span>{isDirty ? 'Unsaved changes' : 'All changes saved'}</span><button className="solid-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</button></div>
        </form>}
      </section>
    </main>
  )
}

export default AdminSettings
