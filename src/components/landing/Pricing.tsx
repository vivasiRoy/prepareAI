'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const plans = [
  {
    id: 'FREE',
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Perfect for trying PrepareAI',
    features: ['1 active event', '10 AI calls per day', 'Basic curriculum generation', 'Flashcards & quizzes', 'Success probability score'],
    missing: ['Document uploads', 'Mock simulations', 'Advanced analytics'],
    cta: 'Get Started Free',
    variant: 'outline' as const,
  },
  {
    id: 'PRO',
    name: 'Pro',
    monthlyPrice: 29,
    yearlyPrice: 23,
    description: 'For serious preparation',
    popular: true,
    features: ['Unlimited events', 'Unlimited AI calls', 'Document uploads', 'Mock simulations & interviews', 'Advanced analytics', 'Priority AI tutor', 'Adaptive difficulty'],
    cta: 'Start Pro',
    variant: 'gradient' as const,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    monthlyPrice: 99,
    yearlyPrice: 79,
    description: 'For teams & organizations',
    features: ['Everything in Pro', 'Team dashboards', 'Custom integrations', 'Admin analytics', 'Dedicated support', 'Custom domain', 'SLA guarantee'],
    cta: 'Contact Sales',
    variant: 'outline' as const,
  },
]

export function Pricing() {
  const [yearly, setYearly] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  const handleCTA = async (planId: string) => {
    if (!session) { router.push('/signup'); return }
    if (planId === 'FREE') { router.push('/dashboard'); return }
    if (planId === 'ENTERPRISE') { window.location.href = 'mailto:royvivasi@gmail.com?subject=PrepareAI Enterprise'; return }
    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan: planId }) })
      const data = await res.json()
      if (data.data?.url) { window.location.href = data.data.url; return }
      router.push('/billing')
    } catch {
      router.push('/billing')
    }
  }

  return (
    <section id="pricing" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-lg mb-8">Start free, upgrade when you need more power</p>
          <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full p-1">
            <button onClick={() => setYearly(false)} className={`px-4 py-1.5 rounded-full text-sm transition-all ${!yearly ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>Monthly</button>
            <button onClick={() => setYearly(true)} className={`px-4 py-1.5 rounded-full text-sm transition-all ${yearly ? 'bg-purple-600 text-white' : 'text-gray-400'}`}>
              Yearly <span className="text-green-400 text-xs ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className={`relative p-8 rounded-2xl border ${plan.popular ? 'border-purple-500/50 bg-purple-500/5' : 'border-white/10 bg-white/2'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-purple-600 to-cyan-500 text-white border-0 px-4">Most Popular</Badge>
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">${yearly ? plan.yearlyPrice : plan.monthlyPrice}</span>
                <span className="text-gray-400 ml-2">/month</span>
                {yearly && plan.yearlyPrice > 0 && <p className="text-green-400 text-sm mt-1">Billed ${plan.yearlyPrice * 12}/year</p>}
              </div>
              <Button variant={plan.variant} className="w-full mb-6" onClick={() => handleCTA(plan.id)}>
                {plan.popular && <Zap className="w-4 h-4 mr-2" />}
                {plan.cta}
              </Button>
              <ul className="space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
