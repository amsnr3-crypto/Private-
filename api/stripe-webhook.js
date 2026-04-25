import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// ── CRITICAL: disable Vercel's body parser so we receive the raw bytes ──
export const config = { api: { bodyParser: false } }

// Collect raw body from the readable stream
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

  const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET      || '').trim()
  const supabaseUrl   = (process.env.SUPABASE_URL               || '').trim()
  const serviceKey    = (process.env.SUPABASE_SERVICE_ROLE_KEY  || '').trim()

  if (!process.env.STRIPE_SECRET_KEY || !webhookSecret) {
    console.error('Missing Stripe env vars')
    return res.status(500).json({ error: 'Server misconfigured' })
  }
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing Supabase env vars')
    return res.status(500).json({ error: 'Server misconfigured' })
  }

  const stripe    = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' })
  const supabase  = createClient(supabaseUrl, serviceKey)

  // ── Verify webhook signature ──
  const sig     = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).json({ error: `Webhook error: ${err.message}` })
  }

  // ── Handle event ──
  if (event.type === 'checkout.session.completed') {
    const session  = event.data.object
    const meta     = session.metadata || {}

    const { error } = await supabase.from('shipments').insert({
      status:              'paid',
      payment_status:      'paid',
      customer_name:       meta.customer_name       || null,
      customer_phone:      meta.customer_phone       || null,
      origin_country:      meta.origin_country       || null,
      destination_name:    meta.destination_country  || null,
      chargeable_weight_lbs: meta.chargeable_weight
        ? parseFloat(meta.chargeable_weight) || null
        : null,
      price:               meta.final_price
        ? parseFloat(meta.final_price) || null
        : null,
      stripe_session_id:   session.id,
      created_at:          new Date().toISOString(),
    })

    if (error) {
      console.error('Supabase insert error:', error.message)
      // Return 200 anyway — Stripe retries on non-2xx, causing duplicate inserts
      return res.status(200).json({ received: true, dbError: error.message })
    }

    console.log('Shipment created for session:', session.id)
  }

  return res.status(200).json({ received: true })
}
