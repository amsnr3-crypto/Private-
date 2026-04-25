import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PaymentSuccess() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '40px 24px' }}>
          <div style={{ fontSize: '56px', marginBottom: '20px' }}>✅</div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Payment Successful
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
            Thank you — your payment has been received. A member of our team will contact you shortly to confirm your shipment details and arrange pickup.
          </p>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
