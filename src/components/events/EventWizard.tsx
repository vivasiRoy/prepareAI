'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Upload, Brain, Target, ChevronRight, ChevronLeft, Loader2, Briefcase, BookOpen, Award, Mic, Users, DollarSign, Scale, GraduationCap, MoreHorizontal, Link2, FileText, X, Sparkles, Youtube } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const eventTypes = [
  { id: 'SOFTWARE_INTERVIEW', label: 'Software Interview', icon: Briefcase, color: 'text-purple-400' },
  { id: 'JOB_INTERVIEW', label: 'Job Interview', icon: Users, color: 'text-blue-400' },
  { id: 'ACADEMIC_EXAM', label: 'Academic Exam', icon: BookOpen, color: 'text-yellow-400' },
  { id: 'CERTIFICATION_EXAM', label: 'Certification', icon: Award, color: 'text-green-400' },
  { id: 'PRESENTATION', label: 'Presentation', icon: Mic, color: 'text-cyan-400' },
  { id: 'SALES_PITCH', label: 'Sales Pitch', icon: DollarSign, color: 'text-orange-400' },
  { id: 'NEGOTIATION', label: 'Negotiation', icon: Scale, color: 'text-red-400' },
  { id: 'COURT_CASE', label: 'Court Case', icon: GraduationCap, color: 'text-pink-400' },
  { id: 'OTHER', label: 'Other', icon: MoreHorizontal, color: 'text-gray-400' },
]

type PendingMaterial =
  | { kind: 'url'; url: string }
  | { kind: 'text'; name: string; content: string }

const YOUTUBE_RE = /youtube\.com|youtu\.be/

