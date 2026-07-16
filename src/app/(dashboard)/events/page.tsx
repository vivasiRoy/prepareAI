import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EventCard } from '@/components/dashboard/EventCard'
import { Button } from '@/components/ui/button'
import { Plus, CalendarClock } from 'lucide-react'
import type { EventWithRelations } from '@/types'

export const metadata = { title: 'My Events' }

export default async function EventsPage() {
  const session = await getServerSession()
  if (!session?.user) redirect('/signin')

  const events = await prisma.event.findMany({
    where: { userId: session.user.id },
    include: {
      curriculum: {
        include: {
          lessons: {
            include: {
              attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 },
              quizzes: true,
            },
          },
        },
      },
      goals: true,
      materials: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      metrics: { orderBy: { date: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const active = events.filter(e => e.status === 'ACTIVE' || e.status === 'PAUSED')
  const past = events.filter(e => e.status === 'COMPLETED' || e.status === 'ARCHIVED')

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">My Events</h1>
          <p className="text-gray-400 mt-1">Everything you&apos;re preparing for, in one place</p>
        </div>
        <Link href="/events/new">
          <Button variant="gradient"><Plus className="w-4 h-4 mr-2" /> New Event</Button>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="w-14 h-14 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-brand">
            <CalendarClock className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No events yet</h3>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">
            Create your first event and AI will build a personalized preparation plan around it.
          </p>
          <Link href="/events/new">
            <Button variant="gradient" size="lg"><Plus className="w-4 h-4 mr-2" /> Create Your First Event</Button>
          </Link>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Active</h2>
              <div className="grid md:grid-cols-2 gap-5">
                {active.map(event => (
                  <EventCard key={event.id} event={event as unknown as EventWithRelations} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Completed &amp; Archived</h2>
              <div className="grid md:grid-cols-2 gap-5 opacity-80">
                {past.map(event => (
                  <EventCard key={event.id} event={event as unknown as EventWithRelations} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
