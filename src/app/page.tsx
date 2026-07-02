import { Navbar } from '@/components/shared/Navbar'
import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { Pricing } from '@/components/landing/Pricing'
import { Zap, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const useCases = [
  { type: 'Software Interview', outcome: 'Land FAANG offers', desc: 'DS&A, system design, behavioral — AI-personalized for your target company.', emoji: '💻' },
  { type: 'Bar Exam', outcome: 'Pass first attempt', desc: 'Constitutional law, torts, contracts — spaced repetition and essay practice.', emoji: '⚖️' },
  { type: 'Sales Pitch', outcome: 'Close more deals', desc: 'Objection handling, pitch structure, roleplay with tough prospects.', emoji: '💰' },
  { type: 'Certification', outcome: 'Ace on the first try', desc: 'AWS, PMP, CPA — practice questions aligned to the actual exam blueprint.', emoji: '🏆' },
  { type: 'Negotiation', outcome: 'Win better terms', desc: 'BATNA analysis, anchoring strategy, scenario simulations.', emoji: '🤝' },
  { type: 'Presentation', outcome: 'Command the room', desc: 'Slide structure, delivery rehearsal, Q&A preparation.', emoji: '🎤' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-0">
      <Navbar />
      <Hero />

      {/* Use cases */}
      <section id="use-cases" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">Use Cases</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Built for Every High-Stakes Event</h2>
            <p className="text-gray-400 text-lg">Whatever you&apos;re preparing for, PrepareAI has you covered</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {useCases.map((uc) => (
              <div
                key={uc.type}
                className="group p-6 rounded-xl border border-white/[0.07] bg-white/[0.025] hover:border-violet-500/25 hover:bg-white/[0.04] hover:shadow-[0_0_30px_-8px_rgba(124,58,237,0.25)] transition-all duration-300 cursor-default"
              >
                <div className="text-3xl mb-4">{uc.emoji}</div>
                <h3 className="text-base font-semibold text-white mb-1">{uc.type}</h3>
                <p className="text-violet-400 text-xs font-semibold uppercase tracking-wide mb-3">{uc.outcome}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Features />

      {/* How it works */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">How It Works</p>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">From Zero to Confident in Minutes</h2>
            <p className="text-gray-400 text-lg">No setup required — just describe your event and PrepareAI does the rest</p>
          </div>
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Define Your Event', desc: "Tell PrepareAI what you're preparing for, your goal, and your target date.", emoji: '🎯', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
                { step: '02', title: 'Get Your Plan', desc: 'AI instantly generates a personalized day-by-day curriculum with adaptive content.', emoji: '🧠', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
                { step: '03', title: 'Prepare & Win', desc: 'Complete daily sessions, track your success probability, and walk in confident.', emoji: '🏆', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className={`w-24 h-24 rounded-2xl border ${item.bg} flex items-center justify-center mx-auto mb-5 text-4xl`}>
                    {item.emoji}
                  </div>
                  <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${item.color}`}>Step {item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* CTA section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative border-gradient-purple rounded-3xl p-12 overflow-hidden">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-500/5 rounded-3xl" />
            <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-600/15 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-6 shadow-brand-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">Ready to Prepare Smarter?</h2>
              <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of professionals who use PrepareAI to walk into their most important moments with confidence.
              </p>
              <Link href="/signin" className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-brand text-white font-semibold text-lg shadow-brand-lg hover:opacity-90 hover:-translate-y-0.5 transition-all">
                Start Preparing Free <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="text-gray-600 text-sm mt-5">No credit card required • Free plan forever</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">PrepareAI</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="mailto:royvivasi@gmail.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs text-gray-600">© 2025 PrepareAI. Built with Claude AI.</p>
        </div>
      </footer>
    </div>
  )
}
