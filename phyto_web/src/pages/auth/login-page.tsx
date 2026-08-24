import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth, type Role } from '../../features/auth/auth-context'
import { Sprout, Truck, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, Leaf } from 'lucide-react'
import clsx from 'clsx'

type Tab = 'customer' | 'partners'
type Mode = 'login' | 'register'

export function LoginPage() {
  const nav = useNavigate()
  const location = useLocation()
  const { login, register } = useAuth()
  const [tab, setTab] = useState<Tab>('customer')
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Determine redirect target
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/'

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
          nav(from === '/login' ? '/' : from)
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

  async function quickLogin(role: Role, demoEmail: string) {
    setError(null)
    setLoading(true)
    try {
      const u = await login(demoEmail, 'password123', role)
      if (u.role === 'admin' || u.role === 'nursery') {
        nav('/admin')
      } else if (u.role === 'delivery') {
        nav('/delivery')
      } else {
        nav('/')
      }
    } catch (err: unknown) {
      const e = err as { body?: { detail?: string }; message?: string }
      setError(e.body?.detail || e.message || 'Quick login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg py-8 px-4">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-phyto-forest text-white shadow-md mb-3">
          <Leaf className="size-8 text-phyto-leaf" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-phyto-forest">Phyto</h1>
        <p className="text-sm font-medium text-stone-600 mt-1">Smart Botanical E-Commerce & Plant-Care Platform</p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white shadow-xl">
        <div className="bg-gradient-to-br from-phyto-sage/70 via-phyto-cream to-white px-8 pb-3 pt-8 text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-phyto-leaf shadow-sm mb-3">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Welcome to our greenhouse</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-phyto-forest">
            {mode === 'login' ? 'Sign in to Continue' : 'Create Your Account'}
          </h2>
          <p className="mt-1.5 text-xs text-stone-600">
            {mode === 'login'
              ? 'Access custom plant kits, personalized care guides, and expert support.'
              : 'Join thousands of plant lovers cultivating greener living spaces.'}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pb-2 pt-4">
          <div className="flex rounded-2xl bg-stone-100 p-1.5">
            <button
              type="button"
              onClick={() => {
                setTab('customer')
                setError(null)
              }}
              className={clsx(
                'flex-1 rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5',
                tab === 'customer' ? 'bg-white text-phyto-forest shadow-sm' : 'text-stone-500 hover:text-stone-800'
              )}
            >
              <span>🌿 Customer Portal</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('partners')
                setError(null)
              }}
              className={clsx(
                'flex-1 rounded-xl py-2.5 text-xs font-bold transition flex items-center justify-center gap-1.5',
                tab === 'partners' ? 'bg-white text-phyto-forest shadow-sm' : 'text-stone-500 hover:text-stone-800'
              )}
            >
              <span>🌱 Partners &amp; Admin</span>
            </button>
          </div>
        </div>

        {tab === 'customer' ? (
          <form onSubmit={submit} className="space-y-4 px-8 pb-8 pt-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-stone-600">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="mt-1.5 w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium focus:border-phyto-leaf focus:outline-none focus:ring-2 focus:ring-phyto-mint/50"
                  required
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-600">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@phyto.com"
                className="mt-1.5 w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium focus:border-phyto-leaf focus:outline-none focus:ring-2 focus:ring-phyto-mint/50"
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wide text-stone-600">Password</label>
                {mode === 'login' && (
                  <span className="text-xs text-stone-400 font-normal">Min 6 characters</span>
                )}
              </div>
              <div className="relative mt-1.5">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 pr-12 text-sm font-medium focus:border-phyto-leaf focus:outline-none focus:ring-2 focus:ring-phyto-mint/50"
                  required
                  minLength={4}
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

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-phyto-leaf disabled:opacity-60"
            >
              {loading ? (
                <span>Processing…</span>
              ) : mode === 'login' ? (
                <>
                  <span>Log in to Phyto</span>
                  <ArrowRight className="size-4" />
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <CheckCircle2 className="size-4" />
                </>
              )}
            </button>

            {/* Quick Demo Login Option */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 font-bold text-stone-400">Or test instantly</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => quickLogin('customer', 'customer@phyto.com')}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-phyto-leaf/40 bg-phyto-sage/30 py-2.5 text-xs font-bold text-phyto-forest transition hover:bg-phyto-sage"
            >
              <Sparkles className="size-3.5 text-amber-600" />
              <span>1-Click Demo Login as Customer</span>
            </button>

            <div className="pt-2 text-center text-xs text-stone-600">
              {mode === 'login' ? (
                <>
                  New to Phyto?{' '}
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
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login')
                      setError(null)
                    }}
                    className="font-bold text-phyto-leaf hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="space-y-4 px-8 pb-8 pt-4">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-stone-500">
              Specialized Portals for Partners
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => quickLogin('nursery', 'nursery@phyto.com')}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-phyto-forest/10 bg-phyto-sage/30 p-5 text-center transition hover:border-phyto-leaf hover:bg-phyto-sage/50"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-white text-phyto-forest shadow-sm">
                  <Sprout className="size-6 text-phyto-leaf" />
                </div>
                <span className="text-xs font-bold text-phyto-forest">Nursery Partner</span>
                <span className="text-[10px] text-stone-500">Manage plants & stock</span>
              </button>
              <button
                type="button"
                onClick={() => quickLogin('delivery', 'delivery@phyto.com')}
                className="flex flex-col items-center gap-2 rounded-2xl border-2 border-phyto-forest/10 bg-phyto-sage/30 p-5 text-center transition hover:border-phyto-leaf hover:bg-phyto-sage/50"
              >
                <div className="grid size-12 place-items-center rounded-xl bg-white text-phyto-forest shadow-sm">
                  <Truck className="size-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold text-phyto-forest">Delivery Fleet</span>
                <span className="text-[10px] text-stone-500">Track shipments</span>
              </button>
            </div>
            <div className="text-center pt-2">
              <Link
                to="/admin/login"
                className="text-xs font-bold text-phyto-leaf hover:underline"
              >
                Advanced Admin &amp; Partner Sign-In Form →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
