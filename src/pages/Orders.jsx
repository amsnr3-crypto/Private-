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

const thStyle = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
  letterSpacing: '.06em', color: 'var(--text-muted)',
  borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap',
}

const tdBase = { padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: '14px' }

const STATUS_STYLE = {
  paid:      { background: '#dcfce7', color: '#166534' },
  pending:   { background: '#fef9c3', color: '#854d0e' },
  failed:    { background: '#fee2e2', color: '#991b1b' },
}

export default function Orders() {
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, customer_email, amount_total, order_status, created_at')
        .order('created_at', { ascending: false })

      if (error) {
        setError(error.message)
      } else {
        setOrders(data || [])
      }
      setLoading(false)
    }
    fetchOrders()
  }, [])

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ padding: '40px 0 80px' }}>
        <div className="container">

          <h1 style={{ fontSize: '26px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
            Orders
          </h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
            Internal view — paid orders from Stripe Checkout.
          </p>

          <div style={{
            background: '#fff', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden',
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                All Orders
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {orders.length} record{orders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <p style={{ padding: '24px', color: 'var(--text-muted)' }}>Loading…</p>
            ) : error ? (
              <p style={{ padding: '24px', color: '#dc2626' }}>Error: {error}</p>
            ) : orders.length === 0 ? (
              <p style={{ padding: '24px', color: 'var(--text-muted)' }}>No orders yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)' }}>
                      {['Customer Email', 'Amount', 'Status', 'Date'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => {
                      const statusStyle = STATUS_STYLE[(o.order_status || '').toLowerCase()] || { background: '#f3f4f6', color: '#374151' }
                      return (
                        <tr key={o.id || i}>
                          <td style={{ ...tdBase, color: 'var(--text-primary)' }}>
                            {o.customer_email || '—'}
                          </td>
                          <td style={{ ...tdBase, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {fmtUsd(o.amount_total)}
                          </td>
                          <td style={tdBase}>
                            <span style={{
                              ...statusStyle,
                              padding: '2px 10px', borderRadius: '999px',
                              fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
                            }}>
                              {o.order_status || '—'}
                            </span>
                          </td>
                          <td style={{ ...tdBase, color: 'var(--text-muted)', fontSize: '12px' }}>
                            {formatDate(o.created_at)}
                          </td>
                        </tr>
                      )
                    })}
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
