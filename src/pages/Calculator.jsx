import { Link } from 'react-router-dom'
import { useState, useMemo, useRef } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { supabase } from '../supabaseClient'
import { DESTINATIONS } from '../data/destinations'
import './Calculator.css'

const VOL_DIV_LBS    = 139
const PRICING = {
  fuel:     0.22,
  handling: 10,
  minimum:  45,
  risk:     30,
}
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
function getVolumetricWeight(length, width, height, dimUnit) {
  return (toInches(parseFloat(length), dimUnit) *
          toInches(parseFloat(width),  dimUnit) *
          toInches(parseFloat(height), dimUnit)) / VOL_DIV_LBS
}
function getChargeableWeight(actualLbs, volLbs) {
  return volLbs !== null ? Math.max(actualLbs, volLbs) : actualLbs
}
function getRiskFlag({ actualLbs, volLbs, length, width, height }) {
  const sides = [parseFloat(length) || 0, parseFloat(width) || 0, parseFloat(height) || 0]
    .sort((a, b) => b - a)
  const longest       = sides[0]
  const secondLongest = sides[1]
  if (longest > 40)       return true
  if (secondLongest > 24) return true
  if (volLbs !== null && actualLbs > 0 && volLbs / actualLbs > 4) return true
  return false
}
function getOverweightFee(actualLbs, chargeLbs) {
  const billable = Math.max(actualLbs, chargeLbs)
  if (billable <= 70)  return 0
  if (billable <= 100) return 45
  return 85
}
function getNonConveyableFee(shipping, length, width, height, dimUnit) {
  const l = toInches(parseFloat(length) || 0, dimUnit)
  const w = toInches(parseFloat(width)  || 0, dimUnit)
  const h = toInches(parseFloat(height) || 0, dimUnit)
  const sides = [l, w, h].sort((a, b) => b - a)
  const longest = sides[0]
  const isNonConveyable =
    longest > 47 ||
    (l * w * h) > 5000
  if (!isNonConveyable) return 0
  const percentFee = shipping * 0.08
  return r2(Math.max(25, percentFee))
}
function getPieceFee(pieces) {
  return Math.max(0, (pieces - 1) * 5)
}
function getMinimumFloor(chargeLbs) {
  if (chargeLbs <= 5)  return 95
  if (chargeLbs <= 10) return 80
  return 45
}
function getShippingPrice(chargeLbs, rates) {
  const minFloor = getMinimumFloor(chargeLbs)
  return Math.max(calcBlendedShipping(chargeLbs, rates), minFloor)
}
function getTotals(shipping, isRisk) {
  const fuel  = r2(shipping * PRICING.fuel)
  const total = r2(shipping + fuel + PRICING.handling + (isRisk ? PRICING.risk : 0))
  return { fuel, total }
}

