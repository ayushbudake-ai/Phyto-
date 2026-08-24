import { motion } from 'framer-motion'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search,
  ShoppingBag,
  User,
  LogOut,
  Leaf,
  Globe,
  MapPin,
  Store,
  Stethoscope,
  Truck,
  Shield,
  Award,
} from 'lucide-react'
import { useCart } from '../../features/cart/cart-context'
import { useAuth } from '../../features/auth/auth-context'
import { useTranslation } from '../../features/i18n/i18n-context'
import { useLocation, SUPPORTED_CITIES } from '../../features/nursery/nursery-service'
import { useGreenIndex } from '../../features/green-index/green-index-context'
import clsx from 'clsx'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { useState } from 'react'

export function Navbar() {
  const { totalItems } = useCart()
  const { user, role, logout } = useAuth()
  const { t, language, setLanguage, supportedLanguages } = useTranslation()
  const { currentCity, setCurrentCity } = useLocation()
  const { points, targetPoints, progressPercentage } = useGreenIndex()
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
    <header className="sticky top-0 z-50 border-b border-phyto-forest/10 bg-white/98 backdrop-blur-md shadow-xs">
      {/* Top Prominent Control Bar: Location, Language & PHYTO GREEN INDEX */}
      <div className="border-b border-stone-200/90 bg-stone-100/95 px-4 py-2.5 text-stone-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Prominent Location Selector */}
          <div className="flex items-center gap-2.5 rounded-xl bg-white px-3.5 py-2 shadow-xs border border-stone-200">
            <MapPin className="size-4 text-emerald-700 shrink-0" />
            <span className="text-xs font-bold text-stone-700">Location:</span>
            <select
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="bg-transparent text-xs font-black text-phyto-forest cursor-pointer focus:outline-none pr-1"
            >
              {SUPPORTED_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c === 'Kolhapur' ? 'Kolhapur, Maharashtra' : `${c}, India`}
                </option>
              ))}
            </select>
          </div>

          {/* Prominent PHYTO GREEN INDEX & Language Selector */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Prominent Large PHYTO GREEN INDEX Link */}
            <Link
              to="/green-index"
              title="View PHYTO GREEN INDEX Dashboard & Rewards"
              className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-2 font-bold text-emerald-950 border border-emerald-300 shadow-xs hover:bg-emerald-100 transition"
            >
              <Award className="size-4 text-emerald-700 shrink-0" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-xs font-black tracking-wide text-phyto-forest">PHYTO GREEN INDEX:</span>
                <span className="text-xs font-black text-emerald-800">
                  {points} / {targetPoints} Points ({progressPercentage}% to Green Champion)
                </span>
              </div>
            </Link>

            {/* Prominent Large Language Selector */}
            <div className="flex items-center gap-1.5 rounded-xl bg-white p-1 shadow-xs border border-stone-200">
              <div className="flex items-center gap-1 pl-2 pr-1">
                <Globe className="size-4 text-stone-600 shrink-0" />
                <span className="text-xs font-bold text-stone-700 hidden sm:inline">Language:</span>
              </div>
              {supportedLanguages.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-bold transition',
                    language === lang.code
                      ? 'bg-phyto-forest text-white shadow-xs'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100'
                  )}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="grid size-10 place-items-center rounded-xl bg-phyto-forest text-white shadow-sm">
            <Leaf className="size-5 text-phyto-leaf" />
          </div>
          <span className="font-display text-2xl md:text-3xl font-extrabold tracking-tight text-phyto-forest">Phyto</span>
        </Link>

        {/* Global Search */}
        <form
          onSubmit={runSearch}
          className="order-3 w-full md:order-none md:w-auto md:min-w-[280px] md:max-w-md lg:max-w-lg flex-1"
        >
          <div className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-4 size-4 text-stone-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t('search_placeholder', 'Search living plants, seeds, flowers, pots, fertilizers...')}
              className="w-full rounded-full border border-phyto-forest/20 bg-stone-50 py-2.5 pl-11 pr-4 text-xs sm:text-sm font-medium text-phyto-forest placeholder:text-stone-400 focus:border-phyto-forest focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </form>

        {/* Action icons & Account menu */}
        <div className="order-2 flex items-center gap-3 md:order-none">
          {/* Cart Icon with Live Badge */}
          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-phyto-forest/15 bg-white px-4 py-2.5 text-xs font-bold text-phyto-forest shadow-sm transition hover:bg-emerald-50"
          >
            <ShoppingBag className="size-4 text-phyto-forest" />
            <span className="hidden sm:inline">{t('nav_cart', 'Cart')}</span>
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

          {/* User Account / Stakeholder Portal Dropdown */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-phyto-forest px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-phyto-leaf cursor-pointer"
              >
                <User className="size-4" />
                <span className="max-w-[100px] truncate sm:max-w-[130px]">
                  {user?.name ? user.name.split(' ')[0] : t('nav_login', 'Sign In')}
                </span>
                {role && role !== 'customer' && (
                  <span className="rounded bg-amber-400/30 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-200">
                    {role}
                  </span>
                )}
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="z-50 w-60 rounded-2xl border border-phyto-forest/10 bg-white p-2.5 shadow-card"
              >
                {user ? (
                  <>
                    <div className="border-b border-stone-100 px-3 py-2">
                      <p className="text-xs font-bold text-phyto-forest truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-400 truncate">{user.email}</p>
                      <span className="mt-1 inline-block rounded-md bg-phyto-sage/60 px-2 py-0.5 text-[10px] font-bold uppercase text-phyto-forest">
                        {user.role} Account
                      </span>
                    </div>

                    {/* Role Specific Navigation */}
                    {role === 'nursery' && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/nursery"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50"
                        >
                          <Store className="size-4 text-amber-600" />
                          <span>Nursery Partner Hub</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    {role === 'gardener' && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/gardener"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50"
                        >
                          <Stethoscope className="size-4 text-teal-600" />
                          <span>Plant Doctor Portal</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    {role === 'delivery' && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/delivery"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-50"
                        >
                          <Truck className="size-4 text-blue-600" />
                          <span>Delivery Partner Route</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    {role === 'admin' && (
                      <DropdownMenu.Item asChild>
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-purple-800 hover:bg-purple-50"
                        >
                          <Shield className="size-4 text-purple-600" />
                          <span>Admin Control Center</span>
                        </Link>
                      </DropdownMenu.Item>
                    )}

                    <DropdownMenu.Item asChild>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                      >
                        <User className="size-4 text-stone-500" />
                        <span>{t('nav_profile', 'My Profile')}</span>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Item asChild>
                      <Link
                        to="/green-index"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-50"
                      >
                        <Award className="size-4 text-emerald-600" />
                        <span>{t('nav_green_index', 'PHYTO GREEN INDEX')}</span>
                      </Link>
                    </DropdownMenu.Item>

                    <DropdownMenu.Separator className="my-1 h-px bg-stone-100" />

                    <DropdownMenu.Item
                      onClick={handleLogout}
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="size-4" />
                      <span>{t('nav_logout', 'Sign Out')}</span>
                    </DropdownMenu.Item>
                  </>
                ) : (
                  <>
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-phyto-forest hover:bg-phyto-sage/50"
                      >
                        <User className="size-4 text-phyto-leaf" />
                        <span>{t('nav_login', 'Sign In / Register')}</span>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link
                        to="/login"
                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100"
                      >
                        <Store className="size-4 text-amber-600" />
                        <span>Join as Nursery / Partner</span>
                      </Link>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>

        {/* Secondary Category Navigation Bar */}
        <nav className="order-4 flex w-full justify-start md:justify-center gap-2 overflow-x-auto py-1.5 border-t border-stone-100 text-xs font-bold">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_home', 'Home')}
          </NavLink>
          <NavLink
            to="/shop?cat=Plants"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_plants', 'Plants')}
          </NavLink>
          <NavLink
            to="/shop?cat=Seeds"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_seeds', 'Seeds')}
          </NavLink>
          <NavLink
            to="/shop?cat=Flowers"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_flowers', 'Flowers')}
          </NavLink>
          <NavLink
            to="/shop?cat=Fertilizers"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_fertilizers', 'Fertilizers')}
          </NavLink>
          <NavLink
            to="/shop?cat=Pots"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_pots', 'Pots & Planters')}
          </NavLink>
          <NavLink
            to="/kits"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_kits', 'Customized Kits')}
          </NavLink>
          <NavLink
            to="/services"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-phyto-forest text-white'
                  : 'text-stone-600 hover:text-phyto-forest hover:bg-phyto-sage/40'
              )
            }
          >
            {t('nav_services', 'Plant Doctor & Services')}
          </NavLink>
          <NavLink
            to="/green-index"
            className={({ isActive }) =>
              clsx(
                'rounded-full px-3.5 py-1.5 transition whitespace-nowrap',
                isActive
                  ? 'bg-emerald-800 text-white font-bold'
                  : 'text-emerald-800 hover:bg-emerald-50'
              )
            }
          >
            {t('nav_green_index', 'PHYTO GREEN INDEX')}
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
