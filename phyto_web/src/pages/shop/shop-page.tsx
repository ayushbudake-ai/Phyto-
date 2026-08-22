import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ProductCard } from '../../ui/product-card'
import type { Environment, ProductTags, ProductType, Smell, Sunlight } from '../../features/catalog/types'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import shopMonsteraImg from '../../assets/shop-monstera.png'
import clsx from 'clsx'
import { apiFetch } from '../../lib/api'
import { formatUsd } from '../../lib/format'
import { products as localProducts } from '../../data/products'

type Sort = 'price-asc' | 'price-desc' | 'popular'

const plantTypes: { id: ProductType; label: string }[] = [
  { id: 'flowers', label: 'Flower' },
  { id: 'plants', label: 'Indoor plants' },
  { id: 'seeds', label: 'Seeds' },
  { id: 'fertilizers', label: 'Fertilizer' },
  { id: 'tools', label: 'Tools' },
]

const smells: { id: Smell; label: string }[] = [
  { id: 'fragrant', label: 'Fragrant' },
  { id: 'non-fragrant', label: 'Non-fragrant' },
]

const sunlights: { id: Sunlight; label: string }[] = [
  { id: 'full-sun', label: 'Full sun' },
  { id: 'partial', label: 'Partial shade' },
  { id: 'shade', label: 'Full shade' },
]

const tags: { id: ProductTags; label: string }[] = [
  { id: 'pet-friendly', label: 'Pet friendly' },
  { id: 'air-purifying', label: 'Air purifying' },
  { id: 'medicinal', label: 'Medicinal' },
  { id: 'spirituality', label: 'Spiritual' },
  { id: 'hanging', label: 'Hanging' },
  { id: 'low-maintenance', label: 'Low maintenance' },
  { id: 'fast-growing', label: 'Fast growing' },
  { id: 'rare', label: 'Rare' },
]

const PAGE_SIZE = 6