function getEstimatedCost(chargeLbs, shipping, riskFlag) {
  const carrierCost  = r2(chargeLbs * 1.58)
  const carrierFuel  = r2(carrierCost * PRICING.fuel)
  const estimatedCost = r2(carrierCost + carrierFuel + PRICING.handling + (riskFlag ? PRICING.risk : 0))
  return { carrierCost, carrierFuel, estimatedCost }
}
function getDynamicMultiplier(chargeLbs) {
  if (chargeLbs <= 5)  return 1.7
  if (chargeLbs <= 20) return 1.5
  return 1.35
}
function getOversizeFlag(length, width, height, dimUnit) {
  const l = toInches(parseFloat(length) || 0, dimUnit)
  const w = toInches(parseFloat(width)  || 0, dimUnit)
  const h = toInches(parseFloat(height) || 0, dimUnit)
  const sides  = [l, w, h].sort((a, b) => b - a)

  const longest = sides[0]
  const girth   = l + 2*w + 2*h
  if (longest > 40) return true
  if (girth > 120)  return true
  return false
}
function applyMarginProtection(total, estimatedCost) {
  const minMarginPct   = 0.28
  const minMarginUsd   = 18
  const requiredByPct  = r2(estimatedCost / (1 - minMarginPct))
  const requiredByUsd  = r2(estimatedCost + minMarginUsd)
  const protectedTotal = r2(Math.max(total, requiredByPct, requiredByUsd))
  return { protectedTotal, marginAdjusted: protectedTotal > total }
}
function getMarginMetrics(total, estimatedCost) {
  const marginUsd = r2(total - estimatedCost)
  const marginPct = total > 0 ? r2(marginUsd / total) : 0
  return { marginUsd, marginPct }
}
function getHeavyDiscount(chargeLbs) {
  if (chargeLbs <= 70)  return 1
  if (chargeLbs <= 120) return 0.75
  if (chargeLbs <= 200) return 0.7
  return 0.75
}
function calculateQuote({ country, weight, weightUnit, length, width, height, dimUnit, pieces }) {
  const dest = DESTINATIONS.find(d => d.code === country)
  const actualLbs = toLbs(parseFloat(weight) || 0, weightUnit)
  if (!dest || actualLbs <= 0) return null

  const hasVol = length && width && height

  const volLbs = hasVol ? getVolumetricWeight(length, width, height, dimUnit) : null

  const chargeLbs   = getChargeableWeight(actualLbs, volLbs)
  const shipping    = getShippingPrice(chargeLbs, dest.rates)
  const riskFlag     = getRiskFlag({ actualLbs, volLbs, length, width, height })
  const oversizeFlag = getOversizeFlag(length, width, height, dimUnit)
  const { fuel, total } = getTotals(shipping, riskFlag)
  const { carrierCost, carrierFuel, estimatedCost } = getEstimatedCost(chargeLbs, shipping, riskFlag)

  const pieceFee      = getPieceFee(pieces)
  const nonConvFee    = getNonConveyableFee(shipping, length, width, height, dimUnit)
  const overweightFee = getOverweightFee(actualLbs, chargeLbs)
  let adjustedTotal = total
  if (oversizeFlag) {
    adjustedTotal = r2(adjustedTotal + 15)
  }
  adjustedTotal = r2(adjustedTotal + pieceFee)
  adjustedTotal = r2(adjustedTotal + nonConvFee)
  adjustedTotal = r2(adjustedTotal + overweightFee)

  const { protectedTotal, marginAdjusted } = applyMarginProtection(adjustedTotal, estimatedCost)
  const multiplier     = getDynamicMultiplier(chargeLbs)
  const costBasedTotal = r2(estimatedCost * multiplier)
  const heavyFactor    = getHeavyDiscount(chargeLbs)
  const finalTotal     =
    chargeLbs > 70
      ? Math.max(costBasedTotal, adjustedTotal * heavyFactor)
      : Math.max(adjustedTotal, costBasedTotal)
  const { marginUsd, marginPct } = getMarginMetrics(r2(finalTotal), estimatedCost)

  return { actualLbs, volLbs, chargeLbs, shipping, fuel, total: r2(finalTotal), carrierCost, carrierFuel, estimatedCost, marginUsd, marginPct, marginAdjusted, oversizeFlag, pieces, pieceFee, nonConvFee, overweightFee }
}

