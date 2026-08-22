import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import heroImg from '../../assets/phyto-hero.png'
import monsteraDeliciaImg from '../../assets/monstera-delicia.png'
import lavenderSeedsImg from '../../assets/lavender-seeds.png'
import bloomboostOrganicImg from '../../assets/bloomboost-organic.png'
import toolsCategoryImg from '../../assets/tools-category.png'
import perfectMatchImg from '../../assets/perfect-match.png'
import architecturalMonsteraImg from '../../assets/architectural-monstera.png'
import { products } from '../../data/products'
import { ProductCard } from '../../ui/product-card'
import { BadgeCheck, Headset, Leaf, Truck, Sparkles } from 'lucide-react'
import * as Slider from '@radix-ui/react-slider'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { formatUsd } from '../../lib/format'
import { apiFetch } from '../../lib/api'
import { PlantRecommender } from '../../features/chatbot/PlantRecommender'

const categories = [
  { label: 'Plants', to: '/shop?type=plants', image: monsteraDeliciaImg, cell: 'hero' as const },
  { label: 'Seeds', to: '/shop?type=seeds', image: lavenderSeedsImg, cell: 'sm' as const },
  { label: 'Fertilizers', to: '/shop?type=fertilizers', image: bloomboostOrganicImg, cell: 'sm' as const },
  { label: 'Tools', to: '/shop?type=tools', image: toolsCategoryImg, cell: 'wide' as const },
]

