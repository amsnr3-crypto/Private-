import { Link } from 'react-router-dom'
import { useState, useMemo } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import './Calculator.css'

const DESTINATIONS = [
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦',
    ratePerLb: 4.50,
    rates: [
      { min: 0,   max: 50,       price: 4.50 },
      { min: 50,  max: 100,      price: 4.25 },
      { min: 100, max: Infinity, price: 4.00 },
    ],
  },
  {
    code: 'AE', name: 'UAE', flag: '🇦🇪',
    ratePerLb: 4.75,
    rates: [
      { min: 0,   max: 50,       price: 4.75 },
      { min: 50,  max: 100,      price: 4.50 },
      { min: 100, max: Infinity, price: 4.25 },
    ],
  },
]

const VOL_DIV_LBS    = 139
const HANDLING_FEE   = 10
const FUEL_SURCHARGE = 0.22
const RISK_FEE       = 30
function r2(n) { return Math.round(n * 100) / 100 }
function calcBlendedShipping(lbs, rates) {
  const sorted = [...rates].sort((a, b) => a.min - b.min)
  let total = 0
  let counted = 0
  for (let i = 0; i < sorted.length; i++) {
    if (counted >= lbs) break
    const bandEnd = i < sorted.length - 1 ? sorted[i + 1].min : Infinity
    const lbsInBand = Math.min(lbs, bandEnd) - counted
    if (lbsInBand > 0) {
      total += lbsInBand * sorted[i].price
      counted += lbsInBand
    }
  }
  return r2(total)
}
function toLbs(val, unit)    { return unit === 'kg' ? val * 2.2046 : val }
function toInches(val, unit) { return unit === 'cm' ? val / 2.54   : val }

