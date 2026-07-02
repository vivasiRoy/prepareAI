import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:     'border-violet-500/30 bg-violet-500/15 text-violet-300',
        secondary:   'border-white/10 bg-white/[0.06] text-gray-300',
        destructive: 'border-red-500/30 bg-red-500/15 text-red-400',
        outline:     'border-white/15 text-gray-400',
        success:     'border-emerald-500/30 bg-emerald-500/15 text-emerald-400',
        warning:     'border-amber-500/30 bg-amber-500/15 text-amber-400',
        purple:      'border-violet-500/30 bg-violet-500/15 text-violet-300',
        cyan:        'border-cyan-500/30 bg-cyan-500/15 text-cyan-400',
        gold:        'border-amber-500/30 bg-amber-500/10 text-amber-400',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
