import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Product } from '../features/catalog/types'
import { useCart } from '../features/cart/cart-context'
import { formatUsd } from '../lib/format'
import clsx from 'clsx'

const tagLabel: Partial<Record<string, string>> = {
  'pet-friendly': 'Pet friendly',
  'air-purifying': 'Air purifying',
  medicinal: 'Medicinal',
  spirituality: 'Spiritual',
  hanging: 'Hanging',
  'low-maintenance': 'Low maintenance',
  'fast-growing': 'Fast growing',
  rare: 'Rare',
}

export function ProductCard({ product, compact }: { product: Product; compact?: boolean }) {
  const { addToCart } = useCart()

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="group overflow-hidden rounded-2xl border border-phyto-forest/10 bg-white shadow-card"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] bg-gradient-to-br from-phyto-sage/60 to-stone-100">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
              loading="lazy"
            />
          ) : null}
        </div>
      </Link>
      <div className={clsx('p-4', compact && 'p-3')}>
        <div className="flex flex-wrap gap-1.5">
          {product.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="rounded-full border border-phyto-forest/10 bg-stone-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-stone-600"
            >
              {tagLabel[t] ?? t}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-display text-lg font-semibold leading-tight text-phyto-forest">{product.name}</div>
            <div className="mt-1 line-clamp-2 text-sm text-stone-600">{product.description}</div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-phyto-forest">{formatUsd(product.price)}</span>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => addToCart(product)}
            className="inline-flex flex-1 items-center justify-center rounded-full bg-phyto-forest px-4 py-2.5 text-sm font-bold text-white transition hover:bg-phyto-leaf"
          >
            Add to cart
          </button>
          <Link
            to={`/product/${product.id}`}
            className="inline-flex items-center justify-center rounded-full border border-phyto-forest/20 bg-white px-4 py-2.5 text-sm font-bold text-phyto-forest transition hover:bg-phyto-sage/50"
          >
            Details
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
