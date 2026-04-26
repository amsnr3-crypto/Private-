import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export const config = { api: { bodyParser: false } }

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end',  ()    => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const stripe  = new Stripe(process.env.STRIPE_SECRET_KEY)
  const sig     = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object

    console.log("SESSION:", session.id)
    console.log("EMAIL:",   session.customer_details?.email)
    console.log("AMOUNT:",  session.amount_total)

    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { error } = await supabase.from('orders').upsert(
      {
        stripe_session_id:        session.id,
        stripe_payment_intent_id: session.payment_intent      ?? null,
        customer_email:           session.customer_details?.email ?? null,
        customer_name:            session.customer_details?.name  ?? null,
        amount_total:             session.amount_total != null
                                    ? session.amount_total / 100
                                    : null,
        currency:                 session.currency              ?? null,
        payment_status:           session.payment_status        ?? null,
        order_status:             'paid',
        raw_session:              session,
      },
      { onConflict: 'stripe_session_id' }
    )

    if (error) {
      console.error('Supabase upsert error:', error.message)
    } else {
      console.log('Order saved for session:', session.id)
    }
  }

  return res.status(200).json({ received: true })
}
