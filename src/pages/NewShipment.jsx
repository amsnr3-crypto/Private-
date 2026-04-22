import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DESTINATIONS } from '../data/mockData'
import { supabase } from '../supabaseClient'
import './NewShipment.css'

const STEPS = ['Sender & Receiver', 'Package Details', 'Review & Submit']
const STEP_ICONS = ['📋', '📦', '✅']

const INITIAL = {
  senderName:    '',
  senderAddress: '',
  receiverName:  '',
  receiverPhone: '',
  country:       '',
  city:          '',
  address:       '',
  description:   '',
  category:      '',
  length:        '',
  width:         '',
  height:        '',
  weight:        '',
  value:         '',
  notes:         '',
}

const CATEGORIES = [
  'Electronics', 'Clothing & Apparel', 'Books & Media', 'Health & Beauty',
  'Home & Kitchen', 'Toys & Games', 'Automotive Parts', 'Sports & Outdoors', 'Other',
]

const COUNTRY_FLAGS = {
  'Saudi Arabia':           '🇸🇦',
  'United Arab Emirates':   '🇦🇪',
  'Kuwait':                 '🇰🇼',
  'Qatar':                  '🇶🇦',
  'Bahrain':                '🇧🇭',
  'Oman':                   '🇴🇲',
  'Yemen':                  '🇾🇪',
}

