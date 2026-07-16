'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function PrepareCTA({ eventType, label, size = 'xl' }: { eventType: string; label: string; size?: 'xl' | 'lg' }) {
  return (
    <Link
      href={`/signup?intent=${eventType}`}
      onClick={() => {
        // The event wizard preselects this after signup
        try { localStorage.setItem('prepareai.intent', eventType) } catch {}
      }}
    >
      <Button variant="gradient" size={size} className="group min-w-[220px]">
        {label}
        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </Button>
    </Link>
  )
}
