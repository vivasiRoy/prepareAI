import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import type Stripe from 'stripe'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('[Stripe] Webhook signature failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkoutSession = event.data.object as Stripe.Checkout.Session
        if (checkoutSession.mode !== 'subscription') break

        const userId = checkoutSession.metadata?.userId
        const plan = (checkoutSession.metadata?.plan || 'PRO') as 'PRO' | 'ENTERPRISE'
        if (!userId) break

        const subscription = await getStripe().subscriptions.retrieve(checkoutSession.subscription as string)

        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { plan, stripeCustomerId: checkoutSession.customer as string, stripeSubscriptionId: subscription.id },
          }),
          prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status,
              plan,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              status: subscription.status,
              plan,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          }),
        ])
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        const priceId = sub.items.data[0].price.id
        const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'PRO' : priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID ? 'ENTERPRISE' : 'FREE'

        await prisma.user.update({ where: { id: userId }, data: { plan } }).catch(() => {})
        await prisma.subscription.update({
          where: { stripeSubscriptionId: sub.id },
          data: { status: sub.status, plan, currentPeriodEnd: new Date(sub.current_period_end * 1000), cancelAtPeriodEnd: sub.cancel_at_period_end },
        }).catch(() => {})
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const userId = sub.metadata?.userId
        if (!userId) break

        await prisma.user.update({ where: { id: userId }, data: { plan: 'FREE', stripeSubscriptionId: null } }).catch(() => {})
        await prisma.subscription.update({ where: { stripeSubscriptionId: sub.id }, data: { status: 'canceled', plan: 'FREE' } }).catch(() => {})
        break
      }
    }
  } catch (err) {
    console.error('[Stripe Webhook] Error:', err)
  }

  return NextResponse.json({ received: true })
}
