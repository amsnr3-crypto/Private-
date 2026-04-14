import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Landing.css'

const SERVICES = [
  {
    icon: '✈️',
    title: 'Express Air Freight',
    desc: 'Fast air delivery from major US retailers directly to Gulf countries. DHL-level speed at competitive rates.',
    highlight: '5–10 business days',
  },
  {
    icon: '🚪',
    title: 'Door-to-Door Delivery',
    desc: 'We collect your packages from any US address and deliver straight to your door in Saudi Arabia, UAE, Kuwait, and more.',
    highlight: 'Full pickup & delivery',
  },
  {
    icon: '📦',
    title: 'Package Consolidation',
    desc: 'Combine multiple US purchases into a single shipment. Save significantly on shipping costs and customs fees.',
    highlight: 'Up to 60% savings',
  },
  {
    icon: '🚗',
    title: 'Vehicle & Cargo Shipping',
    desc: 'Specialized shipping for cars, motorcycles, spare parts, and oversized cargo to all Gulf destinations.',
    highlight: 'Any size, any weight',
  },
  {
    icon: '🔒',
    title: 'Secure Warehousing',
    desc: 'Your packages are stored safely in our Houston facility until consolidated and ready for shipment.',
    highlight: 'Houston, TX facility',
  },
  {
    icon: '📊',
    title: 'Live Tracking',
    desc: 'Monitor every step of your shipment journey with our real-time tracking portal from pickup to delivery.',
    highlight: 'Real-time updates',
  },
]

const STEPS = [
  {
    num: '01',
    icon: '🛒',
    title: 'Shop in the USA',
    desc: 'Buy from any US retailer — Amazon, Apple, Nike, Costco. Use your unique Speedy Texas address as the delivery address.',
  },
  {
    num: '02',
    icon: '🏭',
    title: 'We Receive It',
    desc: 'Your package arrives at our Houston warehouse. We inspect it, photograph it, and notify you immediately.',
  },
  {
    num: '03',
    icon: '✈️',
    title: 'We Ship to the Gulf',
    desc: 'We handle all customs documentation, export paperwork, and ship your package directly to your Gulf destination.',
  },
  {
    num: '04',
    icon: '🎉',
    title: 'Delivered to Your Door',
    desc: 'Your package arrives at your home or office. Track every step in real-time through your personal dashboard.',
  },
]

const STATS = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '98.7%',   label: 'On-Time Delivery' },
  { value: '6',       label: 'Gulf Countries' },
  { value: '7 Days',  label: 'Avg. Delivery Time' },
]

const TRUST_ITEMS = [
  { icon: '🏆', title: 'Licensed & Insured',   desc: 'Fully registered freight forwarder with comprehensive cargo insurance on every shipment.' },
  { icon: '💬', title: 'Arabic & English Support', desc: 'Bilingual customer service team available 6 days a week via WhatsApp, email, and phone.' },
  { icon: '💳', title: 'Transparent Pricing',  desc: 'No hidden fees. Know your exact shipping cost before you send. Instant calculator available.' },
  { icon: '⚡', title: 'Fast Processing',      desc: 'Packages are processed and dispatched within 24–48 hours of arriving at our Houston warehouse.' },
]

