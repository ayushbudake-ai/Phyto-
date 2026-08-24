import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Product } from '../features/catalog/types'
import { useCart } from '../features/cart/cart-context'
import { formatInr } from '../lib/format'
import { Sun, Droplets, ShoppingBag, Check } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

const tagLabels: Record<string, string> = {
  'pet-friendly': 'Pet Friendly',
  'air-purifying': 'Air Purifying',
  'medicinal': 'Medicinal',
  'spirituality': 'Spiritual',
  'hanging': 'Hanging',
  'low-maintenance': 'Easy Care',
  'fast-growing': 'Fast Growing',
  'rare': 'Collector Pick',
  'beginner-friendly': 'Beginner Friendly',
  'flowering': 'Flowering',
  'gifting': 'Gift Ready',
}

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { addToCart } = useCart()
  const [added, setAdded] = useState(false)

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    await addToCart(product, { quantity: 1 })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const isPetSafe = product.isPetFriendly || product.petSafety === 'Pet-Friendly'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white shadow-card hover:shadow-xl transition-all duration-300"
    >
      <div>
        {/* Plant Image & Quick Badges */}
        <Link to={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-stone-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-phyto-sage/30 text-3xl">🌿</div>
          )}

          {/* Badges */}
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {isPetSafe && (
              <span className="rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shadow-sm backdrop-blur">
                🐶 Pet-Safe
              </span>
            )}
            {product.maintenance === 'Easy' && (
              <span className="rounded-full bg-emerald-800/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm backdrop-blur">
                Easy Care
              </span>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className={clsx('p-4 space-y-2', compact && 'p-3')}>
          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {(product.tags || []).slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600"
              >
                {tagLabels[t] || t.replace('-', ' ')}
              </span>
            ))}
          </div>

          <div>
            <Link to={`/product/${product.id}`} className="block group-hover:text-phyto-leaf transition">
              <h3 className="font-display text-base font-bold leading-snug text-phyto-forest line-clamp-1">
                {product.name}
              </h3>
            </Link>
            {product.scientificName && (
              <p className="text-[11px] italic text-stone-500 line-clamp-1">{product.scientificName}</p>
            )}
          </div>

          {/* Mini Specs */}
          <div className="flex items-center gap-3 text-[11px] text-stone-500 pt-1">
            <span className="flex items-center gap-1">
              <Sun className="size-3 text-amber-500" />
              <span>{product.lightRequirement || 'Medium'}</span>
            </span>
            <span className="flex items-center gap-1">
              <Droplets className="size-3 text-blue-500" />
              <span>{product.waterRequirement || 'Medium'}</span>
            </span>
            {product.suitableSpace && product.suitableSpace.length > 0 && (
              <span className="truncate text-stone-400">· {product.suitableSpace[0]}</span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Price & Add Button */}
      <div className="p-4 pt-0">
        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400">Price</span>
            <div className="text-base font-bold text-phyto-forest">{formatInr(product.price)}</div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAdd}
              disabled={added}
              className={clsx(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition shadow-sm',
                added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-phyto-forest text-white hover:bg-phyto-leaf active:scale-95'
              )}
            >
              {added ? (
                <>
                  <Check className="size-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="size-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
            <Link
              to={`/product/${product.id}`}
              className="rounded-full border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 transition"
              title="View details"
            >
              <span className="text-xs font-bold">→</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
