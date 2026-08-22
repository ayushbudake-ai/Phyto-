import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { motion } from 'framer-motion'
import { formatUsd } from '../../lib/format'
import { Droplets, Sun, ShoppingBag, Star, Truck } from 'lucide-react'
import { apiFetch } from '../../lib/api'
import type { Environment, Product, ProductType, Smell, Sunlight } from '../../features/catalog/types'

export function ProductDetailPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()
  const [includeKit, setIncludeKit] = useState(false)
  const [addService, setAddService] = useState(false)

  useEffect(() => {
    const raw = id ?? ''
    const numericId = raw.startsWith('p') ? raw.slice(1) : raw
    if (!numericId) {
      setProduct(null)
      setLoading(false)
      return
    }

    type ApiProduct = {
      id: number
      name: string
      price: number
      image_url: string | null
      description: string
      water_requirement: string | null
      sunlight: string
      smell: string
      environment: string
    }

    const mapType = (): ProductType => 'plants'
    const mapSun = (v: string): Sunlight => (v === 'full_sun' ? 'full-sun' : v === 'full_shade' ? 'shade' : 'partial')
    const mapSmell = (v: string): Smell => (v === 'strong' ? 'strong' : v === 'light' ? 'mild' : 'non-fragrant')
    const mapEnv = (v: string): Environment => (v === 'outdoor' ? 'outdoor' : 'indoor')

    setLoading(true)
    apiFetch<ApiProduct>(`/products/${numericId}`)
      .then((p) =>
        setProduct({
          id: String(p.id),
          name: p.name,
          description: p.description ?? `${p.name} from our backend catalog.`,
          price: p.price ?? 0,
          popularity: 90,
          type: mapType(),
          smell: mapSmell(p.smell),
          sunlight: mapSun(p.sunlight),
          environment: mapEnv(p.environment),
          tags: [],
          imageUrl: p.image_url ?? undefined,
          care: {
            water: p.water_requirement ?? 'Water as needed.',
            sunlight: p.sunlight?.replaceAll('_', ' ') ?? 'Partial shade',
          },
        })
      )
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [id])

  const categoryLabel = useMemo(() => (product?.type === 'plants' ? 'Indoor plants' : product?.type ?? 'plants'), [product])

  if (loading) {
    return <div className="rounded-3xl border border-phyto-forest/10 bg-white p-16 text-center shadow-card">Loading product...</div>
  }

  if (!product) {
    return (
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-16 text-center shadow-card">
        <h1 className="font-display text-xl font-semibold text-phyto-forest">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-bold text-phyto-leaf underline">
          Back to shop
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <nav className="text-sm text-stone-500">
        <Link to="/shop" className="hover:text-phyto-leaf">
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="capitalize">{categoryLabel}</span>
        <span className="mx-2">/</span>
        <span className="font-semibold text-phyto-forest">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-phyto-sage/30 shadow-card">
            <div className="aspect-[4/3]">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl border border-phyto-forest/10 bg-stone-100">
                {product.imageUrl ? <img src={product.imageUrl} alt="" className="size-full object-cover opacity-80" /> : null}
              </div>
            ))}
            <div className="grid place-items-center rounded-xl border border-dashed border-phyto-forest/20 text-xs font-bold text-stone-400">
              +4
            </div>
          </div>
        </motion.div>

        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-phyto-sage px-3 py-1 text-xs font-bold text-phyto-forest">Best seller</span>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">Easy care</span>
          </div>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-phyto-forest">{product.name}</h1>
          <div className="text-3xl font-bold text-phyto-forest">{formatUsd(product.price)}</div>
          <div className="flex items-center gap-2 text-phyto-leaf">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-5 fill-current" />
            ))}
            <span className="text-sm font-medium text-stone-500">(128 reviews)</span>
          </div>
          <p className="leading-relaxed text-stone-600">{product.description}</p>

          <div className="rounded-3xl border border-phyto-forest/10 bg-stone-50/80 p-6">
            <div className="flex items-center gap-2 font-display text-lg font-semibold text-phyto-forest">
              <Sun className="size-5 text-phyto-leaf" />
              Plant care
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3">
                <Droplets className="mt-0.5 size-5 shrink-0 text-phyto-leaf" />
                <div>
                  <div className="text-xs font-bold uppercase text-stone-500">Water</div>
                  <div className="text-sm font-medium text-phyto-forest">{product.care.water}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sun className="mt-0.5 size-5 shrink-0 text-phyto-leaf" />
                <div>
                  <div className="text-xs font-bold uppercase text-stone-500">Sunlight</div>
                  <div className="text-sm font-medium text-phyto-forest">{product.care.sunlight}</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex justify-between text-xs font-bold uppercase text-stone-500">
                <span>Soil moisture</span>
                <span>Well-draining</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-stone-200">
                <div className="h-full w-1/2 rounded-full bg-phyto-leaf" />
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-stone-400">
                <span>Dry</span>
                <span>Moist</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-sm">
            <h2 className="font-display text-lg font-semibold text-phyto-forest">Enhance your experience</h2>
            <div className="mt-4 space-y-3">
              <CheckboxRow checked={includeKit} onChange={setIncludeKit} title="Include full plant kit" subtitle="+ ₹25" />
              <CheckboxRow checked={addService} onChange={setAddService} title="Add gardening service" subtitle="+ ₹40" />
            </div>
            <button
              type="button"
              onClick={() => addToCart(product, { includeKit, addService })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf"
            >
              <ShoppingBag className="size-4" />
              Add to cart
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-stone-500">
              <Truck className="size-3.5" />
              Free carbon-neutral delivery on orders over ₹100
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-phyto-forest/10 bg-white p-8 shadow-card">
        <h2 className="font-display text-2xl font-semibold text-phyto-forest">Detailed care guide</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="font-bold text-phyto-forest">Lighting needs</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{product.care.sunlight} — ideal near east or north windows.</p>
          </div>
          <div>
            <h3 className="font-bold text-phyto-forest">Watering schedule</h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-600">{product.care.water}</p>
          </div>
          <div className="rounded-2xl border border-phyto-sage/60 bg-phyto-sage/30 p-4">
            <h3 className="font-bold text-phyto-forest">Expert tip</h3>
            <p className="mt-2 text-sm italic text-stone-700">Wipe leaves monthly with a damp cloth for shinier foliage and fewer pests.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function CheckboxRow({
  checked,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  subtitle: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-phyto-forest/10 px-4 py-3 text-left hover:bg-phyto-sage/30"
    >
      <div>
        <div className="font-semibold text-phyto-forest">{title}</div>
        <div className="text-xs text-stone-500">{subtitle}</div>
      </div>
      <span
        className={
          checked
            ? 'grid size-6 place-items-center rounded-lg bg-phyto-forest text-xs font-bold text-white'
            : 'size-6 rounded-lg border-2 border-phyto-forest/20'
        }
      >
        {checked ? '✓' : ''}
      </span>
    </button>
  )
}
