'use client'
import { useEffect, useState } from 'react'
import { Gift, Copy, Check, MessageCircle, Linkedin, Twitter } from 'lucide-react'

const SHARE_TEXT = "I'm using PrepareAI to get ready for my next big event — it builds a personalized AI study plan, runs mock exams, and tracks how ready you are. Try it free:"

export function InviteCard({ userId }: { userId: string }) {
  const [copied, setCopied] = useState(false)
  const [referrals, setReferrals] = useState<number | null>(null)
  const [origin, setOrigin] = useState('https://prepareai.co')

  useEffect(() => {
    setOrigin(window.location.origin)
    fetch('/api/users/me')
      .then(r => r.json())
      .then(res => setReferrals(res.data?.referrals ?? 0))
      .catch(() => {})
  }, [])

  const link = `${origin}/signup?ref=${userId}`
  const encodedMsg = encodeURIComponent(`${SHARE_TEXT} ${link}`)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const shareTargets = [
    { label: 'WhatsApp', icon: MessageCircle, href: `https://wa.me/?text=${encodedMsg}`, color: 'hover:border-green-500/40 hover:text-green-400' },
    { label: 'X', icon: Twitter, href: `https://twitter.com/intent/tweet?text=${encodedMsg}`, color: 'hover:border-sky-500/40 hover:text-sky-400' },
    { label: 'LinkedIn', icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`, color: 'hover:border-blue-500/40 hover:text-blue-400' },
  ]

  return (
    <div className="p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/[0.08] to-cyan-500/[0.04] relative overflow-hidden">
      <div className="pointer-events-none absolute -top-10 -right-10 w-40 h-40 bg-violet-600/15 rounded-full blur-3xl" />
      <div className="relative flex flex-col md:flex-row md:items-center gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center shadow-brand">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-semibold">Know someone with a big day coming?</h3>
          </div>
          <p className="text-gray-400 text-sm">
            Share PrepareAI with friends and family — interviews, exams, pitches, anything.
            {referrals !== null && referrals > 0 && (
              <span className="text-violet-300 font-medium"> You&apos;ve brought in {referrals} {referrals === 1 ? 'person' : 'people'} so far 🎉</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copy}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-sm text-gray-200 hover:border-white/25 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy invite link'}
          </button>
          {shareTargets.map(({ label, icon: Icon, href, color }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${label}`}
              className={`p-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-gray-400 transition-all ${color}`}
            >
              <Icon className="w-4 h-4" />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
