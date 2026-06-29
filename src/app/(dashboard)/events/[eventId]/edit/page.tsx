'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'

const EVENT_TYPES = [
  'SOFTWARE_INTERVIEW', 'ACADEMIC_EXAM', 'CERTIFICATION_EXAM',
  'PRESENTATION', 'JOB_INTERVIEW', 'SALES_PITCH',
  'NEGOTIATION', 'COURT_CASE', 'OTHER',
]

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.eventId as string
  const [event, setEvent] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch(`/api/events/${eventId}`).then(r => r.json()).then(d => setEvent(d.data))
  }, [eventId])

  const handleSave = async () => {
    setSaving(true)
    await fetch(`/api/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: event.title,
        description: event.description,
        targetDate: event.targetDate,
        type: event.type,
        status: event.status,
      }),
    })
    setSaving(false)
    router.push(`/events/${eventId}`)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to archive this event?')) return
    setDeleting(true)
    await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
    router.push('/dashboard')
  }

  if (!event) return <div className="flex justify-center pt-20"><Loader2 className="w-8 h-8 animate-spin text-purple-400" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link href={`/events/${eventId}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Event
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit Event</h1>
      </div>

      <Card className="bg-navy-800 border-white/10">
        <CardHeader><CardTitle className="text-white">Event Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-gray-300 mb-1.5 block">Event Title</Label>
            <Input value={event.title} onChange={e => setEvent({ ...event, title: e.target.value })} className="bg-white/5 border-white/20" />
          </div>
          <div>
            <Label className="text-gray-300 mb-1.5 block">Description</Label>
            <Textarea value={event.description || ''} onChange={e => setEvent({ ...event, description: e.target.value })} className="bg-white/5 border-white/20 min-h-[100px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-300 mb-1.5 block">Event Type</Label>
              <Select value={event.type} onValueChange={val => setEvent({ ...event, type: val })}>
                <SelectTrigger className="bg-white/5 border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-gray-300 mb-1.5 block">Target Date</Label>
              <Input type="date" value={event.targetDate?.split('T')[0] || ''} onChange={e => setEvent({ ...event, targetDate: e.target.value })} className="bg-white/5 border-white/20" />
            </div>
          </div>
          <div>
            <Label className="text-gray-300 mb-1.5 block">Status</Label>
            <Select value={event.status} onValueChange={val => setEvent({ ...event, status: val })}>
              <SelectTrigger className="bg-white/5 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['ACTIVE', 'PAUSED', 'ARCHIVED'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10" onClick={handleDelete} disabled={deleting}>
              {deleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
              Archive Event
            </Button>
            <Button variant="gradient" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
