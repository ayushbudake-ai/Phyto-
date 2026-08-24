import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { products } from '../../data/products'
import { ProductCard } from '../../ui/product-card'
import { useAuth } from '../../features/auth/auth-context'
import { useTranslation } from '../../features/i18n/i18n-context'
import { useLocation } from '../../features/nursery/nursery-service'
import { useGreenIndex } from '../../features/green-index/green-index-context'
import { rankProductRecommendations, type RecommendationCriteria } from '../../features/recommendation/recommendation-engine'
import heroImg from '../../assets/hero.png'
import {
  Sparkles,
  Search,
  ArrowRight,
  Award,
  RotateCcw,
  Quote,
  SlidersHorizontal,
  MapPin,
  Check,
} from 'lucide-react'
import clsx from 'clsx'

const PLANT_QUOTES = [
  { key: 'quote_1', fallback: 'A greener home begins with a single plant.', author: 'Botanical Wisdom' },
  { key: 'quote_2', fallback: 'Grow where you are planted.', author: 'African Proverb' },
  { key: 'quote_3', fallback: 'Small plants, big impact on our planet.', author: 'Phyto Ecology' },
  { key: 'quote_4', fallback: 'Sustainability starts right at home.', author: 'Urban Forestry' },
  { key: 'quote_5', fallback: 'To plant a garden is to believe in tomorrow.', author: 'Audrey Hepburn' },
  { key: 'quote_6', fallback: 'Plants give us oxygen for the lungs and for the soul.', author: 'Linda Solegato' },
]

