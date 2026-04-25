import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { destinationName, finalPriceUsd } = req.body

  if (!finalPriceUsd || isNaN(Number(finalPriceUsd))) {
    return res.status(400).json({ error: 'Invalid price' })
  }

  const amountCents = Math.round(Number(finalPriceUsd) * 100)
  const origin = req.headers.origin || `https://${req.headers.host}`

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'usd',
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