export function ShopPage() {
  const [products, setProducts] = useState<import('../../features/catalog/types').Product[]>([])
  const [params, setParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)

  const selectedType = (params.get('type') as ProductType | null) ?? null
  const selectedSmell = (params.get('smell') as Smell | null) ?? null
  const selectedSunlight = (params.get('sunlight') as Sunlight | null) ?? null
  const selectedEnv = (params.get('env') as Environment | null) ?? null
  const searchQ = (params.get('q') ?? '').trim().toLowerCase()
  const selectedTags = useMemo(
    () => new Set((params.get('tags') ?? '').split(',').filter(Boolean) as ProductTags[]),
    [params]
  )
  const min = Number(params.get('min') ?? '0')
  const max = Number(params.get('max') ?? '150')
  const sort = (params.get('sort') as Sort | null) ?? 'popular'

  useEffect(() => {
    type ApiProduct = {
      id: number
      name: string
      price: number
      image_url: string | null
      type: string
      environment: string
      sunlight: string
      smell: string
      popularity: number
    }
    type ApiResponse = { items: ApiProduct[] }

    const mapType = (v: string): ProductType => {
      if (v === 'seed') return 'seeds'
      if (v === 'tool') return 'tools'
      if (v === 'accessory') return 'fertilizers'
      return 'plants'
    }
    const mapSun = (v: string): Sunlight => (v === 'full_sun' ? 'full-sun' : v === 'full_shade' ? 'shade' : 'partial')
    const mapSmell = (v: string): Smell => (v === 'strong' ? 'strong' : v === 'light' ? 'mild' : 'non-fragrant')
    const mapEnv = (v: string): Environment => (v === 'outdoor' ? 'outdoor' : 'indoor')

    apiFetch<ApiResponse>('/products')
      .then((res) => {
        const mapped = (res.items ?? []).map((p) => ({
          id: String(p.id),
          name: p.name,
          description: `${p.name} from our backend catalog.`,
          price: p.price ?? 0,
          popularity: p.popularity ?? 0,
          type: mapType(p.type),
          smell: mapSmell(p.smell),
          sunlight: mapSun(p.sunlight),
          environment: mapEnv(p.environment),
          tags: [] as ProductTags[],
          imageUrl: p.name?.toLowerCase().includes('monstera') ? shopMonsteraImg : (p.image_url ?? undefined),
          care: {
            water: 'Follow product care guidance.',
            sunlight: p.sunlight?.replaceAll('_', ' ') ?? 'Partial shade',
          },
        }))
        const localOnly = localProducts.filter((lp) => !mapped.some((mp) => mp.name.toLowerCase() === lp.name.toLowerCase()))
        setProducts([...mapped, ...localOnly])
      })
      .catch(() => setProducts(localProducts))
  }, [])

  const filtered = useMemo(() => {
    let list = products.slice()
    if (searchQ) list = list.filter((p) => p.name.toLowerCase().includes(searchQ) || p.description.toLowerCase().includes(searchQ))
    if (selectedType) list = list.filter((p) => p.type === selectedType)
    if (selectedSmell) list = list.filter((p) => p.smell === selectedSmell)
    if (selectedSunlight) list = list.filter((p) => p.sunlight === selectedSunlight)
    if (selectedEnv) list = list.filter((p) => p.environment === selectedEnv)
    if (selectedTags.size > 0) list = list.filter((p) => Array.from(selectedTags).every((t) => p.tags.includes(t)))
    list = list.filter((p) => p.price >= min && p.price <= max)

    if (sort === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sort === 'popular') list.sort((a, b) => b.popularity - a.popularity)
    return list
  }, [max, min, searchQ, selectedEnv, selectedSmell, selectedSunlight, selectedTags, selectedType, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const featured = filtered[0] ?? products[0]

  function update(key: string, value: string | null) {
    const next = new URLSearchParams(params)
    if (!value) next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
    setPage(1)
  }

  function toggleTag(tag: ProductTags) {
    const next = new Set(selectedTags)
    if (next.has(tag)) next.delete(tag)
    else next.add(tag)
    update('tags', next.size ? Array.from(next).join(',') : null)
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="text-sm text-stone-500">
        <Link to="/" className="font-medium hover:text-phyto-leaf">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="font-semibold text-phyto-forest">Shop all plants</span>
      </nav>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-phyto-forest md:text-4xl">Our botanical collection</h1>
          <p className="mt-2 max-w-2xl text-stone-600">
            Curated greenery for every corner of your life. From sun-loving succulents to deep-shade ferns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-phyto-forest/15 bg-white px-4 py-2 text-sm font-bold text-phyto-forest md:hidden"
          >
            <SlidersHorizontal className="size-4" />
            Filters
          </button>
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-500">
            Sort by
            <select
              value={sort}
              onChange={(e) => update('sort', e.target.value)}
              className="rounded-full border border-phyto-forest/15 bg-white px-4 py-2 text-sm font-bold text-phyto-forest"
            >
              <option value="popular">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className={mobileFiltersOpen ? 'block' : 'hidden lg:block'}>
          <div className="sticky top-24 space-y-6 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
            <div className="font-display text-lg font-semibold text-phyto-forest">Filters</div>

            <FilterGroup title="Plant type">
              <div className="space-y-2">
                {plantTypes.map((t) => (
                  <label key={t.label} className="flex cursor-pointer items-center gap-3 text-sm font-medium text-stone-700">
                    <input
                      type="checkbox"
                      checked={selectedType === t.id}
                      onChange={() => update('type', selectedType === t.id ? null : t.id)}
                      className="size-4 rounded border-phyto-forest/30 text-phyto-leaf focus:ring-phyto-mint"
                    />
                    {t.label}
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Sunlight exposure">
              <div className="flex flex-wrap gap-2">
                {sunlights.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => update('sunlight', selectedSunlight === s.id ? null : s.id)}
                    className={clsx(
                      'rounded-full px-3 py-1.5 text-xs font-bold transition',
                      selectedSunlight === s.id ? 'bg-phyto-sage text-phyto-forest ring-2 ring-phyto-leaf' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Price range">
              <div className="flex items-center gap-2 text-sm font-bold text-phyto-forest">
                <span>${min}</span>
                <span className="text-stone-400">—</span>
                <span>${max}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input
                  type="number"
                  value={min}
                  min={0}
                  onChange={(e) => update('min', e.target.value)}
                  className="rounded-xl border border-phyto-forest/15 px-3 py-2 text-sm font-bold"
                />
                <input
                  type="number"
                  value={max}
                  min={0}
                  onChange={(e) => update('max', e.target.value)}
                  className="rounded-xl border border-phyto-forest/15 px-3 py-2 text-sm font-bold"
                />
              </div>
            </FilterGroup>

            <FilterGroup title="Fragrance">
              <div className="space-y-2">
                {smells.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 text-sm font-medium">
                    <input
                      type="radio"
                      name="smell"
                      checked={selectedSmell === s.id}
                      onChange={() => update('smell', s.id)}
                      className="size-4 border-phyto-forest/30 text-phyto-leaf"
                    />
                    {s.label}
                  </label>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Lifestyle tags">
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={clsx(
                      'rounded-full px-3 py-1 text-xs font-bold transition',
                      selectedTags.has(t.id) ? 'bg-phyto-forest text-white' : 'border border-phyto-forest/15 bg-white text-stone-600 hover:bg-phyto-sage/50'
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </FilterGroup>

            <FilterGroup title="Environment">
              <div className="flex gap-2">
                <TogglePill label="Indoor" on={() => update('env', selectedEnv === 'indoor' ? null : 'indoor')} active={selectedEnv === 'indoor'} />
                <TogglePill label="Outdoor" on={() => update('env', selectedEnv === 'outdoor' ? null : 'outdoor')} active={selectedEnv === 'outdoor'} />
              </div>
            </FilterGroup>

            <button
              type="button"
              onClick={() => {
                setParams(new URLSearchParams(), { replace: true })
                setPage(1)
              }}
              className="w-full rounded-full border border-phyto-forest/20 py-2.5 text-sm font-bold text-phyto-forest hover:bg-phyto-sage/40"
            >
              Reset filters
            </button>
          </div>
        </aside>

        <div className="space-y-8">
          {/* Editor banner */}
          <div className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-phyto-forest text-white shadow-card">
            <div className="grid items-center gap-6 p-6 md:grid-cols-2 md:p-10">
              <div>
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider">Editor&apos;s choice</span>
                <h2 className="font-display mt-4 text-2xl font-semibold md:text-3xl">The Architectural Monstera</h2>
                <p className="mt-3 text-sm text-white/85">{featured?.description ?? 'Explore our latest catalog picks.'}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to={`/product/${featured?.id ?? '1'}`}
                    className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-phyto-forest"
                  >
                    View details
                  </Link>
                  <Link
                    to={`/product/${featured?.id ?? '1'}`}
                    className="rounded-full border-2 border-white/40 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
                  >
                    Add to cart — {featured ? formatUsd(featured.price) : formatUsd(0)}
                  </Link>
                </div>
              </div>
              <img src={shopMonsteraImg} alt="" className="mx-auto max-h-56 rounded-2xl object-cover md:max-h-64" />
            </div>
          </div>

          {pageItems.length === 0 ? (
            <div className="rounded-3xl border border-phyto-forest/10 bg-white p-16 text-center text-stone-600">
              No plants match these filters.{' '}
              <button type="button" className="font-bold text-phyto-leaf underline" onClick={() => setParams(new URLSearchParams())}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-phyto-forest/10 pt-6 text-sm text-stone-600">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length} products
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="grid size-9 place-items-center rounded-full border border-phyto-forest/15 disabled:opacity-40"
              >
                <ChevronLeft className="size-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={clsx(
                    'grid size-9 place-items-center rounded-full text-sm font-bold',
                    n === safePage ? 'bg-phyto-forest text-white' : 'border border-phyto-forest/10 hover:bg-phyto-sage/50'
                  )}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="grid size-9 place-items-center rounded-full border border-phyto-forest/15 disabled:opacity-40"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-stone-500">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  )
}

function TogglePill({ label, active, on }: { label: string; active: boolean; on: () => void }) {
  return (
    <button
      type="button"
      onClick={on}
      className={clsx(
        'flex-1 rounded-full px-4 py-2 text-xs font-bold transition',
        active ? 'bg-phyto-leaf text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
      )}
    >
      {label}
    </button>
  )
}
