// phyto_web/src/features/chatbot/ChatBot.tsx
// ─────────────────────────────────────────────────────────────
// HOW TO ADD TO PROJECT:
//   1. Save this file as:  phyto_web/src/features/chatbot/ChatBot.tsx
//   2. In app-layout.tsx, import and add <ChatBot /> at the bottom:
//       import { ChatBot } from '../../features/chatbot/ChatBot'
//       ...
//       <ChatBot />        ← add just before </div>
//   3. Add VITE_ANTHROPIC_API_KEY to phyto_web/.env (optional — 
//      if not set, the backend rule-based fallback is used)
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect, useCallback } from 'react'
import { apiFetch } from '../../lib/api'
import {
  MessageCircle, X, Send, Leaf, Loader2,
  RotateCcw, ChevronDown
} from 'lucide-react'
import clsx from 'clsx'

// ── Types ───────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Namaste! 🌿 I'm Phyto Bot, your plant expert. Ask me anything about:\n• Which plants suit your space\n• Plant care & watering tips\n• Finding plants for pets or low light\n• Troubleshooting plant problems",
  timestamp: new Date(),
}

const QUICK_REPLIES = [
  "Best plants for beginners",
  "Plants safe for pets",
  "Low light indoor plants",
  "How often to water?",
]

// ── ChatBot Component ───────────────────────────────────────
export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const sendMessage = useCallback(async (text?: string) => {
    const userText = (text ?? input).trim()
    if (!userText || loading) return

    const userMsg: Message = {
      role: 'user',
      content: userText,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build history (exclude welcome, keep last 6)
      const history = messages
        .slice(1)
        .slice(-6)
        .map(m => ({ role: m.role, content: m.content }))

      const data = await apiFetch<{ reply: string }>('/chatbot/chat', {
        method: 'POST',
        json: { message: userText, history },
      })

      const botMsg: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, botMsg])

      // Increment unread badge if chat is closed
      if (!open) setUnread(n => n + 1)

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't connect right now. Please try again! 🌱",
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, open])

  // Handle Enter key
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    setMessages([WELCOME])
    setInput('')
  }

  return (
    <>
      {/* ── Floating Button ──────────────────────────── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg',
          'flex items-center justify-center transition-all duration-300',
          'bg-[rgb(var(--phyto-forest))] hover:bg-[rgb(var(--phyto-leaf))]',
          open && 'rotate-0'
        )}
        aria-label="Open plant assistant"
      >
        {open ? (
          <ChevronDown className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6 text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* ── Chat Window ──────────────────────────────── */}
      {open && (
        <div className={clsx(
          'fixed bottom-24 right-6 z-50 w-80 sm:w-96 flex flex-col',
          'rounded-2xl shadow-2xl overflow-hidden',
          'border border-stone-200 bg-white',
          'animate-in slide-in-from-bottom-4 duration-200'
        )}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[rgb(var(--phyto-forest))]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-green-200" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-none">Phyto Bot</p>
                <p className="text-green-300 text-xs mt-0.5">Plant Expert · Always online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={resetChat}
                className="p-1.5 rounded-lg text-green-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Reset chat"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-green-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80 bg-stone-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={clsx(
                  'flex flex-col gap-1',
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div className={clsx(
                  'max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-line',
                  msg.role === 'user'
                    ? 'bg-[rgb(var(--phyto-forest))] text-white rounded-br-sm'
                    : 'bg-white text-stone-800 border border-stone-200 rounded-bl-sm shadow-sm'
                )}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-stone-400 px-1">
                  {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies (show only at start) */}
          {messages.length <= 2 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-stone-50 border-t border-stone-100">
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr}
                  onClick={() => sendMessage(qr)}
                  className={clsx(
                    'text-xs px-2.5 py-1 rounded-full border transition-colors',
                    'border-green-700 text-green-800 bg-green-50',
                    'hover:bg-green-700 hover:text-white'
                  )}
                >
                  {qr}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-stone-200">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about plants..."
              disabled={loading}
              className={clsx(
                'flex-1 text-sm px-3 py-2 rounded-xl border outline-none transition-colors',
                'border-stone-200 focus:border-green-600 focus:ring-1 focus:ring-green-600/20',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className={clsx(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                'bg-[rgb(var(--phyto-forest))] text-white',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'hover:bg-[rgb(var(--phyto-leaf))] active:scale-95'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
