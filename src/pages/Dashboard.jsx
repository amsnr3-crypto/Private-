import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'
import { SHIPMENT_STATUSES } from '../data/mockData'
import './Dashboard.css'

const COUNTRY_FLAGS = {
  'Saudi Arabia':       '🇸🇦',
  'United Arab Emirates': '🇦🇪',
  'Kuwait':             '🇰🇼',
  'Qatar':              '🇶🇦',
  'Bahrain':            '🇧🇭',
  'Oman':               '🇴🇲',
  'Yemen':              '🇾🇪',
}

function flagFor(country) {
  return COUNTRY_FLAGS[country] || '🌍'
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatCost(usd) {
  if (usd == null) return '—'
  return '$' + Number(usd).toFixed(2)
}

function StatusBadge({ status }) {
  const s = SHIPMENT_STATUSES[status] || { label: status, color: 'neutral', icon: '📦' }
  return (
    <span className={`badge badge-${s.color || 'neutral'}`}>
      {s.icon} {s.label}
    </span>
  )
}

export default function Dashboard() {
  const [profile, setProfile] = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [shipments, setShipments] = useState([])

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, shipmentsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('shipments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])

      if (!profileRes.error)   setProfile(profileRes.data)
      if (!shipmentsRes.error) setShipments(shipmentsRes.data)
      setLoadingProfile(false)
    }

    fetchData()
  }, [])

  const firstName   = profile?.first_name || '...'
  const fullAddress = profile?.us_address  || 'Loading your address...'
  const customerId  = profile?.customer_id || '...'

  const total     = shipments.length
  const inTransit = shipments.filter(s => s.status === 'in_transit').length
  const delivered = shipments.filter(s => s.status === 'delivered').length
  const pending   = shipments.filter(s => s.status === 'pending').length

  const STAT_CARDS = [
    { label: 'Total Shipments', value: total,     icon: '📦', color: 'blue',   delta: 'All time' },
    { label: 'In Transit',      value: inTransit, icon: '✈️', color: 'orange', delta: 'Active now' },
    { label: 'Delivered',       value: delivered, icon: '✅', color: 'green',  delta: 'Completed' },
    { label: 'Pending Review',  value: pending,   icon: '⏳', color: 'yellow', delta: 'Awaiting processing' },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content dashboard-page">
        <div className="container">

          {/* ── Welcome ── */}
          <div className="dash-welcome">
            <div>
              <h1>Welcome back, {firstName} 👋</h1>
              <p>Here's a snapshot of your Speedy Texas account. &nbsp;
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Customer ID: <strong>{customerId}</strong>
                </span>
              </p>
            </div>
            <div className="dash-welcome-actions">
              <Link to="/tracking"     className="btn btn-ghost btn-sm">Track Shipment</Link>
              <Link to="/new-shipment" className="btn btn-primary">+ New Shipment</Link>
            </div>
          </div>

          {/* ── US Address Card ── */}
          <div className="us-address-card">
            <div className="us-address-icon">🏭</div>
            <div className="us-address-info">
              <div className="us-address-label">Your US Shipping Address</div>
              <div className="us-address-value">
                {loadingProfile ? 'Loading...' : fullAddress}
              </div>
            </div>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => navigator.clipboard?.writeText(fullAddress)}
            >
              Copy Address
            </button>
          </div>

          {/* ── Stat Cards ── */}
          <div className="stat-cards">
            {STAT_CARDS.map(s => (
              <div key={s.label} className={`stat-card stat-card-${s.color}`}>
                <div className="stat-card-top">
                  <div className="stat-card-icon">{s.icon}</div>
                  <div className="stat-card-value">{s.value}</div>
                </div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-delta">{s.delta}</div>
              </div>
            ))}
          </div>

          {/* ── Recent Shipments ── */}
          <div className="dash-section">
            <div className="dash-section-header">
              <h2>Recent Shipments</h2>
              <Link to="/new-shipment" className="btn btn-primary btn-sm">+ New Shipment</Link>
            </div>

            {loadingProfile ? (
              <p style={{ padding: '1rem', color: 'var(--text-muted)' }}>Loading shipments…</p>
            ) : shipments.length === 0 ? (
              <div className="empty-shipments">
                <p>No shipments yet. <Link to="/new-shipment">Create your first shipment →</Link></p>
              </div>
            ) : (
              <>
                <div className="table-wrapper">
                  <table className="shipments-table">
                    <thead>
                      <tr>
                        <th>Tracking ID</th>
                        <th>Description</th>
                        <th>Destination</th>
                        <th>Weight</th>
                        <th>Date</th>
                        <th>Cost</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map(s => (
                        <tr key={s.id}>
                          <td><span className="tracking-id">{s.tracking_id}</span></td>
                          <td>
                            <div className="shipment-desc">{s.description}</div>
                            {s.receiver && <div className="shipment-receiver">To: {s.receiver}</div>}
                          </td>
                          <td><span className="country-chip">{flagFor(s.country)} {s.country}</span></td>
                          <td className="weight-cell">{s.weight_kg != null ? `${s.weight_kg} kg` : '—'}</td>
                          <td className="date-cell">{formatDate(s.created_at)}</td>
                          <td className="cost-cell">{formatCost(s.cost_usd)}</td>
                          <td><StatusBadge status={s.status} /></td>
                          <td>
                            <Link to={`/tracking?id=${s.tracking_id}`} className="btn btn-ghost btn-sm">Track</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="shipment-cards-mobile">
                  {shipments.map(s => (
                    <div key={s.id} className="shipment-card-mobile">
                      <div className="scm-header">
                        <span className="tracking-id">{s.tracking_id}</span>
                        <StatusBadge status={s.status} />
                      </div>
                      <div className="scm-body">
                        <div className="scm-desc">{s.description}</div>
                        <div className="scm-meta">
                          <span>{flagFor(s.country)} {s.country}</span>
                          <span>{s.weight_kg != null ? `${s.weight_kg} kg` : '—'}</span>
                          <span>{formatCost(s.cost_usd)}</span>
                        </div>
                      </div>
                      <Link to={`/tracking?id=${s.tracking_id}`} className="btn btn-ghost btn-sm scm-track">Track →</Link>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Quick Actions ── */}
          <div className="quick-actions">
            <div className="qa-title">Quick Actions</div>
            <div className="qa-grid">
              <Link to="/new-shipment" className="qa-item">
                <span className="qa-icon">📦</span>
                <span>New Shipment Request</span>
              </Link>
              <Link to="/tracking" className="qa-item">
                <span className="qa-icon">🔍</span>
                <span>Track a Package</span>
              </Link>
              <Link to="/calculator" className="qa-item">
                <span className="qa-icon">🧮</span>
                <span>Shipping Calculator</span>
              </Link>
              <a href="#" className="qa-item">
                <span className="qa-icon">💬</span>
                <span>Contact Support</span>
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