export function HomePage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const { t } = useTranslation()
  const { currentCity, nearbyNurseries } = useLocation()
  const { points, targetPoints, progressPercentage } = useGreenIndex()

  const [searchQuery, setSearchQuery] = useState('')
  const [quoteIndex, setQuoteIndex] = useState(0)

  // Need-Based Filter states
  const [filterSpace, setFilterSpace] = useState<string>('Living room')
  const [filterLight, setFilterLight] = useState<string>('Medium')
  const [filterWater, setFilterWater] = useState<string>('any')
  const [filterMaintenance, setFilterMaintenance] = useState<string>('Easy')
  const [filterPurpose, setFilterPurpose] = useState<string>('Air purification')
  const [filterBudgetTier, setFilterBudgetTier] = useState<'all' | 'low' | 'medium' | 'premium'>('all')
  const [filterPetOnly, setFilterPetOnly] = useState<boolean>(user?.preferences?.hasPets ?? false)
  const [filterBeginnerOnly, setFilterBeginnerOnly] = useState<boolean>(true)

  // Selected Category Strip
  const [selectedMainCat, setSelectedMainCat] = useState<'All' | 'Plants' | 'Seeds' | 'Flowers' | 'Fertilizers' | 'Pots'>('All')

  // Auto-rotate quotes
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % PLANT_QUOTES.length)
    }, 9000)
    return () => clearInterval(timer)
  }, [])

  const currentQuote = PLANT_QUOTES[quoteIndex]

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      nav(`/shop?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  // Multi-factor weighted recommendations
  const recommendedResults = useMemo(() => {
    const criteria: RecommendationCriteria = {
      space: filterSpace as any,
      light: filterLight as any,
      purpose: filterPurpose as any,
      maintenance: filterMaintenance as any,
      water: filterWater as any,
      budgetTier: filterBudgetTier,
      petOnly: filterPetOnly,
      beginnerOnly: filterBeginnerOnly,
    }
    return rankProductRecommendations(products, criteria, undefined, 8)
  }, [
    filterSpace,
    filterLight,
    filterPurpose,
    filterMaintenance,
    filterWater,
    filterBudgetTier,
    filterPetOnly,
    filterBeginnerOnly,
  ])

  // Filtered Products for the bottom catalog section
  const displayProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (selectedMainCat === 'All') return true
        return (p.mainCategory || p.type || '').toLowerCase() === selectedMainCat.toLowerCase()
      })
      .slice(0, 12)
  }, [selectedMainCat])

  return (
    <div className="space-y-10 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. Hero Section & Botanical Quote
          ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-radial from-phyto-sage/70 via-phyto-sage/30 to-transparent p-6 shadow-card md:p-12 border border-phyto-forest/10">
        <div className="grid items-center gap-8 md:grid-cols-12">
          <div className="space-y-6 md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-bold text-emerald-900 shadow-xs border border-emerald-300/60">
              <Award className="size-3.5 text-emerald-700" />
              <span>Digital Plant Ecosystem · {currentCity} Regional Network ({nearbyNurseries.length} Verified Nurseries)</span>
            </div>

            <h1 className="font-display text-3xl font-extrabold tracking-tight text-phyto-forest sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
              Connecting Homes with Verified Local Nurseries.
            </h1>

            <p className="text-sm font-medium text-stone-600 sm:text-base max-w-xl">
              Discover living plants, heirloom seeds, fragrant flowers, organic fertilizers, and designer pots fulfilled directly by trusted nurseries across <strong>{currentCity}</strong> and Maharashtra.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 rounded-full bg-phyto-forest px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-phyto-leaf transition"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/green-index"
                className="inline-flex items-center gap-2 rounded-full border border-phyto-forest/20 bg-white/90 px-5 py-3.5 text-xs font-bold text-phyto-forest shadow-xs hover:bg-phyto-sage/40 transition"
              >
                <Award className="size-4 text-emerald-600" />
                <span>PHYTO GREEN INDEX</span>
              </Link>
            </div>
          </div>

          <div className="relative md:col-span-5 flex justify-center">
            <div className="relative size-64 sm:size-72 md:size-80 lg:size-96 rounded-full overflow-hidden border-4 border-white/80 shadow-2xl bg-gradient-to-tr from-phyto-mint/30 to-phyto-sage/60">
              <img
                src={heroImg}
                alt="Phyto Botanical Living Collection"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. Plant Quote Section (Moved UP & Multilingual)
          ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-phyto-forest via-[#1e3d29] to-phyto-forest px-6 py-5 text-white shadow-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid size-9 place-items-center rounded-xl bg-white/10 text-phyto-mint shrink-0">
              <Quote className="size-4" />
            </div>
            <div className="min-w-0">
              <AnimatePresence mode="wait">
                <motion.p
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="font-serif text-sm sm:text-base italic text-phyto-sage truncate sm:whitespace-normal"
                >
                  &ldquo;{t(currentQuote.key, currentQuote.fallback)}&rdquo;
                </motion.p>
              </AnimatePresence>
              <p className="text-[11px] text-stone-300 uppercase tracking-wider font-semibold">
                — {currentQuote.author}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setQuoteIndex((prev) => (prev + 1) % PLANT_QUOTES.length)}
            title="Next Botanical Quote"
            className="grid size-8 place-items-center rounded-full bg-white/10 text-stone-300 hover:bg-white/20 hover:text-white transition shrink-0"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2B. Prominent PHYTO GREEN INDEX Showcase
          ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-950 via-[#133e24] to-stone-900 p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-200">
              <Award className="size-4 text-emerald-300" />
              <span>National Sustainability &amp; College Demonstration Metric</span>
            </div>
            <h2 className="font-display text-2xl font-extrabold md:text-3xl text-white">
              PHYTO GREEN INDEX
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
              {points} / {targetPoints} Points · {progressPercentage}% to Green Champion
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3.5 text-center backdrop-blur-xs border border-white/10">
              <p className="text-2xl font-black text-emerald-300">{points}</p>
              <p className="text-[11px] text-emerald-100 font-semibold">Active Points</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3.5 text-center backdrop-blur-xs border border-white/10">
              <p className="text-2xl font-black text-emerald-200">{progressPercentage}%</p>
              <p className="text-[11px] text-emerald-100 font-semibold">Milestone</p>
            </div>
          </div>
        </div>

        {/* Large Progress Bar with Milestone Markers */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-white/20 overflow-hidden p-0.5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200 transition-all duration-500 shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-emerald-200">
            <span>Seedling (100)</span>
            <span>Planter (300)</span>
            <span>Botanist (600)</span>
            <span>Green Champion (1000)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-4">
          <p className="text-xs text-emerald-100/90 max-w-xl">
            Every living plant adopted, heirloom seed pack purchased, and verified doctor booking increases your official Green Index and unlocks certified reward vouchers.
          </p>
          <Link
            to="/green-index"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-xs font-bold text-stone-950 shadow-md hover:bg-emerald-300 transition cursor-pointer"
          >
            <span>Open PHYTO GREEN INDEX Dashboard</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. Hyperlocal Search Bar & Active City Hub
          ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-phyto-forest">
              Hyperlocal Botanical Search
            </h2>
            <p className="text-xs text-stone-500">
              Search live stock across {nearbyNurseries.length} verified nurseries in <strong>{currentCity}</strong>
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl bg-stone-100 px-3 py-1.5 text-xs font-bold text-stone-700">
            <MapPin className="size-3.5 text-phyto-leaf" />
            <span>Active Hub: {currentCity} ({nearbyNurseries.length} Nurseries Available)</span>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder', 'Search by plant name, seed variety, flower type, or care requirements...')}
              className="w-full rounded-2xl border border-stone-200 bg-stone-50/80 py-3 pl-11 pr-4 text-xs font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none focus:ring-2 focus:ring-phyto-mint/40"
            />
          </div>
          <button
            type="submit"
            className="rounded-2xl bg-phyto-forest px-6 py-3 text-xs font-bold text-white hover:bg-phyto-leaf transition"
          >
            {t('search_button', 'Search')}
          </button>
        </form>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. Need-Based Compound Filters
          ───────────────────────────────────────────────────────────── */}
      <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-phyto-sage/50 text-phyto-forest">
              <SlidersHorizontal className="size-4 text-phyto-leaf" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-phyto-forest">
                {t('quick_filter_title', 'Filter by Need')}
              </h2>
              <p className="text-xs text-stone-500">
                Compound multi-criteria filter tailored to your indoor or balcony conditions
              </p>
            </div>
          </div>

          <Link
            to={`/shop?space=${filterSpace}&light=${filterLight}&pet_friendly=${filterPetOnly}&beginner=${filterBeginnerOnly}`}
            className="text-xs font-bold text-phyto-leaf hover:underline flex items-center gap-1"
          >
            <span>{t('filter_view_matches', 'View Full Matching Catalog')}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        {/* Compound Filter Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs">
          {/* Space */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('filter_space', 'Available Space')}</label>
            <select
              value={filterSpace}
              onChange={(e) => setFilterSpace(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none"
            >
              <option value="Living room">Living Room</option>
              <option value="Bedroom">Bedroom</option>
              <option value="Balcony">Balcony &amp; Railing</option>
              <option value="Desk">Work Desk / Table</option>
              <option value="Office">Office / AC Room</option>
              <option value="Terrace">Terrace / Rooftop</option>
              <option value="Kitchen">Kitchen / Herbs</option>
            </select>
          </div>

          {/* Sunlight */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('filter_light', 'Sunlight Exposure')}</label>
            <select
              value={filterLight}
              onChange={(e) => setFilterLight(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none"
            >
              <option value="Low">Low Light / Shaded Corner</option>
              <option value="Medium">Medium / Indirect Bright Light</option>
              <option value="Bright">Bright / Direct Morning Sun</option>
            </select>
          </div>

          {/* Purpose */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('filter_purpose', 'Plant Purpose')}</label>
            <select
              value={filterPurpose}
              onChange={(e) => setFilterPurpose(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none"
            >
              <option value="Air purification">Air Purification</option>
              <option value="Decoration">Interior Decoration</option>
              <option value="Gifting">Gifting &amp; Good Luck</option>
              <option value="Kitchen/herbs">Kitchen Herbs &amp; Cooking</option>
              <option value="Medicinal">Ayurvedic / Medicinal</option>
              <option value="Flowering">Fragrant Flowering</option>
              <option value="Stress relief">Stress Relief &amp; Zen</option>
            </select>
          </div>

          {/* Maintenance */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('filter_maintenance', 'Maintenance Effort')}</label>
            <select
              value={filterMaintenance}
              onChange={(e) => setFilterMaintenance(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none"
            >
              <option value="Easy">Easy (Low Maintenance)</option>
              <option value="Moderate">Moderate Care</option>
              <option value="any">Any Maintenance</option>
            </select>
          </div>

          {/* Water */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('filter_water', 'Water Requirement')}</label>
            <select
              value={filterWater}
              onChange={(e) => setFilterWater(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none"
            >
              <option value="any">Any Watering</option>
              <option value="Low">Low Water (Every 2-3 weeks)</option>
              <option value="Medium">Medium (Once a week)</option>
              <option value="High">High Moisture</option>
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">{t('filter_budget', 'Budget / Price Range')}</label>
            <select
              value={filterBudgetTier}
              onChange={(e) => setFilterBudgetTier(e.target.value as any)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50 p-2.5 font-medium text-phyto-forest focus:border-phyto-leaf focus:bg-white focus:outline-none"
            >
              <option value="all">Any Budget</option>
              <option value="low">Pocket-Friendly (Under ₹300)</option>
              <option value="medium">Standard (₹300 - ₹800)</option>
              <option value="premium">Specimen / Rare (Above ₹800)</option>
            </select>
          </div>
        </div>

        {/* Checkbox toggles */}
        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-stone-100 text-xs">
          <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterPetOnly}
              onChange={(e) => setFilterPetOnly(e.target.checked)}
              className="size-4 rounded accent-phyto-leaf"
            />
            <span>{t('filter_pet_friendly', 'Pet-Friendly Plants Only')}</span>
          </label>

          <label className="flex items-center gap-2 font-bold text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterBeginnerOnly}
              onChange={(e) => setFilterBeginnerOnly(e.target.checked)}
              className="size-4 rounded accent-phyto-leaf"
            />
            <span>{t('filter_beginner', 'Beginner-Friendly Only')}</span>
          </label>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. Multi-Factor Personalized Botanical Recommendations
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-emerald-600" />
              <h2 className="font-display text-2xl font-bold text-phyto-forest">
                {t('rec_title', 'Personalized Botanical Recommendations')}
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('rec_subtitle', 'Multi-factor weighted evaluation based on maintenance (25%), purpose (20%), budget (20%), and lighting (15%).')}
            </p>
          </div>
          <Link
            to="/shop"
            className="text-xs font-bold text-phyto-leaf hover:underline flex items-center gap-1"
          >
            <span>Browse All {products.length} Products</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedResults.map((rec) => (
            <div key={rec.product.id} className="relative group flex flex-col">
              <div className="absolute top-3 right-3 z-10 rounded-full bg-emerald-900/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-black text-white shadow-sm border border-emerald-400/40">
                {rec.scorePercentage}% Match
              </div>

              <ProductCard product={rec.product} />

              {/* Match breakdown pills */}
              <div className="mt-2 flex flex-wrap gap-1 px-1">
                {rec.highlightBadges.slice(0, 3).map((r: string, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600"
                  >
                    <Check className="size-3 text-emerald-600" />
                    <span>{r}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. Product Categories Strip
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-phyto-forest">
            Explore Botanical Categories
          </h2>
          <span className="text-xs text-stone-500">
            {products.length} items available in {currentCity}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { key: 'All', label: 'All Catalog', desc: 'Complete Range' },
            { key: 'Plants', label: 'Living Plants', desc: 'Air & Indoor Flora' },
            { key: 'Seeds', label: 'Seeds', desc: 'Heirloom & Veg' },
            { key: 'Flowers', label: 'Flowers', desc: 'Fragrant & Sacred' },
            { key: 'Fertilizers', label: 'Fertilizers', desc: 'Organic Nutrition' },
            { key: 'Pots', label: 'Pots', desc: 'Ceramic & Terracotta' },
          ].map((cat) => {
            const isSelected = selectedMainCat === cat.key
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedMainCat(cat.key as any)}
                className={clsx(
                  'flex flex-col items-center justify-center rounded-2xl p-4 text-center transition border shadow-xs',
                  isSelected
                    ? 'border-phyto-forest bg-phyto-forest text-white ring-2 ring-emerald-600/30'
                    : 'border-stone-200/90 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                )}
              >
                <span className="text-xs font-bold">{cat.label}</span>
                <span className={clsx('mt-0.5 text-[10px]', isSelected ? 'text-stone-300' : 'text-stone-500')}>
                  {cat.desc}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. Dynamic Products Catalog Grid
          ───────────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-display text-xl font-bold text-phyto-forest">
            {selectedMainCat === 'All' ? 'Featured Botanical Catalog' : `${selectedMainCat} Collection`}
          </h2>
          <Link
            to={`/shop?cat=${selectedMainCat}`}
            className="text-xs font-bold text-phyto-leaf hover:underline flex items-center gap-1"
          >
            <span>View All {selectedMainCat}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {displayProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </div>
  )
}
