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

function fmt1(val) {
  if (val == null) return '—'
  return Number(val).toFixed(1) + ' lbs'
}

const STATUS_COLORS = {
  pending:   { bg: '#fef9c3', color: '#854d0e' },
  confirmed: { bg: '#dcfce7', color: '#166534' },
  shipped:   { bg: '#dbeafe', color: '#1e40af' },
  delivered: { bg: '#f3f4f6', color: '#374151' },
}

function StatusBadge({ status }) {
  const s = (status || 'pending').toLowerCase()
  const style = STATUS_COLORS[s] || STATUS_COLORS.pending
  return (
    <span style={{
      ...style,
      padding: '2px 10px', borderRadius: '999px',
      fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
    }}>
      {s}
    </span>
  )
}

export default function ShipmentsDashboard() {
  const [shipments, setShipments] = useState([])
  const [loading,   setLoading]   = useState(true)

  // ── Fetch shipments, latest first ──
  useEffect(() => {
    async function fetchShipments() {
      const { data, error } = await supabase
        .from('shipments')
        .select('id, destination_name, actual_weight_lbs, chargeable_weight_lbs, pieces, status, created_at')
        .order('created_at', { ascending: false })

      if (!error && data) setShipments(data)
      setLoading(false)
    }
    fetchShipments()
  }, [])

  const COLS = ['Destination', 'Actual (lbs)', 'Chargeable (lbs)', 'Pieces', 'Status', 'Date']

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ padding: '40px 0 80px' }}>
        <div className="container">

          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Shipments Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Internal view — all submitted shipment records.
          </p>

          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                All Shipments
              </h2>
            </div>

            {loading ? (
              <p style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading…</p>
            ) : shipments.length === 0 ? (
              <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No shipments found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {COLS.map(h => (
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
                    {shipments.map((s, i) => (
                      <tr key={s.id || i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: 500 }}>
                          {s.destination_name || '—'}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {fmt1(s.actual_weight_lbs)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {fmt1(s.chargeable_weight_lbs)}
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          {s.pieces ?? '—'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={s.status} />
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {formatDate(s.created_at)}
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
