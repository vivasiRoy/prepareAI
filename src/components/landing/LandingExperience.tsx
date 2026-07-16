'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, TrendingUp, CheckCircle2, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NeuralBackground } from './NeuralBackground'

// ─── Personalization data ────────────────────────────────────────────────────

type PersonaKey =
  | 'SOFTWARE_INTERVIEW'
  | 'JOB_INTERVIEW'
  | 'ACADEMIC_EXAM'
  | 'CERTIFICATION_EXAM'
  | 'SALES_PITCH'
  | 'NEGOTIATION'
  | 'PRESENTATION'
  | 'OTHER'

interface PlanItem {
  day: string
  title: string
  kind: string
}

interface Persona {
  key: PersonaKey
  label: string
  emoji: string
  hue: number
  accent: string // tailwind-ish hsl for inline styles
  headline: [string, string] // [plain part, gradient part]
  sub: string
  stats: { value: string; label: string }[]
  plan: PlanItem[]
  ctaLabel: string
  proof: string
}

const PERSONAS: Record<PersonaKey, Persona> = {
  SOFTWARE_INTERVIEW: {
    key: 'SOFTWARE_INTERVIEW',
    label: 'Coding interview',
    emoji: '💻',
    hue: 262,
    accent: 'hsl(262, 85%, 68%)',
    headline: ['Walk in prepared.', 'Walk out with the offer.'],
    sub: 'AI builds your personal interview gauntlet — algorithms, system design, and behavioral rounds calibrated to your target company and how you actually perform.',
    stats: [
      { value: '500+', label: 'DS&A patterns covered' },
      { value: '92%', label: 'feel interview-ready' },
      { value: '4.8★', label: 'avg. mock-round rating' },
    ],
    plan: [
      { day: 'Day 1', title: 'Arrays & hashing — pattern drills', kind: 'Micro-lessons' },
      { day: 'Day 2', title: 'Two pointers + sliding window', kind: 'Quiz + flashcards' },
      { day: 'Day 4', title: 'System design: rate limiter', kind: 'Simulation' },
      { day: 'Day 6', title: 'Full mock interview — L5 bar', kind: 'Mock interview' },
    ],
    ctaLabel: 'Start my interview prep',
    proof: 'Engineers used PrepareAI to land offers at Google, Meta, Stripe, and 200+ other companies.',
  },
  JOB_INTERVIEW: {
    key: 'JOB_INTERVIEW',
    label: 'Job interview',
    emoji: '🧑‍💼',
    hue: 285,
    accent: 'hsl(285, 80%, 68%)',
    headline: ['Every question anticipated.', 'Every answer rehearsed.'],
    sub: 'From "tell me about yourself" to the salary conversation — AI coaches you through the exact interview loop for your role, with mock rounds that push back like a real panel.',
    stats: [
      { value: '3×', label: 'more callbacks reported' },
      { value: '1,200+', label: 'role-specific question banks' },
      { value: '87%', label: 'confidence lift after 1 week' },
    ],
    plan: [
      { day: 'Day 1', title: 'Your story: STAR answers that stick', kind: 'Micro-lessons' },
      { day: 'Day 2', title: 'Role-specific curveball questions', kind: 'Quiz' },
      { day: 'Day 3', title: 'Panel simulation — tough follow-ups', kind: 'Simulation' },
      { day: 'Day 5', title: 'Negotiating the offer', kind: 'Roleplay' },
    ],
    ctaLabel: 'Prep my interview',
    proof: 'Job seekers rate PrepareAI mock panels "indistinguishable from the real thing".',
  },
  ACADEMIC_EXAM: {
    key: 'ACADEMIC_EXAM',
    label: 'Academic exam',
    emoji: '📚',
    hue: 190,
    accent: 'hsl(190, 85%, 60%)',
    headline: ['Stop cramming.', 'Start retaining.'],
    sub: 'A day-by-day study plan built around spaced repetition and your weak topics — the AI tracks what you forget and schedules it back exactly when you need to see it again.',
    stats: [
      { value: '+19%', label: 'avg. score improvement' },
      { value: '2×', label: 'retention vs. re-reading' },
      { value: '50k+', label: 'exams prepared for' },
    ],
    plan: [
      { day: 'Day 1', title: 'Diagnostic — find your weak topics', kind: 'Adaptive quiz' },
      { day: 'Day 2', title: 'Core concepts, broken into micro-lessons', kind: 'Micro-lessons' },
      { day: 'Day 4', title: 'Spaced-repetition flashcard cycle', kind: 'Flashcards' },
      { day: 'Day 7', title: 'Timed mock exam + gap analysis', kind: 'Mock exam' },
    ],
    ctaLabel: 'Build my study plan',
    proof: 'Students preparing for finals, boards, and entrance exams trust PrepareAI to find their blind spots.',
  },
  CERTIFICATION_EXAM: {
    key: 'CERTIFICATION_EXAM',
    label: 'Certification',
    emoji: '🏆',
    hue: 217,
    accent: 'hsl(217, 90%, 65%)',
    headline: ['AWS. PMP. CPA.', 'Pass on the first attempt.'],
    sub: 'Practice questions aligned to the actual exam blueprint, with a success-probability score that tells you honestly whether you would pass if the exam were today.',
    stats: [
      { value: '94%', label: 'first-attempt pass rate' },
      { value: '40+', label: 'certification blueprints' },
      { value: '-35%', label: 'study time wasted' },
    ],
    plan: [
      { day: 'Day 1', title: 'Blueprint mapping — what the exam weighs', kind: 'Micro-lessons' },
      { day: 'Day 3', title: 'Domain drills on your weakest areas', kind: 'Adaptive quiz' },
      { day: 'Day 6', title: 'Full-length timed practice exam', kind: 'Mock exam' },
      { day: 'Day 7', title: 'Readiness verdict + final gaps', kind: 'AI analysis' },
    ],
    ctaLabel: 'Start my cert prep',
    proof: 'Used for AWS, Azure, PMP, CPA, CISSP, Security+, and dozens more.',
  },
  SALES_PITCH: {
    key: 'SALES_PITCH',
    label: 'Sales pitch',
    emoji: '💰',
    hue: 160,
    accent: 'hsl(160, 80%, 55%)',
    headline: ['Handle every objection.', 'Close the deal.'],
    sub: 'Roleplay against an AI prospect that stonewalls, lowballs, and raises the objections your real buyer will — until your pitch is bulletproof.',
    stats: [
      { value: '+28%', label: 'close-rate lift reported' },
      { value: '150+', label: 'objection patterns drilled' },
      { value: '10min', label: 'to your first mock pitch' },
    ],
    plan: [
      { day: 'Day 1', title: 'Pitch structure: problem → proof → ask', kind: 'Micro-lessons' },
      { day: 'Day 2', title: 'Objection drills — price, timing, trust', kind: 'Roleplay' },
      { day: 'Day 3', title: 'Tough-prospect simulation', kind: 'Simulation' },
      { day: 'Day 5', title: 'Full pitch rehearsal + AI scorecard', kind: 'Mock pitch' },
    ],
    ctaLabel: 'Sharpen my pitch',
    proof: 'Sales teams rehearse enterprise deals worth millions inside PrepareAI before the real meeting.',
  },
  NEGOTIATION: {
    key: 'NEGOTIATION',
    label: 'Negotiation',
    emoji: '🤝',
    hue: 38,
    accent: 'hsl(38, 92%, 58%)',
    headline: ['Know your BATNA.', 'Win better terms.'],
    sub: 'AI maps your leverage, anchors, and walk-away points — then plays the counterparty in simulations until you have heard every hardball line before it happens.',
    stats: [
      { value: '$18k', label: 'avg. comp increase (salary negs)' },
      { value: '9/10', label: 'felt in control of the room' },
      { value: '5', label: 'counterparty styles simulated' },
    ],
    plan: [
      { day: 'Day 1', title: 'BATNA analysis & anchoring strategy', kind: 'Micro-lessons' },
      { day: 'Day 2', title: 'Concession planning — give/get map', kind: 'Worksheet' },
      { day: 'Day 3', title: 'Hardball counterparty simulation', kind: 'Simulation' },
      { day: 'Day 4', title: 'Full negotiation rehearsal', kind: 'Roleplay' },
    ],
    ctaLabel: 'Plan my negotiation',
    proof: 'Used for salary talks, vendor contracts, fundraising terms, and M&A prep.',
  },
  PRESENTATION: {
    key: 'PRESENTATION',
    label: 'Presentation / talk',
    emoji: '🎤',
    hue: 330,
    accent: 'hsl(330, 82%, 65%)',
    headline: ['Own the room', 'before you enter it.'],
    sub: 'Structure your narrative, rehearse delivery, and face an AI audience that asks the hard Q&A — so the real audience never surprises you.',
    stats: [
      { value: '-70%', label: 'stage anxiety reported' },
      { value: '12', label: 'delivery metrics coached' },
      { value: '3', label: 'rehearsals to confidence' },
    ],
    plan: [
      { day: 'Day 1', title: 'Narrative arc — hook, tension, payoff', kind: 'Micro-lessons' },
      { day: 'Day 2', title: 'Slide structure & data storytelling', kind: 'Workshop' },
      { day: 'Day 3', title: 'Hostile Q&A simulation', kind: 'Simulation' },
      { day: 'Day 5', title: 'Full dress rehearsal + AI feedback', kind: 'Rehearsal' },
    ],
    ctaLabel: 'Rehearse my talk',
    proof: 'From board meetings to conference keynotes — speakers rehearse with PrepareAI first.',
  },
  OTHER: {
    key: 'OTHER',
    label: 'Something else',
    emoji: '✨',
    hue: 262,
    accent: 'hsl(262, 85%, 68%)',
    headline: ['Prepare for anything.', 'Win everything.'],
    sub: 'Court dates, medical boards, visa interviews, thesis defenses — describe any high-stakes event and AI builds a preparation plan around it, adapting as you improve.',
    stats: [
      { value: '50+', label: 'event types supported' },
      { value: '10,000+', label: 'professionals prepared' },
      { value: '94%', label: 'success rate' },
    ],
    plan: [
      { day: 'Day 1', title: 'AI maps your event & goal', kind: 'Setup' },
      { day: 'Day 2', title: 'Personalized curriculum generated', kind: 'AI plan' },
      { day: 'Day 3', title: 'Daily adaptive sessions begin', kind: 'Micro-lessons' },
      { day: 'Day 7', title: 'First readiness checkpoint', kind: 'Assessment' },
    ],
    ctaLabel: 'Start preparing free',
    proof: 'Whatever the event, the method is the same: assess, plan, drill, simulate, win.',
  },
}

