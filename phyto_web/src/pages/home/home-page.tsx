import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { products } from '../../data/products'
import { ProductCard } from '../../ui/product-card'
import { useAuth } from '../../features/auth/auth-context'
import heroImg from '../../assets/hero.png'
import { formatInr } from '../../lib/format'
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Award,
  Truck,
  Leaf,
  RotateCcw,
  Quote,
  SlidersHorizontal,
  Stethoscope,
} from 'lucide-react'
import clsx from 'clsx'

const PLANT_QUOTES = [
  { text: 'A little green can make a big difference.', author: 'Botanical Wisdom' },
  { text: 'Grow where you are planted.', author: 'African Proverb' },
  { text: 'Bring nature closer to home.', author: 'Phyto Care' },
  { text: 'Every plant is a step toward a greener future.', author: 'Urban Forestry' },
  { text: 'To plant a garden is to believe in tomorrow.', author: 'Audrey Hepburn' },
  { text: 'Plants give us oxygen for the lungs and for the soul.', author: 'Linda Solegato' },
  { text: 'In a world of rush, plants teach us patience.', author: 'Nature Philosophy' },
]

const QUICK_NEED_CHIPS = [
  { label: '🛏️ Bedroom Plants', filter: 'space=Bedroom' },
  { label: '💡 Low Light Thrivers', filter: 'light=Low' },
  { label: '🐶 Pet-Safe Greenery', filter: 'pet_friendly=true' },
  { label: '🌱 Easy for Beginners', filter: 'beginner=true' },
  { label: '🪴 Balcony Sun Lovers', filter: 'space=Balcony&light=Bright' },
  { label: '🌸 Fragrant Flowering', filter: 'category=Flowering Plants' },
  { label: '🎁 Gift Ready Kits', filter: 'category=Customized Kits' },
]

