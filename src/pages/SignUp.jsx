import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Auth.css'

const COUNTRIES = [
  'Saudi Arabia',
  'United Arab Emirates',
  'Kuwait',
  'Qatar',
  'Bahrain',
  'Oman',
  'Yemen',
  'Other',
]

export default function SignUp() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    firstName: '',
    lastName:  '',
    email:     '',
    phone:     '',
    country:   '',
    password:  '',
    confirm:   '',
    agree:     false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
    setError('')
  }

  const nextStep = e => {
    e.preventDefault()
    if (!form.firstName || !form.lastName || !form.email || !form.phone) {
      setError('Please fill in all fields.')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')

    if (!form.country || !form.password || !form.confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (!form.agree) {
      setError('Please agree to our Terms of Service.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email:    form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name:  form.lastName,
          phone:      form.phone,
          country:    form.country,
        },
      },
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
            <h2>Get Your Free US Shipping Address</h2>
            <p>Create your account in under 2 minutes and start shopping from any US store today.</p>
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <span>🏠</span>
              <span>Free Houston, TX shipping address</span>
            </div>
            <div className="auth-feature">
              <span>📲</span>
              <span>Real-time shipment notifications</span>
            </div>
            <div className="auth-feature">
              <span>💰</span>
              <span>Competitive shipping rates</span>
            </div>
            <div className="auth-feature">
              <span>🛡️</span>
              <span>No subscription fees — pay per shipment</span>
            </div>
          </div>
        </div>
        <div className="auth-bg-overlay" />
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-form-header">
            <h1>Create your account</h1>
            <p>Start shipping from the USA today</p>
          </div>

          <div className="step-indicator">
            <div className={`step-dot-ind ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className={`step-line ${step >= 2 ? 'done' : ''}`} />
            <div className={`step-dot-ind ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>

          {error && <div className="auth-error">{error}</div>}

          {step === 1 ? (
            <form className="auth-form" onSubmit={nextStep}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    placeholder="Mohammed"
                    value={form.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    placeholder="Al-Rashid"
                    value={form.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number (WhatsApp)</label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+966 5x xxx xxxx"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full">
                Continue →
              </button>
            </form>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  name="country"
                  className="form-input"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirm"
                  className="form-input"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={handleChange}
                />
              </div>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agree"
                  checked={form.agree}
                  onChange={handleChange}
                />
                <span>
                  I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                </span>
              </label>
              <div className="form-row btn-row">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner" /> Creating account…</>
                  ) : (
                    'Create Account →'
                  )}
                </button>
              </div>
            </form>
          )}

          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
