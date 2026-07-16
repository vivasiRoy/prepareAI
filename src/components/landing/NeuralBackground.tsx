'use client'
import { useEffect, useRef } from 'react'

interface NeuralBackgroundProps {
  /** HSL hue (0-360) the field glows in — transitions smoothly when it changes */
  hue: number
  className?: string
}

/**
 * A 3D particle constellation rendered on canvas: points float in a rotating
 * 3D volume, connected by proximity lines, with mouse-driven parallax. Pure
 * canvas 2D + perspective projection — no WebGL dependency, ~150 particles,
 * cheap enough for any device. Honors prefers-reduced-motion.
 */
export function NeuralBackground({ hue, className }: NeuralBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hueRef = useRef(hue)
  hueRef.current = hue

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let running = true
    let currentHue = hueRef.current
    const mouse = { x: 0, y: 0 } // normalized -1..1

    const N = 150
    const R = 900
    const pts = Array.from({ length: N }, () => ({
      x: (Math.random() - 0.5) * 2 * R,
      y: (Math.random() - 0.5) * 1.2 * R,
      z: (Math.random() - 0.5) * 2 * R,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.12,
      vz: (Math.random() - 0.5) * 0.22,
    }))

    const resize = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = Math.max(1, w * dpr)
      canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const onMouse = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('mousemove', onMouse, { passive: true })

    let angle = 0
    let last = performance.now()
    let smoothRX = 0
    let smoothRY = 0

    const frame = (now: number) => {
      if (!running) return
      const dt = Math.min(now - last, 50)
      last = now
      angle += dt * 0.00004
      currentHue += (hueRef.current - currentHue) * 0.04
      smoothRX += (mouse.y * 0.22 - smoothRX) * 0.05
      smoothRY += (mouse.x * 0.3 - smoothRY) * 0.05

      ctx.clearRect(0, 0, w, h)
      const f = 700
      const cx = w / 2
      const cy = h / 2
      const ry = angle + smoothRY
      const rx = smoothRX
      const cosY = Math.cos(ry)
      const sinY = Math.sin(ry)
      const cosX = Math.cos(rx)
      const sinX = Math.sin(rx)

      const proj: { sx: number; sy: number; s: number }[] = new Array(N)
      for (let i = 0; i < N; i++) {
        const p = pts[i]
        if (!reduced) {
          p.x += p.vx * dt * 0.06
          p.y += p.vy * dt * 0.06
          p.z += p.vz * dt * 0.06
          if (p.x > R) p.x = -R
          else if (p.x < -R) p.x = R
          if (p.y > R * 0.6) p.y = -R * 0.6
          else if (p.y < -R * 0.6) p.y = R * 0.6
          if (p.z > R) p.z = -R
          else if (p.z < -R) p.z = R
        }
        const x1 = p.x * cosY - p.z * sinY
        const z1 = p.x * sinY + p.z * cosY
        const y1 = p.y * cosX - z1 * sinX
        const z2 = p.y * sinX + z1 * cosX
        const s = f / (z2 + R + f)
        proj[i] = { sx: cx + x1 * s, sy: cy + y1 * s, s }
      }

      const maxDist = Math.min(160, w * 0.14)
      const maxDist2 = maxDist * maxDist
      ctx.lineWidth = 1
      for (let i = 0; i < N; i++) {
        const a = proj[i]
        for (let j = i + 1; j < N; j++) {
          const b = proj[j]
          const dx = a.sx - b.sx
          const dy = a.sy - b.sy
          const d2 = dx * dx + dy * dy
          if (d2 < maxDist2) {
            const alpha = (1 - Math.sqrt(d2) / maxDist) * 0.4 * Math.min(a.s, b.s) * 1.5
            ctx.strokeStyle = `hsla(${currentHue}, 85%, 65%, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(a.sx, a.sy)
            ctx.lineTo(b.sx, b.sy)
            ctx.stroke()
          }
        }
      }
      for (let i = 0; i < N; i++) {
        const q = proj[i]
        ctx.fillStyle = `hsla(${currentHue}, 90%, 72%, ${0.2 + q.s * 0.5})`
        ctx.beginPath()
        ctx.arc(q.sx, q.sy, Math.max(0.6, 2.4 * q.s), 0, Math.PI * 2)
        ctx.fill()
      }

      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    const onVis = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else {
        running = true
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener('mousemove', onMouse)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
