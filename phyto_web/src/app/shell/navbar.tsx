import { motion } from 'framer-motion'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User } from 'lucide-react'
import { useCart } from '../../features/cart/cart-context'
import { useAuth } from '../../features/auth/auth-context'
import clsx from 'clsx'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'

export function Navbar() {
  const { totalItems } = useCart()
  const { user } = useAuth()
  const nav = useNavigate()
  const { pathname } = useLocation()
  const [q, setQ] = useState('')

  function runSearch(e: React.FormEvent) {
    e.preventDefault()
    const v = q.trim()
    if (v) nav(`/shop?q=${encodeURIComponent(v)}`)
    else nav('/shop')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-phyto-forest/10 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-2xl font-semibold tracking-tight text-phyto-forest">Phyto</span>
        </Link>

        <nav className="order-3 flex w-full justify-center gap-1 md:order-none md:w-auto md:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                isActive ? 'border-b-2 border-phyto-forest text-phyto-forest' : 'text-stone-600 hover:text-phyto-forest'
              )
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-5 py-2 text-sm font-semibold transition',
                isActive ? 'border-b-2 border-phyto-forest text-phyto-forest' : 'text-stone-600 hover:text-phyto-forest'
              )
            }
          >
            Shop
          </NavLink>
          <Link
            to="/admin"
            className={clsx(
              'rounded-full px-5 py-2 text-sm font-semibold transition',
              pathname.startsWith('/admin') && !pathname.includes('/admin/login')
                ? 'border-b-2 border-phyto-forest text-phyto-forest'
                : 'text-stone-600 hover:text-phyto-forest'
            )}
          >
            Admin
          </Link>
        </nav>

        <form
          onSubmit={runSearch}
          className="order-2 hidden min-w-[200px] flex-1 justify-center md:order-none md:flex md:max-w-md"
        >
          <div className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-4 size-4 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search plants…"
              className="w-full rounded-full border border-phyto-forest/15 bg-stone-50/80 py-2.5 pl-11 pr-4 text-sm text-phyto-forest placeholder:text-stone-400 focus:border-phyto-leaf focus:outline-none focus:ring-2 focus:ring-phyto-mint/40"
            />
          </div>
        </form>

        <div className="order-2 flex items-center gap-2 md:order-none">
          <button
            type="button"
            onClick={() => nav('/shop')}
            className="grid size-10 place-items-center rounded-full border border-phyto-forest/10 text-phyto-forest md:hidden"
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-phyto-forest/15 bg-white px-3 py-2 text-sm font-semibold text-phyto-forest shadow-sm transition hover:bg-phyto-sage/50"
          >
            <ShoppingBag className="size-4" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-phyto-leaf text-[10px] font-bold text-white"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full border border-phyto-forest/15 bg-white text-phyto-forest shadow-sm transition hover:bg-phyto-sage/50"
                aria-label="Account"
              >
                <User className="size-5" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="min-w-[200px] rounded-2xl border border-phyto-forest/10 bg-white p-2 shadow-card"
                sideOffset={8}
              >
                {user ? (
                  <div className="px-3 py-2 text-xs text-stone-500">Signed in</div>
                ) : null}
                <DropdownMenu.Item asChild>
                  <Link
                    to="/login"
                    className="block cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-phyto-forest outline-none hover:bg-phyto-sage/60"
                  >
                    Sign in
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    to="/admin/login"
                    className="block cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-phyto-forest outline-none hover:bg-phyto-sage/60"
                  >
                    Partner / Admin login
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link
                    to="/delivery"
                    className="block cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-phyto-forest outline-none hover:bg-phyto-sage/60"
                  >
                    Delivery portal
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}