export function EventWizard() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')
  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    goalOutcome: '',
    targetDate: '',
  })
  const router = useRouter()

  // Materials collected during the wizard, attached right after event creation
  const [materials, setMaterials] = useState<PendingMaterial[]>([])
  const [urlInput, setUrlInput] = useState('')
  const [urlError, setUrlError] = useState('')
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesName, setNotesName] = useState('')
  const [notesContent, setNotesContent] = useState('')
  const [suggestions, setSuggestions] = useState<{ name: string; why: string }[]>([])
  const [suggestLoading, setSuggestLoading] = useState(false)

  // Pre-select the event type the visitor chose on the landing page (stored
  // there before signup), so the wizard continues where they left off.
  useEffect(() => {
    try {
      const intent = localStorage.getItem('prepareai.intent')
      if (intent && eventTypes.some(t => t.id === intent)) {
        setForm(f => (f.type ? f : { ...f, type: intent }))
        localStorage.removeItem('prepareai.intent')
      }
    } catch {}
  }, [])

  const steps = [
    { title: 'What are you preparing for?', icon: Target },
    { title: 'Tell us about your event', icon: Calendar },
    { title: 'Boost your plan with materials', icon: Upload },
    { title: 'Your success criteria', icon: Brain },
  ]

  const [error, setError] = useState('')

  const fetchSuggestions = async () => {
    if (suggestions.length || suggestLoading || !form.title || !form.description) return
    setSuggestLoading(true)
    try {
      const res = await fetch('/api/ai/suggest-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: form.type, title: form.title, description: form.description, goalOutcome: form.goalOutcome }),
      })
      const data = await res.json()
      if (Array.isArray(data.data)) setSuggestions(data.data)
    } catch {}
    setSuggestLoading(false)
  }

  const addUrl = () => {
    setUrlError('')
    let url = urlInput.trim()
    if (!url) return
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url
    try { new URL(url) } catch { setUrlError('That doesn’t look like a valid link'); return }
    if (materials.length >= 8) { setUrlError('Maximum 8 materials'); return }
    setMaterials(m => [...m, { kind: 'url', url }])
    setUrlInput('')
  }

  const addNotes = () => {
    if (!notesContent.trim()) return
    if (materials.length >= 8) return
    setMaterials(m => [...m, { kind: 'text', name: notesName.trim() || 'My notes', content: notesContent.slice(0, 50_000) }])
    setNotesName('')
    setNotesContent('')
    setNotesOpen(false)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      setProgressMsg('Creating your event…')
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, targetDate: new Date(form.targetDate).toISOString() }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Failed to create event')
        setLoading(false)
        return
      }

      const eventId = data.data.id

      // Attach materials before curriculum generation so the plan reflects them
      for (let i = 0; i < materials.length; i++) {
        const m = materials[i]
        setProgressMsg(`Reading your materials (${i + 1}/${materials.length})…`)
        try {
          await fetch(`/api/events/${eventId}/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(
              m.kind === 'url'
                ? { type: 'URL', url: m.url }
                : { type: 'TEXT', name: m.name, content: m.content }
            ),
          })
        } catch {
          // A failed material shouldn't block plan creation
        }
      }

      // Generate the curriculum synchronously (serverless-safe). This can take
      // 20-40s as it calls the AI to build the plan and the first lessons.
      setProgressMsg('Designing your day-by-day curriculum…')
      const genRes = await fetch(`/api/events/${eventId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      // Even if generation fails, navigate to the event page — it has a
      // "Generate curriculum" fallback button the user can retry with.
      if (!genRes.ok) {
        console.error('Curriculum generation failed:', await genRes.text())
      }

      router.push(`/events/${eventId}`)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const canNext =
    step === 0 ? !!form.type
    : step === 1 ? !!form.title && !!form.description && !!form.targetDate
    : step === 2 ? true // materials are optional
    : !!form.goalOutcome

  const goNext = () => {
    const next = step + 1
    setStep(next)
    if (next === 2) fetchSuggestions()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all', i < step ? 'bg-purple-600 text-white' : i === step ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-400' : 'bg-white/5 text-gray-600')}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 w-12 sm:w-16 mx-2 ${i < step ? 'bg-purple-600' : 'bg-white/10'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-2xl font-bold text-white mb-2">{steps[0].title}</h2>
            <p className="text-gray-400 mb-6">Select the type of event you are preparing for</p>
            <div className="grid grid-cols-3 gap-3">
              {eventTypes.map(et => (
                <button
                  key={et.id}
                  onClick={() => setForm(f => ({ ...f, type: et.id }))}
                  className={cn('p-4 rounded-xl border flex flex-col items-center gap-2 transition-all', form.type === et.id ? 'border-purple-500/60 bg-purple-500/10' : 'border-white/10 hover:border-white/30 bg-white/2')}
                >
                  <et.icon className={`w-6 h-6 ${et.color}`} />
                  <span className="text-xs text-gray-300 text-center">{et.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-2">{steps[1].title}</h2>
            <div>
              <Label className="text-gray-300 mb-1.5 block">Event Title</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Google Software Engineer Interview" className="bg-navy-800 border-white/20" />
            </div>
            <div>
              <Label className="text-gray-300 mb-1.5 block">Description</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell us more about the event, company, role, or context..." className="bg-navy-800 border-white/20 min-h-[100px]" />
            </div>
            <div>
              <Label className="text-gray-300 mb-1.5 block">Event Date</Label>
              <Input type="date" value={form.targetDate} onChange={e => setForm(f => ({ ...f, targetDate: e.target.value }))} className="bg-navy-800 border-white/20" min={new Date().toISOString().split('T')[0]} />
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-1">{steps[2].title}</h2>
            <p className="text-gray-400 text-sm">
              Optional — add links, YouTube videos, or paste notes and the AI will build your plan around their actual content.
            </p>

            {/* AI suggestions */}
            <div className="p-4 rounded-xl bg-violet-500/[0.06] border border-violet-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white">Recommended for this event</span>
                {suggestLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />}
              </div>
              {suggestions.length > 0 ? (
                <ul className="space-y-2">
                  {suggestions.map((s, i) => (
                    <li key={i} className="text-sm">
                      <span className="text-gray-200 font-medium">{s.name}</span>
                      <span className="text-gray-500"> — {s.why}</span>
                    </li>
                  ))}
                </ul>
              ) : !suggestLoading ? (
                <p className="text-sm text-gray-500">Anything official — syllabi, job posts, briefs — makes your plan dramatically more specific.</p>
              ) : null}
            </div>

            {/* URL input */}
            <div>
              <Label className="text-gray-300 mb-1.5 block">Add a link (article, docs, YouTube…)</Label>
              <div className="flex gap-2">
                <Input
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
                  placeholder="https://…"
                  className="bg-navy-800 border-white/20 flex-1"
                />
                <Button variant="outline" className="border-white/20" onClick={addUrl} type="button">
                  <Link2 className="w-4 h-4 mr-1.5" /> Add
                </Button>
              </div>
              {urlError && <p className="text-red-400 text-xs mt-1.5">{urlError}</p>}
            </div>

            {/* Paste notes */}
            {notesOpen ? (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-3">
                <Input value={notesName} onChange={e => setNotesName(e.target.value)} placeholder="Name (e.g. Lecture notes week 3)" className="bg-navy-800 border-white/20" />
                <Textarea value={notesContent} onChange={e => setNotesContent(e.target.value)} placeholder="Paste your notes, syllabus, job description…" className="bg-navy-800 border-white/20 min-h-[120px]" />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => setNotesOpen(false)} type="button">Cancel</Button>
                  <Button variant="gradient" size="sm" onClick={addNotes} disabled={!notesContent.trim()} type="button">Add notes</Button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setNotesOpen(true)}
                type="button"
                className="w-full p-3 rounded-xl border border-dashed border-white/15 text-gray-400 text-sm hover:border-white/30 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Paste notes or a document instead
              </button>
            )}

            {/* Added materials */}
            {materials.length > 0 && (
              <div className="space-y-2">
                {materials.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    {m.kind === 'url'
                      ? (YOUTUBE_RE.test(m.url) ? <Youtube className="w-4 h-4 text-red-400 shrink-0" /> : <Link2 className="w-4 h-4 text-cyan-400 shrink-0" />)
                      : <FileText className="w-4 h-4 text-emerald-400 shrink-0" />}
                    <span className="text-sm text-gray-300 truncate flex-1">{m.kind === 'url' ? m.url : m.name}</span>
                    <button onClick={() => setMaterials(list => list.filter((_, j) => j !== i))} className="text-gray-600 hover:text-red-400 transition-colors" type="button">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <h2 className="text-2xl font-bold text-white mb-2">{steps[3].title}</h2>
            <p className="text-gray-400">What does success look like for you?</p>
            <div>
              <Label className="text-gray-300 mb-1.5 block">Goal Outcome</Label>
              <Textarea value={form.goalOutcome} onChange={e => setForm(f => ({ ...f, goalOutcome: e.target.value }))} placeholder="e.g., Land a senior software engineer offer with a $200k+ package at a top tech company" className="bg-navy-800 border-white/20 min-h-[120px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-6 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="mt-6 p-4 rounded-xl bg-violet-500/[0.07] border border-violet-500/20 text-center">
          <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin text-violet-400" />
          <p className="text-sm text-white font-medium">{progressMsg || 'Building your personalised plan…'}</p>
          <p className="text-xs text-gray-400 mt-1">The AI is designing your curriculum and first lessons. This can take up to a minute — please don&apos;t close this page.</p>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0 || loading} className="border-white/20">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button variant="gradient" onClick={goNext} disabled={!canNext}>
            {step === 2 && materials.length === 0 ? 'Skip for now' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button variant="gradient" onClick={handleSubmit} disabled={!canNext || loading}>
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating Plan...</> : <><Brain className="w-4 h-4 mr-2" /> Create My Plan</>}
          </Button>
        )}
      </div>
    </div>
  )
}