export function HomePage() {
  const [backendImages, setBackendImages] = useState<Record<string, string>>({})
  const featured = useMemo(
    () =>
      products.slice(0, 4).map((p) => ({
        ...p,
        imageUrl: backendImages[p.id] ?? p.imageUrl,
      })),
    [backendImages]
  )
  const hero = featured[0]
  const [drainage, setDrainage] = useState([50])
  const [moisture, setMoisture] = useState([40])

  useEffect(() => {
    let mounted = true

    type BackendProduct = { id: number; name: string; image_url: string | null }
    type ListResponse = { items: BackendProduct[] }

    const normalize = (s: string) => s.trim().toLowerCase()

    apiFetch<ListResponse>('/products')
      .then((res) => {
        if (!mounted) return
        const next: Record<string, string> = {}
        const backendByName = new Map<string, string>()
        for (const item of res.items ?? []) {
          if (item.image_url && item.name) backendByName.set(normalize(item.name), item.image_url)
        }
        for (const p of products) {
          const byName = backendByName.get(normalize(p.name))
          if (byName) next[p.id] = byName
        }
        setBackendImages(next)
      })
      .catch(() => {
        // Keep local fallback images when backend is unavailable.
      })

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white shadow-card">
        <div className="grid gap-10 p-6 md:grid-cols-2 md:items-center md:p-14">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-phyto-forest/10 bg-phyto-sage/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-phyto-leaf"
            >
              <Sparkles className="size-3.5" />
              Editor&apos;s choice nursery
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="font-display mt-6 text-4xl font-semibold leading-tight tracking-tight text-phyto-forest md:text-5xl lg:text-[3.25rem]"
            >
              Bring Nature Home
            </motion.h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
              Curated greenery for every corner of your life — from sun-loving succulents to deep-shade ferns, plus care
              kits and expert support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center rounded-full bg-phyto-forest px-8 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-phyto-leaf"
              >
                Explore collection
              </Link>
              <Link
                to="/shop?type=plants"
                className="inline-flex items-center justify-center rounded-full border-2 border-phyto-forest/20 bg-white px-8 py-3.5 text-sm font-bold text-phyto-forest transition hover:bg-phyto-sage/40"
              >
                Care guides
              </Link>
            </div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="relative">
            <div className="absolute -left-8 -top-8 size-56 rounded-full bg-phyto-mint/30 blur-3xl" />
            <div className="absolute -bottom-8 -right-8 size-64 rounded-full bg-phyto-sage blur-3xl" />
            <img
              src={heroImg}
              alt="Phyto hero"
              className="relative w-full rounded-3xl border border-phyto-forest/10 object-cover shadow-card"
            />
          </motion.div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4">
        <PlantRecommender />
      </div>

      {/* Editor's choice */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-phyto-leaf">Editor&apos;s choice</div>
            <h2 className="font-display mt-2 text-3xl font-semibold text-phyto-forest">Fresh picks for your space</h2>
          </div>
          <Link to="/shop" className="text-sm font-bold text-phyto-leaf underline decoration-2 underline-offset-4">
            View all selection
          </Link>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section>
        <h2 className="font-display text-3xl font-semibold text-phyto-forest">Shop by category</h2>
        <p className="mt-2 max-w-2xl text-stone-600">Browse plants, seeds, soil amendments, and tools — all vetted by our nursery team.</p>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 md:grid-rows-2">
          {categories.map((c) => (
            <Link
              key={c.label}
              to={c.to}
              className={clsx(
                'group relative overflow-hidden rounded-3xl border border-phyto-forest/10 shadow-card',
                c.cell === 'hero' && 'col-span-2 row-span-2 min-h-[280px] bg-phyto-forest text-white md:min-h-[320px]',
                c.cell === 'sm' && 'min-h-[140px] bg-white',
                c.cell === 'wide' && 'col-span-2 min-h-[120px] bg-stone-900 text-white'
              )}
            >
              <img
                src={c.image}
                alt=""
                className={clsx(
                  'absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105',
                  c.cell === 'hero' && 'opacity-85',
                  c.cell === 'sm' && 'opacity-90',
                  c.cell === 'wide' && 'opacity-60'
                )}
              />
              <div
                className={clsx(
                  'absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/75 via-black/20 to-transparent',
                  c.cell === 'hero' && 'p-8',
                  c.cell === 'sm' && 'p-5',
                  c.cell === 'wide' && 'p-6'
                )}
              >
                <span
                  className={clsx(
                    'font-display font-semibold',
                    c.cell === 'hero' && 'text-3xl',
                    (c.cell === 'sm' || c.cell === 'wide') && 'text-xl'
                  )}
                >
                  {c.label}
                </span>
                <span className="mt-1 text-sm font-bold text-white/90 underline decoration-white/50">Browse collection →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Value props */}
      <section className="grid gap-4 rounded-3xl border border-phyto-forest/10 bg-white/80 p-6 shadow-card sm:grid-cols-2 lg:grid-cols-4 lg:p-10">
        <Benefit icon={<Truck className="size-5" />} title="Fast delivery" desc="Carbon-conscious routes and careful packaging." />
        <Benefit icon={<Leaf className="size-5" />} title="Fresh plants" desc="Handpicked from partner nurseries." />
        <Benefit icon={<Headset className="size-5" />} title="Expert support" desc="Care guides and 1:1 help when you need it." />
        <Benefit icon={<BadgeCheck className="size-5" />} title="Gardening services" desc="Optional potting and plant doctor visits." />
      </section>

      {/* Finding the perfect match */}
      <section className="grid gap-8 overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card lg:grid-cols-2 lg:p-10">
        <div>
          <h2 className="font-display text-3xl font-semibold text-phyto-forest">Finding the perfect match</h2>
          <p className="mt-3 text-stone-600">Dial in drainage and humidity preferences — we&apos;ll narrow the catalog to plants that thrive in similar conditions.</p>

          <div className="mt-10 space-y-8">
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                <span>Drainage</span>
                <span>Well-drained → Moist</span>
              </div>
              <Slider.Root
                className="relative mt-3 flex h-6 w-full touch-none select-none items-center"
                value={drainage}
                onValueChange={setDrainage}
                max={100}
                step={1}
              >
                <Slider.Track className="relative h-2 grow rounded-full bg-stone-200">
                  <Slider.Range className="absolute h-full rounded-full bg-phyto-leaf" />
                </Slider.Track>
                <Slider.Thumb className="block size-5 rounded-full border-2 border-white bg-phyto-forest shadow-md focus:outline-none focus:ring-2 focus:ring-phyto-mint" />
              </Slider.Root>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-stone-500">
                <span>Moisture retention</span>
                <span>Low humidity → High</span>
              </div>
              <Slider.Root
                className="relative mt-3 flex h-6 w-full touch-none select-none items-center"
                value={moisture}
                onValueChange={setMoisture}
                max={100}
                step={1}
              >
                <Slider.Track className="relative h-2 grow rounded-full bg-stone-200">
                  <Slider.Range className="absolute h-full rounded-full bg-phyto-mint" />
                </Slider.Track>
                <Slider.Thumb className="block size-5 rounded-full border-2 border-white bg-phyto-forest shadow-md focus:outline-none focus:ring-2 focus:ring-phyto-mint" />
              </Slider.Root>
            </div>
            <Link
              to="/shop"
              className="inline-flex rounded-full bg-phyto-forest px-6 py-3 text-sm font-bold text-white hover:bg-phyto-leaf"
            >
              See matching plants
            </Link>
          </div>
        </div>
        <div className="relative min-h-[240px] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100/80 to-phyto-sage lg:min-h-0">
          <img src={perfectMatchImg} alt="" className="h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/90 p-4 text-sm text-stone-700 backdrop-blur">
            <span className="font-bold text-phyto-forest">Soil preview</span> — adjust sliders to explore textures that pair with your care style.
          </div>
        </div>
      </section>

      {/* Featured editorial strip */}
      <section className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-phyto-forest text-white shadow-card">
        <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-phyto-sage">Trending</span>
            <h2 className="font-display mt-4 text-3xl font-semibold md:text-4xl">The Architectural Monstera</h2>
            <p className="mt-4 text-white/85">
              {hero?.description ?? 'Statement foliage for bright living spaces — low drama, high impact.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={`/product/${hero?.id ?? 'p1'}`}
                className="rounded-full bg-white px-6 py-3 text-sm font-bold text-phyto-forest hover:bg-phyto-sage"
              >
                View details
              </Link>
              <Link
                to={`/product/${hero?.id ?? 'p1'}`}
                className="rounded-full border-2 border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Add to cart — {hero ? formatUsd(hero.price) : '₹45'}
              </Link>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <img src={architecturalMonsteraImg} alt="" className="max-h-72 rounded-2xl object-cover shadow-2xl md:max-h-96" />
          </div>
        </div>
      </section>
    </div>
  )
}

function Benefit({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-phyto-sage/80 text-phyto-forest">{icon}</div>
      <div>
        <div className="font-display text-lg font-semibold text-phyto-forest">{title}</div>
        <p className="mt-1 text-sm text-stone-600">{desc}</p>
      </div>
    </div>
  )
}
