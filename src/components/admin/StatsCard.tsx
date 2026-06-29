import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

export function StatsCard({ title, value, change, changeLabel, icon, variant = 'default' }: StatsCardProps) {
  const colors = {
    default: 'text-purple-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400',
  }

  const trendColor = change === undefined ? '' : change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-gray-400'
  const TrendIcon = change === undefined ? Minus : change > 0 ? TrendingUp : change < 0 ? TrendingDown : Minus

  return (
    <Card className="bg-navy-800 border-white/10">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {change !== undefined && (
              <div className={cn('flex items-center gap-1 mt-2 text-sm', trendColor)}>
                <TrendIcon className="w-3.5 h-3.5" />
                <span>{Math.abs(change)}% {changeLabel || (change >= 0 ? 'increase' : 'decrease')}</span>
              </div>
            )}
          </div>
          <div className={cn('p-3 rounded-xl bg-white/5', colors[variant])}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
