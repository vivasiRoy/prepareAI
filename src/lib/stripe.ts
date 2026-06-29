import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import type { User, Plan } from '@prisma/client'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-09-30.acacia',
})

export async function getOrCreateCustomer(user: User): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId

  const customer = await stripe.customers.create({
    email: user.email!,
    name: user.name || undefined,
    metadata: { userId: user.id },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  })

  return customer.id
}

export async function createCheckoutSession(
  user: User,
  plan: 'PRO' | 'ENTERPRISE',
  successUrl: string,
  cancelUrl: string
): Promise<Stripe.Checkout.Session> {
  const customerId = await getOrCreateCustomer(user)
  const priceId = plan === 'PRO' ? process.env.STRIPE_PRO_PRICE_ID! : process.env.STRIPE_ENTERPRISE_PRICE_ID!

  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId: user.id, plan },
    subscription_data: { metadata: { userId: user.id, plan } },
  })
}

export async function createPortalSession(customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl })
}

export function getPlanFromPriceId(priceId: string): Plan {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO'
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return 'ENTERPRISE'
  return 'FREE'
}