const PERSONA_ORDER: PersonaKey[] = [
  'SOFTWARE_INTERVIEW',
  'JOB_INTERVIEW',
  'ACADEMIC_EXAM',
  'CERTIFICATION_EXAM',
  'SALES_PITCH',
  'NEGOTIATION',
  'PRESENTATION',
  'OTHER',
]

type Timeframe = 'days' | 'weeks' | 'month' | 'later'

const TIMEFRAMES: { key: Timeframe; label: string; emoji: string }[] = [
  { key: 'days', label: 'Within days — help!', emoji: '🔥' },
  { key: 'weeks', label: '1–2 weeks away', emoji: '⏳' },
  { key: 'month', label: 'About a month out', emoji: '📅' },
  { key: 'later', label: 'Further out — building early', emoji: '🌱' },
]

const URGENCY_COPY: Record<Timeframe, { line: string; planLabel: string }> = {
  days: { line: 'Days away? The plan switches to sprint mode — highest-impact drills only, ruthlessly prioritized.', planLabel: 'Your final-sprint plan' },
  weeks: { line: 'Two weeks is the sweet spot — enough time to fix weak areas and run full simulations twice.', planLabel: 'Your 14-day plan preview' },
  month: { line: 'A month out means we build depth first, then taper into mock runs as the date approaches.', planLabel: 'Your 30-day plan preview' },
  later: { line: 'Starting early is a superpower — spaced repetition works best with runway. You will peak exactly on time.', planLabel: 'Your mastery roadmap' },
}

