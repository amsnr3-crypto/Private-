# Speedy Texas — MVP Web Platform

**Your Shortcut from America to the Gulf**

A full-featured MVP frontend application for Speedy Texas, a USA → Gulf shipping platform.

---

## Getting Started

### Prerequisites
- Node.js v18+ installed
- npm v9+ (comes with Node)

### Install & Run

```bash
# 1. Navigate to the project folder
cd speedy-texas-website

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open your browser at: **http://localhost:5173**

### Build for Production

```bash
npm run build    # builds to /dist folder
npm run preview  # preview the production build
```

---

## Pages & Routes

| Route           | Page                   | Description                                  |
|-----------------|------------------------|----------------------------------------------|
| `/`             | Landing Page           | Hero, services, how it works, trust, contact |
| `/login`        | Login                  | Email/password login                         |
| `/signup`       | Sign Up                | 2-step registration form                     |
| `/dashboard`    | Customer Dashboard     | Shipment stats, recent shipments, actions    |
| `/new-shipment` | New Shipment Request   | 3-step form: sender → package → review       |
| `/tracking`     | Tracking               | Track by ID with timeline                    |
| `/calculator`   | Shipping Calculator    | Rate calculator with breakdown               |

---

## Project Structure

```
speedy-texas-website/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Smart navbar (landing vs app mode)
│   │   ├── Navbar.css
│   │   ├── Footer.jsx
│   │   └── Footer.css
│   ├── pages/
│   │   ├── Landing.jsx         # Full landing page
│   │   ├── Landing.css
│   │   ├── Login.jsx           # Login form
│   │   ├── SignUp.jsx          # 2-step registration
│   │   ├── Auth.css            # Shared auth styles
│   │   ├── Dashboard.jsx       # Customer dashboard
│   │   ├── Dashboard.css
│   │   ├── NewShipment.jsx     # 3-step shipment request
│   │   ├── NewShipment.css
│   │   ├── Tracking.jsx        # Shipment tracker
│   │   ├── Tracking.css
│   │   ├── Calculator.jsx      # Rate calculator
│   │   └── Calculator.css
│   ├── data/
│   │   └── mockData.js         # All sample/mock data
│   ├── App.jsx                 # Root router
│   ├── main.jsx                # React entry point
│   └── index.css               # Global CSS variables & utilities
├── index.html
├── vite.config.js
└── package.json
```

---

## Tech Stack

- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Vite** — Build tool & dev server
- **Custom CSS** — No external UI framework, fully custom premium design

---

## Mock Data

All data is mocked in `src/data/mockData.js`. When connecting a real backend, replace these with API calls:

- `DESTINATIONS` — Gulf country codes, names, flags, shipping rates
- `MOCK_SHIPMENTS` — Sample shipment records
- `TRACKING_EVENTS` — Per-shipment timeline events
- `DASHBOARD_STATS` — Summary counts for the dashboard

---

## Demo Tracking Numbers

Use these on the `/tracking` page:
- `SPX-20240001` — Delivered ✅
- `SPX-20240002` — In Transit ✈️
- `SPX-20240003` — Processing ⚙️

---

## Next Steps (Backend Integration)

- [ ] Connect to a Node.js / Supabase backend
- [ ] Implement real authentication (JWT or Supabase Auth)
- [ ] Real shipment database with CRUD API
- [ ] WhatsApp notifications via Twilio or WhatsApp Business API
- [ ] Payment gateway (Stripe or HyperPay for Gulf)
- [ ] Real shipping rate API (DHL, FedEx)
- [ ] Admin dashboard for the Speedy Texas team

---

*Built for Speedy Texas — speedy-tx.com*
