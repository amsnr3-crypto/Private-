import Stripe from 'stripe'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  console.log("KEY:", process.env.STRIPE_SECRET_KEY ? "exists" : "missing")

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

  const {
    destinationName  = 'destination',
    finalPriceUsd,
    customerName     = '',
    customerPhone    = '',
    originCountry    = 'United States',
    chargeableWeight = '',
  } = req.body || {}

  const price = Number(finalPriceUsd)
  if (!finalPriceUsd || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  const amountCents = Math.round(price * 100)
  const host   = req.headers.host || ''
  const origin = req.headers.origin || `https://${host}`

  const successUrl = `${origin}/success`
  const cancelUrl  = `${origin}/calculator`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `Shipping to ${destinationName}`,
              description: 'Speedy Texas international air freight',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        customer_name:       String(customerName).slice(0, 500),
        customer_phone:      String(customerPhone).slice(0, 500),
        origin_country:      String(originCountry).slice(0, 500),
        destination_country: String(destinationName).slice(0, 500),
        chargeable_weight:   String(chargeableWeight).slice(0, 500),
        final_price:         String(finalPriceUsd).slice(0, 500),
      },
      success_url: successUrl,
      cancel_url:  cancelUrl,
    })

    return res.status(200).json({ url: session.url })
  } catch (err) {
    console.error('Stripe error:', err.message)
    return res.status(500).json({ error: 'Payment setup error. Please contact support.' })
  }
}
