'use client'
import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Github, Mail, Loader2, Eye, EyeOff, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(provider)
    await signIn(provider, { callbackUrl })
  }

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

        {/* OAuth buttons */}
        <div className="space-y-2.5 mb-6">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('google')}
            disabled={!!loading}
          >
            {loading === 'google' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <svg className="w-4 h-4 mr-2 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/>
                <path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/>
                <path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/>
                <path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/>
              </svg>
            )}
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleOAuth('github')}
            disabled={!!loading}
          >
            {loading === 'github' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
            Continue with GitHub
          </Button>
        </div>

        <div className="relative mb-6">
          <Separator className="bg-white/[0.07]" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#11111c] px-3 text-xs text-gray-500">
            or continue with email
          </span>
        </div>

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
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          No account? Just sign in — we&apos;ll create one for you.
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
