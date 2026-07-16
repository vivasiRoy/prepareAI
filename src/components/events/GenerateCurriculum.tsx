'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Sparkles, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function GenerateCurriculum({ eventId }: { eventId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/events/${eventId}/curriculum`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body.error || 'Generation failed. Please try again.')
        setLoading(false)
        return
      }
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="text-center py-14 px-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-brand">
        <Sparkles className="w-7 h-7 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">No curriculum yet</h3>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
        Generate a personalised, day-by-day preparation plan tailored to your event.
        This takes up to a minute while the AI builds your lessons.
      </p>

      {error && (
        <div className="mb-5 max-w-md mx-auto p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2 justify-center">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <Button variant="gradient" size="lg" onClick={generate} disabled={loading}>
        {loading
          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
          : <><Sparkles className="w-4 h-4 mr-2" /> Generate Curriculum</>}
      </Button>

      {loading && (
        <p className="text-xs text-gray-500 mt-4">Please keep this page open…</p>
      )}
    </div>
  )
}
