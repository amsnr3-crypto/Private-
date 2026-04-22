// ── Single source of truth for all Speedy Texas destinations ──
// Used by: Calculator, NewShipment, dashboards, router state
// Pricing tiers: blended per-lb rates (0–50 / 51–100 / 101+)
//
// Fields:
//   code    — ISO 3166-1 alpha-2
//   name    — display name
//   flag    — emoji flag
//   zone    — pricing zone (future use: 'L' | 'M' | 'H')
//   enabled — controls visibility across UI
//   rates   — blended tier pricing

export const DESTINATIONS = [
  // ── Gulf (GCC) ──
  {
    code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 4.50 },
      { min: 50,  max: 100,      price: 4.25 },
      { min: 100, max: Infinity, price: 4.00 },
    ],
  },
  {
    code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 4.75 },
      { min: 50,  max: 100,      price: 4.50 },
      { min: 100, max: Infinity, price: 4.25 },
    ],
  },
  {
    code: 'KW', name: 'Kuwait', flag: '🇰🇼',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 4.75 },
      { min: 50,  max: 100,      price: 4.50 },
      { min: 100, max: Infinity, price: 4.25 },
    ],
  },
  {
    code: 'QA', name: 'Qatar', flag: '🇶🇦',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 4.75 },
      { min: 50,  max: 100,      price: 4.50 },
      { min: 100, max: Infinity, price: 4.25 },
    ],
  },
  {
    code: 'BH', name: 'Bahrain', flag: '🇧🇭',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 4.50 },
      { min: 50,  max: 100,      price: 4.25 },
      { min: 100, max: Infinity, price: 4.00 },
    ],
  },
  {
    code: 'OM', name: 'Oman', flag: '🇴🇲',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 5.00 },
      { min: 50,  max: 100,      price: 4.75 },
      { min: 100, max: Infinity, price: 4.50 },
    ],
  },
  // ── Levant / Near East ──
  {
    code: 'JO', name: 'Jordan', flag: '🇯🇴',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 5.25 },
      { min: 50,  max: 100,      price: 5.00 },
      { min: 100, max: Infinity, price: 4.75 },
    ],
  },
  {
    code: 'EG', name: 'Egypt', flag: '🇪🇬',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 5.25 },
      { min: 50,  max: 100,      price: 5.00 },
      { min: 100, max: Infinity, price: 4.75 },
    ],
  },
  {
    code: 'YE', name: 'Yemen', flag: '🇾🇪',
    zone: 'L', enabled: true,
    rates: [
      { min: 0,   max: 50,       price: 5.50 },
      { min: 50,  max: 100,      price: 5.25 },
      { min: 100, max: Infinity, price: 5.00 },
    ],
  },
]

// Flag lookup by name — used by NewShipment review screen
export const DESTINATION_FLAGS = Object.fromEntries(
  DESTINATIONS.map(d => [d.name, d.flag])
)
