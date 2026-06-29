import { requireAdmin } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Server, Database, Cpu, CheckCircle2, AlertCircle } from 'lucide-react'

async function checkService(name: string, fn: () => Promise<any>) {
  try { await fn(); return { name, status: 'ok' } }
  catch (e) { return { name, status: 'error', error: String(e) } }
}

export default async function SystemPage() {
  try { await requireAdmin() } catch { redirect('/dashboard') }

  const { prisma } = await import('@/lib/prisma')
  const checks = await Promise.allSettled([
    checkService('Database', () => prisma.$queryRaw`SELECT 1`),
    checkService('Auth', async () => true),
  ])

  const services = checks.map((c, i) => c.status === 'fulfilled' ? c.value : { name: ['Database', 'Auth'][i], status: 'error' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">System Health</h1>
        <p className="text-gray-400 mt-1">Service status and infrastructure</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {services.map(svc => (
          <Card key={svc.name} className={`bg-navy-800 ${svc.status === 'ok' ? 'border-green-500/20' : 'border-red-500/20'}`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-white">{svc.name}</span>
                </div>
                {svc.status === 'ok'
                  ? <Badge variant="success" className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OK</Badge>
                  : <Badge variant="destructive" className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Error</Badge>
                }
              </div>
              {'error' in svc && <p className="text-xs text-red-400">{svc.error as string}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-navy-800 border-white/10">
        <CardHeader><CardTitle className="text-white">Environment</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              ['Node Version', process.version],
              ['Environment', process.env.NODE_ENV || 'development'],
              ['Default LLM', process.env.DEFAULT_LLM_PROVIDER || 'anthropic'],
              ['Default Model', process.env.DEFAULT_MODEL || 'claude-sonnet-4-5-20251001'],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-sm text-gray-400">{k}</span>
                <span className="text-sm text-white font-mono">{v}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
