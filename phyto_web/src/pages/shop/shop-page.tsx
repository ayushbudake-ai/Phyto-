import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../../ui/product-card'
import type {
  Environment,
  SuitableSpace,
  LightRequirement,
  WaterRequirement,
  MaintenanceLevel,
  PlantPurpose,
} from '../../features/catalog/types'
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
} from 'lucide-react'
import clsx from 'clsx'
import { formatInr } from '../../lib/format'
import { products as localProducts } from '../../data/products'
import { useAuth } from '../../features/auth/auth-context'

type Sort = 'popular' | 'price-asc' | 'price-desc' | 'name-asc'

const SPACES: { id: SuitableSpace; label: string; icon: string }[] = [
  { id: 'Living room', label: 'Living room', icon: '🛋️' },
  { id: 'Bedroom', label: 'Bedroom', icon: '🛏️' },
  { id: 'Balcony', label: 'Balcony', icon: '🪴' },
  { id: 'Office', label: 'Office', icon: '🏢' },
  { id: 'Desk', label: 'Desk', icon: '💻' },
  { id: 'Terrace', label: 'Terrace', icon: '☀️' },
]

const LIGHT_OPTIONS: { id: LightRequirement; label: string; desc: string }[] = [
  { id: 'Low', label: 'Low / Shade', desc: 'Bedrooms & corners' },
  { id: 'Medium', label: 'Medium Light', desc: 'Indirect bright light' },
  { id: 'Bright', label: 'Bright / Direct Sun', desc: 'Sunny balconies' },
]

const WATER_OPTIONS: { id: WaterRequirement; label: string; desc: string }[] = [
  { id: 'Low', label: 'Low Water', desc: 'Every 2-3 weeks' },
  { id: 'Medium', label: 'Moderate', desc: 'Once a week' },
  { id: 'High', label: 'High Moisture', desc: 'Keep soil damp' },
]

const MAINTENANCE_OPTIONS: { id: MaintenanceLevel; label: string }[] = [
  { id: 'Easy', label: 'Easy Care (Beginner)' },
  { id: 'Moderate', label: 'Moderate Care' },
  { id: 'Difficult', label: 'Collector (High Care)' },
]

const PURPOSES: { id: PlantPurpose; label: string }[] = [
  { id: 'Air purification', label: 'Air Purification' },
  { id: 'Decoration', label: 'Interior Decor' },
  { id: 'Gifting', label: 'Gift Ready' },
  { id: 'Herbs', label: 'Fresh Herbs' },
  { id: 'Medicinal', label: 'Medicinal & Wellness' },
  { id: 'Gardening', label: 'Outdoor Gardening' },
]

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Botanical Items' },
  { id: 'Indoor Plants', label: 'Indoor Plants' },
  { id: 'Air-Purifying Plants', label: 'Air-Purifying Plants' },
  { id: 'Flowering Plants', label: 'Flowering Plants' },
  { id: 'Succulents & Cacti', label: 'Succulents & Cacti' },
  { id: 'Herbs & Medicinal', label: 'Herbs & Medicinal' },
  { id: 'Customized Kits', label: 'Customized Kits' },
  { id: 'Seeds', label: 'Seeds' },
  { id: 'Fertilizers', label: 'Fertilizers & Soil' },
  { id: 'Tools', label: 'Gardening Tools' },
]

const PAGE_SIZE = 12

