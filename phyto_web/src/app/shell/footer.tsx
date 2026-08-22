import { Link } from 'react-router-dom'
import { useState } from 'react'

const company = [
  { label: 'About Phyto', to: '/' },
  { label: 'Sustainability', to: '/' },
]
const resources = [
  { label: 'Plant Care Guides', to: '/shop' },
  { label: 'Shipping & Returns', to: '/' },
]
const connect = [
  { label: 'Contact Us', to: '/' },
  { label: 'Newsletter Signup', to: '/' },
]

export function Footer() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function subscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSent(true)
    setEmail('')
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <footer className="mt-auto border-t border-phyto-forest/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="font-display text-xl font-semibold text-phyto-forest">Phyto</div>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">© {new Date().getFullYear()} Phyto. Cultivating a greener world.</p>
            <p className="mt-2 text-sm text-stone-500">Smart plant care, nursery tools, and carbon-conscious delivery.</p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-phyto-forest/70">Company</div>
            <ul className="mt-4 space-y-2">
              {company.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm font-medium text-stone-600 hover:text-phyto-leaf">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-phyto-forest/70">Resources</div>
            <ul className="mt-4 space-y-2">
              {resources.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm font-medium text-stone-600 hover:text-phyto-leaf">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-phyto-forest/70">Join our greenhouse</div>
            <p className="mt-3 text-sm text-stone-600">Tips, restocks, and seasonal drops — straight to your inbox.</p>
            <form onSubmit={subscribe} className="mt-4 flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="min-w-0 flex-1 rounded-full border border-phyto-forest/15 bg-stone-50 px-4 py-2.5 text-sm text-phyto-forest placeholder:text-stone-400 focus:border-phyto-leaf focus:outline-none focus:ring-2 focus:ring-phyto-mint/30"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-phyto-forest px-5 py-2.5 text-sm font-bold text-white transition hover:bg-phyto-leaf"
              >
                Join
              </button>
            </form>
            {sent ? <p className="mt-2 text-xs font-semibold text-phyto-leaf">Thanks — you&apos;re on the list.</p> : null}
            <ul className="mt-6 space-y-2">
              {connect.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm font-medium text-stone-600 hover:text-phyto-leaf">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
