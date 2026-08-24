import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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

const SPACES: { id: SuitableSpace; label: string }[] = [
  { id: 'Living room', label: 'Living Room' },
  { id: 'Bedroom', label: 'Bedroom' },
  { id: 'Balcony', label: 'Balcony' },
  { id: 'Office', label: 'Office' },
  { id: 'Desk', label: 'Desk' },
  { id: 'Terrace', label: 'Terrace' },
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
  { id: 'all', label: 'All Catalog' },
  { id: 'Plants', label: 'Living Plants' },
  { id: 'Seeds', label: 'Seeds' },
  { id: 'Flowers', label: 'Flowers' },
  { id: 'Fertilizers', label: 'Fertilizers & Soil' },
  { id: 'Pots', label: 'Pots & Planters' },
  { id: 'Customized Kits', label: 'Customized Kits' },
  { id: 'Indoor Plants', label: 'Indoor Greenery' },
  { id: 'Air-Purifying Plants', label: 'Air-Purifying Plants' },
  { id: 'Succulents & Cacti', label: 'Succulents & Cacti' },
  { id: 'Herbs & Medicinal', label: 'Herbs & Medicinal' },
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
  const selectedCategory = params.get('cat') || params.get('category') || 'all'
  const selectedPetFriendly = params.get('pet_friendly') === 'true'
  const selectedBeginner = params.get('beginner') === 'true'
  const minPrice = Number(params.get('min_price') ?? '0')
  const maxPrice = Number(params.get('max_price') ?? '2000')
  const searchQ = (params.get('q') ?? '').trim().toLowerCase()
  const sort = (params.get('sort') as Sort | null) ?? 'popular'

  // Record searches for personalized recommendations
  useEffect(() => {
    if (searchQ && searchQ.length > 2) {
      recordSearchQuery(searchQ)
    }
  }, [searchQ, recordSearchQuery])

  function updateParam(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (value === null || value === '' || (key === 'category' && value === 'all')) {
      next.delete(key)
    } else {
      next.set(key, value)
    }
    setParams(next)
    setPage(1)
  }

  function resetAllFilters() {
    setParams(new URLSearchParams())
    setPage(1)
  }

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (selectedEnv) count++
    if (selectedSpace) count++
    if (selectedLight) count++
    if (selectedWater) count++
    if (selectedMaintenance) count++
    if (selectedPurpose) count++
    if (selectedPetFriendly) count++
    if (selectedBeginner) count++
    if (selectedCategory && selectedCategory !== 'all') count++
    if (minPrice > 0 || maxPrice < 2000) count++
    if (searchQ) count++
    return count
  }, [
    selectedEnv,
    selectedSpace,
    selectedLight,
    selectedWater,
    selectedMaintenance,
    selectedPurpose,
    selectedPetFriendly,
    selectedBeginner,
    selectedCategory,
    minPrice,
    maxPrice,
    searchQ,
  ])

  // Filter and Sort Products
  const filteredProducts = useMemo(() => {
    return localProducts.filter((p) => {
      // Search
      if (searchQ) {
        const inName = p.name.toLowerCase().includes(searchQ)
        const inSci = p.scientificName?.toLowerCase().includes(searchQ) ?? false
        const inDesc = p.description.toLowerCase().includes(searchQ)
        const inTag = p.tags.some((t) => t.toLowerCase().includes(searchQ))
        const inCat = (p.category || '').toLowerCase().includes(searchQ)
        const inMainCat = p.mainCategory?.toLowerCase().includes(searchQ) ?? false
        if (!inName && !inSci && !inDesc && !inTag && !inCat && !inMainCat) return false
      }

      // Main Category / Subcategory
      if (selectedCategory && selectedCategory !== 'all') {
        const matchMain = (p.mainCategory || p.type || '').toLowerCase() === selectedCategory.toLowerCase()
        const matchSub = (p.category || '').toLowerCase() === selectedCategory.toLowerCase()
        if (!matchMain && !matchSub) return false
      }

      // Environment
      if (selectedEnv && p.environment !== 'both' && p.environment !== selectedEnv) return false

      // Space
      if (selectedSpace && !(p.suitableSpace || []).includes(selectedSpace)) return false

      // Light
      if (selectedLight && p.lightRequirement && p.lightRequirement !== selectedLight) return false

      // Water
      if (selectedWater && p.waterRequirement && p.waterRequirement !== selectedWater) return false

      // Maintenance
      if (selectedMaintenance && p.maintenance && p.maintenance !== selectedMaintenance) return false

      // Purpose
      if (selectedPurpose && !(p.benefits || '').toLowerCase().includes(selectedPurpose.toLowerCase())) return false

      // Pet Friendly
      if (selectedPetFriendly && !p.isPetFriendly) return false

      // Beginner Friendly
      if (selectedBeginner && !p.beginnerFriendly) return false

      // Price Range
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

  // Sorted list
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (sort === 'price-asc') return list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return list.sort((a, b) => b.price - a.price)
    if (sort === 'name-asc') return list.sort((a, b) => a.name.localeCompare(b.name))
    return list.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  }, [filteredProducts, sort])

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / PAGE_SIZE)
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return sortedProducts.slice(start, start + PAGE_SIZE)
  }, [sortedProducts, page])

  return (
    <div className="space-y-6 pb-16">
      {/* Top Banner & Header */}
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-phyto-forest md:text-4xl">
              Explore Botanical Collection
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-stone-600">
              Browse over 220+ living plants, heirloom seeds, fragrant flowers, fertilizers, and designer pots.
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
                <span className="font-display text-base font-bold text-phyto-forest">Filter by Need</span>
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
                <span className="text-xs font-bold text-phyto-forest">Pet-Friendly Only</span>
                <input
                  type="checkbox"
                  checked={selectedPetFriendly}
                  onChange={(e) => updateParam('pet_friendly', e.target.checked ? 'true' : null)}
                  className="size-4 rounded text-phyto-leaf focus:ring-phyto-mint"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-2.5 cursor-pointer hover:bg-stone-50 transition">
                <span className="text-xs font-bold text-phyto-forest">Beginner-Friendly Only</span>
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
                  Indoor
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
                  Outdoor
                </button>
              </div>
            </FilterSection>

            {/* Suitable Space */}
            <FilterSection title="Suitable Space">
              <div className="grid grid-cols-2 gap-2">
                {SPACES.map((sp) => {
                  const isSelected = selectedSpace === sp.id
                  return (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => updateParam('space', isSelected ? null : sp.id)}
                      className={clsx(
                        'flex items-center justify-center rounded-xl p-2 text-xs font-bold transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      <span>{sp.label}</span>
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Sunlight / Light Exposure */}
            <FilterSection title="Sunlight Requirement">
              <div className="space-y-1.5">
                {LIGHT_OPTIONS.map((lo) => {
                  const isSelected = selectedLight === lo.id
                  return (
                    <button
                      key={lo.id}
                      type="button"
                      onClick={() => updateParam('light', isSelected ? null : lo.id)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl p-2 text-left text-xs transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      <div>
                        <div className="font-bold">{lo.label}</div>
                        <div className={clsx('text-[10px]', isSelected ? 'text-stone-300' : 'text-stone-400')}>
                          {lo.desc}
                        </div>
                      </div>
                      {isSelected && <Check className="size-4" />}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Water Requirement */}
            <FilterSection title="Water Requirement">
              <div className="space-y-1.5">
                {WATER_OPTIONS.map((wo) => {
                  const isSelected = selectedWater === wo.id
                  return (
                    <button
                      key={wo.id}
                      type="button"
                      onClick={() => updateParam('water', isSelected ? null : wo.id)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl p-2 text-left text-xs transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      <div>
                        <div className="font-bold">{wo.label}</div>
                        <div className={clsx('text-[10px]', isSelected ? 'text-stone-300' : 'text-stone-400')}>
                          {wo.desc}
                        </div>
                      </div>
                      {isSelected && <Check className="size-4" />}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Maintenance Level */}
            <FilterSection title="Maintenance Level">
              <div className="space-y-1.5">
                {MAINTENANCE_OPTIONS.map((mo) => {
                  const isSelected = selectedMaintenance === mo.id
                  return (
                    <button
                      key={mo.id}
                      type="button"
                      onClick={() => updateParam('maintenance', isSelected ? null : mo.id)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl p-2 text-left text-xs font-bold transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      <span>{mo.label}</span>
                      {isSelected && <Check className="size-4" />}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Plant Purpose */}
            <FilterSection title="Plant Purpose">
              <div className="space-y-1.5">
                {PURPOSES.map((pu) => {
                  const isSelected = selectedPurpose === pu.id
                  return (
                    <button
                      key={pu.id}
                      type="button"
                      onClick={() => updateParam('purpose', isSelected ? null : pu.id)}
                      className={clsx(
                        'flex w-full items-center justify-between rounded-xl p-2 text-left text-xs font-bold transition border',
                        isSelected
                          ? 'bg-phyto-forest text-white border-phyto-forest'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      )}
                    >
                      <span>{pu.label}</span>
                      {isSelected && <Check className="size-4" />}
                    </button>
                  )
                })}
              </div>
            </FilterSection>

            {/* Price Range Slider */}
            <FilterSection title="Price Range (₹)">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-phyto-forest">
                  <span>{formatInr(minPrice)}</span>
                  <span>{formatInr(maxPrice)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="2500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value === '2000' ? null : e.target.value)}
                  className="w-full accent-phyto-leaf"
                />
              </div>
            </FilterSection>
          </div>
        </aside>

        {/* Products Grid & Results */}
        <div className="space-y-6">
          {/* Active filter pills bar */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-stone-100 p-3 text-xs">
              <span className="font-bold text-stone-500">Active Filters:</span>
              {searchQ && (
                <FilterPill label={`Query: "${searchQ}"`} onRemove={() => updateParam('q', null)} />
              )}
              {selectedCategory && selectedCategory !== 'all' && (
                <FilterPill
                  label={`Category: ${selectedCategory}`}
                  onRemove={() => updateParam('category', null)}
                />
              )}
              {selectedEnv && (
                <FilterPill
                  label={`Environment: ${selectedEnv}`}
                  onRemove={() => updateParam('env', null)}
                />
              )}
              {selectedSpace && (
                <FilterPill
                  label={`Space: ${selectedSpace}`}
                  onRemove={() => updateParam('space', null)}
                />
              )}
              {selectedLight && (
                <FilterPill
                  label={`Light: ${selectedLight}`}
                  onRemove={() => updateParam('light', null)}
                />
              )}
              {selectedWater && (
                <FilterPill
                  label={`Water: ${selectedWater}`}
                  onRemove={() => updateParam('water', null)}
                />
              )}
              {selectedMaintenance && (
                <FilterPill
                  label={`Care: ${selectedMaintenance}`}
                  onRemove={() => updateParam('maintenance', null)}
                />
              )}
              {selectedPetFriendly && (
                <FilterPill label="Pet-Friendly" onRemove={() => updateParam('pet_friendly', null)} />
              )}
              {selectedBeginner && (
                <FilterPill label="Beginner-Friendly" onRemove={() => updateParam('beginner', null)} />
              )}

              <button
                type="button"
                onClick={resetAllFilters}
                className="ml-auto text-xs font-bold text-red-600 hover:underline"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing <strong>{paginatedProducts.length}</strong> of{' '}
              <strong>{sortedProducts.length}</strong> matching botanical items
            </span>
          </div>

          {/* Product Cards Grid */}
          {paginatedProducts.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {paginatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-phyto-forest/10 bg-white p-12 text-center space-y-4 shadow-card">
              <h3 className="font-display text-xl font-bold text-phyto-forest">No matching botanical items</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto">
                No items match your selected space, sunlight, or category filters. Try widening your criteria.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="rounded-full bg-phyto-forest px-6 py-2.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="grid size-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPage(num)}
                  className={clsx(
                    'size-9 rounded-full text-xs font-bold transition shadow-xs',
                    page === num
                      ? 'bg-phyto-forest text-white'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  )}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="grid size-9 place-items-center rounded-full border border-stone-200 bg-white text-stone-700 shadow-xs hover:bg-stone-50 disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 border-t border-stone-100 pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">{title}</h3>
      {children}
    </div>
  )
}

function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 font-bold text-phyto-forest border border-stone-200 shadow-xs">
      <span>{label}</span>
      <button type="button" onClick={onRemove} className="text-stone-400 hover:text-stone-600">
        <X className="size-3" />
      </button>
    </span>
  )
}
