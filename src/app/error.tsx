'use client'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[App Error]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
      <div className="text-center px-4 max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
        <p className="text-gray-400 mb-8 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <Button variant="gradient" onClick={reset}>
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    </div>
  )
}
