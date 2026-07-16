import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, Sparkles, Zap } from 'lucide-react'
import { Navbar } from '@/components/shared/Navbar'
import { PREPARE_PAGES, getPreparePage } from '@/lib/prepare-pages'
import { PrepareCTA } from './PrepareCTA'

export function generateStaticParams() {
  return PREPARE_PAGES.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const page = getPreparePage(params.slug)
  if (!page) return {}
  return {
    title: `${page.title} (AI Study Plan)`,
    description: `${page.sub} Free personalized preparation plan from PrepareAI.`,
    alternates: { canonical: `https://prepareai.co/prepare/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.sub,
      url: `https://prepareai.co/prepare/${page.slug}`,
      siteName: 'PrepareAI',
      type: 'website',
    },
  }
}

export default function PrepareSlugPage({ params }: { params: { slug: string } }) {
  const page = getPreparePage(params.slug)
  if (!page) notFound()

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: page.faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-surface-0">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 bg-hero overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-600/[0.14] blur-[120px]" />
        <div className="relative max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-6">{page.emoji}</div>
          <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-4">{page.title}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            {page.headline.split(' ').slice(0, -2).join(' ')}{' '}
            <span className="gradient-text">{page.headline.split(' ').slice(-2).join(' ')}</span>
          </h1>
          <p className="text-lg text-gray-400 mb-9 leading-relaxed max-w-2xl mx-auto">{page.sub}</p>
          <PrepareCTA eventType={page.eventType} label="Build my free plan" />
          <p className="text-gray-600 text-sm mt-4">Free plan · No credit card · Personalized in ~60 seconds</p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-10">Sound familiar?</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {page.pains.map((pain, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02] text-gray-300 text-sm leading-relaxed">
                <span className="text-red-400 font-bold mr-2">✗</span>{pain}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan preview */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-violet-400 text-sm font-semibold tracking-widest uppercase mb-3">Your plan, generated for you</p>
            <h2 className="text-3xl font-bold text-white">What your first week looks like</h2>
          </div>
          <div className="glass-heavy rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-sm">{page.name} — sample plan</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full text-violet-300 bg-violet-500/15">AI-generated</span>
            </div>
            <div className="space-y-3">
              {page.plan.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-violet-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-sm font-medium">{item.item}</p>
                    <p className="text-gray-500 text-xs">{item.day}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-gray-500 text-xs mt-5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              Yours adapts daily to how you actually perform — this is just a taste.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-10">Questions people ask</h2>
          <div className="space-y-4">
            {page.faqs.map((f, i) => (
              <div key={i} className="p-5 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                <h3 className="text-white font-semibold mb-2">{f.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center border-gradient-purple rounded-3xl p-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-brand">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">Your {page.name.toLowerCase()} won&apos;t prepare for itself</h2>
          <p className="text-gray-400 mb-7">Tell the AI your date and goal — it does the planning. You do the winning.</p>
          <PrepareCTA eventType={page.eventType} label="Start preparing free" size="lg" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <Link href="/" className="font-bold gradient-text">PrepareAI</Link>
          <div className="flex flex-wrap gap-4 justify-center">
            {PREPARE_PAGES.filter(p => p.slug !== page.slug).slice(0, 5).map(p => (
              <Link key={p.slug} href={`/prepare/${p.slug}`} className="hover:text-white transition-colors text-xs">
                {p.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-600">© 2026 PrepareAI</p>
        </div>
      </footer>
    </div>
  )
}
