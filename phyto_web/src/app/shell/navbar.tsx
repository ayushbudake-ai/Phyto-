import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Search, ShoppingBag, User, LogOut, Sparkles, Sprout, Heart, Leaf } from 'lucide-react'
import { useCart } from '../../features/cart/cart-context'
import { useAuth } from '../../features/auth/auth-context'
import clsx from 'clsx'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'

export function Navbar() {
  const { totalItems } = useCart()
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const [q, setQ] = useState('')

  function runSearch(e: React.FormEvent) {
    e.preventDefault()
    const v = q.trim()
    if (v) nav(`/shop?q=${encodeURIComponent(v)}`)
    else nav('/shop')
  }

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-phyto-forest/10 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-phyto-forest text-white shadow-sm">
            <Leaf className="size-5 text-phyto-leaf" />
          </div>
          <span className="font-display text-2xl font-bold tracking-tight text-phyto-forest">Phyto</span>
        </Link>

        {/* Main Navigation Menu */}
        <nav className="order-3 flex w-full justify-center gap-1 overflow-x-auto py-1 md:order-none md:w-auto md:gap-1.5 lg:gap-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                isActive
                  ? 'bg-phyto-forest text-white shadow-sm'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                isActive
                  ? 'bg-phyto-forest text-white shadow-sm'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            Plants
          </NavLink>
          <NavLink
            to="/kits"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm flex items-center gap-1',
                isActive
                  ? 'bg-phyto-forest text-white shadow-sm'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            <Sparkles className="size-3 text-amber-500 hidden sm:inline" />
            <span>Customized Kits</span>
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                isActive
                  ? 'bg-phyto-forest text-white shadow-sm'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            Services
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-2 text-xs font-bold transition sm:text-sm',
                isActive
                  ? 'bg-phyto-forest text-white shadow-sm'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            Profile
          </NavLink>
        </nav>

        {/* Global Search */}
        <form
          onSubmit={runSearch}
          className="order-2 hidden min-w-[180px] flex-1 justify-center md:order-none md:flex md:max-w-xs lg:max-w-sm"
        >
          <div className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-3.5 size-4 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search 100+ plants, care, seeds…"
              className="w-full rounded-full border border-phyto-forest/15 bg-stone-50/90 py-2 pl-10 pr-4 text-xs font-medium text-phyto-forest placeholder:text-stone-400 focus:border-phyto-leaf focus:bg-white focus:outline-none focus:ring-2 focus:ring-phyto-mint/50"
            />
          </div>
        </form>

        {/* Action icons & Account menu */}
        <div className="order-2 flex items-center gap-2 md:order-none">
          <button
            type="button"
            onClick={() => nav('/shop')}
            className="grid size-9 place-items-center rounded-full border border-phyto-forest/10 text-phyto-forest md:hidden"
            aria-label="Search"
          >
            <Search className="size-4" />
          </button>

          {/* Cart Icon with Live Badge */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-1.5 rounded-full border border-phyto-forest/15 bg-white px-3 py-2 text-xs font-bold text-phyto-forest shadow-sm transition hover:bg-phyto-sage/40"
          >
            <ShoppingBag className="size-4 text-phyto-forest" />
            <span className="hidden sm:inline">Cart</span>
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex size-5 items-center justify-center rounded-full bg-phyto-leaf text-[10px] font-bold text-white shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full border border-phyto-forest/15 bg-white text-phyto-forest shadow-sm transition hover:bg-phyto-sage/40"
                aria-label="Account Menu"
              >
                {user ? (
                  <span className="text-xs font-bold text-phyto-forest">
                    {user.name.slice(0, 1).toUpperCase()}
                  </span>
                ) : (
                  <User className="size-4" />
                )}
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="z-50 min-w-[220px] rounded-2xl border border-phyto-forest/10 bg-white p-2 shadow-2xl animate-in fade-in"
                sideOffset={8}
                align="end"
              >
                {user ? (
                  <div className="border-b border-stone-100 px-3 py-2.5 mb-1">
                    <p className="text-xs font-bold text-phyto-forest">{user.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                  </div>
                ) : null}

                <DropdownMenu.Item asChild>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-phyto-forest outline-none hover:bg-phyto-sage/50"
                  >
                    <User className="size-3.5 text-stone-500" />
                    <span>My Profile &amp; Preferences</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <Link
                    to="/kits"
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-phyto-forest outline-none hover:bg-phyto-sage/50"
                  >
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Customized Kits</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <Link
                    to="/services"
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-phyto-forest outline-none hover:bg-phyto-sage/50"
                  >
                    <Sprout className="size-3.5 text-phyto-leaf" />
                    <span>Plant Care Services</span>
                  </Link>
                </DropdownMenu.Item>

                <DropdownMenu.Item asChild>
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-semibold text-stone-600 outline-none hover:bg-stone-100"
                  >
                    <Heart className="size-3.5 text-stone-400" />
                    <span>Partner &amp; Nursery Portal</span>
                  </Link>
                </DropdownMenu.Item>

                <div className="my-1 border-t border-stone-100" />

                {user ? (
                  <DropdownMenu.Item asChild>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-red-600 outline-none hover:bg-red-50"
                    >
                      <LogOut className="size-3.5" />
                      <span>Log Out</span>
                    </button>
                  </DropdownMenu.Item>
                ) : (
                  <DropdownMenu.Item asChild>
                    <Link
                      to="/login"
                      className="flex items-center gap-2 cursor-pointer rounded-xl px-3 py-2 text-xs font-bold text-phyto-forest outline-none hover:bg-phyto-sage/60"
                    >
                      <User className="size-3.5" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
    </header>
  )
}
