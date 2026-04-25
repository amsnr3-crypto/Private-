import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtUsd(val) {
  if (val == null) return '—'
  return '$' + Number(val).toFixed(2)
}

function fmt1(val) {
  if (val == null) return '—'
  return Number(val).toFixed(1) + ' lbs'
}

const QUALITY_COLORS = {
  high:   { background: '#dcfce7', color: '#166534' },
  medium: { background: '#fef9c3', color: '#854d0e' },
  low:    { background: '#f3f4f6', color: '#374151' },
}

function QualityBadge({ value }) {
  if (!value) return <span style={{ color: 'var(--text-muted)' }}>—</span>
  const style = QUALITY_COLORS[value.toLowerCase()] || QUALITY_COLORS.low
  return (
    <span style={{
      ...style,
      padding: '2px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
    }}>
      {value}
    </span>
  )
}

function buildWaUrl(q) {
  const lines = [
    'Hi, following up on your shipping quote from Speedy Texas.',
    '',
    `Destination: ${q.destination_name || '—'}`,
    q.chargeable_weight_lbs != null ? `Chargeable weight: ${Number(q.chargeable_weight_lbs).toFixed(1)} lbs` : null,
    q.final_price_usd        != null ? `Quoted price: $${Number(q.final_price_usd).toFixed(2)}`              : null,
    q.shipmentType     ? `Shipment type: ${q.shipmentType}`         : null,
    q.shipmentReadiness ? `Readiness: ${q.shipmentReadiness}`       : null,
    q.shipmentSize     ? `Shipment size: ${q.shipmentSize}`         : null,
    '',
    'Are you ready to proceed? We can confirm the final details right away.',
  ].filter(l => l !== null).join('\n')
  return `https://wa.me/?text=${encodeURIComponent(lines)}`
}

function buildReturnMap(quotes) {
  const counts = {}
  quotes.forEach(q => {
    const key = `${(q.destination_name || '').toLowerCase()}|${(q.shipmentType || '').toLowerCase()}`
    counts[key] = (counts[key] || 0) + 1
  })
  return counts
}

const COLS = [
  'Destination',
  'Chargeable (lbs)',
  'Final Price',
  'Shipment Type',
  'Readiness',
  'Size',
  'Lead Quality',
  'Customer Type',
  'Date',
  'Contact',
]

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
}

const tdBase = { padding: '12px 16px', borderBottom: '1px solid var(--border)' }

export default function Quotes() {
  const [quotes,  setQuotes]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data) setQuotes(data)
      setLoading(false)
    }
    fetchQuotes()
  }, [])

  // ── Returning-customer map ──
  const returnMap = buildReturnMap(quotes)
  const isReturning = (q) => {
    const key = `${(q.destination_name || '').toLowerCase()}|${(q.shipmentType || '').toLowerCase()}`
    return returnMap[key] > 1
  }

  // ── Summary counts ──
  const total  = quotes.length
  const high   = quotes.filter(q => q.leadQuality === 'high').length
  const medium = quotes.filter(q => q.leadQuality === 'medium').length
  const low    = quotes.filter(q => q.leadQuality === 'low').length

  const SUMMARY = [
    { label: 'Total Quotes',   value: total },
    { label: 'High Quality',   value: high,   color: '#166534', bg: '#dcfce7' },
    { label: 'Medium Quality', value: medium, color: '#854d0e', bg: '#fef9c3' },
    { label: 'Low Quality',    value: low,    color: '#374151', bg: '#f3f4f6' },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ padding: '40px 0 80px' }}>
        <div className="container">

          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Quotes
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Internal view — all calculator quotes with lead quality signals.
          </p>

          {/* ── Summary cards ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}>
            {SUMMARY.map(s => (
              <div key={s.label} style={{
                background: s.bg || '#fff',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 22px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '.06em', color: s.color || 'var(--text-muted)',
                  marginBottom: '6px',
                }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: s.color || 'var(--accent)' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Table ── */}
          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                All Quotes
              </h2>
            </div>

            {loading ? (
              <p style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading…</p>
            ) : quotes.length === 0 ? (
              <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No quotes saved yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {COLS.map(h => <th key={h} style={thStyle}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q, i) => (
                      <tr key={q.id || i} style={{ background: '#fff' }}>
                        <td style={{ ...tdBase, color: 'var(--text-primary)', fontWeight: 500 }}>
                          {q.destination_name || '—'}
                        </td>
                        <td style={{ ...tdBase, color: 'var(--text-secondary)' }}>
                          {fmt1(q.chargeable_weight_lbs)}
                        </td>
                        <td style={{ ...tdBase, color: 'var(--text-primary)', fontWeight: 600 }}>
                          {fmtUsd(q.final_price_usd)}
                        </td>
                        <td style={{ ...tdBase, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                          {q.shipmentType || '—'}
                        </td>
                        <td style={{ ...tdBase, color: 'var(--text-secondary)' }}>
                          {q.shipmentReadiness || '—'}
                        </td>
                        <td style={{ ...tdBase, color: 'var(--text-secondary)' }}>
                          {q.shipmentSize || '—'}
                        </td>
                        <td style={tdBase}>
                          <QualityBadge value={q.leadQuality} />
                        </td>
                        <td style={tdBase}>
                          {isReturning(q) ? (
                            <span style={{
                              background: '#dcfce7', color: '#166534',
                              padding: '2px 10px', borderRadius: '999px',
                              fontSize: '12px', fontWeight: 700,
                            }}>
                              Returning
                            </span>
                          ) : (
                            <span style={{
                              background: '#f3f4f6', color: '#374151',
                              padding: '2px 10px', borderRadius: '999px',
                              fontSize: '12px', fontWeight: 600,
                            }}>
                              New
                            </span>
                          )}
                        </td>
                        <td style={{ ...tdBase, color: 'var(--text-muted)', fontSize: '12px' }}>
                          {formatDate(q.created_at)}
                        </td>
                        <td style={tdBase}>
                          <a
                            href={buildWaUrl(q)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              fontSize: '12px', fontWeight: 600,
                              border: '1px solid var(--border)',
                              borderRadius: '6px',
                              background: '#fff',
                              color: '#16a34a',
                              textDecoration: 'none',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Open WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
