'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, X, Sparkles, Bot, Mic, MicOff, Volume2, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useSession } from 'next-auth/react'
import { useSpeech, useSpeechInput } from '@/hooks/use-speech'
import { useLanguage } from '@/components/shared/LanguageProvider'

interface Message { role: 'user' | 'assistant'; content: string }

interface AIChatSidebarProps {
  eventId?: string
  lessonId?: string
  suggestedQuestions?: string[]
}

export function AIChatSidebar({ eventId, lessonId, suggestedQuestions = [] }: AIChatSidebarProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I\'m your AI tutor. Ask me anything about your current lesson or event preparation.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [voiceMode, setVoiceMode] = useState(false)
  const { data: session } = useSession()
  const { lang } = useLanguage()
  const tts = useSpeech(lang)
  const stt = useSpeechInput(lang, (text) => {
    // Dictated speech goes straight to the tutor
    sendMessage(text)
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const userMsg: Message = { role: 'user', content }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(m => [...m, assistantMsg])

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          eventId,
          lessonId,
        }),
      })

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        accumulated += chunk
        setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: accumulated } : msg))
      }
      // In voice mode, speak the tutor's reply aloud
      if (voiceMode && accumulated) tts.speak(accumulated)
    } catch (err) {
      setMessages(m => m.map((msg, i) => i === m.length - 1 ? { ...msg, content: 'Sorry, I encountered an error. Please try again.' } : msg))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-110 transition-transform"
      >
        {open ? <X className="w-6 h-6 text-white" /> : <MessageSquare className="w-6 h-6 text-white" />}
      </button>

      {/* Sidebar */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-96 bg-navy-900 border-l border-white/10 z-40 flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white text-sm">AI Tutor</p>
                <p className="text-xs text-gray-400">Powered by Claude</p>
              </div>
              {tts.supported && (
                <button
                  onClick={() => {
                    if (tts.speaking) tts.stop()
                    setVoiceMode(v => !v)
                  }}
                  title={voiceMode ? 'Voice replies on — click to mute' : 'Read replies aloud'}
                  className={`p-2 rounded-lg border transition-all ${voiceMode ? 'border-violet-500/50 text-violet-300 bg-violet-500/10' : 'border-white/10 text-gray-500 hover:text-white'}`}
                >
                  {tts.speaking ? <Square className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && (
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="bg-purple-600 text-white text-xs"><Bot className="w-3 h-3" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[280px] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-sm' : 'bg-white/5 text-gray-200 rounded-tl-sm'
                  }`}>
                    {msg.content || (loading && i === messages.length - 1 ? <span className="animate-pulse">...</span> : '')}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested questions */}
            {suggestedQuestions.length > 0 && messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="space-y-1">
                  {suggestedQuestions.slice(0, 3).map(q => (
                    <button key={q} onClick={() => sendMessage(q)} className="w-full text-left text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) } }}
                  placeholder={stt.listening ? 'Listening…' : 'Ask your AI tutor...'}
                  className="min-h-0 h-10 resize-none bg-white/5 border-white/20 text-sm"
                  rows={1}
                />
                {stt.supported && (
                  <Button
                    size="icon"
                    variant="outline"
                    className={stt.listening ? 'border-red-500/60 text-red-400 animate-pulse' : 'border-white/20'}
                    onClick={() => {
                      if (stt.listening) { stt.stop() } else { setVoiceMode(true); stt.start() }
                    }}
                    title={stt.listening ? 'Stop listening' : 'Speak to your tutor'}
                  >
                    {stt.listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                <Button size="icon" variant="gradient" onClick={() => sendMessage(input)} disabled={!input.trim() || loading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
