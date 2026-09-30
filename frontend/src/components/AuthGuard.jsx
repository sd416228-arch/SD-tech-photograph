import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/authApi'

function AuthGuard({ children, onUnauthenticated, onUserLoaded }) {
  const [state, setState] = useState({ status: 'checking', user: null })

  useEffect(() => {
    let isActive = true

    getCurrentUser()
      .then((response) => {
        if (!isActive) return
        setState({ status: 'authenticated', user: response.data })
        onUserLoaded(response.data)
      })
      .catch(() => {
        if (!isActive) return
        setState({ status: 'unauthenticated', user: null })
        onUnauthenticated()
      })

    return () => {
      isActive = false
    }
  }, [onUnauthenticated, onUserLoaded])

  if (state.status === 'checking') {
    return <main className="auth-loading"><p>Checking authentication...</p></main>
  }

  if (state.status === 'unauthenticated') return null

  return children
}

export default AuthGuard
