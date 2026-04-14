export const DESTINATIONS = [
  { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', rate: 18 },
  { code: 'AE', name: 'United Arab Emirates', flag: '🇦🇪', rate: 20 },
  { code: 'KW', name: 'Kuwait', flag: '🇰🇼', rate: 22 },
  { code: 'QA', name: 'Qatar', flag: '🇶🇦', rate: 21 },
  { code: 'BH', name: 'Bahrain', flag: '🇧🇭', rate: 23 },
  { code: 'OM', name: 'Oman', flag: '🇴🇲', rate: 24 },
]

export const SHIPMENT_STATUSES = {
  received:    { label: 'Received in Houston', color: 'info',    icon: '📦', step: 1 },
  processing:  { label: 'Processing',          color: 'warning', icon: '⚙️', step: 2 },
  in_transit:  { label: 'In Transit',          color: 'info',    icon: '✈️', step: 3 },
  out_delivery:{ label: 'Out for Delivery',    color: 'warning', icon: '🚚', step: 4 },
  delivered:   { label: 'Delivered',           color: 'success', icon: '✅', step: 5 },
}

export const MOCK_SHIPMENTS = [
  {
    id: 'SPX-20240001',
    sender: 'Amazon US',
    receiver: 'Mohammed Al-Rashid',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    description: 'Electronics – MacBook Pro',
    weight: 2.4,
    status: 'delivered',
    date: '2024-03-15',
    cost: '$89.50',
  },
  {
    id: 'SPX-20240002',
    sender: 'Nike Store',
    receiver: 'Ahmed Al-Fahad',
    country: 'Kuwait',
    flag: '🇰🇼',
    description: 'Clothing – Shoes & Apparel',
    weight: 1.8,
    status: 'in_transit',
    date: '2024-03-28',
    cost: '$52.20',
  },
  {
    id: 'SPX-20240003',
    sender: 'Best Buy',
    receiver: 'Khalid Al-Mansouri',
    country: 'UAE',
    flag: '🇦🇪',
    description: 'Smart TV – 55 inch',
    weight: 18.5,
    status: 'processing',
    date: '2024-04-01',
    cost: '$210.00',
  },
  {
    id: 'SPX-20240004',
    sender: 'Walmart',
    receiver: 'Fatima Al-Jaber',
    country: 'Qatar',
    flag: '🇶🇦',
    description: 'Home Appliances',
    weight: 5.2,
    status: 'received',
    date: '2024-04-05',
    cost: '$78.40',
  },
  {
    id: 'SPX-20240005',
    sender: 'Apple Store',
    receiver: 'Omar Al-Saud',
    country: 'Saudi Arabia',
    flag: '🇸🇦',
    description: 'iPhone 15 Pro Max',
    weight: 0.4,
    status: 'out_delivery',
    date: '2024-04-06',
    cost: '$38.90',
  },
]

export const TRACKING_EVENTS = {
  'SPX-20240001': [
    { date: 'Mar 10, 2024 – 09:15 AM', event: 'Package received at Houston warehouse', location: 'Houston, TX', status: 'done' },
    { date: 'Mar 11, 2024 – 02:30 PM', event: 'Processing and customs documentation', location: 'Houston, TX', status: 'done' },
    { date: 'Mar 12, 2024 – 11:00 PM', event: 'Departed Houston International Airport', location: 'Houston, TX', status: 'done' },
    { date: 'Mar 14, 2024 – 08:45 AM', event: 'Arrived at Riyadh customs', location: 'Riyadh, SA', status: 'done' },
    { date: 'Mar 15, 2024 – 03:20 PM', event: 'Delivered to recipient', location: 'Riyadh, SA', status: 'done' },
  ],
  'SPX-20240002': [
    { date: 'Mar 24, 2024 – 10:00 AM', event: 'Package received at Houston warehouse', location: 'Houston, TX', status: 'done' },
    { date: 'Mar 25, 2024 – 01:15 PM', event: 'Processing and customs documentation', location: 'Houston, TX', status: 'done' },
    { date: 'Mar 28, 2024 – 09:30 PM', event: 'In transit – airborne', location: 'International', status: 'active' },
    { date: 'Est. Apr 1, 2024', event: 'Expected arrival at destination', location: 'Kuwait City, KW', status: 'pending' },
    { date: 'Est. Apr 2, 2024', event: 'Out for delivery', location: 'Kuwait City, KW', status: 'pending' },
  ],
  'SPX-20240003': [
    { date: 'Apr 1, 2024 – 11:30 AM', event: 'Package received at Houston warehouse', location: 'Houston, TX', status: 'done' },
    { date: 'Apr 1, 2024 – 04:00 PM', event: 'Under processing', location: 'Houston, TX', status: 'active' },
    { date: 'Est. Apr 4, 2024', event: 'Scheduled departure', location: 'Houston, TX', status: 'pending' },
    { date: 'Est. Apr 7, 2024', event: 'Arrival in UAE', location: 'Dubai, AE', status: 'pending' },
    { date: 'Est. Apr 8, 2024', event: 'Out for delivery', location: 'Dubai, AE', status: 'pending' },
  ],
}

export const DASHBOARD_STATS = {
  total:      12,
  inTransit:  3,
  delivered:  8,
  pending:    1,
}