export default function Calculator() {
  const [country,    setCountry]    = useState('')
  const [weight,     setWeight]     = useState('')
  const [length,     setLength]     = useState('')
  const [width,      setWidth]      = useState('')
  const [height,     setHeight]     = useState('')
  const [weightUnit, setWeightUnit] = useState('lb')
  const [dimUnit,    setDimUnit]    = useState('in')
  const [isRisk,     setIsRisk]     = useState(false)

  const calc = useMemo(() => {
    const dest = DESTINATIONS.find(d => d.code === country)
    const actualLbs = toLbs(parseFloat(weight) || 0, weightUnit)
    if (!dest || actualLbs <= 0) return null

    const hasVol = length && width && height

    const volLbs = hasVol
      ? (toInches(parseFloat(length), dimUnit) *
         toInches(parseFloat(width),  dimUnit) *
         toInches(parseFloat(height), dimUnit)) / VOL_DIV_LBS
      : null

    const chargeLbs   = volLbs !== null ? Math.max(actualLbs, volLbs) : actualLbs
    const shippingRaw = calcBlendedShipping(chargeLbs, dest.rates)
    const shipping    = Math.max(shippingRaw, 45)
    const fuel        = r2(shipping * FUEL_SURCHARGE)
    const total       = r2(shipping + fuel + HANDLING_FEE + (isRisk ? RISK_FEE : 0))

    return { actualLbs, volLbs, chargeLbs, shipping, fuel, total }
  }, [country, weight, weightUnit, length, width, height, dimUnit, isRisk])

  const activeDest = DESTINATIONS.find(d => d.code === country)
  const volApplies = calc && calc.volLbs !== null && calc.volLbs > calc.actualLbs

  const unitToggleStyle = (active) => ({
    padding: '4px 16px', borderRadius: '20px', cursor: 'pointer',
    border: '1.5px solid', fontSize: '13px', fontWeight: 600,
    borderColor: active ? 'var(--primary)' : 'var(--border)',
    background:  active ? 'var(--primary)' : '#fff',
    color:       active ? '#fff' : 'var(--text-secondary)',
  })

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

              {/* Destination */}
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

              {/* Weight */}
              <div className="calc-section">
                <h3>Actual Weight <span className="req">*</span></h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {['lb', 'kg'].map(u => (
                    <button key={u} onClick={() => setWeightUnit(u)} style={unitToggleStyle(weightUnit === u)}>{u}</button>
                  ))}
                </div>
                <div className="weight-input-wrap">
                  <input type="text" inputMode="decimal" className="form-input calc-input"
                    placeholder="0.0"
                    value={weight} onChange={e => setWeight(e.target.value)} />
                  <span className="unit-label">{weightUnit}</span>
                </div>
              </div>

              {/* Dimensions */}
              <div className="calc-section">
                <h3>
                  Dimensions
                  <span className="optional-tag">Optional — for volumetric weight</span>
                </h3>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                  {['in', 'cm'].map(u => (
                    <button key={u} onClick={() => setDimUnit(u)} style={unitToggleStyle(dimUnit === u)}>{u}</button>
                  ))}
                </div>
                <div className="dim-grid">
                  {[
                    { label: 'Length', val: length, set: setLength },
                    { label: 'Width',  val: width,  set: setWidth  },
                    { label: 'Height', val: height, set: setHeight },
                  ].map(({ label, val, set }) => (
                    <div key={label} className="dim-field">
                      <label className="dim-label">{label}</label>
                      <div className="weight-input-wrap">
                        <input type="text" inputMode="decimal" className="form-input calc-input"
                          placeholder="0"
                          value={val} onChange={e => set(e.target.value)} />
                        <span className="unit-label">{dimUnit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {calc && calc.volLbs !== null && (
                  <div className="dim-preview">
                    Volumetric weight: <strong>{r2(calc.volLbs)} lbs</strong>
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
                    <span>{activeDest?.flag}</span>
                    <div>
                      <div className="rd-label">Shipping to</div>
                      <div className="rd-name">{activeDest?.name}</div>
                    </div>
                    <div className="delivery-badge">✈️ 5–10 days</div>
                  </div>

                  <div className="weight-breakdown">
                    <h3>Weight Breakdown</h3>
                    <div className="wb-row">
                      <span>Actual weight</span>
                      <span>{r2(calc.actualLbs)} lbs</span>
                    </div>
                    {calc.volLbs !== null && (
                      <div className={`wb-row ${volApplies ? 'wb-highlight' : ''}`}>
                        <span>Volumetric weight{volApplies ? ' ★' : ''}</span>
                        <span>{r2(calc.volLbs)} lbs</span>
                      </div>
                    )}
                    <div className="wb-row billable">
                      <span>Chargeable weight</span>
                      <span><strong>{r2(calc.chargeLbs)} lbs</strong></span>
                    </div>
                    {volApplies && (
                      <div className="wb-note">★ Volumetric weight applies — package is large relative to its weight.</div>
                    )}
                  </div>

                  <div className="cost-breakdown">
                    <h3>Cost Breakdown</h3>
                    <div className="cb-row">
                      <span>Shipping</span>
                      <span>${calc.shipping.toFixed(2)}</span>
                    </div>
                    <div className="cb-row">
                      <span>Fuel surcharge (22%)</span>
                      <span>${calc.fuel.toFixed(2)}</span>
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
            <p>All rates are per chargeable pound. Fuel surcharge (22%) and handling fee ($10) apply per shipment.</p>
            <div className="rate-table-wrapper">
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>0–50 lbs</th>
                    <th>51–100 lbs</th>
                    <th>101+ lbs</th>
                    <th>Est. Transit</th>
                  </tr>
                </thead>
                <tbody>
                  {DESTINATIONS.map(d => (
                    <tr key={d.code} className={country === d.code ? 'rate-row-active' : ''}>
                      <td><span className="country-cell">{d.flag} {d.name}</span></td>
                      {d.rates.map((t, i) => (
                        <td key={i}><strong>${t.price.toFixed(2)}/lb</strong></td>
                      ))}
                      <td>5–10 business days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rate-note">
              All rates are in USD. Chargeable weight = max(actual weight, volumetric weight).
              Volumetric weight (lbs) = L × W × H (in) ÷ 139, or L × W × H (cm) ÷ 2268.
              Customs duties and import taxes are the responsibility of the recipient and are not included.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