export default function Calculator() {
  const [country,    setCountry]    = useState('')
  const [weight,     setWeight]     = useState('')
  const [length,     setLength]     = useState('')
  const [width,      setWidth]      = useState('')
  const [height,     setHeight]     = useState('')
  const [weightUnit, setWeightUnit] = useState('lb')
  const [dimUnit,    setDimUnit]    = useState('in')
  const [pieces,     setPieces]     = useState(1)
  const calc = useMemo(
    () => calculateQuote({ country, weight, weightUnit, length, width, height, dimUnit, pieces }),
    [country, weight, weightUnit, length, width, height, dimUnit, pieces]
  )

  const activeDest = DESTINATIONS.find(d => d.code === country)
  const activeDestinations = DESTINATIONS.filter(d => d.enabled)

  // ── Quote save (intentional only — triggered by user action) ──
  const quotePayload = calc && activeDest ? {
    destination_code:      activeDest.code,
    destination_name:      activeDest.name,
    actual_weight_lbs:     calc.actualLbs,
    volumetric_weight_lbs: calc.volLbs,
    chargeable_weight_lbs: calc.chargeLbs,
    pieces:                calc.pieces,
    final_price_usd:       calc.total,
    estimated_cost_usd:    calc.estimatedCost,
    margin_usd:            calc.marginUsd,
    margin_pct:            calc.marginPct,
    oversize_flag:         calc.oversizeFlag,
    non_conv_fee_usd:      calc.nonConvFee,
    overweight_fee_usd:    calc.overweightFee,
    piece_fee_usd:         calc.pieceFee,
    created_at:            new Date().toISOString(),
  } : null

  const savingRef = useRef(false)

  async function saveQuote() {
    if (savingRef.current || !quotePayload) return
    savingRef.current = true
    try {
      await supabase.from('quotes').insert(quotePayload)
    } catch (_) {
      // silent
    }
  }
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
                  {activeDestinations.map(d => (
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

              {/* Pieces */}
              <div className="calc-section">
                <h3>Pieces</h3>
                <div className="weight-input-wrap">
                  <input type="number" min="1" className="form-input calc-input"
                    value={pieces} onChange={e => setPieces(Math.max(1, parseInt(e.target.value) || 1))} />
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

                  {/* Destination header */}
                  <div className="result-destination">
                    <span>{activeDest?.flag}</span>
                    <div>
                      <div className="rd-label">Shipping to</div>
                      <div className="rd-name">{activeDest?.name}</div>
                    </div>
                    <div className="delivery-badge">✈️ 5–7 business days</div>
                  </div>

                  {/* Final price */}
                  <div className="cb-total" style={{ margin: '0', borderRadius: '0' }}>
                    <span>Estimated Shipping Price</span>
                    <span className="total-amount">${calc.total.toFixed(2)}</span>
                  </div>

                  {/* Shipment summary */}
                  <div className="weight-breakdown">
                    <h3>Shipment Summary</h3>
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
                    <div className="wb-row">
                      <span>Pieces</span>
                      <span>{calc.pieces}</span>
                    </div>
                    <div className="wb-row">
                      <span>Destination</span>
                      <span>{activeDest?.flag} {activeDest?.name}</span>
                    </div>
                    <div className="wb-row">
                      <span>Estimated delivery</span>
                      <span>5–7 business days</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="result-actions">
                    <Link
                      to="/new-shipment"
                      state={{
                        destinationName:      activeDest?.name,
                        destinationCode:      activeDest?.code,
                        actualWeightLbs:      calc.actualLbs,
                        volumetricWeightLbs:  calc.volLbs,
                        chargeableWeightLbs:  calc.chargeLbs,
                        pieces:               calc.pieces,
                        finalPriceUsd:        calc.total,
                        lengthIn:             length,
                        widthIn:              width,
                        heightIn:             height,
                        dimUnit:              dimUnit,
                      }}
                      className="btn btn-primary btn-lg"
                    >
                      Ship Now →
                    </Link>
                    {(() => {
                      const lines = [
                        'Hello, I would like to confirm this shipment quote from Speedy Texas.',
                        '',
                        `Destination: ${activeDest?.name}`,
                        `Actual Weight: ${r2(calc.actualLbs)} lbs`,
                        calc.volLbs !== null ? `Volumetric Weight: ${r2(calc.volLbs)} lbs` : null,
                        `Chargeable Weight: ${r2(calc.chargeLbs)} lbs`,
                        `Pieces: ${calc.pieces}`,
                        `Quoted Price: $${calc.total.toFixed(2)}`,
                        '',
                        'Please confirm the next step.',
                      ].filter(l => l !== null).join('\n')
                      const waUrl = `https://wa.me/?text=${encodeURIComponent(lines)}`
                      return (
                        <>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost"
                            style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}
                            onClick={() => saveQuote()}
                          >
                            <span>💬</span> Confirm via WhatsApp
                          </a>
                          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', margin: '-4px 0 0' }}>
                            A Speedy Texas team member will confirm your shipment shortly.
                          </p>
                        </>
                      )
                    })()}
                    <Link to="/tracking" className="btn btn-ghost">Track a Package</Link>
                  </div>

                  {/* Customer note */}
                  <div className="result-note">
                    <span>ℹ️</span>
                    Final carrier handling charges may vary for unusual items.
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* ── Internal Dashboard (Dev Only) ── */}
          {calc && (
            <div className="internal-dashboard">
              <h3>Internal Pricing (Dev Only)</h3>

              <div>Estimated Cost: ${calc.estimatedCost?.toFixed(2)}</div>
              <div>Final Price: ${calc.total?.toFixed(2)}</div>
              <div>Margin: ${calc.marginUsd?.toFixed(2)}</div>
              <div>Margin %: {(calc.marginPct * 100)?.toFixed(1)}%</div>

              <hr />

              <div>Chargeable Weight: {r2(calc.chargeLbs)} lbs</div>
              <div>Actual Weight: {r2(calc.actualLbs)} lbs</div>
              {calc.volLbs !== null && <div>Volumetric: {r2(calc.volLbs)} lbs</div>}

              <hr />

              <div>Oversize: {calc.oversizeFlag ? 'Yes' : 'No'}</div>
              <div>Non-Conveyable Fee: ${calc.nonConvFee?.toFixed(2)}</div>
              <div>Overweight Fee: ${calc.overweightFee?.toFixed(2)}</div>
              <div>Piece Fee: ${calc.pieceFee?.toFixed(2)}</div>
            </div>
          )}

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
                  {activeDestinations.map(d => (
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