export function ShopPage() {
  const [params, setParams] = useSearchParams()
  const { recordSearchQuery } = useAuth()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  // Current Filter Parameters
  const selectedEnv = (params.get('env') as Environment | null) ?? null
  const selectedSpace = (params.get('space') as SuitableSpace | null) ?? null
  const selectedLight = (params.get('light') as LightRequirement | null) ?? null
  const selectedWater = (params.get('water') as WaterRequirement | null) ?? null
  const selectedMaintenance = (params.get('maintenance') as MaintenanceLevel | null) ?? null
  const selectedPurpose = (params.get('purpose') as PlantPurpose | null) ?? null
  const selectedCategory = params.get('category') || 'all'
  const selectedPetFriendly = params.get('pet_friendly') === 'true'
  const selectedBeginner = params.get('beginner') === 'true'
  const minPrice = Number(params.get('min_price') ?? '0')
  const maxPrice = Number(params.get('max_price') ?? '2000')
  const searchQ = (params.get('q') ?? '').trim().toLowerCase()
  const sort = (params.get('sort') as Sort | null) ?? 'popular'

  // Record searches for personalized recommendations
  useEffect(() => {
    if (searchQ) {
      recordSearchQuery(searchQ)
    }
  }, [searchQ, recordSearchQuery])

  // Compound Filter Algorithm
  const filtered = useMemo(() => {
    return localProducts.filter((p) => {
      // 1. Search Query
      if (searchQ) {
        const matchesName = p.name.toLowerCase().includes(searchQ)
        const matchesSci = p.scientificName?.toLowerCase().includes(searchQ)
        const matchesDesc = p.description.toLowerCase().includes(searchQ)
        const matchesTags = p.tags.some((t) => t.toLowerCase().includes(searchQ))
        const matchesBenefits = p.benefits?.toLowerCase().includes(searchQ)
        if (!matchesName && !matchesSci && !matchesDesc && !matchesTags && !matchesBenefits) {
          return false
        }
      }

      // 2. Category Filter
      if (selectedCategory && selectedCategory !== 'all') {
        if (p.category !== selectedCategory) return false
      }

      // 3. Environment (Indoor / Outdoor / Both)
      if (selectedEnv) {
        if (p.environment !== selectedEnv && p.environment !== 'both') return false
      }

      // 4. Available Space
      if (selectedSpace) {
        if (!p.suitableSpace?.includes(selectedSpace)) return false
      }

      // 5. Light Requirement
      if (selectedLight) {
        if (p.lightRequirement !== selectedLight) return false
      }

      // 6. Water Requirement
      if (selectedWater) {
        if (p.waterRequirement !== selectedWater) return false
      }

      // 7. Maintenance Level
      if (selectedMaintenance) {
        if (p.maintenance !== selectedMaintenance && p.difficulty !== selectedMaintenance) return false
      }

      // 8. Purpose
      if (selectedPurpose) {
        if (!p.purpose?.includes(selectedPurpose)) return false
      }

      // 9. Pet Friendly
      if (selectedPetFriendly) {
        if (!p.isPetFriendly && p.petSafety !== 'Pet-Friendly') return false
      }

      // 10. Beginner Friendly
      if (selectedBeginner) {
        if (!p.beginnerFriendly && p.maintenance !== 'Easy') return false
      }

      // 11. Price Range
      if (p.price < minPrice || p.price > maxPrice) return false

      return true
    })
  }, [
    searchQ,
    selectedCategory,
    selectedEnv,
    selectedSpace,
    selectedLight,
    selectedWater,
    selectedMaintenance,
    selectedPurpose,
    selectedPetFriendly,
    selectedBeginner,
    minPrice,
    maxPrice,
  ])

  // Sorting
  const sorted = useMemo(() => {
    const list = [...filtered]
    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'name-asc') list.sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'popular') list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    return list
  }, [filtered, sort])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || value === 'false') {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setParams(next, { replace: true })
    setPage(1)
  }

  function resetAllFilters() {
    setParams(new URLSearchParams(), { replace: true })
    setPage(1)
  }

  const activeFilterCount = [
    selectedEnv,
    selectedSpace,
    selectedLight,
    selectedWater,
    selectedMaintenance,
    selectedPurpose,
    selectedCategory !== 'all' ? selectedCategory : null,
    selectedPetFriendly ? 'pet' : null,
    selectedBeginner ? 'beginner' : null,
    minPrice > 0 || maxPrice < 2000 ? 'price' : null,
    searchQ || null,
  ].filter(Boolean).length

  return (
    <div className="space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="text-xs font-semibold text-stone-500 mb-2">
          <Link to="/" className="hover:text-phyto-leaf">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-phyto-forest">Botanical Catalog</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-phyto-forest md:text-4xl">
              Explore Our Plant Collection
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Browse over 100+ vetted living plants, customized kits, and organic care supplies.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-full border border-phyto-forest/20 bg-white px-4 py-2.5 text-xs font-bold text-phyto-forest shadow-sm md:hidden"
            >
              <SlidersHorizontal className="size-4" />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500 uppercase hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="rounded-full border border-phyto-forest/20 bg-white px-4 py-2 text-xs font-bold text-phyto-forest shadow-sm focus:outline-none"
              >
                <option value="popular">Popular &amp; Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((c) => {
          const isSelected = selectedCategory === c.id || (c.id === 'all' && !params.get('category'))
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => updateParam('category', c.id === 'all' ? null : c.id)}
              className={clsx(
                'rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition shadow-2xs',
                isSelected
                  ? 'bg-phyto-forest text-white'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-phyto-sage/40'
              )}
            >
              {c.label}
            </button>
          )
        })}
      </div>

      {/* Main Grid: Filters Sidebar + Products */}
      <div className="grid gap-8 lg:grid-cols-[290px_1fr]">
        {/* Filter Sidebar */}
        <aside className={clsx('space-y-6', mobileFiltersOpen ? 'block' : 'hidden lg:block')}>
          <div className="sticky top-24 space-y-6 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-phyto-forest" />
                <span className="font-display text-base font-bold text-phyto-forest">Filter by Your Needs</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex items-center gap-1 text-xs font-bold text-red-600 hover:underline"
                >
                  <RotateCcw className="size-3" />
                  <span>Reset ({activeFilterCount})</span>
                </button>
              )}
            </div>

            {/* Quick Lifestyle Toggles */}
            <div className="space-y-2">
              <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-2.5 cursor-pointer hover:bg-stone-50 transition">
                <span className="text-xs font-bold text-phyto-forest flex items-center gap-1.5">
                  <span>🐶</span> Pet-Friendly Only
                </span>
                <input
                  type="checkbox"
                  checked={selectedPetFriendly}
                  onChange={(e) => updateParam('pet_friendly', e.target.checked ? 'true' : null)}
                  className="size-4 rounded text-phyto-leaf focus:ring-phyto-mint"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-2.5 cursor-pointer hover:bg-stone-50 transition">
                <span className="text-xs font-bold text-phyto-forest flex items-center gap-1.5">
                  <span>🌱</span> Beginner-Friendly
                </span>
                <input
                  type="checkbox"
                  checked={selectedBeginner}
                  onChange={(e) => updateParam('beginner', e.target.checked ? 'true' : null)}
                  className="size-4 rounded text-phyto-leaf focus:ring-phyto-mint"
                />
              </label>
            </div>

            {/* Environment */}
            <FilterSection title="Environment">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateParam('env', selectedEnv === 'indoor' ? null : 'indoor')}
                  className={clsx(
                    'rounded-xl py-2 text-xs font-bold transition border',
                    selectedEnv === 'indoor'
                      ? 'bg-phyto-forest text-white border-phyto-forest'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  )}
                >
                  🏠 Indoor
                </button>
                <button
                  type="button"
                  onClick={() => updateParam('env', selectedEnv === 'outdoor' ? null : 'outdoor')}
                  className={clsx(
                    'rounded-xl py-2 text-xs font-bold transition border',
                    selectedEnv === 'outdoor'
                      ? 'bg-phyto-forest text-white border-phyto-forest'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  )}
                >
                  ☀️ Outdoor
                </button>
              </div>
            </FilterSection>

            {/* Suitable Space */}
            <FilterSection title="Available Space in Your Home">
              <div className="grid grid-cols-2 gap-1.5">
                {SPACES.map((sp) => {
                  const isSelected = selectedSpace === sp.id
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => updateParam('space', isSelected ? null : sp.id)}
                      className={clsx(
                        'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-left transition border',
                        isSelected
                          ? 'bg-phyto-sage text-phyto-forest border-phyto-leaf ring-1 ring-phyto-leaf'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      )}
                    >
                      <span>{sp.icon}</span>
                      <span className="truncate">{sp.label}</span>
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Sunlight / Light Requirement */}
            <FilterSection title="Sunlight Exposure">
              <div className="space-y-1.5">
                {LIGHT_OPTIONS.map((l) => {
                  const isSelected = selectedLight === l.id
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => updateParam('light', isSelected ? null : l.id)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-left transition border',
                        isSelected
                          ? 'bg-phyto-sage text-phyto-forest border-phyto-leaf'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      )}
                    >
                      <div>
                        <p>{l.label}</p>
                        <p className="text-[10px] text-stone-500 font-normal">{l.desc}</p>
                      </div>
                      {isSelected && <Check className="size-3.5 text-phyto-leaf" />}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Water Requirement */}
            <FilterSection title="Watering Need">
              <div className="grid grid-cols-3 gap-1.5">
                {WATER_OPTIONS.map((w) => {
                  const isSelected = selectedWater === w.id
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => updateParam('water', isSelected ? null : w.id)}
                      className={clsx(
                        'rounded-xl py-2 px-1 text-center text-xs font-bold transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      {w.label.split(' ')[0]}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Maintenance Level */}
            <FilterSection title="Maintenance Effort">
              <div className="space-y-1.5">
                {MAINTENANCE_OPTIONS.map((m) => {
                  const isSelected = selectedMaintenance === m.id
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => updateParam('maintenance', isSelected ? null : m.id)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-bold text-left transition border',
                        isSelected
                          ? 'bg-phyto-sage text-phyto-forest border-phyto-leaf'
                          : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      )}
                    >
                      <span>{m.label}</span>
                      {isSelected && <Check className="size-3.5 text-phyto-leaf" />}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Plant Purpose */}
            <FilterSection title="Plant Purpose">
              <div className="flex flex-wrap gap-1.5">
                {PURPOSES.map((purp) => {
                  const isSelected = selectedPurpose === purp.id
                  return (
                    <button
                      key={purp.id}
                      type="button"
                      onClick={() => updateParam('purpose', isSelected ? null : purp.id)}
                      className={clsx(
                        'rounded-full px-3 py-1.5 text-[11px] font-bold transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      {purp.label}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection title="Price Range (₹)">
              <div className="flex items-center justify-between text-xs font-bold text-phyto-forest mb-2">
                <span>{formatInr(minPrice)}</span>
                <span>—</span>
                <span>{formatInr(maxPrice)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  max={2000}
                  step={50}
                  value={minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-bold"
                  placeholder="Min ₹"
                />
                <input
                  type="number"
                  min={0}
                  max={2500}
                  step={50}
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-bold"
                  placeholder="Max ₹"
                />
              </div>
            </FilterSection>

            <button
              type="button"
              onClick={resetAllFilters}
              className="w-full rounded-full border border-phyto-forest/20 py-2.5 text-xs font-bold text-phyto-forest hover:bg-phyto-sage/40 transition"
            >
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* Product Catalog Grid */}
        <div className="space-y-6">
          {/* Active Filter Chips Bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-phyto-sage/30 p-3 text-xs">
              <span className="font-bold text-phyto-forest text-[11px] uppercase tracking-wider mr-1">
                Active ({activeFilterCount}):
              </span>

              {searchQ && (
                <Chip label={`"${searchQ}"`} onRemove={() => updateParam('q', null)} />
              )}
              {selectedCategory !== 'all' && (
                <Chip label={selectedCategory} onRemove={() => updateParam('category', null)} />
              )}
              {selectedEnv && (
                <Chip label={`Env: ${selectedEnv}`} onRemove={() => updateParam('env', null)} />
              )}
              {selectedSpace && (
                <Chip label={`Space: ${selectedSpace}`} onRemove={() => updateParam('space', null)} />
              )}
              {selectedLight && (
                <Chip label={`Light: ${selectedLight}`} onRemove={() => updateParam('light', null)} />
              )}
              {selectedWater && (
                <Chip label={`Water: ${selectedWater}`} onRemove={() => updateParam('water', null)} />
              )}
              {selectedMaintenance && (
                <Chip label={`Care: ${selectedMaintenance}`} onRemove={() => updateParam('maintenance', null)} />
              )}
              {selectedPurpose && (
                <Chip label={`Purpose: ${selectedPurpose}`} onRemove={() => updateParam('purpose', null)} />
              )}
              {selectedPetFriendly && (
                <Chip label="Pet-Friendly" onRemove={() => updateParam('pet_friendly', null)} />
              )}
              {selectedBeginner && (
                <Chip label="Beginner-Friendly" onRemove={() => updateParam('beginner', null)} />
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="ml-auto text-xs font-bold text-phyto-leaf underline"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing <strong>{sorted.length > 0 ? (safePage - 1) * PAGE_SIZE + 1 : 0}–{Math.min(safePage * PAGE_SIZE, sorted.length)}</strong> of <strong>{sorted.length}</strong> unique plants
            </span>
          </div>

          {/* Empty State */}
          {pageItems.length === 0 ? (
            <div className="rounded-3xl border border-phyto-forest/10 bg-white p-12 text-center shadow-card space-y-4">
              <div className="mx-auto grid size-16 place-items-center rounded-full bg-phyto-sage text-3xl">
                🪴
              </div>
              <h3 className="font-display text-xl font-bold text-phyto-forest">
                No plants match your specific filter combination
              </h3>
              <p className="text-xs text-stone-600 max-w-md mx-auto">
                Try loosening your sunlight, space, or price filters to see more of our 100+ botanical varieties.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-2 rounded-full bg-phyto-forest px-6 py-3 text-xs font-bold text-white hover:bg-phyto-leaf transition"
              >
                <RotateCcw className="size-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-6 text-xs text-stone-600">
              <span>
                Page {safePage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid size-9 place-items-center rounded-full border border-stone-200 disabled:opacity-30 hover:bg-stone-100"
                >
                  <ChevronLeft className="size-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setPage(n)}
                    className={clsx(
                      'grid size-9 place-items-center rounded-full text-xs font-bold transition',
                      n === safePage
                        ? 'bg-phyto-forest text-white'
                        : 'border border-stone-200 hover:bg-phyto-sage/40'
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid size-9 place-items-center rounded-full border border-stone-200 disabled:opacity-30 hover:bg-stone-100"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500">{title}</div>
      {children}
    </div>
  )
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-phyto-forest shadow-2xs border border-phyto-forest/10">
      <span>{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full hover:bg-stone-100 p-0.5"
      >
        <X className="size-3" />
      </button>
    </span>
  )
}
