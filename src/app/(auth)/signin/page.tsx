'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Loader2, Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('credentials')
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(null)
    } else {
      router.push(callbackUrl)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Glow behind card */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl" />

      <div className="relative glass-heavy rounded-2xl p-8 border border-white/10">
        {/* Logo mark */}
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-brand">
            <Zap className="w-6 h-6 text-white" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-1.5">Welcome back</h1>
          <p className="text-gray-400 text-sm">Sign in to continue your preparation</p>
        </div>

        {searchParams.get('error') && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            Authentication failed. Please try again.
          </div>
        )}

        <form onSubmit={handleCredentials} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-300 text-sm mb-2 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="pl-10 bg-white/[0.04] border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.06] transition-colors"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="password" className="text-gray-300 text-sm mb-2 block">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pr-10 bg-white/[0.04] border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.06] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" variant="gradient" size="lg" className="w-full mt-2" disabled={!!loading}>
            {loading === 'credentials' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Continue
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{' '}
          <a href="/signup" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Create a free account
          </a>
        </p>
      </div>
    </motion.div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md h-96 glass-heavy rounded-2xl animate-pulse" />}>
      <SignInForm />
    </Suspense>
  )
}
