'use client'
import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

interface DataPoint {
  label: string
  value: number
  color?: string
}

interface UsageChartProps {
  title: string
  data: DataPoint[]
  valueLabel?: string
}

export function UsageChart({ title, data, valueLabel = 'calls' }: UsageChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1)

  return (
    <Card className="bg-navy-800 border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-base">
          <TrendingUp className="w-4 h-4 text-purple-400" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 truncate max-w-[60%]">{item.label}</span>
                <span className="text-white font-medium">{item.value.toLocaleString()} {valueLabel}</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(item.value / maxValue) * 100}%`,
                    background: item.color || 'linear-gradient(to right, #7C3AED, #06B6D4)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
