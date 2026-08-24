import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { useAuth } from '../../features/auth/auth-context'
import { motion } from 'framer-motion'
import { formatInr } from '../../lib/format'
import {
  Droplets,
  Sun,
  ShoppingBag,
  Star,
  Truck,
  Sparkles,
  Thermometer,
  Wind,
  CheckCircle2,
} from 'lucide-react'
import { products } from '../../data/products'

export function ProductDetailPage() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { recordProductView } = useAuth()
  const [includeKit, setIncludeKit] = useState(false)
  const [addService, setAddService] = useState(false)
  const [addedToast, setAddedToast] = useState(false)

  // Find product from local catalog or fallback
  const product = useMemo(() => {
    if (!id) return null
    return (
      products.find((p) => p.id === id || p.id === `p${id}` || p.id.replace('p', '') === id) ||
      products[0]
    )
  }, [id])

  // Record product view in user's personalized profile
  useEffect(() => {
    if (product) {
      recordProductView(product.id)
    }
  }, [product, recordProductView])

  if (!product) {
    return (
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-16 text-center shadow-card">
        <h1 className="font-display text-xl font-semibold text-phyto-forest">Botanical item not found</h1>
        <Link to="/shop" className="mt-4 inline-block font-bold text-phyto-leaf underline">
          Back to catalog
        </Link>
      </div>
    )
  }

  const isPetSafe = product.isPetFriendly || product.petSafety === 'Pet-Friendly'

  async function handleAddToCart() {
    if (!product) return
    await addToCart(product, { quantity: 1, includeKit, addService })
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-xs font-semibold text-stone-500">
        <Link to="/shop" className="hover:text-phyto-leaf">Catalog</Link>
        <span className="mx-2">/</span>
        <span>{product.category || 'Plants'}</span>
        <span className="mx-2">/</span>
        <span className="font-bold text-phyto-forest">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-stone-100 shadow-card">
            <div className="aspect-[4/3]">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="size-full object-cover" />
              ) : (
                <div className="flex size-full items-center justify-center text-4xl">🪴</div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <div className="rounded-2xl border border-phyto-forest/10 bg-white p-3 flex-1 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Space</span>
              <span className="text-xs font-bold text-phyto-forest">{(product.suitableSpace || ['Living room'])[0]}</span>
            </div>
            <div className="rounded-2xl border border-phyto-forest/10 bg-white p-3 flex-1 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Pet Safety</span>
              <span className="text-xs font-bold text-emerald-800">{isPetSafe ? '🐶 Pet-Safe' : '⚠️ Toxic if ingested'}</span>
            </div>
            <div className="rounded-2xl border border-phyto-forest/10 bg-white p-3 flex-1 text-center">
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Care Level</span>
              <span className="text-xs font-bold text-phyto-forest">{product.maintenance || 'Easy'}</span>
            </div>
          </div>
        </motion.div>

        {/* Product Details */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-phyto-sage px-3 py-1 text-xs font-bold text-phyto-forest">
              {product.category || 'Indoor Plants'}
            </span>
            {product.beginnerFriendly && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900">
                🌱 Beginner Friendly
              </span>
            )}
            {isPetSafe && (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">
                🐶 Non-Toxic
              </span>
            )}
          </div>

          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-phyto-forest md:text-4xl">
              {product.name}
            </h1>
            {product.scientificName && (
              <p className="text-sm italic text-stone-500 mt-1">{product.scientificName}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-phyto-forest">{formatInr(product.price)}</div>
            <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
              <Star className="size-4 fill-amber-500" />
              <span>{product.rating || 4.8}</span>
              <span className="text-xs text-stone-400">({product.reviewsCount || 128} reviews)</span>
            </div>
          </div>

          <p className="leading-relaxed text-sm text-stone-600">{product.description}</p>

          {/* Quick Care Overview Box */}
          <div className="rounded-3xl border border-phyto-forest/10 bg-stone-50/90 p-5 space-y-4">
            <div className="flex items-center gap-2 font-display text-sm font-bold text-phyto-forest uppercase tracking-wider">
              <Sun className="size-4 text-phyto-leaf" />
              <span>Essential Care Specs</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="flex items-start gap-2.5">
                <Sun className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-700">Light:</span>
                  <p className="text-stone-500">{product.lightRequirement || 'Medium'} ({product.care.sunlight})</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Droplets className="size-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-700">Watering:</span>
                  <p className="text-stone-500">{product.care.water}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Thermometer className="size-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-700">Temperature:</span>
                  <p className="text-stone-500">{product.temperature || '18°C - 30°C'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Wind className="size-4 text-teal-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-stone-700">Soil Type:</span>
                  <p className="text-stone-500">{product.soilType || 'Well-draining rich organic mix'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Kit & Service Add-ons */}
          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-sm space-y-3">
            <h2 className="font-display text-base font-bold text-phyto-forest">Add-On Options</h2>
            <CheckboxRow
              checked={includeKit}
              onChange={setIncludeKit}
              title="Add Ceramic Planter &amp; Soil Kit"
              subtitle={`+ ${formatInr(250)} (Includes matte pot, saucer & nutrient blend)`}
            />
            <CheckboxRow
              checked={addService}
              onChange={setAddService}
              title="Add Doorstep Plant Doctor Setup"
              subtitle={`+ ${formatInr(400)} (Expert potting & diagnostic inspection)`}
            />

            {addedToast && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Added to cart successfully!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-4 text-sm font-bold text-white shadow-md hover:bg-phyto-leaf transition"
            >
              <ShoppingBag className="size-4" />
              <span>Add to Cart ({formatInr(product.price + (includeKit ? 250 : 0) + (addService ? 400 : 0))})</span>
            </button>

            <p className="flex items-center justify-center gap-2 text-xs text-stone-500 pt-1">
              <Truck className="size-3.5 text-phyto-leaf" />
              <span>Free hyperlocal nursery delivery on orders over ₹499</span>
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Care & Botanical Guide */}
      <section className="rounded-3xl border border-phyto-forest/10 bg-white p-8 shadow-card space-y-6">
        <h2 className="font-display text-2xl font-bold text-phyto-forest">Detailed Botanical Care Guide</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
            <h3 className="font-bold text-phyto-forest text-sm flex items-center gap-2">
              <Sun className="size-4 text-amber-500" /> Sunlight Placement
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              {product.careGuide?.sunlight || `${product.care.sunlight}. Position near east or bright north-facing windows away from harsh afternoon scorch.`}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-100 bg-stone-50/60 p-5">
            <h3 className="font-bold text-phyto-forest text-sm flex items-center gap-2">
              <Droplets className="size-4 text-blue-500" /> Watering Instructions
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-stone-600">
              {product.careGuide?.watering || `${product.care.water}. Always check the top 2 inches of soil moisture before pouring water.`}
            </p>
          </div>
          <div className="rounded-2xl border border-phyto-sage/60 bg-phyto-sage/30 p-5">
            <h3 className="font-bold text-phyto-forest text-sm flex items-center gap-2">
              <Sparkles className="size-4 text-amber-600" /> Key Benefits &amp; Tips
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-stone-700">
              {product.benefits || 'Purifies indoor air, boosts ambient humidity, and elevates room aesthetics.'}
            </p>
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
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-phyto-forest/10 p-3.5 text-left hover:bg-phyto-sage/30 transition"
    >
      <div>
        <div className="text-xs font-bold text-phyto-forest">{title}</div>
        <div className="text-[11px] text-stone-500">{subtitle}</div>
      </div>
      <span
        className={
          checked
            ? 'grid size-5 place-items-center rounded-lg bg-phyto-forest text-xs font-bold text-white shrink-0'
            : 'size-5 rounded-lg border-2 border-phyto-forest/20 shrink-0'
        }
      >
        {checked ? '✓' : ''}
      </span>
    </button>
  )
}
