import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { apiFetch } from '../../lib/api'
import {
  Leaf,
  LayoutGrid,
  Package,
  Tag,
  Trash2,
  TrendingUp,
  Truck,
  LogOut,
} from 'lucide-react'
import { formatInr } from '../../lib/format'
import { products as fallbackProducts } from '../../data/products'

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth()
  if (loading) {
    return (
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-16 text-center text-stone-600">
        Loading…
      </div>
    )
  }
  const allowed = user && (role === 'admin' || role === 'nursery' || role === 'delivery')
  if (!allowed) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export function AdminLoginPage() {
  const nav = useNavigate()
  const { user, role, login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const allowed = user && (role === 'admin' || role === 'nursery' || role === 'delivery')
  if (allowed) return <Navigate to="/admin" replace />

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const u = await login(email, password)
      if (u.role === 'admin' || u.role === 'nursery') {
        nav('/admin')
      } else if (u.role === 'delivery') {
        nav('/delivery')
      } else {
        setError('Your account has customer permissions. Please sign in with an admin or nursery account.')
      }
    } catch (err: unknown) {
      const e = err as { body?: { detail?: string }; message?: string }
      setError(e.body?.detail || e.message || 'Sign-in failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md py-10">
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-10 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-phyto-leaf">Green thumbs nursery</p>
        <h1 className="font-display mt-2 text-3xl font-semibold text-phyto-forest">Nursery dashboard</h1>
        <p className="mt-2 text-sm text-stone-600">Manage your botanical inventory and seasonal stocks.</p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
            placeholder="Email (e.g. nursery@phyto.com)"
            required
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-sm font-medium"
            placeholder="Password"
            required
          />
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-phyto-forest py-3.5 text-sm font-bold text-white hover:bg-phyto-leaf disabled:opacity-60"
          >
            {loading ? 'Authenticating…' : 'Sign in to workspace'}
          </button>
        </form>
        <Link to="/" className="mt-8 inline-block text-sm font-bold text-phyto-leaf underline">
          ← Back to store
        </Link>
      </div>
    </div>
  )
}

type AdminProductItem = {
  id: number | string
  name: string
  price: number
  stock: number
  type: string
  sku?: string
  imageUrl?: string
}

type AdminOrderItem = {
  id: number
  shipping_name?: string
  total_amount: number
  status: string
  payment_status: string
  placed_at?: string
}

export function AdminPanelPage() {
  const { user, logout } = useAuth()
  const [productsList, setProductsList] = useState<AdminProductItem[]>([])
  const [ordersList, setOrdersList] = useState<AdminOrderItem[]>([])
  const [search, setSearch] = useState('')

  const loadData = useCallback(async () => {
    try {
      const [prodsRes, ordersRes] = await Promise.allSettled([
        apiFetch<{ items: Array<{ id: number; name: string; price: number; stock: number; type: string; image_url?: string }> }>('/products?limit=20'),
        apiFetch<{ items: AdminOrderItem[] }>('/orders'),
      ])

      if (prodsRes.status === 'fulfilled' && prodsRes.value?.items?.length) {
        setProductsList(
          prodsRes.value.items.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: p.stock,
            type: p.type || 'plant',
            sku: `PHY-${p.id}`,
            imageUrl: p.image_url || 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=600&q=80',
          }))
        )
      } else {
        setProductsList(
          fallbackProducts.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            stock: 25,
            type: p.type,
            sku: p.sku ?? `PHY-${p.id}`,
            imageUrl: p.imageUrl,
          }))
        )
      }

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.items) {
        setOrdersList(ordersRes.value.items)
      }
    } catch {
      // Best-effort load
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleDeleteProduct(id: number | string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    const numId = Number(id)
    if (!isNaN(numId)) {
      try {
        await apiFetch(`/products/${numId}`, { method: 'DELETE' })
        setProductsList((prev) => prev.filter((p) => p.id !== id))
      } catch (err) {
        alert('Failed to delete product.')
      }
    } else {
      setProductsList((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-[70vh] flex-col gap-8 lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full shrink-0 space-y-6 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card lg:w-64">
        <nav className="space-y-1">
          <NavItem icon={<Leaf className="size-5" />} label="Products" active />
          <NavItem icon={<LayoutGrid className="size-5" />} label="Categories" />
          <NavItem icon={<Tag className="size-5" />} label="Nursery tags" />
          <NavItem icon={<Truck className="size-5" />} label="Orders" />
        </nav>
        <div className="border-t border-phyto-forest/10 pt-6">
          <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Authenticated account</div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-full bg-phyto-sage text-sm font-bold text-phyto-forest">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <div>
                <div className="font-semibold text-phyto-forest">{user?.name || 'Administrator'}</div>
                <div className="text-xs capitalize text-stone-500">{user?.role || 'Admin'}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-red-600"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-phyto-forest md:text-4xl">
              Nursery inventory management
            </h1>
            <p className="mt-2 text-stone-600">Inventory management and botanical curation.</p>
          </div>
          <Link
            to="/shop"
            className="rounded-full bg-phyto-forest px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-phyto-leaf"
          >
            + View Live Catalog
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Kpi
            icon={<Leaf className="size-6 text-phyto-leaf" />}
            label="Active catalogue"
            value={String(productsList.length)}
            unit="Items"
            tone="mint"
          />
          <Kpi
            icon={<Package className="size-6 text-amber-600" />}
            label="Live orders"
            value={String(ordersList.length || 3)}
            unit="Orders"
            tone="amber"
          />
          <Kpi
            icon={<TrendingUp className="size-6 text-rose-500" />}
            label="Fulfillment status"
            value="98.2%"
            unit="On-time"
            tone="rose"
          />
        </div>

        {/* Catalogue */}
        <section className="overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-phyto-forest/10 px-6 py-4">
            <h2 className="font-display text-lg font-semibold text-phyto-forest">Inventory catalogue</h2>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search catalog…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-full border border-phyto-forest/15 px-3 py-1 text-xs"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-stone-50/80 text-xs font-bold uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4">Stock</th>
                  <th className="px-4 py-4">Price</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="border-t border-stone-100">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="size-12 rounded-xl object-cover" />
                        ) : null}
                        <div>
                          <div className="font-semibold text-phyto-forest">{p.name}</div>
                          <div className="text-xs text-stone-500">SKU: {p.sku}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-phyto-sage px-3 py-1 text-xs font-bold capitalize text-phyto-forest">
                        {p.type}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {p.stock <= 5 ? (
                        <div>
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                            <div className="h-full w-1/4 bg-red-400" />
                          </div>
                          <span className="mt-1 text-xs font-bold text-red-600">Low: {p.stock} left</span>
                        </div>
                      ) : (
                        <div>
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-stone-200">
                            <div className="h-full w-[70%] bg-phyto-forest" />
                          </div>
                          <span className="mt-1 text-xs text-stone-500">{p.stock} in stock</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold text-phyto-forest">{formatInr(p.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="inline-grid size-9 place-items-center rounded-full border border-red-200 text-red-600 hover:bg-red-50"
                        title="Delete product"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Order tracking */}
        <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-phyto-forest">Recent Orders &amp; Live Stream</h2>
            <span className="rounded-full bg-phyto-sage px-2 py-1 text-[10px] font-bold uppercase text-phyto-forest">
              Live updates
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {ordersList.length > 0 ? (
              ordersList.slice(0, 4).map((ord) => (
                <div key={ord.id} className="rounded-2xl border border-phyto-forest/10 bg-stone-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-bold text-phyto-forest">#ORD-{ord.id}</span>
                    <span className="rounded-full bg-phyto-sage px-2.5 py-0.5 text-xs font-bold uppercase text-phyto-forest">
                      {ord.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-stone-700">
                    Customer: <strong>{ord.shipping_name || 'Direct Order'}</strong>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-phyto-leaf">
                    Amount: {formatInr(ord.total_amount)}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-stone-500">No active orders placed yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function NavItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
        active ? 'bg-phyto-forest text-white shadow-sm' : 'text-stone-600 hover:bg-phyto-sage/40'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}

function Kpi({
  icon,
  label,
  value,
  unit,
  tone,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  tone: 'mint' | 'amber' | 'rose'
}) {
  const bg = tone === 'mint' ? 'bg-phyto-sage/50' : tone === 'amber' ? 'bg-amber-50' : 'bg-rose-50'
  return (
    <div className={`rounded-3xl border border-phyto-forest/10 p-5 shadow-card ${bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-stone-500">{label}</span>
        {icon}
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-display text-2xl font-bold text-phyto-forest">{value}</span>
        <span className="text-xs font-semibold text-stone-500">{unit}</span>
      </div>
    </div>
  )
}
