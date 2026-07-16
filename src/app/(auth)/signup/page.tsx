'use client'
import { useEffect, useState } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Github, Mail, Loader2, Eye, EyeOff, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [oauthProviders, setOauthProviders] = useState<{ google: boolean; github: boolean }>({ google: false, github: false })
  const router = useRouter()

  const [ref, setRef] = useState<string>('')

  // Only offer OAuth buttons for providers that are actually configured
  useEffect(() => {
    getProviders().then(p => {
      setOauthProviders({ google: !!p?.google, github: !!p?.github })
    }).catch(() => {})
    // Referral attribution — survives navigating away and coming back
    try {
      const params = new URLSearchParams(window.location.search)
      const r = params.get('ref') || localStorage.getItem('prepareai.ref') || ''
      if (r) {
        setRef(r)
        localStorage.setItem('prepareai.ref', r)
      }
    } catch {}
  }, [])

  const handleOAuth = async (provider: 'google' | 'github') => {
    setLoading(provider)
    await signIn(provider, { callbackUrl: '/dashboard' })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading('register')
    setError('')
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, ref: ref || undefined }),
    })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Registration failed')
      setLoading(null)
      return
    }
    try { localStorage.removeItem('prepareai.ref') } catch {}
    await signIn('credentials', { email, password, callbackUrl: '/dashboard' })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
      <div className="glass-card rounded-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm">Start preparing smarter today</p>
        </div>

        {(oauthProviders.google || oauthProviders.github) && (
        <>
        <div className="space-y-3 mb-6">
          {oauthProviders.google && (
          <Button variant="outline" className="w-full border-white/20 hover:bg-white/5" onClick={() => handleOAuth('google')} disabled={!!loading}>
            {loading === 'google' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"/><path fill="#34A853" d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"/><path fill="#4A90E2" d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"/><path fill="#FBBC05" d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"/></svg>
            )}
            Continue with Google
          </Button>
          )}
          {oauthProviders.github && (
          <Button variant="outline" className="w-full border-white/20 hover:bg-white/5" onClick={() => handleOAuth('github')} disabled={!!loading}>
            {loading === 'github' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Github className="w-4 h-4 mr-2" />}
            Continue with GitHub
          </Button>
          )}
        </div>

        <div className="relative mb-6">
          <Separator className="bg-white/10" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0F172A] px-3 text-xs text-gray-500">or</span>
        </div>
        </>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <Label className="text-gray-300 text-sm mb-1.5 block">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="pl-10 bg-white/5 border-white/20" required />
            </div>
          </div>
          <div>
            <Label className="text-gray-300 text-sm mb-1.5 block">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 bg-white/5 border-white/20" required />
            </div>
          </div>
          <div>
            <Label className="text-gray-300 text-sm mb-1.5 block">Password</Label>
            <div className="relative">
              <Input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" className="pr-10 bg-white/5 border-white/20" minLength={8} required />
              <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button type="submit" variant="gradient" className="w-full" disabled={!!loading}>
            {loading === 'register' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/signin" className="text-purple-400 hover:text-purple-300">Sign in</Link>
        </p>
      </div>
    </motion.div>
  )
}
