const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export async function getInquiries() {
  let response
  try {
    response = await fetch(`${API_URL}/inquiries`, {
      credentials: 'include',
    })
  } catch {
    throw new Error('Unable to load dashboard data.')
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const error = new Error('Unable to load dashboard data.')
    error.status = response.status
    throw error
  }

  return body?.data || []
}

async function inquiryRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...options.headers },
    })
  } catch {
    throw new Error('Unable to complete that inquiry action. Please try again.')
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const error = new Error('Unable to complete that inquiry action. Please try again.')
    error.status = response.status
    throw error
  }

  return body?.data
}

export function getInquiry(id) {
  return inquiryRequest(`/inquiries/${id}`)
}

export function updateInquiry(id, data) {
  return inquiryRequest(`/inquiries/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
}

export function deleteInquiry(id) {
  return inquiryRequest(`/inquiries/${id}`, { method: 'DELETE' })
}

export async function submitInquiry(formData) {
  let response
  try {
    response = await fetch(`${API_URL}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
  } catch {
    throw new Error('Network error: unable to reach the server. Please check your connection or contact us directly.')
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    let errorMsg = 'Please check the form details and try again.'
    if (body?.errors && Array.isArray(body.errors) && body.errors.length > 0) {
      errorMsg = body.errors.map((e) => e.message).join('. ')
    } else if (body?.message) {
      errorMsg = body.message
    }
    const error = new Error(errorMsg)
    error.status = response.status
    throw error
  }

  return body
}
