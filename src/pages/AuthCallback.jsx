import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('confirming') // 'confirming' | 'error'

  useEffect(() => {
    async function handleCallback() {
      const params    = new URLSearchParams(window.location.search)
      const tokenHash = params.get('token_hash')
      const type      = params.get('type')
      const code      = params.get('code')

      // ── PKCE flow (code param) ──
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { setStatus('error'); return }
        navigate('/dashboard', { replace: true })
        return
      }

      // ── OTP / email confirmation flow (token_hash param) ──
      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        if (error) { setStatus('error'); return }
        navigate('/dashboard', { replace: true })
        return
      }

      // ── Fallback: session already established by Supabase client ──
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate('/dashboard', { replace: true })
        return
      }

      setStatus('error')
    }

    handleCallback()
  }, [navigate])

  if (status === 'error') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100vh', textAlign: 'center', padding: '2rem',
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Confirmation failed</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          This confirmation link may have expired or already been used.<br />
          Please sign up again or contact support.
        </p>
        <a href="/signup" className="btn btn-primary">Back to Sign Up</a>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100vh', textAlign: 'center',
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
      <p style={{ color: 'var(--text-muted)' }}>Confirming your email…</p>
    </div>
  )
}
