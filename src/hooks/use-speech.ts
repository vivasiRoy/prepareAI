'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

const LANG_TO_BCP47: Record<string, string> = {
  en: 'en-US', es: 'es-ES', fr: 'fr-FR', de: 'de-DE',
  pt: 'pt-BR', hi: 'hi-IN', ar: 'ar-SA', zh: 'zh-CN',
}

/** Text-to-speech via the Web Speech API — reads lessons and chat replies aloud. */
export function useSpeech(langCode: string = 'en') {
  const [speaking, setSpeaking] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window)
    return () => { try { window.speechSynthesis?.cancel() } catch {} }
  }, [])

  const stop = useCallback(() => {
    try { window.speechSynthesis.cancel() } catch {}
    setSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window) || !text.trim()) return
    window.speechSynthesis.cancel()
    // Chunk long text — some engines silently drop very long utterances
    const chunks = text.match(/[^.!?\n]+[.!?\n]*/g) || [text]
    const lang = LANG_TO_BCP47[langCode] || 'en-US'
    let remaining = chunks.length
    setSpeaking(true)
    for (const chunk of chunks) {
      const u = new SpeechSynthesisUtterance(chunk.trim())
      u.lang = lang
      u.rate = 1.0
      u.onend = () => { remaining -= 1; if (remaining <= 0) setSpeaking(false) }
      u.onerror = () => { remaining -= 1; if (remaining <= 0) setSpeaking(false) }
      window.speechSynthesis.speak(u)
    }
  }, [langCode])

  return { speak, stop, speaking, supported }
}

/** Speech-to-text (dictation) via the Web Speech API — voice input anywhere. */
export function useSpeechInput(langCode: string = 'en', onResult?: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recRef = useRef<any>(null)
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult

  useEffect(() => {
    const SR = typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    setSupported(!!SR)
    return () => { try { recRef.current?.abort() } catch {} }
  }, [])

  const start = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    try { recRef.current?.abort() } catch {}
    const rec = new SR()
    rec.lang = LANG_TO_BCP47[langCode] || 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (e: any) => {
      const text = Array.from(e.results).map((r: any) => r[0].transcript).join(' ')
      if (text) onResultRef.current?.(text)
    }
    rec.onend = () => setListening(false)
    rec.onerror = () => setListening(false)
    recRef.current = rec
    setListening(true)
    rec.start()
  }, [langCode])

  const stop = useCallback(() => {
    try { recRef.current?.stop() } catch {}
    setListening(false)
  }, [])

  return { start, stop, listening, supported }
}
