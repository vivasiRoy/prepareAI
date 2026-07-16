'use client'
import { useState } from 'react'
import { Share2, Download, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareReadinessCardProps {
  eventTitle: string
  eventType: string
  readiness: number // 0-100
  daysToGo: number
  userId?: string
}

/**
 * Renders a branded 1200x630 share image on a canvas (client-side, no server
 * cost) and shares/downloads it — users posting their readiness IS the ad.
 */
export function ShareReadinessCard({ eventTitle, eventType, readiness, daysToGo, userId }: ShareReadinessCardProps) {
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const render = async (): Promise<Blob> => {
    const W = 1200, H = 630
    const canvas = document.createElement('canvas')
    canvas.width = W; canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = '#09090f'
    ctx.fillRect(0, 0, W, H)
    const glow1 = ctx.createRadialGradient(W * 0.85, H * 0.1, 0, W * 0.85, H * 0.1, 520)
    glow1.addColorStop(0, 'rgba(124,58,237,0.35)'); glow1.addColorStop(1, 'transparent')
    ctx.fillStyle = glow1; ctx.fillRect(0, 0, W, H)
    const glow2 = ctx.createRadialGradient(W * 0.08, H * 0.95, 0, W * 0.08, H * 0.95, 460)
    glow2.addColorStop(0, 'rgba(34,211,238,0.22)'); glow2.addColorStop(1, 'transparent')
    ctx.fillStyle = glow2; ctx.fillRect(0, 0, W, H)

    // Constellation
    const rand = (() => { let s = 42; return () => (s = (s * 16807) % 2147483647) / 2147483647 })()
    const pts = Array.from({ length: 60 }, () => ({ x: rand() * W, y: rand() * H }))
    ctx.strokeStyle = 'rgba(139,92,246,0.16)'
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
      if (dx * dx + dy * dy < 130 * 130) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke() }
    }
    ctx.fillStyle = 'rgba(167,139,250,0.9)'
    for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, Math.PI * 2); ctx.fill() }

    // Logo mark
    const lg = ctx.createLinearGradient(70, 60, 150, 140)
    lg.addColorStop(0, '#7c3aed'); lg.addColorStop(1, '#22d3ee')
    ctx.fillStyle = lg
    const r = 18, lx = 70, ly = 60, ls = 72
    ctx.beginPath(); (ctx as any).roundRect(lx, ly, ls, ls, r); ctx.fill()
    ctx.fillStyle = 'white'; ctx.font = 'bold 40px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⚡', lx + ls / 2, ly + ls / 2 + 3)
    ctx.textAlign = 'left'
    ctx.font = 'bold 42px system-ui'; ctx.fillStyle = 'white'
    ctx.fillText('PrepareAI', lx + ls + 22, ly + ls / 2 + 2)

    // Readiness ring
    const cx = W - 240, cy = H / 2, radius = 130
    ctx.lineWidth = 22
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke()
    const ringGrad = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy)
    ringGrad.addColorStop(0, '#a78bfa'); ringGrad.addColorStop(1, '#38bdf8')
    ctx.strokeStyle = ringGrad; ctx.lineCap = 'round'
    ctx.beginPath(); ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * Math.max(readiness, 4)) / 100); ctx.stroke()
    ctx.textAlign = 'center'
    ctx.font = 'bold 84px system-ui'; ctx.fillStyle = 'white'
    ctx.fillText(`${Math.round(readiness)}%`, cx, cy - 6)
    ctx.font = '600 24px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.65)'
    ctx.fillText('READY', cx, cy + 48)

    // Copy
    ctx.textAlign = 'left'
    ctx.font = '600 26px system-ui'; ctx.fillStyle = '#a78bfa'
    ctx.fillText(`I'M PREPARING FOR`, 80, 258)
    ctx.font = 'bold 52px system-ui'; ctx.fillStyle = 'white'
    const title = eventTitle.length > 30 ? eventTitle.slice(0, 28) + '…' : eventTitle
    ctx.fillText(title, 78, 316)
    ctx.font = '400 30px system-ui'; ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillText(`${daysToGo > 0 ? `${daysToGo} days to go` : 'Event day!'} · AI-coached, daily`, 80, 372)
    ctx.font = '600 28px system-ui'; ctx.fillStyle = '#38bdf8'
    ctx.fillText('prepareai.co — free personalized plan', 80, 540)

    return new Promise(resolve => canvas.toBlob(b => resolve(b!), 'image/png'))
  }

  const share = async () => {
    setBusy(true)
    try {
      const blob = await render()
      const file = new File([blob], 'prepareai-readiness.png', { type: 'image/png' })
      const refLink = `https://prepareai.co${userId ? `/signup?ref=${userId}` : ''}`
      const text = `${Math.round(readiness)}% ready for my ${eventType.replace(/_/g, ' ').toLowerCase()} — AI is coaching me daily on PrepareAI ⚡ ${refLink}`

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text })
      } else {
        // Fallback: download the image + copy the caption
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'prepareai-readiness.png'; a.click()
        URL.revokeObjectURL(url)
        try { await navigator.clipboard.writeText(text) } catch {}
      }
      setDone(true)
      setTimeout(() => setDone(false), 2500)
    } catch {
      // user cancelled the share sheet — fine
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className="border-white/20" onClick={share} disabled={busy} title="Share your readiness card">
      {busy ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        : done ? <Check className="w-4 h-4 mr-1.5 text-green-400" />
        : <Share2 className="w-4 h-4 mr-1.5" />}
      {done ? 'Saved!' : 'Share'}
    </Button>
  )
}
