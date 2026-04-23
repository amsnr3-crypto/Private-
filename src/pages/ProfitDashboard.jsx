import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'

function formatUsd(val) {
  if (val == null) return '—'
  return '$' + Number(val).toFixed(2)
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ProfitDashboard() {
  const [quotes, setQuotes]   = useState([])
  const [loading, setLoading] = useState(true)

  // ── Fetch last 10 quotes + aggregate totals ──
  useEffect(() => {
    async function fetchQuotes() {
      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!error && data) setQuotes(data)
      setLoading(false)
    }
    fetchQuotes()
  }, [])

  const [totals, setTotals] = useState({ count: 0, revenue: 0, cost: 0, profit: 0 })

  useEffect(() => {
    async function fetchTotals() {
      const { data, error } = await supabase
        .from('quotes')
        .select('final_price_usd, estimated_cost_usd, margin_usd')

      if (!error && data) {
        setTotals({
          count:   data.length,
          revenue: data.reduce((s, r) => s + (r.final_price_usd   || 0), 0),
          cost:    data.reduce((s, r) => s + (r.estimated_cost_usd || 0), 0),
          profit:  data.reduce((s, r) => s + (r.margin_usd         || 0), 0),
        })
      }
    }
    fetchTotals()
  }, [])

  const SUMMARY = [
    { label: 'Total Quotes',         value: totals.count },
    { label: 'Total Revenue',        value: formatUsd(totals.revenue) },
    { label: 'Total Estimated Cost', value: formatUsd(totals.cost) },
    { label: 'Total Profit',         value: formatUsd(totals.profit) },
  ]

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ padding: '40px 0 80px' }}>
        <div className="container">

          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Profit Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Internal view — quote history and margin analysis.
          </p>

          {/* ── Summary Cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {SUMMARY.map(s => (
              <div key={s.label} style={{
                background: '#fff', border: '1px solid var(--border)',
                borderRadius: 'var(--radius)', padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--accent)' }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* ── Recent Quotes Table ── */}
          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Last 10 Quotes
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
                      {['Destination', 'Chargeable (lbs)', 'Final Price', 'Est. Cost', 'Margin', 'Date'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left',
                          fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                          letterSpacing: '.06em', color: 'var(--text-muted)',
                          borderBottom: '1px solid var(--border)',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q, i) => (
                      <tr key={q.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {q.destination_name || q.destination_code || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {q.chargeable_weight_lbs != null ? Number(q.chargeable_weight_lbs).toFixed(1) : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 600 }}>
                          {formatUsd(q.final_price_usd)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {formatUsd(q.estimated_cost_usd)}
                        </td>
                        <td style={{ padding: '12px 16px', color: q.margin_usd >= 0 ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                          {formatUsd(q.margin_usd)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {formatDate(q.created_at)}
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
