import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-violet-600 text-white hover:bg-violet-500 shadow-brand hover:shadow-brand-lg',
        destructive:
          'bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 hover:border-red-500/50',
        outline:
          'border border-white/10 bg-white/[0.03] text-gray-300 hover:bg-white/[0.07] hover:border-white/20 hover:text-white',
        secondary:
          'bg-white/[0.06] text-gray-200 hover:bg-white/[0.10] border border-white/[0.06]',
        ghost:
          'text-gray-400 hover:bg-white/[0.06] hover:text-white',
        link:
          'text-violet-400 underline-offset-4 hover:underline hover:text-violet-300 p-0 h-auto',
        gradient:
          'bg-gradient-to-r from-violet-600 via-violet-500 to-cyan-500 text-white hover:from-violet-500 hover:via-violet-400 hover:to-cyan-400 shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5',
        'gradient-gold':
          'bg-gradient-gold text-white hover:opacity-90 shadow-glow-gold',
        glow:
          'bg-violet-600/20 border border-violet-500/40 text-violet-300 hover:bg-violet-600/30 hover:border-violet-500/60 hover:text-violet-200 shadow-glow-sm',
        danger:
          'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.4)]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs:  'h-7 rounded-md px-2.5 text-xs',
        sm:  'h-9 rounded-md px-3',
        lg:  'h-11 rounded-xl px-6 text-base',
        xl:  'h-13 rounded-xl px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8 rounded-md',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
