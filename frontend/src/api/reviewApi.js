const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

async function reviewRequest(path, options = {}) {
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
    const error = new Error(body?.message || 'Unable to complete that review action. Please try again.')
    error.status = response.status
    throw error
  }

  return body
}

export async function getReviews() {
  const body = await reviewRequest('/reviews/admin')
  return body?.data || []
}

export async function createReview(data) {
  const body = await reviewRequest('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function updateReview(id, data) {
  const body = await reviewRequest(`/reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
  return body?.data
}

export async function deleteReview(id) {
  const body = await reviewRequest(`/reviews/${id}`, { method: 'DELETE' })
  return body?.data
}
