import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { DESTINATIONS } from '../data/mockData'
import './Calculator.css'

function calcDimWeight(l, w, h) {
  if (!l || !w || !h) return 0
  return (parseFloat(l) * parseFloat(w) * parseFloat(h)) / 5000
}

function calcCost(billableWeight, ratePerKg) {
  const base    = billableWeight * ratePerKg
  const fuel    = base * 0.18
  const handling = 8
  return {
    base:      base.toFixed(2),
    fuel:      fuel.toFixed(2),
    handling:  handling.toFixed(2),
    total:     (base + fuel + handling).toFixed(2),
  }
}

export default function Calculator() {
  const [form, setForm] = useState({
    length: '', width: '', height: '',
    weight: '', country: '',
  })
  const [result, setResult] = useState(null)
  const [calculated, setCalculated] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setCalculated(false)
    setResult(null)
  }

  const handleCalc = () => {
    const dest   = DESTINATIONS.find(d => d.code === form.country)
    if (!dest || !form.weight) return
    const actW   = parseFloat(form.weight)
    const dimW   = calcDimWeight(form.length, form.width, form.height)
    const bill   = Math.max(actW, dimW)
    const costs  = calcCost(bill, dest.rate)
    setResult({ actW, dimW, bill, costs, dest, deliveryDays: '5–10' })
    setCalculated(true)
  }

  const canCalc = form.weight && form.country

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content calc-page">

        {/* Hero */}
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
                    <label key={d.code} className={`country-option ${form.country === d.code ? 'selected' : ''}`}>
                      <input type="radio" name="country" value={d.code}
                        checked={form.country === d.code} onChange={handleChange} />
                      <span className="country-flag">{d.flag}</span>
                      <span className="country-name">{d.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="calc-section">
                <h3>Actual Weight (kg) <span className="req">*</span></h3>
                <div className="weight-input-wrap">
                  <input type="number" name="weight" className="form-input calc-input"
                    placeholder="0.0" min="0" step="0.1"
                    value={form.weight} onChange={handleChange} />
                  <span className="unit-label">kg</span>
                </div>
              </div>

              <div className="calc-section">
                <h3>
                  Dimensions (cm)
                  <span className="optional-tag">Optional — for dimensional weight</span>
                </h3>
                <div className="dim-grid">
                  {[
                    { name: 'length', label: 'Length' },
                    { name: 'width',  label: 'Width'  },
                    { name: 'height', label: 'Height' },
                  ].map(f => (
                    <div key={f.name} className="dim-field">
                      <label className="dim-label">{f.label}</label>
                      <div className="weight-input-wrap">
                        <input type="number" name={f.name} className="form-input calc-input"
                          placeholder="0" min="0" value={form[f.name]} onChange={handleChange} />
                        <span className="unit-label">cm</span>
                      </div>
                    </div>
                  ))}
                </div>
                {form.length && form.width && form.height && (
                  <div className="dim-preview">
                    Dimensional weight: <strong>
                      {calcDimWeight(form.length, form.width, form.height).toFixed(2)} kg
                    </strong>
                  </div>
                )}
              </div>

              <button
                className={`btn btn-primary btn-lg calc-btn ${!canCalc ? 'disabled' : ''}`}
                onClick={handleCalc}
                disabled={!canCalc}
              >
                🧮 Calculate Shipping Cost
              </button>

              <p className="calc-disclaimer">
                * Estimates are based on current rates and may vary. Final cost is confirmed after physical weighing at our Houston warehouse.
              </p>
            </div>

            {/* ── Result Panel ── */}
            <div className="result-panel">
              {!calculated ? (
                <div className="result-empty">
                  <div className="re-icon">🧮</div>
                  <h3>Your estimate will appear here</h3>
                  <p>Select a destination and enter the package weight to calculate your shipping cost.</p>
                  <div className="re-features">
                    <div className="re-feature">
                      <span>✈️</span>
                      <span>Air freight to Gulf countries</span>
                    </div>
                    <div className="re-feature">
                      <span>📦</span>
                      <span>Includes handling & fuel surcharge</span>
                    </div>
                    <div className="re-feature">
                      <span>🛡️</span>
                      <span>Fully insured shipping</span>
                    </div>
                    <div className="re-feature">
                      <span>📱</span>
                      <span>Real-time tracking included</span>
                    </div>
                  </div>
                </div>
              ) : result && (
                <div className="result-content fade-up">
                  <div className="result-destination">
                    <span>{result.dest.flag}</span>
                    <div>
                      <div className="rd-label">Shipping to</div>
                      <div className="rd-name">{result.dest.name}</div>
                    </div>
                    <div className="delivery-badge">
                      ✈️ {result.deliveryDays} days
                    </div>
                  </div>

                  <div className="weight-breakdown">
                    <h3>Weight Breakdown</h3>
                    <div className="wb-row">
                      <span>Actual Weight</span>
                      <span>{result.actW.toFixed(2)} kg</span>
                    </div>
                    {result.dimW > 0 && (
                      <div className="wb-row">
                        <span>Dimensional Weight</span>
                        <span>{result.dimW.toFixed(2)} kg</span>
                      </div>
                    )}
                    <div className="wb-row billable">
                      <span>Billable Weight</span>
                      <span><strong>{result.bill.toFixed(2)} kg</strong></span>
                    </div>
                    <div className="wb-note">
                      Billable weight = max(actual, dimensional)
                    </div>
                  </div>

                  <div className="cost-breakdown">
                    <h3>Cost Breakdown</h3>
                    <div className="cb-row">
                      <span>Base Rate ({result.dest.rate}/kg × {result.bill.toFixed(2)} kg)</span>
                      <span>${result.costs.base}</span>
                    </div>
                    <div className="cb-row">
                      <span>Fuel Surcharge (18%)</span>
                      <span>${result.costs.fuel}</span>
                    </div>
                    <div className="cb-row">
                      <span>Handling Fee</span>
                      <span>${result.costs.handling}</span>
                    </div>
                    <div className="cb-total">
                      <span>Estimated Total</span>
                      <span className="total-amount">${result.costs.total}</span>
                    </div>
                  </div>

                  <div className="result-actions">
                    <Link to="/signup" className="btn btn-primary btn-lg">
                      Start Shipping for ${result.costs.total} →
                    </Link>
                    <button className="btn btn-ghost" onClick={() => { setResult(null); setCalculated(false) }}>
                      Recalculate
                    </button>
                  </div>

                  <div className="result-note">
                    <span>ℹ️</span>
                    This is an estimate. Duties, taxes, and customs fees are not included and vary by country and declared value.
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── Rate Table ── */}
          <div className="rate-table-section">
            <h2>Standard Shipping Rates</h2>
            <p>Base rates per kilogram (billable weight) — fuel surcharge and handling fees apply.</p>
            <div className="rate-table-wrapper">
              <table className="rate-table">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>Base Rate / kg</th>
                    <th>Fuel Surcharge</th>
                    <th>Est. Transit Time</th>
                    <th>Min. Charge</th>
                  </tr>
                </thead>
                <tbody>
                  {DESTINATIONS.map(d => (
                    <tr key={d.code}>
                      <td><span className="country-cell">{d.flag} {d.name}</span></td>
                      <td><strong>${d.rate}.00</strong></td>
                      <td>18%</td>
                      <td>5–10 business days</td>
                      <td>${(d.rate * 0.5 + 8).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="rate-note">
              All rates are in USD. Dimensional weight applies when volumetric weight exceeds actual weight (L×W×H÷5000).
              Customs duties and import taxes are the responsibility of the recipient and are not included above.
            </p>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
