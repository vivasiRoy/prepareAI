'use client'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, Check, ExternalLink, Zap, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLAN_FEATURES } from '@/types'

const planDetails = {
  FREE: { name: 'Free', price: '$0', color: 'text-gray-400', features: ['1 active event', '10 AI calls/day', 'Basic curriculum'] },
  PRO: { name: 'Pro', price: '$29/mo', color: 'text-purple-400', features: ['Unlimited events', 'Unlimited AI calls', 'Document uploads', 'Mock simulations', 'Advanced analytics'] },
  ENTERPRISE: { name: 'Enterprise', price: '$99/mo', color: 'text-cyan-400', features: ['Everything in Pro', 'Team dashboards', 'Priority support', 'Custom integrations'] },
}

export default function BillingPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState<string | null>(null)
  const currentPlan = session?.user?.plan || 'FREE'
  const details = planDetails[currentPlan]
  const features = PLAN_FEATURES[currentPlan]

  const handleUpgrade = async (plan: 'PRO' | 'ENTERPRISE') => {
    setLoading(plan)
    const res = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    })
    const data = await res.json()
    if (data.data?.url) window.location.href = data.data.url
    setLoading(null)
  }

  const handlePortal = async () => {
    setLoading('portal')
    const res = await fetch('/api/stripe/portal', { method: 'POST' })
    const data = await res.json()
    if (data.data?.url) window.location.href = data.data.url
    setLoading(null)
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Billing</h1>
        <p className="text-gray-400 mt-1">Manage your subscription and usage</p>
      </div>

      {/* Current Plan */}
      <Card className="bg-navy-800 border-white/10">
        <CardHeader><CardTitle className="flex items-center gap-3 text-white"><CreditCard className="w-5 h-5 text-purple-400" /> Current Plan</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl font-bold text-white">{details.name}</span>
                <Badge variant={currentPlan === 'FREE' ? 'outline' : currentPlan === 'PRO' ? 'purple' : 'cyan'}>{currentPlan}</Badge>
              </div>
              <p className={`text-lg font-semibold ${details.color}`}>{details.price}</p>
              <ul className="mt-3 space-y-1.5">
                {details.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <Check className="w-3.5 h-3.5 text-green-400" /> {f}
                  </li>
                ))}
              </ul>
            </div>
            {currentPlan !== 'FREE' && (
              <Button variant="outline" className="border-white/20" onClick={handlePortal} disabled={loading === 'portal'}>
                {loading === 'portal' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                Manage Billing
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <Card className="bg-navy-800 border-white/10">
        <CardHeader><CardTitle className="text-white">Usage This Month</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div><p className="text-gray-400 text-sm mb-1">Active Events</p><p className="text-2xl font-bold text-white">—</p><p className="text-xs text-gray-500">of {features.maxEvents === 9999 ? '∞' : features.maxEvents} max</p></div>
            <div><p className="text-gray-400 text-sm mb-1">AI Calls Today</p><p className="text-2xl font-bold text-white">—</p><p className="text-xs text-gray-500">of {features.dailyAICalls === 9999 ? '∞' : features.dailyAICalls} daily</p></div>
            <div><p className="text-gray-400 text-sm mb-1">Document Uploads</p><p className="text-2xl font-bold text-white">{features.documentUploads ? '✓' : '✗'}</p><p className="text-xs text-gray-500">{features.documentUploads ? 'Enabled' : 'Upgrade to Pro'}</p></div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade options */}
      {currentPlan === 'FREE' && (
        <div className="grid md:grid-cols-2 gap-6">
          {(['PRO', 'ENTERPRISE'] as const).map(plan => (
            <motion.div key={plan} whileHover={{ y: -2 }}>
              <Card className={`bg-navy-800 border-white/10 ${plan === 'PRO' ? 'border-purple-500/30' : ''}`}>
                <CardContent className="p-6">
                  <Badge variant={plan === 'PRO' ? 'purple' : 'cyan'} className="mb-3">{plan}</Badge>
                  <p className="text-2xl font-bold text-white mb-4">{planDetails[plan].price}</p>
                  <ul className="space-y-2 mb-6">
                    {planDetails[plan].features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                        <Check className="w-3.5 h-3.5 text-green-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan === 'PRO' ? 'gradient' : 'outline'}
                    className="w-full"
                    onClick={() => handleUpgrade(plan)}
                    disabled={!!loading}
                  >
                    {loading === plan ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
                    Upgrade to {plan === 'PRO' ? 'Pro' : 'Enterprise'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
