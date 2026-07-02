'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Calendar, Upload, Brain, Target, ChevronRight, ChevronLeft, Loader2, Briefcase, BookOpen, Award, Mic, Users, DollarSign, Scale, GraduationCap, MoreHorizontal } from 'lucide-react'
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

export function EventWizard() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    type: '',
    title: '',
    description: '',
    goalOutcome: '',
    targetDate: '',
  })
  const router = useRouter()

  const steps = [
    { title: 'What are you preparing for?', icon: Target },
    { title: 'Tell us about your event', icon: Calendar },
    { title: 'Your success criteria', icon: Brain },
  ]

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, targetDate: new Date(form.targetDate).toISOString() }),
      })
      const data = await res.json()
      if (data.success) {
        router.push(`/events/${data.data.id}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const canNext = step === 0 ? !!form.type : step === 1 ? !!form.title && !!form.description && !!form.targetDate : !!form.goalOutcome

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center">
            <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all', i < step ? 'bg-purple-600 text-white' : i === step ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-400' : 'bg-white/5 text-gray-600')}>
              {i < step ? '✓' : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`h-0.5 w-20 mx-2 ${i < step ? 'bg-purple-600' : 'bg-white/10'}`} />}
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
            <h2 className="text-2xl font-bold text-white mb-2">{steps[2].title}</h2>
            <p className="text-gray-400">What does success look like for you?</p>
            <div>
              <Label className="text-gray-300 mb-1.5 block">Goal Outcome</Label>
              <Textarea value={form.goalOutcome} onChange={e => setForm(f => ({ ...f, goalOutcome: e.target.value }))} placeholder="e.g., Land a senior software engineer offer with a $200k+ package at a top tech company" className="bg-navy-800 border-white/20 min-h-[120px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="border-white/20">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        {step < steps.length - 1 ? (
          <Button variant="gradient" onClick={() => setStep(s => s + 1)} disabled={!canNext}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
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
