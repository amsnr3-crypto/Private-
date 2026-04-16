import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Calculator.css'

// ---------------------------------------------------------------------------
// Rate table — per chargeable lb (update these to match your actual pricing)
// ---------------------------------------------------------------------------
const DESTINATIONS = [
  { code: 'SA', name: 'Saudi Arabia',         flag: '🇸🇦', ratePerLb: 4.50 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', ratePerLb: 4.75 },
  { code: 'KW', name: 'Kuwait',               flag: '🇰🇼', ratePerLb: 5.00 },
  { code: 'QA', name: 'Qatar',                flag: '🇶🇦', ratePerLb: 4.90 },
  { code: 'BH', name: 'Bahrain',              flag: '🇧🇭', ratePerLb: 5.20 },
  { code: 'OM', name: 'Oman',                 flag: '🇴🇲', ratePerLb: 5.50 },
]

const VOLUMETRIC_DIVISOR = 5000   // cm³ per kg (standard air freight)
const KG_TO_LBS          = 2.2046
const HANDLING_FEE       = 10.00  // flat USD per shipment

function r2(n) { return Math.round(n * 100) / 100 }

export default function Calculator() {
  const [country, setCountry] = useState('')
  const [weight,  setWeight]  = useState('')
  const [length,  setLength]  = useState('')
  const [width,   setWidth]   = useState('')
  const [height,  setHeight]  = useState('')

  // ── Live calculation ──────────────────────────────────────────────────
  const calc = useMemo(() => {
    const dest    = DESTINATIONS.find(d => d.code === country)
    const actualKg = parseFloat(weight) || 0
    if (!dest || actualKg <= 0) return null

    const hasVol  = length && width && height
    const volKg   = hasVol
      ? (parseFloat(length) * parseFloat(width) * parseFloat(height)) / VOLUMETRIC_DIVISOR
      : null

    const chargeKg  = volKg !== null ? Math.max(actualKg, volKg) : actualKg
    const chargeLbs = chargeKg * KG_TO_LBS
    const shipping  = r2(chargeLbs * dest.ratePerLb)
    const total     = r2(shipping + HANDLING_FEE)
    const volApplies = volKg !== null && volKg > actualKg

    return { dest, actualKg, volKg, chargeKg, chargeLbs, shipping, total, volApplies }
  }, [country, weight, length, width, height])

  const volKgPreview = (length && width && height)
    ? r2((parseFloat(length) * parseFloat(width) * parseFloat(height)) / VOLUMETRIC_DIVISOR)
    : null

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content calc-page">

        {/* ── Hero ── */}
        <div className="calc-hero">
          <div className="container">
            <h1>Shipping Rate Calculator</h1>
            <p>Get an instant estimate for shipping your package from the USA to any Gulf country.</p>
          </div>
        </div>

        <div className="container calc-body">
          <div className="calc-layout">

            {/* ── Input Panel ── */}
            <div className="calc-panel">
              <h2 className="calc-panel-title">Package Details</h2>

              <div className="calc-section">
                <h3>Destination</h3>
                <div className="country-selector">
                  {DESTINATIONS.map(d => (
                    <label key={d.code} className={`country-option ${country === d.code ? 'selected' : ''}`}>
                      <input type="radio" name="country" value={d.code}
                        checked={country === d.code}
                        onChange={e => setCountry(e.target.value)} />
                      <span className="country-flag">{d.flag}</span>
                      <span className="country-name">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="calc-section">
                <h3>Actual Weight <span className="req">*</span></h3>
                <div className="weight-input-wrap">
                  <input type="number" className="form-input calc-input"
                    placeholder="0.0" min="0" step="0.1"
                    value={weight} onChange={e => setWeight(e.target.value)} />
                  <span className="unit-label">kg</span>
                </div>
                {weight && parseFloat(weight) > 0 && (
                  <div className="unit-hint">= {r2(parseFloat(weight) * KG_TO_LBS)} lbs</div>
                )}
              </div>

              <div className="calc-section">
                <h3>
                  Dimensions (cm)
                  <span className="optional-tag">Optional — for volumetric weight</span>
                </h3>
                <div className="dim-grid">
                  {[
                    { label: 'Length', val: length, set: setLength },
                    { label: 'Width',  val: width,  set: setWidth  },
                    { label: 'Height', val: height, set: setHeight },
                  ].map(({ label, val, set }) => (
                    <div key={label} className="dim-field">
                      <label className="dim-label">{label}</label>
                      <div className="weight-input-wrap">
                        <input type="number" className="form-input calc-input"
                          placeholder="0" min="0"
                          value={val} onChange={e => set(e.target.value)} />
                        <span className="unit-label">cm</span>
                      </div>
                    </div>
                  ))}
                </div>
                {volKgPreview !== null && (
                  <div className="dim-preview">
                    Volumetric weight: <strong>{volKgPreview} kg &nbsp;·&nbsp; {r2(volKgPreview * KG_TO_LBS)} lbs</strong>
                  </div>
                )}
              </div>

              <p className="calc-disclaimer">
                Estimates are based on current rates and may vary. Final cost is confirmed after physical weighing at our Houston warehouse.
              </p>
            </div>

            {/* ── Result Panel ── */}
            <div className="result-panel">
              {!calc ? (
                <div className="result-empty">
                  <div className="re-icon">🧮</div>
                  <h3>Your estimate will appear here</h3>
                  <p>Select a destination and enter the package weight — estimate updates instantly.</p>
                  <div className="re-features">
                    <div className="re-feature"><span>✈️</span><span>Air freight to Gulf countries</span></div>
                    <div className="re-feature"><span>⚖️</span><span>Billed on chargeable weight (actual vs. volumetric)</span></div>
                    <div className="re-feature"><span>🛡️</span><span>Fully insured shipping</span></div>
                    <div className="re-feature"><span>📱</span><span>Real-time tracking included</span></div>
                  </div>
                </div>
              ) : (
                <div className="result-content fade-up">
                  <div className="result-destination">
                    <span>{calc.dest.flag}</span>
                    <div>
                      <div className="rd-label">Shipping to</div>
                      <div className="rd-name">{calc.dest.name}</div>
                    </div>
                    <div className="delivery-badge">✈️ 5–10 days</div>
                  </div>

                  <div className="weight-breakdown">
                    <h3>Weight Breakdown</h3>
                    <div className="wb-row">
                      <span>Actual weight</span>
                      <span>{r2(calc.actualKg)} kg &nbsp;·&nbsp; {r2(calc.actualKg * KG_TO_LBS)} lbs</span>
                    </div>
                    {calc.volKg !== null && (
                      <div className={`wb-row ${calc.volApplies ? 'wb-highlight' : ''}`}>
                        <span>Volumetric weight{calc.volApplies ? ' ★' : ''}</span>
                        <span>{r2(calc.volKg)} kg &nbsp;·&nbsp; {r2(calc.volKg * KG_TO_LBS)} lbs</span>
                      </div>
                    )}
                    <div className="wb-row billable">
                      <span>Chargeable weight</span>
                      <span><strong>{r2(calc.chargeKg)} kg &nbsp;·&nbsp; {r2(calc.chargeLbs)} lbs</strong></span>
                    </div>
                    {calc.volApplies && (
                      <div className="wb-note">★ Volumetric weight applies — package is large relative to its weight.</div>
                    )}
                  </div>

                  <div className="cost-breakdown">
                    <h3>Cost Breakdown</h3>
                    <div className="cb-row">
                      <span>{r2(calc.chargeLbs)} lbs × ${calc.dest.ratePerLb.toFixed(2)}/lb</span>
                      <span>${calc.shipping.toFixed(2)}</span>
                    </div>
                    <div className="cb-row">
                      <span>Handling fee</span>
                      <span>${HANDLING_FEE.toFixed(2)}</span>
                    </div>
                    <div className="cb-total">
                      <span>Estimated Total</span>
                      <span className="total-amount">${calc.total.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="result-actions">
                    <Link to="/new-shipment" className="btn btn-primary btn-lg">
                      Ship Now for ${calc.total.toFixed(2)} →
                    </Link>
                    <Link to="/tracking" className="btn btn-ghost">Track a Package</Link>
                  </div>

                  <div className="result-note">
                    <span>ℹ️</span>
                    This is an estimate. Duties, taxes, and customs fees are not included and vary by country.
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Rate Table ── */}
          <div className="rate-table-section">
            <h2>Standard Shipping Rates</h2>
            <p>All rates are per chargeable pound — whichever is greater between actual and volumetric weight. Handling fee of $10 applies per shipment.</p>
            <div className="rate-table-wrapper">
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Rate / lb</th>
                    <th>Rate / kg (approx)</th>
                    <th>Est. Transit</th>
                    <th>Handling Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {DESTINATIONS.map(d => (
                    <tr key={d.code} className={country === d.code ? 'rate-row-active' : ''}>
                      <td><span className="country-cell">{d.flag} {d.name}</span></td>
                      <td><strong>${d.ratePerLb.toFixed(2)}</strong></td>
                      <td>${r2(d.ratePerLb * KG_TO_LBS).toFixed(2)}</td>
                      <td>5–10 business days</td>
                      <td>$10.00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rate-note">
              All rates are in USD. Chargeable weight = max(actual weight, volumetric weight).
              Volumetric weight = L × W × H (cm) ÷ 5000.
              Customs duties and import taxes are the responsibility of the recipient and are not included.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