export default function NewShipment() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // ── Prefill from calculator router state ──
  const qs = location.state || {}

  function round1(n) { return Math.round(n * 10) / 10 }

  // Convert weight: lbs → kg
  const prefillWeight = qs.actualWeightLbs
    ? String(round1(qs.actualWeightLbs / 2.2046))
    : ''

  // Convert dimensions: calculator stores raw value + dimUnit
  // Always convert to cm for the NewShipment form
  function toCm(val, unit) {
    const n = parseFloat(val)
    if (!n) return ''
    return String(round1(unit === 'cm' ? n : n * 2.54))
  }
  const prefillLength = toCm(qs.lengthIn, qs.dimUnit)
  const prefillWidth  = toCm(qs.widthIn,  qs.dimUnit)
  const prefillHeight = toCm(qs.heightIn, qs.dimUnit)

  const prefill = {
    country: qs.destinationName || '',
    weight:  prefillWeight,
    length:  prefillLength,
    width:   prefillWidth,
    height:  prefillHeight,
  }

  const [form, setForm] = useState({ ...INITIAL, ...prefill })
  const [step, setStep]               = useState(1)
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [trackingId, setTrackingId]   = useState('')
  const [errors, setErrors]           = useState({})

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const validate1 = () => {
    const e = {}
    if (!form.senderName)   e.senderName   = 'Required'
    if (!form.receiverName) e.receiverName = 'Required'
    if (!form.country)      e.country      = 'Required'
    if (!form.description)  e.description  = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validate2 = () => {
    const e = {}
    if (!form.weight) e.weight = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const nextStep = () => {
    if (step === 1 && validate1()) setStep(2)
    if (step === 2 && validate2()) setStep(3)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setSubmitError('You must be logged in to submit a shipment.')
      setSubmitting(false)
      return
    }

    const generatedId = 'SPX-' + String(Date.now()).slice(-7)

    const { error } = await supabase.from('shipments').insert({
      user_id:     user.id,
      tracking_id: generatedId,
      description: form.description,
      receiver:    form.receiverName,
      country:     form.country,
      city:        form.city     || null,
      weight_kg:   form.weight ? parseFloat(form.weight) : null,
      cost_usd:    form.value  ? parseFloat(form.value)  : null,
      status:      'pending',
    })

    setSubmitting(false)
    if (error) { setSubmitError(error.message); return }
    setTrackingId(generatedId)
    setSubmitted(true)
  }

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container">
            <div className="success-screen">
              <div className="success-icon">🎉</div>
              <h1>Shipment Request Submitted!</h1>
              <p>Your request has been received. We'll process it within 24 hours and notify you via WhatsApp.</p>
              <div className="success-ref">
                <span>Reference Number</span>
                <strong>{trackingId}</strong>
              </div>
              <div className="success-actions">
                <button className="btn btn-ghost"   onClick={() => navigate('/tracking')}>Track Shipment</button>
                <button className="btn btn-primary" onClick={() => { setForm(INITIAL); setStep(1); setSubmitted(false) }}>New Shipment</button>
                <button className="btn btn-dark"    onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Form ──
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content new-shipment-page">
        <div className="container">

          {/* Page Header */}
          <div className="page-header">
            <h1>New Shipment Request</h1>
            <p>Fill in the details below to submit a new shipping request.</p>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            {STEPS.map((label, i) => {
              const num      = i + 1
              const isDone   = step > num
              const isActive = step === num
              return (
                <div key={label} className="progress-track">
                  <div className={`progress-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
                    <div className="progress-circle">
                      {isDone ? '✓' : <span>{num}</span>}
                    </div>
                    <div className="progress-info">
                      <span className="progress-step-num">Step {num}</span>
                      <span className="progress-label">{label}</span>
                    </div>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`progress-connector ${isDone ? 'done' : ''}`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Form Card */}
          <div className="shipment-form-card">

            {/* ── Step 1: Sender & Receiver ── */}
            {step === 1 && (
              <div className="form-step">
                <div className="step-header">
                  <span className="step-icon">{STEP_ICONS[0]}</span>
                  <div>
                    <h2 className="step-title">Sender & Receiver Information</h2>
                    <p className="step-desc">Tell us where this package is coming from and who receives it.</p>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">📤 Sender (US Store / Supplier)</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Sender Name <span className="req">*</span></label>
                      <input type="text" name="senderName"
                        className={`form-input ${errors.senderName ? 'error' : ''}`}
                        placeholder="Amazon US, Nike Store, Best Buy…"
                        value={form.senderName} onChange={handleChange} />
                      {errors.senderName && <span className="err-msg">{errors.senderName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sender Address <span className="optional">(optional)</span></label>
                      <input type="text" name="senderAddress" className="form-input"
                        placeholder="US store address"
                        value={form.senderAddress} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">📥 Receiver</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Receiver Name <span className="req">*</span></label>
                      <input type="text" name="receiverName"
                        className={`form-input ${errors.receiverName ? 'error' : ''}`}
                        placeholder="Full name of the recipient"
                        value={form.receiverName} onChange={handleChange} />
                      {errors.receiverName && <span className="err-msg">{errors.receiverName}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Receiver Phone <span className="optional">(WhatsApp)</span></label>
                      <input type="tel" name="receiverPhone" className="form-input"
                        placeholder="+966 5x xxx xxxx"
                        value={form.receiverPhone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Destination Country <span className="req">*</span></label>
                      <select name="country"
                        className={`form-input ${errors.country ? 'error' : ''}`}
                        value={form.country} onChange={handleChange}>
                        <option value="">Select country</option>
                        {DESTINATIONS.map(d => (
                          <option key={d.code} value={d.name}>{d.flag} {d.name}</option>
                        ))}
                      </select>
                      {errors.country && <span className="err-msg">{errors.country}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Destination City <span className="optional">(optional)</span></label>
                      <input type="text" name="city" className="form-input"
                        placeholder="e.g. Riyadh, Dubai, Kuwait City…"
                        value={form.city} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Delivery Address <span className="optional">(optional)</span></label>
                      <input type="text" name="address" className="form-input"
                        placeholder="Street, building, apartment…"
                        value={form.address} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">📝 Package Contents</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Product Description <span className="req">*</span></label>
                      <input type="text" name="description"
                        className={`form-input ${errors.description ? 'error' : ''}`}
                        placeholder="e.g. MacBook Pro 14-inch, Nike Air Max, iPhone 15…"
                        value={form.description} onChange={handleChange} />
                      {errors.description && <span className="err-msg">{errors.description}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Category <span className="optional">(optional)</span></label>
                      <select name="category" className="form-input"
                        value={form.category} onChange={handleChange}>
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn btn-primary btn-lg" onClick={nextStep}>
                    Continue to Package Details →
                  </button>
                </div>
              </div>
            )}

            {/* ── Step 2: Package Details ── */}
            {step === 2 && (
              <div className="form-step">
                <div className="step-header">
                  <span className="step-icon">{STEP_ICONS[1]}</span>
                  <div>
                    <h2 className="step-title">Package Dimensions & Weight</h2>
                    <p className="step-desc">Accurate measurements help us calculate your shipping cost.</p>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">📐 Dimensions (cm) — optional</div>
                  <div className="dimensions-info">
                    💡 Providing dimensions gives you a more accurate estimate. Dimensional weight may apply.
                  </div>
                  <div className="form-grid-3">
                    <div className="form-group">
                      <label className="form-label">Length (cm)</label>
                      <input type="number" name="length" className="form-input"
                        placeholder="0" min="0" value={form.length} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Width (cm)</label>
                      <input type="number" name="width" className="form-input"
                        placeholder="0" min="0" value={form.width} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Height (cm)</label>
                      <input type="number" name="height" className="form-input"
                        placeholder="0" min="0" value={form.height} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">⚖️ Weight & Value</div>
                  <div className="form-grid-2">
                    <div className="form-group">
                      <label className="form-label">Actual Weight (kg) <span className="req">*</span></label>
                      <input type="number" name="weight"
                        className={`form-input ${errors.weight ? 'error' : ''}`}
                        placeholder="0.0" min="0" step="0.1"
                        value={form.weight} onChange={handleChange} />
                      {errors.weight && <span className="err-msg">{errors.weight}</span>}
                    </div>
                    <div className="form-group">
                      <label className="form-label">Declared Value (USD) <span className="optional">(optional)</span></label>
                      <input type="number" name="value" className="form-input"
                        placeholder="0.00" min="0" step="0.01"
                        value={form.value} onChange={handleChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">🗒 Additional Notes</div>
                  <div className="form-group">
                    <label className="form-label">Notes for our team <span className="optional">(optional)</span></label>
                    <textarea name="notes" className="form-input" rows={3}
                      placeholder="Special handling, fragile items, urgent delivery…"
                      value={form.notes} onChange={handleChange} />
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={nextStep}>Review & Submit →</button>
                </div>
              </div>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <div className="form-step">
                <div className="step-header">
                  <span className="step-icon">{STEP_ICONS[2]}</span>
                  <div>
                    <h2 className="step-title">Review Your Shipment</h2>
                    <p className="step-desc">Double-check everything before submitting. You can go back to edit.</p>
                  </div>
                </div>

                {/* Route Banner */}
                <div className="review-route-banner">
                  <div className="rrb-point">
                    <span className="rrb-flag">🇺🇸</span>
                    <span className="rrb-city">Houston, TX, USA</span>
                    <span className="rrb-name">{form.senderName}</span>
                  </div>
                  <div className="rrb-arrow">
                    <div className="rrb-line" />
                    <span className="rrb-plane">✈️</span>
                    <div className="rrb-line" />
                  </div>
                  <div className="rrb-point">
                    <span className="rrb-flag">{COUNTRY_FLAGS[form.country] || '🌍'}</span>
                    <span className="rrb-city">{form.city ? `${form.city}, ${form.country}` : form.country}</span>
                    <span className="rrb-name">{form.receiverName}</span>
                  </div>
                </div>

                {/* Review Cards */}
                <div className="review-grid">
                  <div className="review-section">
                    <div className="review-section-head">📤 Sender</div>
                    <div className="review-item"><span>Name</span><strong>{form.senderName}</strong></div>
                    {form.senderAddress && <div className="review-item"><span>Address</span><strong>{form.senderAddress}</strong></div>}
                  </div>
                  <div className="review-section">
                    <div className="review-section-head">📥 Receiver</div>
                    <div className="review-item"><span>Name</span><strong>{form.receiverName}</strong></div>
                    {form.receiverPhone && <div className="review-item"><span>Phone</span><strong>{form.receiverPhone}</strong></div>}
                    <div className="review-item"><span>Country</span><strong>{form.city ? `${form.city}, ${form.country}` : form.country}</strong></div>
                    {form.address && <div className="review-item"><span>Address</span><strong>{form.address}</strong></div>}
                  </div>
                  <div className="review-section">
                    <div className="review-section-head">📦 Package</div>
                    <div className="review-item"><span>Description</span><strong>{form.description}</strong></div>
                    {form.category && <div className="review-item"><span>Category</span><strong>{form.category}</strong></div>}
                    <div className="review-item"><span>Weight</span><strong>{form.weight} kg</strong></div>
                    {form.length && (
                      <div className="review-item">
                        <span>Dimensions</span>
                        <strong>{form.length} × {form.width} × {form.height} cm</strong>
                      </div>
                    )}
                    {form.value && <div className="review-item"><span>Value</span><strong>${form.value}</strong></div>}
                  </div>
                  {form.notes && (
                    <div className="review-section review-full-width">
                      <div className="review-section-head">🗒 Notes</div>
                      <p className="review-notes">{form.notes}</p>
                    </div>
                  )}
                </div>

                {/* Trust Signals */}
                <div className="review-trust-row">
                  <div className="trust-chip">🔒 Secure submission</div>
                  <div className="trust-chip">⚡ Processed within 24h</div>
                  <div className="trust-chip">📲 WhatsApp updates</div>
                </div>

                {/* Disclaimer */}
                <div className="review-disclaimer">
                  <span>ℹ️</span>
                  <span>By submitting, you confirm the package contents are accurately declared and comply with all applicable laws. Speedy Texas is not responsible for prohibited or restricted items.</span>
                </div>

                {submitError && (
                  <div className="form-error-banner">{submitError}</div>
                )}

                <div className="step-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg submit-btn" onClick={handleSubmit} disabled={submitting}>
                    {submitting
                      ? <><span className="spinner" /> Submitting…</>
                      : <>🚀 Submit Shipment Request</>}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
