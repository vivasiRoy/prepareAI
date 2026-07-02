import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsageChart } from '@/components/admin/UsageChart'
import { Users, Activity, BookOpen, Target } from 'lucide-react'

export default async function AnalyticsPage() {
  try { await requireAdmin() } catch { redirect('/dashboard') }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000)

  const [
    userGrowth,
    eventsByType,
    completionStats,
    dailyActiveStats,
  ] = await Promise.all([
    prisma.user.groupBy({
      by: ['plan'],
      _count: true,
    }),
    prisma.event.groupBy({
      by: ['type'],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { _count: { type: 'desc' } },
    }),
    prisma.lesson.aggregate({
      _count: { completed: true },
      where: { completed: true },
    }),
    prisma.attempt.groupBy({
      by: ['createdAt'],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo } },
    }),
  ])

  const userByPlanData = userGrowth.map(u => ({ label: u.plan, value: u._count }))
  const eventTypeData = eventsByType.map(e => ({ label: e.type.replace(/_/g, ' '), value: e._count }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Platform usage over the last 30 days</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Lessons Completed', value: completionStats._count.completed || 0, icon: BookOpen },
          { label: 'Quiz Attempts', value: dailyActiveStats.reduce((s, d) => s + d._count, 0), icon: Target },
        ].map(stat => (
          <Card key={stat.label} className="bg-navy-800 border-white/10">
            <CardContent className="pt-6">
              <stat.icon className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <UsageChart title="Users by Plan" data={userByPlanData} valueLabel="users" />
        <UsageChart title="Events by Type (30d)" data={eventTypeData} valueLabel="events" />
      </div>
    </div>
  )
}
