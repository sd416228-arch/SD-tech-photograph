const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function settingsRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
  } catch {
    throw new Error('Unable to connect to the server. Please try again.')
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const error = new Error(body?.message || 'Unable to complete that settings action. Please try again.')
    error.status = response.status
    throw error
  }

  return body
}

export async function getSettings() {
  const body = await settingsRequest('/settings')
  return body?.data || null
}

export async function getPublicSettings() {
  const body = await settingsRequest('/settings/public')
  return body?.data || null
}

export async function updateSettings(data) {
  const body = await settingsRequest('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return body?.data || null
}
