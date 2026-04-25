import Stripe from 'stripe'

export default async function handler(req, res) {
  // CORS headers for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const key = (process.env.STRIPE_SECRET_KEY || '').trim()
  console.log('STRIPE_SECRET_KEY present:', !!key, '| prefix:', key.slice(0, 7))

  if (!key || !key.startsWith('sk_')) {
    return res.status(500).json({ error: 'Stripe secret key is missing or malformed.' })
  }

  // Initialise inside handler so env var is read at runtime, not module load time
  const stripe = new Stripe(key, { apiVersion: '2023-10-16' })

  const { destinationName, finalPriceUsd } = req.body || {}

  if (!finalPriceUsd || isNaN(Number(finalPriceUsd))) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  const amountCents = Math.round(Number(finalPriceUsd) * 100)
  const origin = (req.headers.origin || `https://${req.headers.host}`).replace(/\/$/, '')

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `Shipping to ${destinationName || 'destination'}`,
              description: 'Speedy Texas international air freight',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/success`,
      cancel_url:  `${origin}/calculator`,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
