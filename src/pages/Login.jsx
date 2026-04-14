import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!form.email || !form.password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand">
          <Link to="/" className="auth-logo">
            <span className="logo-icon">⚡</span>
            <span>Speedy<strong>Texas</strong></span>
          </Link>
          <div className="auth-hero-text">
            <h2>Your Shortcut from America to the Gulf</h2>
            <p>Millions of US products. Delivered fast to Saudi Arabia, UAE, Kuwait, Qatar, Bahrain & Oman.</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <span>✈️</span>
              <span>5–10 day delivery to Gulf countries</span>
            </div>
            <div className="auth-feature">
              <span>📦</span>
              <span>Free US storage & consolidation</span>
            </div>
            <div className="auth-feature">
              <span>🔒</span>
              <span>Fully insured shipments</span>
            </div>
            <div className="auth-feature">
              <span>💬</span>
              <span>Arabic & English support</span>
            </div>
          </div>
        </div>
        <div className="auth-bg-overlay" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Welcome back</h1>
            <p>Log in to your Speedy Texas account</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <div className="label-row">
                <label className="form-label">Password</label>
                <a href="#" className="forgot-link">Forgot password?</a>
              </div>
              <input
                type="password"
                name="password"
                className="form-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <><span className="spinner" /> Logging in…</> : 'Log In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/signup">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}