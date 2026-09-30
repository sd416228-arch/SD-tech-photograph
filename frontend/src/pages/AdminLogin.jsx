import { useEffect, useState } from 'react'
import { login } from '../services/authApi'
import { getPublicSettings } from '../api/settingsApi'

function AdminLogin({ onLogin, onNavigate }) {
  const [credentials, setCredentials] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [businessName, setBusinessName] = useState('SD Tech Photograph')

  useEffect(() => {
    getPublicSettings()
      .then((settings) => {
        if (settings?.business_name) setBusinessName(settings.business_name)
      })
      .catch(() => {})
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setCredentials((current) => ({ ...current, [name]: value }))
  }

  function validate() {
    if (!credentials.email || !/^\S+@\S+\.\S+$/.test(credentials.email)) {
      return 'Please enter a valid email address.'
    }
    if (!credentials.password) return 'Please enter your password.'
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationMessage = validate()
    if (validationMessage) {
      setMessage(validationMessage)
      return
    }

    setIsSubmitting(true)
    setMessage('')
    try {
      const response = await login(credentials)
      onLogin(response.data.user)
      onNavigate('/admin', true)
    } catch (error) {
      setMessage(error.status === 401 ? 'Invalid email or password.' : error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="admin-auth-page">
      <div className="admin-auth-image" aria-hidden="true" />
      <div className="admin-auth-panel">
        <button className="admin-back-link" type="button" onClick={() => onNavigate('/')}>← Back to studio</button>
        <div className="admin-brand"><span className="brand-mark">SD</span><span><strong>{businessName}</strong><small>PHOTOGRAPHY STUDIO</small></span></div>
        <div className="admin-auth-heading">
          <p className="eyebrow warm">Private workspace</p>
          <h1>Owner<br /><em>Dashboard</em></h1>
          <p>Sign in to manage the stories behind the studio.</p>
        </div>
        <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
          <label>Email<input name="email" type="email" value={credentials.email} onChange={handleChange} autoComplete="email" /></label>
          <label>Password<input name="password" type="password" value={credentials.password} onChange={handleChange} autoComplete="current-password" /></label>
          {message && <p className="admin-form-message" role="alert">{message}</p>}
          <button className="solid-button admin-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Login'} <span>{'->'}</span></button>
        </form>
        <p className="admin-forgot">Forgot password? <span>Contact the studio owner.</span></p>
      </div>
    </main>
  )
}

export default AdminLogin