const KEY_HINTS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

// ─── Component ───────────────────────────────────────────────────────────────

type Step = 'event' | 'when' | 'reveal'

export function LandingExperience() {
  const [step, setStep] = useState<Step>('event')
  const [personaKey, setPersonaKey] = useState<PersonaKey>('OTHER')
  const [timeframe, setTimeframe] = useState<Timeframe>('weeks')
  const persona = PERSONAS[personaKey]
  const urgency = URGENCY_COPY[timeframe]

  const pickPersona = useCallback((key: PersonaKey) => {
    setPersonaKey(key)
    setStep('when')
  }, [])

  const pickTimeframe = useCallback((tf: Timeframe) => {
    setTimeframe(tf)
    setStep('reveal')
  }, [])

  // Typeform-style keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (step === 'event') {
        const idx = KEY_HINTS.indexOf(e.key.toUpperCase())
        if (idx >= 0 && idx < PERSONA_ORDER.length) pickPersona(PERSONA_ORDER[idx])
      } else if (step === 'when') {
        const idx = ['1', '2', '3', '4'].indexOf(e.key)
        if (idx >= 0) pickTimeframe(TIMEFRAMES[idx].key)
        if (e.key === 'Backspace') setStep('event')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, pickPersona, pickTimeframe])

  const signupHref = useMemo(
    () => `/signup?intent=${personaKey}&timeframe=${timeframe}`,
    [personaKey, timeframe]
  )

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-hero">
      {/* Animated 3D particle field — hue follows the visitor's selection */}
      <NeuralBackground hue={persona.hue} className="absolute inset-0 w-full h-full" />

      {/* Soft vignette so text stays readable over the field */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(6,6,13,0.55)_0%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: What are you preparing for? ── */}
          {step === 'event' && (
            <motion.div
              key="event"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/25 text-violet-300 text-sm font-medium mb-8 glow-sm-purple">
                <Sparkles className="w-4 h-4" /> AI-powered preparation, personalized in 10 seconds
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-white mb-4 leading-[1.08]">
                What are you <span className="gradient-text">preparing for</span>?
              </h1>
              <p className="text-gray-400 text-lg mb-12">
                Pick your event — everything that follows is built around it.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
                {PERSONA_ORDER.map((key, i) => {
                  const p = PERSONAS[key]
                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.15 + i * 0.06 }}
                      onClick={() => pickPersona(key)}
                      className="group relative p-5 rounded-2xl glass border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.06] transition-all duration-200 text-left hover:-translate-y-1"
                      style={{ boxShadow: `0 0 0 0 transparent` }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 34px -10px ${p.accent}` }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 0 transparent' }}
                    >
                      <span className="absolute top-3 right-3 text-[10px] font-bold text-gray-600 border border-white/10 rounded px-1.5 py-0.5 group-hover:text-gray-400 transition-colors">
                        {KEY_HINTS[i]}
                      </span>
                      <div className="text-3xl mb-3">{p.emoji}</div>
                      <div className="text-white font-semibold text-sm">{p.label}</div>
                    </motion.button>
                  )
                })}
              </div>

              <p className="text-gray-600 text-xs mt-8">
                Press <span className="text-gray-400 font-semibold">A–H</span> to choose · Your answer personalizes the whole page
              </p>
            </motion.div>
          )}

          {/* ── STEP 2: When is it? ── */}
          {step === 'when' && (
            <motion.div
              key="when"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.45 }}
              className="text-center max-w-2xl mx-auto"
            >
              <div className="text-5xl mb-6">{persona.emoji}</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-[1.08]">
                When is your <span className="gradient-text">{persona.label.toLowerCase()}</span>?
              </h1>
              <p className="text-gray-400 text-lg mb-10">Your timeline shapes the plan — sprint or marathon.</p>

              <div className="flex flex-col gap-3 max-w-md mx-auto">
                {TIMEFRAMES.map((tf, i) => (
                  <motion.button
                    key={tf.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
                    onClick={() => pickTimeframe(tf.key)}
                    className="flex items-center gap-4 p-4 rounded-xl glass border border-white/[0.08] hover:border-white/25 hover:bg-white/[0.06] transition-all duration-200 text-left hover:translate-x-1"
                  >
                    <span className="text-[10px] font-bold text-gray-600 border border-white/10 rounded px-1.5 py-0.5">{i + 1}</span>
                    <span className="text-2xl">{tf.emoji}</span>
                    <span className="text-white font-medium">{tf.label}</span>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => setStep('event')}
                className="inline-flex items-center gap-1.5 text-gray-500 hover:text-white text-sm mt-8 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
            </motion.div>
          )}

          {/* ── STEP 3: Personalized reveal ── */}
          {step === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.5 }}
            >
              {/* Selection chip */}
              <div className="flex justify-center mb-10">
                <button
                  onClick={() => setStep('event')}
                  className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-white/10 text-sm text-gray-300 hover:border-white/25 transition-all"
                >
                  <span>{persona.emoji}</span>
                  <span className="font-medium text-white">{persona.label}</span>
                  <span className="text-gray-600">·</span>
                  <span>{TIMEFRAMES.find(t => t.key === timeframe)?.label}</span>
                  <RefreshCcw className="w-3.5 h-3.5 text-gray-500 group-hover:text-white group-hover:rotate-180 transition-all duration-300" />
                </button>
              </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: personalized pitch */}
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.08]">
                    <span className="text-white">{persona.headline[0]}</span>
                    <br />
                    <span className="gradient-text">{persona.headline[1]}</span>
                  </h1>
                  <p className="text-lg text-gray-400 mb-4 leading-relaxed">{persona.sub}</p>
                  <p className="text-sm mb-8 leading-relaxed" style={{ color: persona.accent }}>
                    {urgency.line}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                    <Link
                      href={signupHref}
                      onClick={() => {
                        // The event wizard preselects this after signup
                        try { localStorage.setItem('prepareai.intent', personaKey) } catch {}
                      }}
                    >
                      <Button variant="gradient" size="xl" className="group min-w-[230px]">
                        {persona.ctaLabel}
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                    <Link href="#pricing">
                      <Button variant="outline" size="xl" className="min-w-[160px]">See pricing</Button>
                    </Link>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-gray-500 mb-6">
                    {persona.stats.map(s => (
                      <div key={s.label} className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" style={{ color: persona.accent }} />
                        <span><strong className="text-white">{s.value}</strong> {s.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">{persona.proof} · No credit card required.</p>
                </div>

                {/* Right: live plan preview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative"
                >
                  <div
                    className="pointer-events-none absolute -inset-6 rounded-3xl blur-3xl opacity-25"
                    style={{ background: `radial-gradient(ellipse at center, ${persona.accent}, transparent 70%)` }}
                  />
                  <div className="relative glass-heavy rounded-2xl border border-white/10 p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="text-white font-semibold text-sm">{urgency.planLabel}</h3>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full"
                        style={{ color: persona.accent, background: `${persona.accent.replace(')', ', 0.12)').replace('hsl', 'hsla')}` }}
                      >
                        AI-generated
                      </span>
                    </div>

                    <div className="space-y-3 mb-6">
                      {persona.plan.map((item, i) => (
                        <motion.div
                          key={`${personaKey}-${item.day}`}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, delay: 0.35 + i * 0.12 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                        >
                          <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: persona.accent }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-sm font-medium truncate">{item.title}</p>
                            <p className="text-gray-500 text-xs">{item.day} · {item.kind}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Success probability meter */}
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-gray-400">Projected readiness on event day</span>
                        <span className="font-bold" style={{ color: persona.accent }}>91%</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          key={`${personaKey}-${timeframe}-meter`}
                          initial={{ width: '8%' }}
                          animate={{ width: '91%' }}
                          transition={{ duration: 1.4, delay: 0.8, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${persona.accent}, hsl(${persona.hue + 40}, 85%, 65%))` }}
                        />
                      </div>
                      <p className="text-gray-600 text-[11px] mt-2">Updates in real time as you complete sessions</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Quick-switch pills: the "dynamic content" showcase */}
              <div className="flex flex-wrap justify-center gap-2 mt-14">
                {PERSONA_ORDER.filter(k => k !== personaKey).map(key => (
                  <button
                    key={key}
                    onClick={() => setPersonaKey(key)}
                    className="px-3.5 py-1.5 rounded-full glass border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-white/25 transition-all"
                  >
                    {PERSONAS[key].emoji} {PERSONAS[key].label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}
