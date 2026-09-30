const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function request(path, options = {}) {
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
    const error = new Error('Unable to connect to the server. Please try again.')
    error.code = 'NETWORK_ERROR'
    throw error
  }

  let body
  try {
    body = await response.json()
  } catch {
    body = null
  }

  if (!response.ok) {
    const error = new Error(body?.message || 'Unable to complete authentication.')
    error.status = response.status
    throw error
  }

  return body
}

export function login(credentials) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export function getCurrentUser() {
  return request('/auth/me')
}

export function logout() {
  return request('/auth/logout', { method: 'POST' })
}
