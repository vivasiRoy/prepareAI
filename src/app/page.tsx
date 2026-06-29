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
    <div className="min-h-screen bg-[#0F172A]">
      <Navbar />
      <Hero />

      {/* Use cases */}
      <section id="use-cases" className="py-24 px-4 bg-gradient-to-b from-transparent to-purple-900/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Built for Every High-Stakes Event</h2>
            <p className="text-gray-400 text-lg">Whatever you're preparing for, PrepareAI has you covered</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div key={uc.type} className="glass-card rounded-xl p-6 hover:border-purple-500/30 transition-all group cursor-default">
                <div className="text-4xl mb-4">{uc.emoji}</div>
                <h3 className="text-lg font-semibold text-white mb-1">{uc.type}</h3>
                <p className="text-purple-400 text-sm font-medium mb-3">{uc.outcome}</p>
                <p className="text-gray-400 text-sm">{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Features />

      {/* Demo section */}
      <section id="demo" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">How It Works</h2>
            <p className="text-gray-400 text-lg">From event definition to success — in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Define Your Event', desc: 'Tell PrepareAI what you\'re preparing for, your goal, and your target date.', icon: '🎯' },
              { step: '02', title: 'Get Your Plan', desc: 'AI instantly generates a personalized day-by-day curriculum with adaptive content.', icon: '🧠' },
              { step: '03', title: 'Prepare & Win', desc: 'Complete daily sessions, track your success probability, and walk in confident.', icon: '🏆' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-purple-400 text-sm font-bold tracking-wider mb-2">STEP {item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Pricing />

      {/* CTA section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass-card rounded-2xl p-12 glow-purple">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Ready to Prepare Smarter?</h2>
            <p className="text-gray-400 text-lg mb-8">Join thousands of professionals who use PrepareAI to walk into their most important moments with confidence.</p>
            <Link href="/signin" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-lg hover:from-purple-700 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/30">
              Start Preparing Free <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-gray-500 text-sm mt-4">No credit card required • Free plan forever</p>
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
