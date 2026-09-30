const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function serviceRequest(path, options = {}) {
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
    const error = new Error(body?.message || 'Unable to complete that service action. Please try again.')
    error.status = response.status
    throw error
  }

  return body
}

export async function getServices() {
  const body = await serviceRequest('/services')
  return body?.data || []
}

export async function createService(data) {
  const body = await serviceRequest('/services', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function updateService(id, data) {
  const body = await serviceRequest(`/services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function deleteService(id) {
  const body = await serviceRequest(`/services/${id}`, { method: 'DELETE' })
  return body?.data
}
