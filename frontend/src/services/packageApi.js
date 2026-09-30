const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function packageRequest(path, options = {}) {
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
    const error = new Error(body?.message || 'Unable to complete that package action. Please try again.')
    error.status = response.status
    throw error
  }

  return body
}

export async function getPackages() {
  const body = await packageRequest('/packages')
  return body?.data || []
}

export async function createPackage(data) {
  const body = await packageRequest('/packages', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function updatePackage(id, data) {
  const body = await packageRequest(`/packages/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function deletePackage(id) {
  const body = await packageRequest(`/packages/${id}`, { method: 'DELETE' })
  return body?.data
}
