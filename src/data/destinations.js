// ── Single source of truth for all Speedy Texas destinations ──
// Used by: Calculator, NewShipment, dashboards, router state
// Pricing tiers: blended per-lb rates (0–50 / 51–100 / 101+)
//
// Fields:
//   code    — ISO 3166-1 alpha-2
//   name    — display name
//   flag    — emoji flag
//   zone    — pricing zone ('L' = specialized Gulf/MENA | 'INTL' = international fallback)
//   enabled — true = show in rate table; false = dropdown-only
//   rates   — blended tier pricing

// ── Specialized Gulf & MENA rates ─────────────────────────────────────────
export const DESTINATIONS = [
  // Gulf (GCC)
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
  // Levant / Near East
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

// ── International fallback rates (all other countries) ────────────────────
const IR = [
  { min: 0,   max: 50,       price: 7.50 },
  { min: 50,  max: 100,      price: 7.00 },
  { min: 100, max: Infinity, price: 6.50 },
]

const intl = (code, name, flag) => ({
  code, name, flag, zone: 'INTL', enabled: false, rates: IR,
})

export const WORLD_COUNTRIES = [
  // ── Africa ──
  intl('DZ', 'Algeria',                   '🇩🇿'),
  intl('AO', 'Angola',                    '🇦🇴'),
  intl('BJ', 'Benin',                     '🇧🇯'),
  intl('BW', 'Botswana',                  '🇧🇼'),
  intl('BF', 'Burkina Faso',              '🇧🇫'),
  intl('BI', 'Burundi',                   '🇧🇮'),
  intl('CV', 'Cape Verde',                '🇨🇻'),
  intl('CM', 'Cameroon',                  '🇨🇲'),
  intl('CF', 'Central African Republic',  '🇨🇫'),
  intl('TD', 'Chad',                      '🇹🇩'),
  intl('KM', 'Comoros',                   '🇰🇲'),
  intl('CG', 'Congo',                     '🇨🇬'),
  intl('CD', 'Congo (DR)',                '🇨🇩'),
  intl('CI', "Côte d'Ivoire",             '🇨🇮'),
  intl('DJ', 'Djibouti',                  '🇩🇯'),
  intl('ER', 'Eritrea',                   '🇪🇷'),
  intl('SZ', 'Eswatini',                  '🇸🇿'),
  intl('ET', 'Ethiopia',                  '🇪🇹'),
  intl('GA', 'Gabon',                     '🇬🇦'),
  intl('GM', 'Gambia',                    '🇬🇲'),
  intl('GH', 'Ghana',                     '🇬🇭'),
  intl('GN', 'Guinea',                    '🇬🇳'),
  intl('GW', 'Guinea-Bissau',             '🇬🇼'),
  intl('KE', 'Kenya',                     '🇰🇪'),
  intl('LS', 'Lesotho',                   '🇱🇸'),
  intl('LR', 'Liberia',                   '🇱🇷'),
  intl('LY', 'Libya',                     '🇱🇾'),
  intl('MG', 'Madagascar',                '🇲🇬'),
  intl('MW', 'Malawi',                    '🇲🇼'),
  intl('ML', 'Mali',                      '🇲🇱'),
  intl('MR', 'Mauritania',                '🇲🇷'),
  intl('MU', 'Mauritius',                 '🇲🇺'),
  intl('MA', 'Morocco',                   '🇲🇦'),
  intl('MZ', 'Mozambique',                '🇲🇿'),
  intl('NA', 'Namibia',                   '🇳🇦'),
  intl('NE', 'Niger',                     '🇳🇪'),
  intl('NG', 'Nigeria',                   '🇳🇬'),
  intl('RW', 'Rwanda',                    '🇷🇼'),
  intl('ST', 'São Tomé and Príncipe',     '🇸🇹'),
  intl('SN', 'Senegal',                   '🇸🇳'),
  intl('SC', 'Seychelles',                '🇸🇨'),
  intl('SL', 'Sierra Leone',              '🇸🇱'),
  intl('SO', 'Somalia',                   '🇸🇴'),
  intl('ZA', 'South Africa',              '🇿🇦'),
  intl('SS', 'South Sudan',               '🇸🇸'),
  intl('SD', 'Sudan',                     '🇸🇩'),
  intl('TZ', 'Tanzania',                  '🇹🇿'),
  intl('TG', 'Togo',                      '🇹🇬'),
  intl('TN', 'Tunisia',                   '🇹🇳'),
  intl('UG', 'Uganda',                    '🇺🇬'),
  intl('ZM', 'Zambia',                    '🇿🇲'),
  intl('ZW', 'Zimbabwe',                  '🇿🇼'),

  // ── Americas ──
  intl('AG', 'Antigua and Barbuda',       '🇦🇬'),
  intl('AR', 'Argentina',                 '🇦🇷'),
  intl('BS', 'Bahamas',                   '🇧🇸'),
  intl('BB', 'Barbados',                  '🇧🇧'),
  intl('BZ', 'Belize',                    '🇧🇿'),
  intl('BO', 'Bolivia',                   '🇧🇴'),
  intl('BR', 'Brazil',                    '🇧🇷'),
  intl('CA', 'Canada',                    '🇨🇦'),
  intl('CL', 'Chile',                     '🇨🇱'),
  intl('CO', 'Colombia',                  '🇨🇴'),
  intl('CR', 'Costa Rica',                '🇨🇷'),
  intl('CU', 'Cuba',                      '🇨🇺'),
  intl('DM', 'Dominica',                  '🇩🇲'),
  intl('DO', 'Dominican Republic',        '🇩🇴'),
  intl('EC', 'Ecuador',                   '🇪🇨'),
  intl('SV', 'El Salvador',               '🇸🇻'),
  intl('GD', 'Grenada',                   '🇬🇩'),
  intl('GT', 'Guatemala',                 '🇬🇹'),
  intl('GY', 'Guyana',                    '🇬🇾'),
  intl('HT', 'Haiti',                     '🇭🇹'),
  intl('HN', 'Honduras',                  '🇭🇳'),
  intl('JM', 'Jamaica',                   '🇯🇲'),
  intl('MX', 'Mexico',                    '🇲🇽'),
  intl('NI', 'Nicaragua',                 '🇳🇮'),
  intl('PA', 'Panama',                    '🇵🇦'),
  intl('PY', 'Paraguay',                  '🇵🇾'),
  intl('PE', 'Peru',                      '🇵🇪'),
  intl('KN', 'Saint Kitts and Nevis',     '🇰🇳'),
  intl('LC', 'Saint Lucia',               '🇱🇨'),
  intl('VC', 'Saint Vincent and the Grenadines', '🇻🇨'),
  intl('SR', 'Suriname',                  '🇸🇷'),
  intl('TT', 'Trinidad and Tobago',       '🇹🇹'),
  intl('UY', 'Uruguay',                   '🇺🇾'),
  intl('VE', 'Venezuela',                 '🇻🇪'),

  // ── Asia ──
  intl('AF', 'Afghanistan',               '🇦🇫'),
  intl('AM', 'Armenia',                   '🇦🇲'),
  intl('AZ', 'Azerbaijan',                '🇦🇿'),
  intl('BD', 'Bangladesh',                '🇧🇩'),
  intl('BT', 'Bhutan',                    '🇧🇹'),
  intl('BN', 'Brunei',                    '🇧🇳'),
  intl('KH', 'Cambodia',                  '🇰🇭'),
  intl('CN', 'China',                     '🇨🇳'),
  intl('GE', 'Georgia',                   '🇬🇪'),
  intl('IN', 'India',                     '🇮🇳'),
  intl('ID', 'Indonesia',                 '🇮🇩'),
  intl('IR', 'Iran',                      '🇮🇷'),
  intl('IQ', 'Iraq',                      '🇮🇶'),
  intl('IL', 'Israel',                    '🇮🇱'),
  intl('JP', 'Japan',                     '🇯🇵'),
  intl('KZ', 'Kazakhstan',                '🇰🇿'),
  intl('KG', 'Kyrgyzstan',               '🇰🇬'),
  intl('LA', 'Laos',                      '🇱🇦'),
  intl('LB', 'Lebanon',                   '🇱🇧'),
  intl('MY', 'Malaysia',                  '🇲🇾'),
  intl('MV', 'Maldives',                  '🇲🇻'),
  intl('MN', 'Mongolia',                  '🇲🇳'),
  intl('MM', 'Myanmar',                   '🇲🇲'),
  intl('NP', 'Nepal',                     '🇳🇵'),
  intl('PK', 'Pakistan',                  '🇵🇰'),
  intl('PH', 'Philippines',               '🇵🇭'),
  intl('RU', 'Russia',                    '🇷🇺'),
  intl('SG', 'Singapore',                 '🇸🇬'),
  intl('LK', 'Sri Lanka',                 '🇱🇰'),
  intl('SY', 'Syria',                     '🇸🇾'),
  intl('TW', 'Taiwan',                    '🇹🇼'),
  intl('TJ', 'Tajikistan',                '🇹🇯'),
  intl('TH', 'Thailand',                  '🇹🇭'),
  intl('TL', 'Timor-Leste',               '🇹🇱'),
  intl('TM', 'Turkmenistan',              '🇹🇲'),
  intl('UZ', 'Uzbekistan',                '🇺🇿'),
  intl('VN', 'Vietnam',                   '🇻🇳'),

  // ── Europe ──
  intl('AL', 'Albania',                   '🇦🇱'),
  intl('AD', 'Andorra',                   '🇦🇩'),
  intl('AT', 'Austria',                   '🇦🇹'),
  intl('BY', 'Belarus',                   '🇧🇾'),
  intl('BE', 'Belgium',                   '🇧🇪'),
  intl('BA', 'Bosnia and Herzegovina',    '🇧🇦'),
  intl('BG', 'Bulgaria',                  '🇧🇬'),
  intl('HR', 'Croatia',                   '🇭🇷'),
  intl('CY', 'Cyprus',                    '🇨🇾'),
  intl('CZ', 'Czechia',                   '🇨🇿'),
  intl('DK', 'Denmark',                   '🇩🇰'),
  intl('EE', 'Estonia',                   '🇪🇪'),
  intl('FI', 'Finland',                   '🇫🇮'),
  intl('FR', 'France',                    '🇫🇷'),
  intl('DE', 'Germany',                   '🇩🇪'),
  intl('GR', 'Greece',                    '🇬🇷'),
  intl('HU', 'Hungary',                   '🇭🇺'),
  intl('IS', 'Iceland',                   '🇮🇸'),
  intl('IE', 'Ireland',                   '🇮🇪'),
  intl('IT', 'Italy',                     '🇮🇹'),
  intl('LV', 'Latvia',                    '🇱🇻'),
  intl('LI', 'Liechtenstein',             '🇱🇮'),
  intl('LT', 'Lithuania',                 '🇱🇹'),
  intl('LU', 'Luxembourg',                '🇱🇺'),
  intl('MT', 'Malta',                     '🇲🇹'),
  intl('MD', 'Moldova',                   '🇲🇩'),
  intl('MC', 'Monaco',                    '🇲🇨'),
  intl('ME', 'Montenegro',                '🇲🇪'),
  intl('NL', 'Netherlands',               '🇳🇱'),
  intl('MK', 'North Macedonia',           '🇲🇰'),
  intl('NO', 'Norway',                    '🇳🇴'),
  intl('PL', 'Poland',                    '🇵🇱'),
  intl('PT', 'Portugal',                  '🇵🇹'),
  intl('RO', 'Romania',                   '🇷🇴'),
  intl('SM', 'San Marino',                '🇸🇲'),
  intl('RS', 'Serbia',                    '🇷🇸'),
  intl('SK', 'Slovakia',                  '🇸🇰'),
  intl('SI', 'Slovenia',                  '🇸🇮'),
  intl('ES', 'Spain',                     '🇪🇸'),
  intl('SE', 'Sweden',                    '🇸🇪'),
  intl('CH', 'Switzerland',               '🇨🇭'),
  intl('TR', 'Turkey',                    '🇹🇷'),
  intl('UA', 'Ukraine',                   '🇺🇦'),
  intl('GB', 'United Kingdom',            '🇬🇧'),

  // ── Oceania ──
  intl('AU', 'Australia',                 '🇦🇺'),
  intl('FJ', 'Fiji',                      '🇫🇯'),
  intl('KI', 'Kiribati',                  '🇰🇮'),
  intl('MH', 'Marshall Islands',          '🇲🇭'),
  intl('FM', 'Micronesia',                '🇫🇲'),
  intl('NR', 'Nauru',                     '🇳🇷'),
  intl('NZ', 'New Zealand',               '🇳🇿'),
  intl('PW', 'Palau',                     '🇵🇼'),
  intl('PG', 'Papua New Guinea',          '🇵🇬'),
  intl('WS', 'Samoa',                     '🇼🇸'),
  intl('SB', 'Solomon Islands',           '🇸🇧'),
  intl('TO', 'Tonga',                     '🇹🇴'),
  intl('TV', 'Tuvalu',                    '🇹🇻'),
  intl('VU', 'Vanuatu',                   '🇻🇺'),
]

// ── Combined lookup — used by Calculator pricing engine ───────────────────
export const ALL_COUNTRIES = [...DESTINATIONS, ...WORLD_COUNTRIES]

// ── Flag lookup by name — used by NewShipment review screen ──────────────
export const DESTINATION_FLAGS = Object.fromEntries(
  DESTINATIONS.map(d => [d.name, d.flag])
)
