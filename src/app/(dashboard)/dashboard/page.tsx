import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { EventCard } from '@/components/dashboard/EventCard'
import { StatsOverview } from '@/components/dashboard/StatsOverview'
import { Button } from '@/components/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import type { EventWithRelations } from '@/types'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session?.user) redirect('/signin')

  const [events, weeklyAttempts] = await Promise.all([
    prisma.event.findMany({
      where: { userId: session.user.id, status: { in: ['ACTIVE', 'PAUSED'] } },
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
    }),
    prisma.attempt.count({
      where: {
        userId: session.user.id,
        createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
      },
    }),
  ])

  const avgSuccessScore = events.length > 0
    ? events.reduce((sum, e) => sum + (e.successScore || 0), 0) / events.length
    : 0

  const latestMetric = await prisma.performanceMetrics.findFirst({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            {getGreeting()}, {session.user.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-gray-400 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/events/new">
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" /> New Event
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <StatsOverview
        totalEvents={events.length}
        avgSuccessScore={avgSuccessScore}
        currentStreak={latestMetric?.streak || 0}
        weeklyLessons={weeklyAttempts}
      />

      {/* Events */}
      {events.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Ready to start preparing?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Create your first event and let AI build a personalized preparation curriculum for you.
          </p>
          <Link href="/events/new">
            <Button variant="gradient" size="lg">
              <Plus className="w-5 h-5 mr-2" /> Create Your First Event
            </Button>
          </Link>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Active Events</h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map(event => (
              <EventCard key={event.id} event={event as EventWithRelations} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
