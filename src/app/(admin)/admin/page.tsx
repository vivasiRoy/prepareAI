import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { StatsCard } from '@/components/admin/StatsCard'
import { Users, Activity, DollarSign, Cpu } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AdminDashboard() {
  try { await requireAdmin() } catch { redirect('/dashboard') }

  const monthAgo = new Date(Date.now() - 30 * 86400000)
  const today = new Date(); today.setHours(0, 0, 0, 0)

  const [totalUsers, newToday, activeEvents, llmCostMonth, recentUsers, topEventTypes] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.event.count({ where: { status: 'ACTIVE' } }),
    prisma.lLMUsageLog.aggregate({ where: { createdAt: { gte: monthAgo } }, _sum: { costUsd: true } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, email: true, plan: true, createdAt: true } }),
    prisma.event.groupBy({ by: ['type'], _count: true, orderBy: { _count: { type: 'desc' } }, take: 5 }),
  ])

  const monthlyCost = llmCostMonth._sum.costUsd || 0

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Overview</h1>
        <p className="text-gray-400 mt-1">System health and key metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Users" value={totalUsers} icon={<Users className="w-5 h-5" />} variant="default" />
        <StatsCard title="New Today" value={newToday} icon={<Activity className="w-5 h-5" />} variant="success" />
        <StatsCard title="Active Events" value={activeEvents} icon={<Activity className="w-5 h-5" />} variant="default" />
        <StatsCard title="LLM Cost (30d)" value={`$${monthlyCost.toFixed(2)}`} icon={<Cpu className="w-5 h-5" />} variant="warning" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-navy-800 border-white/10">
          <CardHeader><CardTitle className="text-white text-lg">Recent Signups</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map(u => (
                <div key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{u.name || 'Anonymous'}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-gray-400">{u.plan}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-white/10">
          <CardHeader><CardTitle className="text-white text-lg">Top Event Types</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEventTypes.map(e => (
                <div key={e.type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">{e.type.replace('_', ' ')}</span>
                  <span className="text-sm font-bold text-purple-400">{e._count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
