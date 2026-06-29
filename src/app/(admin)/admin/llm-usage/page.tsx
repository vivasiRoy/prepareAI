'use client'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cpu } from 'lucide-react'

export default function LLMUsagePage() {
  const [data, setData] = useState<{ byProvider: any[]; byFeature: any[] } | null>(null)

  useEffect(() => {
    fetch('/api/admin/llm-usage').then(r => r.json()).then(d => setData(d.data))
  }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">LLM Usage & Costs</h1>
        <p className="text-gray-400 mt-1">Token consumption and cost breakdown</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-navy-800 border-white/10">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-400" /> By Provider & Model</CardTitle></CardHeader>
          <CardContent>
            {data?.byProvider?.map((row: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={row.provider === 'anthropic' ? 'purple' : 'cyan'}>{row.provider}</Badge>
                    <span className="text-xs text-gray-400">{row.model}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{row._count} calls</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${(row._sum?.costUsd || 0).toFixed(4)}</p>
                  <p className="text-xs text-gray-500">{((row._sum?.inputTokens || 0) + (row._sum?.outputTokens || 0)).toLocaleString()} tokens</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-navy-800 border-white/10">
          <CardHeader><CardTitle className="text-white">By Feature (30 days)</CardTitle></CardHeader>
          <CardContent>
            {data?.byFeature?.map((row: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-sm text-gray-300">{row.feature}</span>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${(row._sum?.costUsd || 0).toFixed(4)}</p>
                  <p className="text-xs text-gray-500">{row._count} calls</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
