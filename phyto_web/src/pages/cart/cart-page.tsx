import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { formatInr } from '../../lib/format'
import { products as staticProducts } from '../../data/products'
import { apiFetch } from '../../lib/api'
import type { Product } from '../../features/catalog/types'
import { Trash2 } from 'lucide-react'

export function CartPage() {
  const nav = useNavigate()
  const { items, subtotal, removeFromCart, setQty, addToCart } = useCart()
  const [addons, setAddons] = useState<Product[]>(staticProducts.slice(0, 3))

  useEffect(() => {
    async function loadAddons() {
      try {
        const res = await apiFetch<{ items: Array<{ id: number; name: string; description?: string; price: number; type?: string; image_url?: string; popularity_score?: number }> }>('/products?limit=3')
        if (res?.items?.length) {
          setAddons(
            res.items.map((p) => ({
              id: String(p.id),
              name: p.name,
              description: p.description || '',
              price: p.price,
              type: 'plants',
              smell: 'mild',
              sunlight: 'partial',
              environment: 'indoor',
              popularity: p.popularity_score || 0,
              imageUrl: p.image_url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
              tags: ['low-maintenance'],
              care: { water: 'Weekly', sunlight: 'Partial' },
            }))
          )
        }
      } catch {
        // Fallback to static
      }
    }
    loadAddons()
  }, [])

  const shipping = subtotal > 0 ? 5.99 : 0
  const tax = Math.round(subtotal * 0.07 * 100) / 100
  const total = subtotal + shipping + tax

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-phyto-forest md:text-4xl">Your botanical selection</h1>
        <p className="mt-2 text-stone-600">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-phyto-forest/10 bg-white p-16 text-center shadow-card">
          <p className="text-stone-600">Your cart is empty.</p>
          <Link to="/shop" className="mt-4 inline-block font-bold text-phyto-leaf underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              {items.map((it) => (
                <div
                  key={it.product.id}
                  className="flex flex-col gap-4 rounded-3xl border border-phyto-forest/10 bg-white p-5 shadow-card sm:flex-row sm:items-center"
                >
                  <div className="flex flex-1 gap-4">
                    <div className="size-24 shrink-0 overflow-hidden rounded-2xl bg-phyto-sage/40">
                      {it.product.imageUrl ? (
                        <img src={it.product.imageUrl} alt="" className="size-full object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <div className="font-display text-lg font-semibold text-phyto-forest">{it.product.name}</div>
                      <p className="mt-1 line-clamp-2 text-sm text-stone-600">{it.product.description}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(it.product.tags || []).slice(0, 3).map((t) => (
                          <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-600">
                            {String(t).replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-xs text-stone-500">
                        {it.includeKit ? 'Kit included' : 'No kit'} · {it.addService ? 'Service add-on' : 'No service'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="text-lg font-bold text-phyto-forest">{formatInr(it.product.price)}</div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-phyto-forest/15 p-1">
                        <button
                          type="button"
                          onClick={() => setQty(it.product.id, it.quantity - 1)}
                          className="grid size-9 place-items-center rounded-full text-lg font-bold text-phyto-forest hover:bg-phyto-sage/50"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-bold">{it.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQty(it.product.id, it.quantity + 1)}
                          className="grid size-9 place-items-center rounded-full text-lg font-bold text-phyto-forest hover:bg-phyto-sage/50"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFromCart(it.product.id)}
                        className="inline-flex items-center gap-1 rounded-full border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <aside className="h-fit space-y-4 rounded-3xl border border-phyto-forest/10 bg-stone-50/80 p-6 shadow-card">
              <h2 className="font-display text-xl font-semibold text-phyto-forest">Order summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-phyto-forest">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Shipping</span>
                  <span className="font-bold text-phyto-forest">{formatInr(shipping)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Est. tax</span>
                  <span className="font-bold text-phyto-forest">{formatInr(tax)}</span>
                </div>
                <div className="border-t border-phyto-forest/10 pt-3 text-base font-bold text-phyto-forest">
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{formatInr(total)}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => nav('/checkout')}
                className="w-full rounded-full bg-phyto-forest py-3.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-phyto-leaf"
              >
                Proceed to checkout
              </button>
              <p className="text-center text-xs text-stone-500">Free shipping on orders over ₹100 · Secure encrypted checkout</p>
              <div className="rounded-2xl border border-phyto-mint/40 bg-phyto-sage/40 p-4 text-xs text-phyto-forest">
                <span className="font-bold">Sustainable packaging</span> — recyclable materials and plastic-free tape where possible.
              </div>
            </aside>
          </div>

          <section>
            <h2 className="font-display text-xl font-semibold text-phyto-forest">Essential add-ons</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {addons.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-4 rounded-3xl border border-phyto-forest/10 bg-white p-4 shadow-sm"
                >
                  <img src={p.imageUrl} alt="" className="size-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <div className="font-semibold text-phyto-forest">{p.name}</div>
                    <div className="text-sm font-bold text-phyto-leaf">{formatInr(p.price)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addToCart(p)}
                    className="shrink-0 rounded-full border border-phyto-forest/20 px-4 py-2 text-xs font-bold text-phyto-forest hover:bg-phyto-sage/50"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
