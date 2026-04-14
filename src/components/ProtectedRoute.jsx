import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })
  }, [])

  // Still checking — show nothing while loading
  if (session === undefined) return null

  // No session — redirect to login
  if (session === null) return <Navigate to="/login" replace />

  // Session exists — render the page
  return children
}
