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

function calcScore(q, returning) {
  let s = 0
  if (q.leadQuality        === 'high')            s += 3
  if (q.leadQuality        === 'medium')          s += 2
  if (q.shipmentReadiness  === 'Ready now')       s += 2
  if (q.shipmentReadiness  === 'Within 2–3 days') s += 1
  if (returning)                                  s += 2
  return s
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
  'Follow-up',
  'Response',
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
  const [quotes,       setQuotes]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filterQuality,   setFilterQuality]   = useState('all')
  const [filterReadiness, setFilterReadiness] = useState('all')
  const [filterFollowup,  setFilterFollowup]  = useState('all')
  const [copiedId,        setCopiedId]        = useState(null)
  const [responses,       setResponses]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_responses') || '{}') }
    catch (_) { return {} }
  })

  function setResponse(id, status) {
    if (!id) return
    setResponses(prev => {
      const next = { ...prev, [id]: status }
      try { localStorage.setItem('stx_responses', JSON.stringify(next)) } catch (_) {}
      return next
    })
  }
  const [followups, setFollowups] = useState(() => {
    try { return JSON.parse(localStorage.getItem('stx_followups') || '{}') }
    catch (_) { return {} }
  })

  function toggleFollowup(id) {
    if (!id) return
    setFollowups(prev => {
      const next = prev[id] === 'contacted'
        ? { ...prev, [id]: undefined }
        : { ...prev, [id]: 'contacted' }
      // remove undefined keys before saving
      const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v))
      try { localStorage.setItem('stx_followups', JSON.stringify(clean)) } catch (_) {}
      return clean
    })
  }

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

  // ── Filter + sort ──
  const filtered = quotes.filter(q => {
    if (filterQuality   !== 'all' && q.leadQuality       !== filterQuality)   return false
    if (filterReadiness !== 'all' && q.shipmentReadiness !== filterReadiness) return false
    if (filterFollowup === 'contacted'     && followups[q.id] !== 'contacted') return false
    if (filterFollowup === 'not-contacted' && followups[q.id] === 'contacted') return false
    return true
  })

  const sorted = [...filtered].sort((a, b) => {
    const scoreDiff = calcScore(b, isReturning(b)) - calcScore(a, isReturning(a))
    if (scoreDiff !== 0) return scoreDiff
    return new Date(b.created_at) - new Date(a.created_at)
  })

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
            <div style={{
              padding: '16px 24px', borderBottom: '1px solid var(--border)',
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px',
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginRight: '6px', flexShrink: 0 }}>
                All Quotes
              </h2>
              {[
                {
                  value: filterQuality, set: setFilterQuality,
                  options: [
                    { value: 'all',    label: 'All Quality' },
                    { value: 'high',   label: 'High' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'low',    label: 'Low' },
                  ],
                },
                {
                  value: filterReadiness, set: setFilterReadiness,
                  options: [
                    { value: 'all',              label: 'All Readiness' },
                    { value: 'Ready now',         label: 'Ready now' },
                    { value: 'Within 2–3 days',   label: 'Within 2–3 days' },
                    { value: 'Just exploring',    label: 'Just exploring' },
                  ],
                },
                {
                  value: filterFollowup, set: setFilterFollowup,
                  options: [
                    { value: 'all',           label: 'All Follow-ups' },
                    { value: 'contacted',     label: 'Contacted' },
                    { value: 'not-contacted', label: 'Not contacted' },
                  ],
                },
              ].map((f, idx) => (
                <select
                  key={idx}
                  value={f.value}
                  onChange={e => f.set(e.target.value)}
                  style={{
                    border: '1px solid var(--border)', borderRadius: '6px',
                    padding: '5px 10px', fontSize: '13px', fontWeight: 500,
                    color: f.value !== 'all' ? 'var(--primary)' : 'var(--text-secondary)',
                    background: f.value !== 'all' ? '#EEF3FF' : '#fff',
                    cursor: 'pointer', outline: 'none',
                  }}
                >
                  {f.options.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ))}
              {(filterQuality !== 'all' || filterReadiness !== 'all' || filterFollowup !== 'all') && (
                <button
                  onClick={() => { setFilterQuality('all'); setFilterReadiness('all'); setFilterFollowup('all') }}
                  style={{
                    background: 'none', border: 'none', fontSize: '12px',
                    color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px',
                    textDecoration: 'underline',
                  }}
                >
                  Clear filters
                </button>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)', flexShrink: 0 }}>
                {sorted.length} of {quotes.length}
              </span>
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
                    {sorted.map((q, i) => {
                      const isUrgent = q.leadQuality === 'high'
                        && q.shipmentReadiness === 'Ready now'
                        && followups[q.id] !== 'contacted'
                      return (
                      <tr key={q.id || i} style={{
                        background: isUrgent ? '#fffbeb' : '#fff',
                        borderLeft: isUrgent ? '3px solid #f59e0b' : '3px solid transparent',
                      }}>
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
                        <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
                          <QualityBadge value={q.leadQuality} />
                          <span style={{
                            marginLeft: '6px',
                            display: 'inline-block',
                            background: '#e0e7ff', color: '#3730a3',
                            padding: '1px 7px', borderRadius: '999px',
                            fontSize: '11px', fontWeight: 700,
                          }}>
                            {calcScore(q, isReturning(q))}
                          </span>
                          {isUrgent && (
                            <span style={{
                              marginLeft: '6px',
                              display: 'inline-block',
                              background: '#fef3c7', color: '#b45309',
                              padding: '1px 7px', borderRadius: '999px',
                              fontSize: '11px', fontWeight: 700,
                            }}>
                              🔥 Urgent
                            </span>
                          )}
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
                          {followups[q.id] === 'contacted' ? (
                            <button
                              onClick={() => toggleFollowup(q.id)}
                              style={{
                                background: '#dcfce7', color: '#166534',
                                border: '1px solid #bbf7d0',
                                borderRadius: '6px', padding: '3px 10px',
                                fontSize: '12px', fontWeight: 700,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              ✓ Contacted
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleFollowup(q.id)}
                              style={{
                                background: '#fff', color: 'var(--text-secondary)',
                                border: '1px solid var(--border)',
                                borderRadius: '6px', padding: '3px 10px',
                                fontSize: '12px', fontWeight: 600,
                                cursor: 'pointer', whiteSpace: 'nowrap',
                              }}
                            >
                              Mark as Contacted
                            </button>
                          )}
                        </td>
                        <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
                          {(() => {
                            const current = responses[q.id] || null
                            const OPTS = [
                              { value: 'no_reply', label: 'No reply', active: { background: '#f3f4f6', color: '#374151' }, idle: { background: '#fff', color: 'var(--text-muted)' } },
                              { value: 'replied',  label: 'Replied',  active: { background: '#dbeafe', color: '#1e40af' }, idle: { background: '#fff', color: 'var(--text-muted)' } },
                              { value: 'closed',   label: 'Closed',   active: { background: '#1e293b', color: '#f1f5f9' }, idle: { background: '#fff', color: 'var(--text-muted)' } },
                            ]
                            return (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                {OPTS.map(opt => {
                                  const isActive = current === opt.value
                                  return (
                                    <button
                                      key={opt.value}
                                      onClick={() => setResponse(q.id, opt.value)}
                                      style={{
                                        ...(isActive ? opt.active : opt.idle),
                                        border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                                        borderRadius: '6px', padding: '3px 8px',
                                        fontSize: '11px', fontWeight: isActive ? 700 : 500,
                                        cursor: 'pointer', whiteSpace: 'nowrap',
                                        transition: 'all .15s',
                                      }}
                                    >
                                      {opt.label}
                                    </button>
                                  )
                                })}
                              </div>
                            )
                          })()}
                        </td>
                        <td style={{ ...tdBase, whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
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
                            <button
                              onClick={() => {
                                const msg = `Hi, just following up on your shipment to ${q.destination_name || '—'}. Your estimated cost was $${q.final_price_usd != null ? Number(q.final_price_usd).toFixed(2) : '—'}. Let us know if you're ready to proceed — we can arrange it quickly.`
                                navigator.clipboard.writeText(msg).then(() => {
                                  setCopiedId(q.id)
                                  setTimeout(() => setCopiedId(null), 1500)
                                })
                              }}
                              style={{
                                padding: '3px 10px',
                                fontSize: '12px', fontWeight: 600,
                                border: '1px solid var(--border)',
                                borderRadius: '6px',
                                background: copiedId === q.id ? '#dcfce7' : '#fff',
                                color:      copiedId === q.id ? '#166534' : 'var(--text-secondary)',
                                cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'background .15s, color .15s',
                              }}
                            >
                              {copiedId === q.id ? 'Copied ✓' : 'Copy Message'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
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
