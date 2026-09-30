import { useEffect, useState } from 'react'
import { submitInquiry } from '../services/inquiryApi'
import { getPublicSettings } from '../api/settingsApi'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  service: '',
  preferred_date: '',
  message: '',
}

function formatWhatsAppNumber(phone) {
  if (!phone || typeof phone !== 'string') return ''
  let cleaned = phone.replace(/[^0-9]/g, '')
  if (!cleaned) return ''
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1)
  }
  if (!cleaned.startsWith('977')) {
    cleaned = '977' + cleaned
  }
  return cleaned
}

function formatPreferredDate(dateStr) {
  if (!dateStr) return 'Flexible / Not specified'
  try {
    const dateObj = new Date(`${dateStr}T00:00:00`)
    if (!Number.isNaN(dateObj.getTime())) {
      return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj)
    }
  } catch {
    // Return original string if formatting fails
  }
  return dateStr
}

function buildWhatsAppMessage({ name, phone, service, preferred_date, message, businessName }) {
  const studioName = businessName || 'SD Tech Photograph'
  const formattedDate = formatPreferredDate(preferred_date)

  const lines = [
    `*New Website Inquiry - ${studioName}*`,
    ``,
    `*Name:* ${name.trim()}`,
    `*Phone:* ${phone.trim()}`,
    `*Service:* ${service}`,
    `*Preferred Date:* ${formattedDate}`,
    `*Message:*`,
    `${message.trim()}`,
    ``,
    `_Sent via ${studioName} Website_`,
  ]

  return lines.join('\n')
}

function CTA({ settings }) {
  const [formData, setFormData] = useState(initialForm)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedState, setSubmittedState] = useState(null)
  const [fetchedSettings, setFetchedSettings] = useState(null)

  useEffect(() => {
    if (!settings && !fetchedSettings) {
      getPublicSettings()
        .then((data) => {
          if (data) setFetchedSettings(data)
        })
        .catch(() => {
          // Ignore error gracefully
        })
    }
  }, [settings, fetchedSettings])

  const activeSettings = settings || fetchedSettings

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return 'Please enter your name.'
    }
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      return 'Please enter a valid email address.'
    }
    if (!formData.phone.trim()) {
      return 'Please enter your phone number.'
    }
    if (!formData.service) {
      return 'Please select a photography service.'
    }
    if (!formData.message.trim()) {
      return 'Please enter a brief message describing your shoot.'
    }
    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationMessage = validateForm()
    if (validationMessage) {
      setStatus({ type: 'error', message: validationMessage })
      return
    }

    setIsSubmitting(true)
    setStatus({ type: '', message: '' })

    const studioPhone = activeSettings?.phone || '9800000000'
    const formattedWaNumber = formatWhatsAppNumber(studioPhone)
    const waMessageText = buildWhatsAppMessage({
      ...formData,
      businessName: activeSettings?.business_name,
    })
    const whatsappUrl = formattedWaNumber 
      ? `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(waMessageText)}`
      : null

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      service: formData.service,
      preferred_date: formData.preferred_date ? formData.preferred_date : null,
      message: formData.message.trim(),
    }

    try {
      await submitInquiry(payload)

      setSubmittedState({
        whatsappUrl,
        hasPhone: Boolean(formattedWaNumber),
      })
      setStatus({
        type: 'success',
        message: '✓ Inquiry saved! Click below to send on WhatsApp.',
      })
    } catch (error) {
      // If server is unreachable, gracefully allow user to proceed directly to WhatsApp
      if (whatsappUrl) {
        setSubmittedState({
          whatsappUrl,
          hasPhone: true,
        })
        setStatus({
          type: 'success',
          message: '✓ Ready to send! Click below to open WhatsApp directly.',
        })
      } else {
        setStatus({ type: 'error', message: error.message })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleReset() {
    setFormData(initialForm)
    setSubmittedState(null)
    setStatus({ type: '', message: '' })
  }

  return (
    <section className="cta-section page-width" id="contact">
      <div>
        <p className="eyebrow warm">Your story starts here</p>
        <h2>Let&apos;s make something<br /><em>you&apos;ll keep forever.</em></h2>
        <p className="cta-note">Tell us a little about what you are planning, and we&apos;ll be in touch.</p>
      </div>

      <div className="inquiry-form-container">
        {submittedState?.hasPhone ? (
          <div className="whatsapp-continuation-box">
            <p className="form-status success" role="status">
              {status.message || '✓ Inquiry saved successfully.'}
            </p>
            <a
              href={submittedState.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="solid-button whatsapp-button"
            >
              Continue to WhatsApp <span>{'->'}</span>
            </a>
            <p className="whatsapp-helper-text">
              Your inquiry will open in WhatsApp with your message already filled in. Tap <strong>Send</strong> in WhatsApp to reach us directly.
            </p>
            <button
              type="button"
              className="text-link reset-inquiry-button"
              onClick={handleReset}
            >
              Send another inquiry
            </button>
          </div>
        ) : (
          <form className="inquiry-form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <label>Name<input name="name" value={formData.name} onChange={handleChange} autoComplete="name" placeholder="Your name" /></label>
              <label>Email<input name="email" type="email" value={formData.email} onChange={handleChange} autoComplete="email" placeholder="you@example.com" /></label>
            </div>
            <div className="form-row">
              <label>Phone<input name="phone" value={formData.phone} onChange={handleChange} autoComplete="tel" placeholder="98XXXXXXXX" /></label>
              <label>Service<select name="service" value={formData.service} onChange={handleChange}>
                <option value="">Choose a service</option>
                <option value="Newborn Photography">Newborn Photography</option>
                <option value="Baby Photography">Baby Photography</option>
                <option value="Family Photography">Family Photography</option>
                <option value="Maternity Photography">Maternity Photography</option>
                <option value="Milestone Photography">Milestone Photography</option>
                <option value="Event Photography">Event Photography</option>
              </select></label>
            </div>
            <label>Preferred date<input name="preferred_date" type="date" value={formData.preferred_date} onChange={handleChange} /></label>
            <label>Message<textarea name="message" rows="3" value={formData.message} onChange={handleChange} placeholder="Tell us about the session..." /></label>
            {status.message && <p className={`form-status ${status.type}`} role="status">{status.message}</p>}
            <button className="solid-button form-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Send Inquiry on WhatsApp'} <span>{'->'}</span>
            </button>
            {submittedState && !submittedState.hasPhone && (
              <button
                type="button"
                className="text-link reset-inquiry-button"
                onClick={handleReset}
                style={{ marginTop: '12px' }}
              >
                Send another inquiry
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  )
}

export default CTA
