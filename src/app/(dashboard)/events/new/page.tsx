import { EventWizard } from '@/components/events/EventWizard'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export const metadata = { title: 'Create New Event' }

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="text-gray-400 mt-1">Tell us about what you&apos;re preparing for</p>
      </div>
      <EventWizard />
    </div>
  )
}