const DESTINATIONS = [
  { flag: '🇸🇦', name: 'Saudi Arabia' },
  { flag: '🇦🇪', name: 'UAE' },
  { flag: '🇰🇼', name: 'Kuwait' },
  { flag: '🇶🇦', name: 'Qatar' },
  { flag: '🇧🇭', name: 'Bahrain' },
  { flag: '🇴🇲', name: 'Oman' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <Navbar />

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="container hero-inner">
          <div className="hero-content fade-up">
            <div className="hero-badge">🇺🇸 → 🌍 &nbsp; USA to Gulf Shipping</div>
            <h1 className="hero-title">
              Your Shortcut from<br />
              <span className="hero-title-accent">America to the Gulf</span>
            </h1>
            <p className="hero-subtitle">
              Shop from any US store and get your packages delivered fast and safely
              to Saudi Arabia, UAE, Kuwait, Qatar, Bahrain & Oman.
            </p>
            <div className="hero-actions">
              <Link to="/signup" className="btn btn-primary btn-lg">
                Start Shipping Free →
              </Link>
              <Link to="/calculator" className="btn btn-outline btn-lg">
                Calculate Rates
              </Link>
            </div>
            <div className="hero-destinations">
              {DESTINATIONS.map(d => (
                <span key={d.name} className="dest-chip">
                  {d.flag} {d.name}
                </span>
              ))}
            </div>
          </div>
          <div className="hero-visual fade-up-2">
            <div className="hero-card-mock">
              <div className="mock-header">
                <span className="mock-dot red" />
                <span className="mock-dot yellow" />
                <span className="mock-dot green" />
                <span className="mock-title">Live Tracking Dashboard</span>
              </div>
              <div className="mock-shipment">
                <div className="mock-id">SPX-20240001</div>
                <span className="badge badge-success">✅ Delivered</span>
              </div>
              <div className="mock-route">
                <div className="mock-point">
                  <div className="point-dot origin" />
                  <div>
                    <div className="point-label">Origin</div>
                    <div className="point-value">Houston, TX 🇺🇸</div>
                  </div>
                </div>
                <div className="mock-line">
                  <div className="mock-plane">✈️</div>
                </div>
                <div className="mock-point">
                  <div className="point-dot dest" />
                  <div>
                    <div className="point-label">Destination</div>
                    <div className="point-value">Riyadh, SA 🇸🇦</div>
                  </div>
                </div>
              </div>
              <div className="mock-steps">
                {['📦 Received','⚙️ Processing','✈️ In Transit','🚚 Out for Delivery','✅ Delivered'].map((s, i) => (
                  <div key={i} className={`mock-step ${i < 5 ? 'done' : ''}`}>
                    <div className="step-dot" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
              <div className="mock-footer">
                <span>Est. arrival: <strong>Mar 15, 2024</strong></span>
                <span className="mock-weight">2.4 kg · $89.50</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-stats">
          <div className="container">
            <div className="stats-bar">
              {STATS.map(s => (
                <div key={s.label} className="stat-item">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ────────────────────────────────────────────────── */}
      <section className="section services-section" id="services">
        <div className="container">
          <div className="section-header center">
            <div className="section-tag">Our Services</div>
            <h2 className="section-title">Everything You Need to Ship from the USA</h2>
            <div className="divider" style={{ margin: '0 auto 20px' }} />
            <p className="section-subtitle">
              End-to-end logistics from US retailers to your doorstep in the Gulf — fast, tracked, and affordable.
            </p>
          </div>
          <div className="services-grid">
            {SERVICES.map(s => (
              <div key={s.title} className="service-card">
                <div className="service-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <div className="service-highlight">{s.highlight}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section className="section how-section" id="how-it-works">
        <div className="container">
          <div className="section-header center">
            <div className="section-tag">How It Works</div>
            <h2 className="section-title">Ship in 4 Simple Steps</h2>
            <div className="divider" style={{ margin: '0 auto 20px' }} />
            <p className="section-subtitle">
              From clicking "Add to Cart" in the USA to receiving your package at the Gulf — we handle everything in between.
            </p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <div key={s.num} className="step-card">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < STEPS.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
          <div className="steps-cta">
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get Your Free US Address →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust ───────────────────────────────────────────────────── */}
      <section className="section trust-section" id="trust">
        <div className="container">
          <div className="trust-inner">
            <div className="trust-left">
              <div className="section-tag">Why Speedy Texas?</div>
              <h2 className="section-title">Trusted by Thousands of Gulf Shoppers</h2>
              <div className="divider" />
              <p className="section-subtitle">
                We've been connecting Gulf residents with US products since day one. Here's why customers choose us over the rest.
              </p>
              <div className="trust-grid">
                {TRUST_ITEMS.map(t => (
                  <div key={t.title} className="trust-item">
                    <div className="trust-icon">{t.icon}</div>
                    <div>
                      <h4>{t.title}</h4>
                      <p>{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="trust-right">
              <div className="testimonials">
                <div className="testimonial-card featured">
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <p>"Speedy Texas is by far the best shipping company for getting packages from the US to Saudi Arabia. Fast, reliable, and their customer support always responds within minutes."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">M</div>
                    <div>
                      <strong>Mohammed Al-Rashid</strong>
                      <span>Riyadh, Saudi Arabia 🇸🇦</span>
                    </div>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <p>"I shop from Amazon and Apple US every month. Speedy Texas saves me a fortune on shipping compared to DHL direct."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">F</div>
                    <div>
                      <strong>Fatima Al-Jaber</strong>
                      <span>Dubai, UAE 🇦🇪</span>
                    </div>
                  </div>
                </div>
                <div className="testimonial-card">
                  <div className="stars">⭐⭐⭐⭐⭐</div>
                  <p>"مريح جداً وسريع. أتعامل معهم من سنتين وما خذلوني أبداً."</p>
                  <div className="testimonial-author">
                    <div className="author-avatar">K</div>
                    <div>
                      <strong>Khalid Al-Mansouri</strong>
                      <span>Kuwait City, Kuwait 🇰🇼</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Calculator CTA ──────────────────────────────────────────── */}
      <section className="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div>
              <h2>Know Your Rate Before You Ship</h2>
              <p>Use our instant rate calculator — no signup needed.</p>
            </div>
            <Link to="/calculator" className="btn btn-primary btn-lg">
              Calculate Shipping Cost →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Contact ─────────────────────────────────────────────────── */}
      <section className="section contact-section" id="contact">
        <div className="container">
          <div className="section-header center">
            <div className="section-tag">Contact Us</div>
            <h2 className="section-title">We're Here to Help</h2>
            <div className="divider" style={{ margin: '0 auto 20px' }} />
          </div>
          <div className="contact-grid">
            <div className="contact-card">
              <div className="contact-icon">💬</div>
              <h3>WhatsApp</h3>
              <p>Chat with us instantly on WhatsApp — available in Arabic & English.</p>
              <a href="#" className="btn btn-dark btn-sm" style={{ marginTop: '16px' }}>Open WhatsApp</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📧</div>
              <h3>Email Support</h3>
              <p>Send us an email and we'll get back to you within a few hours.</p>
              <a href="mailto:support@speedy-tx.com" className="btn btn-dark btn-sm" style={{ marginTop: '16px' }}>support@speedy-tx.com</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h3>Phone</h3>
              <p>Call us Monday–Friday, 9am–6pm Central Standard Time.</p>
              <a href="tel:+18321234567" className="btn btn-dark btn-sm" style={{ marginTop: '16px' }}>+1 (832) 123-4567</a>
            </div>
            <div className="contact-card">
              <div className="contact-icon">🏭</div>
              <h3>Houston Warehouse</h3>
              <p>Our main facility in Houston, TX — the heart of all US operations.</p>
              <span className="btn btn-ghost btn-sm" style={{ marginTop: '16px', cursor: 'default' }}>Houston, TX 77001</span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