export function HomePage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Interactive Fast Filter Bar States
  const [filterSpace, setFilterSpace] = useState('Living room')
  const [filterLight, setFilterLight] = useState('Medium')
  const [filterPetOnly, setFilterPetOnly] = useState(user?.preferences?.hasPets ?? false)

  // Rotate quotes automatically every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % PLANT_QUOTES.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [])

  function nextQuote() {
    setQuoteIndex((prev) => (prev + 1) % PLANT_QUOTES.length)
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      nav(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      nav('/shop')
    }
  }

  // ── Personalized Recommendations Engine ───────────────────
  // Grounded on user's previous searches, viewed items, and preferences
  const personalizedPicks = useMemo(() => {
    const prefs = user?.preferences
    const recentSearches = (prefs?.recentSearches || []).map((s) => s.toLowerCase())
    const viewedIds = prefs?.viewedProductIds || []
    const hasPets = prefs?.hasPets || filterPetOnly
    const favSpace = prefs?.favoriteSpaces?.[0] || 'Living room'

    // Score all products
    const scored = products
      .filter((p) => p.type === 'plants' || p.type === 'flowers')
      .map((p) => {
        let score = 0
        let matchReason = 'Popular top pick'

        // 1. Matches Pet Safety if user has pets
        if (hasPets) {
          if (p.isPetFriendly || p.petSafety === 'Pet-Friendly') {
            score += 40
            matchReason = '🐶 100% Pet-Safe for your home'
          } else {
            score -= 50
          }
        }

        // 2. Matches Favorite / Selected Space
        if (p.suitableSpace?.includes(favSpace as any)) {
          score += 30
          matchReason = `🌿 Perfect match for your ${favSpace}`
        }

        // 3. Matches Recent Search History (e.g. low light, bedroom, fragrant)
        for (const q of recentSearches) {
          if (
            p.name.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)) ||
            (p.benefits && p.benefits.toLowerCase().includes(q))
          ) {
            score += 35
            matchReason = `💡 Based on your interest in "${q}"`
            break
          }
        }

        // 4. Recently viewed affinity
        if (viewedIds.includes(p.id)) {
          score += 25
          matchReason = '⭐ Recently viewed & highly rated'
        }

        // 5. Beginner friendly boost
        if (prefs?.isBeginner && (p.beginnerFriendly || p.maintenance === 'Easy')) {
          score += 20
        }

        score += Math.round((p.popularity || 80) / 10)

        return {
          product: p,
          score,
          matchReason,
        }
      })

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
  }, [user, filterPetOnly])

  // Matching count for Home Page Interactive Filter
  const quickMatchCount = useMemo(() => {
    return products.filter((p) => {
      if (filterSpace && !p.suitableSpace?.includes(filterSpace as any)) return false
      if (filterLight && p.lightRequirement !== filterLight) return false
      if (filterPetOnly && !p.isPetFriendly && p.petSafety !== 'Pet-Friendly') return false
      return true
    }).length
  }, [filterSpace, filterLight, filterPetOnly])

  return (
    <div className="space-y-12 md:space-y-16">
      {/* ── 1. Hero Section & Quick Needs Search ─────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-phyto-forest/10 bg-phyto-sage/50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-phyto-leaf">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Welcome{user?.name ? `, ${user.name}` : ' to Phyto'}</span>
            </div>

            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-phyto-forest md:text-5xl lg:text-[3.25rem]">
              Bring Living Nature Home
            </h1>

            <p className="text-sm md:text-base leading-relaxed text-stone-600">
              Curated urban plants, customized kits, and plant doctor support delivered direct from local verified nurseries.
            </p>

            {/* Global Quick Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative flex w-full items-center">
              <Search className="pointer-events-none absolute left-4 size-5 text-stone-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plants, care guides, seeds, customized kits…"
                className="w-full rounded-full border-2 border-phyto-forest/15 bg-stone-50 py-3.5 pl-12 pr-28 text-xs sm:text-sm font-medium text-phyto-forest placeholder:text-stone-400 focus:border-phyto-leaf focus:bg-white focus:outline-none focus:ring-4 focus:ring-phyto-mint/40"
              />
              <button
                type="submit"
                className="absolute right-1.5 rounded-full bg-phyto-forest px-5 py-2.5 text-xs font-bold text-white transition hover:bg-phyto-leaf"
              >
                Search
              </button>
            </form>

            {/* Quick Need Filter Pills */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Quick Filter by Need:</p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_NEED_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => nav(`/shop?${chip.filter}`)}
                    className="rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-bold text-stone-700 shadow-2xs hover:border-phyto-leaf hover:bg-phyto-sage/30 hover:text-phyto-forest transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Visual Image */}
          <div className="relative">
            <div className="absolute -left-6 -top-6 size-48 rounded-full bg-phyto-mint/30 blur-3xl" />
            <div className="absolute -bottom-6 -right-6 size-56 rounded-full bg-phyto-sage blur-3xl" />
            <img
              src={heroImg}
              alt="Phyto botanical greenery"
              className="relative w-full rounded-3xl border border-phyto-forest/10 object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── 2. Interactive Plant Filter on Home Page ─────────────── */}
      <section className="rounded-3xl border border-phyto-forest/10 bg-gradient-to-br from-white via-phyto-cream to-phyto-sage/30 p-6 shadow-card md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/60 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-phyto-leaf">
              <SlidersHorizontal className="size-3.5" />
              <span>Instant Space Matcher</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-phyto-forest md:text-3xl">
              Find Plants for Your Exact Space
            </h2>
          </div>
          <button
            type="button"
            onClick={() =>
              nav(
                `/shop?space=${encodeURIComponent(filterSpace)}&light=${encodeURIComponent(filterLight)}${
                  filterPetOnly ? '&pet_friendly=true' : ''
                }`
              )
            }
            className="inline-flex items-center gap-2 rounded-full bg-phyto-forest px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-phyto-leaf"
          >
            <span>View {quickMatchCount} Matching Plants</span>
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {/* Space Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-stone-600 block">
              1. Where will it live?
            </label>
            <select
              value={filterSpace}
              onChange={(e) => setFilterSpace(e.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold text-phyto-forest focus:border-phyto-leaf focus:outline-none shadow-2xs"
            >
              <option value="Living room">🛋️ Living room</option>
              <option value="Bedroom">🛏️ Bedroom</option>
              <option value="Balcony">🪴 Balcony</option>
              <option value="Office">🏢 Office / Desk</option>
              <option value="Desk">💻 Workstation Desk</option>
              <option value="Terrace">☀️ Terrace Garden</option>
            </select>
          </div>

          {/* Light Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-stone-600 block">
              2. Sunlight level?
            </label>
            <select
              value={filterLight}
              onChange={(e) => setFilterLight(e.target.value)}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-xs font-bold text-phyto-forest focus:border-phyto-leaf focus:outline-none shadow-2xs"
            >
              <option value="Low">🌥️ Low Light / Shaded</option>
              <option value="Medium">⛅ Medium Indirect Sun</option>
              <option value="Bright">☀️ Bright Direct Sun</option>
            </select>
          </div>

          {/* Pet Friendly Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wide text-stone-600 block">
              3. Living with pets?
            </label>
            <button
              type="button"
              onClick={() => setFilterPetOnly((prev) => !prev)}
              className={clsx(
                'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-xs font-bold transition shadow-2xs',
                filterPetOnly
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-stone-300 bg-white text-stone-700'
              )}
            >
              <span>🐶 Pet-Safe Plants Only</span>
              <span
                className={clsx(
                  'grid size-5 place-items-center rounded-md border text-[10px]',
                  filterPetOnly ? 'bg-emerald-600 text-white border-emerald-600' : 'border-stone-300 bg-white'
                )}
              >
                {filterPetOnly ? '✓' : ''}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 3. Personalized Recommendations Section ────────────── */}
      <section className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-phyto-leaf">
              <Sparkles className="size-3.5 text-amber-500" />
              <span>Tailored for You</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-phyto-forest md:text-3xl">
              Personalized Botanical Recommendations
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Grounded in your recent space searches, viewed plants, and plant-care preferences.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-phyto-leaf hover:underline decoration-2 underline-offset-4"
          >
            Explore all 100+ plants →
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {personalizedPicks.map(({ product, matchReason }) => (
            <div key={product.id} className="relative flex flex-col">
              <div className="mb-2 inline-flex items-center gap-1 rounded-full bg-phyto-sage/70 px-2.5 py-0.5 text-[10px] font-bold text-phyto-forest">
                <span>{matchReason}</span>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Dynamic Plant & Nature Quotes ─────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-phyto-forest/10 bg-phyto-forest p-8 text-white shadow-xl md:p-12">
        <div className="relative z-10 mx-auto max-w-3xl text-center space-y-4">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-white/10 text-phyto-sage">
            <Quote className="size-6" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={quoteIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              <p className="font-display text-2xl font-semibold leading-relaxed md:text-3xl text-emerald-50">
                &ldquo;{PLANT_QUOTES[quoteIndex].text}&rdquo;
              </p>
              <p className="text-xs font-bold uppercase tracking-wider text-phyto-sage">
                — {PLANT_QUOTES[quoteIndex].author}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="pt-2">
            <button
              type="button"
              onClick={nextQuote}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-white/20 transition"
            >
              <RotateCcw className="size-3" />
              <span>Inspire with another quote</span>
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. Customized Kits & Services Highlight Strips ────────── */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Customized Kits Feature Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
              <Sparkles className="size-3.5" />
              <span>DIY Plant Kits</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-phyto-forest">Customized Plant &amp; Pot Bundles</h3>
            <p className="text-xs leading-relaxed text-stone-600">
              Mix and match living indoor plants with handcrafted terracotta or ceramic pots, customized chunky soil mixes, and brass care tools.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="text-xs font-bold text-stone-500">From {formatInr(549)}</span>
            <Link
              to="/kits"
              className="inline-flex items-center gap-1.5 rounded-full bg-phyto-forest px-5 py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
            >
              <span>Build Custom Kit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Plant Care Services Card */}
        <div className="flex flex-col justify-between rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
              <Stethoscope className="size-3.5" />
              <span>Doorstep Services</span>
            </div>
            <h3 className="font-display text-2xl font-bold text-phyto-forest">Plant Doctor &amp; Repotting Visits</h3>
            <p className="text-xs leading-relaxed text-stone-600">
              Book certified botanists for sick plant diagnosis, mess-free repotting, or a complete terrace garden makeover in your city.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
            <span className="text-xs font-bold text-stone-500">From {formatInr(249)}</span>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 rounded-full bg-phyto-forest px-5 py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
            >
              <span>Book Expert Visit</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── 6. Value Props ────────────────────────────────────────── */}
      <section className="grid gap-4 rounded-3xl border border-phyto-forest/10 bg-white/90 p-6 shadow-card sm:grid-cols-2 lg:grid-cols-4 lg:p-8">
        <Benefit
          icon={<Truck className="size-5" />}
          title="Hyperlocal Delivery"
          desc="Carefully packaged with moisture-lock root wrapping."
        />
        <Benefit
          icon={<Leaf className="size-5" />}
          title="100+ Botanical Varieties"
          desc="Hand-vetted directly from verified partner nurseries."
        />
        <Benefit
          icon={<ShieldCheck className="size-5" />}
          title="14-Day Guarantee"
          desc="Free replacement if your plant does not thrive."
        />
        <Benefit
          icon={<Award className="size-5" />}
          title="Plant Doctor Support"
          desc="AI bot & 1:1 botanist care advice whenever you need."
        />
      </section>
    </div>
  )
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-phyto-sage/80 text-phyto-forest">
        {icon}
      </div>
      <div>
        <div className="font-display text-sm font-bold text-phyto-forest">{title}</div>
        <p className="mt-0.5 text-xs text-stone-600">{desc}</p>
      </div>
    </div>
  )
}
