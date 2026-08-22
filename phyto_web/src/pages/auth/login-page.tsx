import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { Sprout, Truck, ArrowRight, Eye, EyeOff } from 'lucide-react'
import clsx from 'clsx'

type Tab = 'customer' | 'partners'
type Mode = 'login' | 'register'

export function LoginPage() {
  const nav = useNavigate()
  const { login, register } = useAuth()
  const [tab, setTab] = useState<Tab>('customer')
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const u = await login(email, password)
        if (u.role === 'admin' || u.role === 'nursery') {
          nav('/admin')
        } else if (u.role === 'delivery') {
          nav('/delivery')
        } else {
          nav('/')
        }
      } else {
        await register({ email, password, name })
        nav('/')
      }
    } catch (err: unknown) {
      const e = err as { body?: { detail?: string }; message?: string }
      setError(e.body?.detail || e.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-6">
      <div className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white shadow-card">
        <div className="bg-gradient-to-br from-phyto-sage/60 to-white px-8 pb-2 pt-10 text-center">
          <h1 className="font-display text-3xl font-semibold text-phyto-forest">Welcome to Phyto</h1>
          <p className="mt-2 text-sm text-stone-600">
            {mode === 'login' ? 'Sign in to your account or partner portal.' : 'Create your Phyto account.'}
          </p>
        </div>

        <div className="px-6 pb-2 pt-4">
          <div className="flex rounded-full bg-stone-100 p-1">
            <button
              type="button"
              onClick={() => setTab('customer')}
              className={clsx(
                'flex-1 rounded-full py-2.5 text-sm font-bold transition',
                tab === 'customer' ? 'bg-white text-phyto-forest shadow-sm' : 'text-stone-500'
              )}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => setTab('partners')}
              className={clsx(
                'flex-1 rounded-full py-2.5 text-sm font-bold transition',
                tab === 'partners' ? 'bg-white text-phyto-forest shadow-sm' : 'text-stone-500'
              )}
            >
              Partners &amp; admin
            </button>
          </div>
        </div>

        {tab === 'customer' ? (
          <form onSubmit={submit} className="space-y-4 px-8 pb-10 pt-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="mt-2 w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@phyto.com"
                className="mt-2 w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-stone-500">Password</label>
                {mode === 'login' && (
                  <button type="button" className="text-xs font-bold text-phyto-leaf hover:underline">
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative mt-2">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 pr-12 text-sm font-medium"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-phyto-forest"
                  aria-label="Toggle password"
                >
                  {showPw ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </div>
            </div>

            {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf disabled:opacity-60"
            >
              {loading ? 'Processing…' : mode === 'login' ? 'Log in to account' : 'Create account'}
              <ArrowRight className="size-4" />
            </button>

            <div className="pt-2 text-center text-sm text-stone-600">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register')
                      setError(null)
                    }}
                    className="font-bold text-phyto-leaf hover:underline"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                    }}
                    className="font-bold text-phyto-leaf hover:underline"
                  >
                    Log in
                  </button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-6 px-8 pb-10 pt-2">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-stone-500">
              Direct access to partner portals
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/admin/login"
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-phyto-forest/10 bg-phyto-sage/30 p-6 text-center transition hover:border-phyto-leaf"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-white text-phyto-forest shadow-sm">
                  <Sprout className="size-7" />
                </div>
                <span className="text-sm font-bold text-phyto-forest">Nursery partner</span>
              </Link>
              <Link
                to="/delivery"
                className="flex flex-col items-center gap-3 rounded-2xl border-2 border-phyto-forest/10 bg-phyto-sage/30 p-6 text-center transition hover:border-phyto-leaf"
              >
                <div className="grid size-14 place-items-center rounded-2xl bg-white text-phyto-forest shadow-sm">
                  <Truck className="size-7" />
                </div>
                <span className="text-sm font-bold text-phyto-forest">Delivery partner</span>
              </Link>
            </div>
            <p className="text-center text-xs text-stone-500">
              Partners and administrators authenticate using standard Phyto credentials.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
