import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'
import { SHIPMENT_STATUSES } from '../data/mockData'
import './Tracking.css'

const STATUS_STEPS = [
  { key: 'received',     label: 'Received in Houston', icon: '📦' },
  { key: 'processing',   label: 'Processing',           icon: '⚙️' },
  { key: 'in_transit',   label: 'In Transit',           icon: '✈️' },
  { key: 'out_delivery', label: 'Out for Delivery',     icon: '🚚' },
  { key: 'delivered',    label: 'Delivered',            icon: '✅' },
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

function flagFor(country) {
  return COUNTRY_FLAGS[country] || '🌍'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
}

function formatCost(usd) {
  if (usd == null) return '—'
  return '$' + Number(usd).toFixed(2)
}

function estimatedDelivery(isoDate) {
  if (!isoDate) return null
  const date = new Date(isoDate)
  // Add 7 business days (approx 10 calendar days)
  date.setDate(date.getDate() + 10)
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function Tracking() {
  const [searchParams] = useSearchParams()
  const [input, setInput]       = useState(searchParams.get('id') || '')
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [notFound, setNotFound] = useState(false)

  const statusInfo  = shipment ? (SHIPMENT_STATUSES[shipment.status] || null) : null
  const currentStep = statusInfo ? statusInfo.step : 0
  const isDelivered = shipment?.status === 'delivered'

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) handleSearch(id)
  }, [])

  const handleSearch = async (id) => {
    const trackId = (id || input).trim().toUpperCase()
    if (!trackId) return

    setLoading(true)
    setNotFound(false)
    setShipment(null)

    const { data, error } = await supabase.rpc('get_shipment_by_tracking_id', {
      p_tracking_id: trackId,
    })

    setLoading(false)

    if (error) {
      console.error('RPC error:', error)
      setNotFound(true)
      return
    }

    const row = Array.isArray(data) ? data[0] : data
    if (!row) { setNotFound(true); return }
    setShipment(row)
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content tracking-page">

        {/* ── Hero Banner ── */}
        <div className="tracking-hero">
          <div className="container">
            <h1>Track Your Shipment</h1>
            <p>Enter your Speedy Texas tracking number to see real-time status updates.</p>
            <div className="tracking-input-bar">
              <div className="tracking-input-wrap">
                <span className="tracking-search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Enter tracking number  e.g. SPX-1234567"
                  className="tracking-input"
                  value={input}
                  onChange={e => { setInput(e.target.value.toUpperCase()); setNotFound(false) }}
                  onKeyDown={e => e.key === 'Enter' && handleSearch(input)}
                />
              </div>
              <button className="btn btn-primary btn-lg" onClick={() => handleSearch(input)} disabled={loading}>
                {loading ? <><span className="spinner" /> Searching…</> : 'Track →'}
              </button>
            </div>
          </div>
        </div>

        <div className="container tracking-body">

          {/* Not found */}
          {notFound && (
            <div className="not-found-card">
              <div className="not-found-icon">🔎</div>
              <h2>No shipment found</h2>
              <p>We couldn't find a shipment with tracking number <strong>{input}</strong>. Please check the number and try again.</p>
            </div>
          )}

          {/* Results */}
          {shipment && (
            <div className="tracking-results fade-up">

              {/* ── Summary Card ── */}
              <div className="tracking-summary-card">
                <div className="tsm-left">
                  <div className="tsm-id">{shipment.tracking_id}</div>
                  <div className="tsm-desc">{shipment.description}</div>
                  <div className="tsm-route">
                    <span>🇺🇸 Houston, TX, USA</span>
                    <span className="route-arrow">→</span>
                    <span>{flagFor(shipment.country)} {shipment.country}</span>
                  </div>
                </div>
                <div className="tsm-right">
                  <div className={`big-status-badge badge badge-${statusInfo?.color || 'neutral'}`}>
                    {statusInfo?.icon} {statusInfo?.label || shipment.status}
                  </div>
                  <div className="tsm-meta">
                    <span><strong>Receiver:</strong> {shipment.receiver}</span>
                    <span><strong>Weight:</strong> {shipment.weight_kg != null ? `${shipment.weight_kg} kg` : '—'}</span>
                    <span><strong>Cost:</strong> {formatCost(shipment.cost_usd)}</span>
                    <span><strong>Submitted:</strong> {formatDateTime(shipment.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* ── Estimated Delivery ── */}
              {!isDelivered && (
                <div className="tracking-card est-delivery-card">
                  <div className="est-delivery">
                    <div className="est-left">
                      <div className="est-label">📅 Estimated Delivery</div>
                      <div className="est-date">{estimatedDelivery(shipment.created_at)}</div>
                      <div className="est-note">Standard international shipping · 5–7 business days</div>
                    </div>
                    <div className="est-right">
                      <div className="est-route">
                        <div className="est-point">
                          <span className="est-flag">🇺🇸</span>
                          <span>Houston, TX</span>
                        </div>
                        <div className="est-connector">
                          <div className="est-dashes" />
                          <span className="est-plane">✈️</span>
                          <div className="est-dashes" />
                        </div>
                        <div className="est-point">
                          <span className="est-flag">{flagFor(shipment.country)}</span>
                          <span>{shipment.country}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isDelivered && (
                <div className="tracking-card delivered-banner">
                  <span className="delivered-icon">🎉</span>
                  <div>
                    <div className="delivered-title">Shipment Delivered!</div>
                    <div className="delivered-sub">Your package has been successfully delivered.</div>
                  </div>
                </div>
              )}

              {/* ── Progress Stepper ── */}
              <div className="tracking-card">
                <h3 className="tracking-card-title">Shipment Progress</h3>
                <div className="stepper">
                  {STATUS_STEPS.map((step, i) => {
                    const done    = i + 1 < currentStep
                    const active  = i + 1 === currentStep
                    const pending = i + 1 > currentStep
                    return (
                      <div key={step.key} className={`stepper-step ${done ? 'done' : ''} ${active ? 'active' : ''} ${pending ? 'pending' : ''}`}>
                        <div className="stepper-dot-wrap">
                          <div className="stepper-dot">
                            {done ? '✓' : active ? step.icon : <span className="step-num-small">{i + 1}</span>}
                          </div>
                          {i < STATUS_STEPS.length - 1 && (
                            <div className={`stepper-line ${done ? 'done' : active ? 'active' : ''}`} />
                          )}
                        </div>
                        <div className="stepper-label">
                          <span className="sl-main">{step.label}</span>
                          {active && <span className="sl-badge">● Current</span>}
                          {done  && <span className="sl-done">✓ Done</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── Timeline ── */}
              <div className="tracking-card">
                <h3 className="tracking-card-title">Shipment Timeline</h3>
                <div className="timeline">
                  <div className="timeline-event done">
                    <div className="tl-indicator">
                      <div className="tl-dot done" />
                      <div className="tl-line done" />
                    </div>
                    <div className="tl-content">
                      <div className="tl-event">Shipment request received</div>
                      <div className="tl-meta">
                        <span className="tl-location">📍 Houston, TX, USA</span>
                        <span className="tl-date">{formatDateTime(shipment.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="timeline-event pending">
                    <div className="tl-indicator">
                      <div className="tl-dot pending" />
                    </div>
                    <div className="tl-content">
                      <div className="tl-event">Further updates coming soon</div>
                      <div className="tl-meta">
                        <span className="tl-location">📍 In progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Empty state */}
          {!shipment && !notFound && !loading && (
            <div className="tracking-empty">
              <div className="te-icon">📭</div>
              <h2>Ready to track your package?</h2>
              <p>Enter your Speedy Texas tracking number above to see where your package is right now.</p>
              <div className="te-hint">
                Your tracking number was sent to your email when you submitted the shipment request.
                It starts with <strong>SPX-</strong>.
              </div>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  )
}
