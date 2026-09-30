const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function galleryRequest(path, options = {}) {
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
    const error = new Error(body?.message || 'Unable to complete that gallery action. Please try again.')
    error.status = response.status
    throw error
  }

  return body
}

export async function getGallery() {
  const body = await galleryRequest('/gallery/admin')
  return body?.data || []
}

export async function createGalleryItem(data) {
  const body = await galleryRequest('/gallery', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function updateGalleryItem(id, data) {
  const body = await galleryRequest(`/gallery/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function deleteGalleryItem(id) {
  const body = await galleryRequest(`/gallery/${id}`, { method: 'DELETE' })
  return body?.data
}
