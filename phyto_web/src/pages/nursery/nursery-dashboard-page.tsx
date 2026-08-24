import { useState } from 'react'
import { useAuth } from '../../features/auth/auth-context'
import { useLocation } from '../../features/nursery/nursery-service'
import { products } from '../../data/products'
import {
  Store,
  Package,
  MapPin,
  Plus,
  Leaf,
} from 'lucide-react'
import clsx from 'clsx'

interface LocalOrder {
  id: string
  customerName: string
  phone: string
  address: string
  city: string
  items: { name: string; quantity: number; price: number }[]
  totalAmount: number
  status: 'pending_dispatch' | 'packed' | 'out_for_delivery' | 'delivered'
  orderTime: string
}

const INITIAL_ORDERS: LocalOrder[] = [
  {
    id: 'ORD-8901',
    customerName: 'Aarav Patil',
    phone: '+91 98231 44556',
    address: 'Plot 14, Nagala Park, Kolhapur - 416003',
    city: 'Kolhapur',
    items: [
      { name: 'Monstera Deliciosa (Swiss Cheese Plant)', quantity: 1, price: 699 },
      { name: 'Matte Nordic White Ceramic Planter', quantity: 1, price: 349 },
    ],
    totalAmount: 1048,
    status: 'pending_dispatch',
    orderTime: '15 mins ago',
  },
  {
    id: 'ORD-8898',
    customerName: 'Pooja Kulkarni',
    phone: '+91 98220 88990',
    address: 'Bungalow 12, Tarabai Park, Kolhapur - 416003',
    city: 'Kolhapur',
    items: [
      { name: 'Arabian Jasmine (Bhat Mogra)', quantity: 2, price: 498 },
      { name: '100% Organic Vermicompost (5kg)', quantity: 1, price: 199 },
    ],
    totalAmount: 697,
    status: 'packed',
    orderTime: '1 hour ago',
  },
  {
    id: 'ORD-8890',
    customerName: 'Rohan Shinde',
    phone: '+91 98234 11223',
    address: 'Kawala Naka, Kolhapur - 416001',
    city: 'Kolhapur',
    items: [
      { name: 'Snake Plant Laurentii', quantity: 1, price: 349 },
      { name: 'Heirloom San Marzano Tomato Seeds', quantity: 2, price: 198 },
    ],
    totalAmount: 547,
    status: 'out_for_delivery',
    orderTime: '2 hours ago',
  },
]

export function NurseryDashboardPage() {
  const { user } = useAuth()
  const { currentCity } = useLocation()
  const [orders, setOrders] = useState<LocalOrder[]>(INITIAL_ORDERS)
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders')

  function updateOrderStatus(orderId: string, nextStatus: LocalOrder['status']) {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    )
  }

  // Filter products associated with or in the local hub
  const nurseryStock = products.slice(0, 16)

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Nursery Hub Header */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-950 via-amber-900 to-stone-900 p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-amber-200">
              <Store className="size-3.5" />
              <span>Nursery Partner Hub · {currentCity} Regional Network</span>
            </div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {user?.stakeholderDetails?.nurseryName || 'Shinde Botanical Nursery, Kolhapur'}
            </h1>
            <p className="text-xs text-amber-100/90 flex items-center gap-2">
              <MapPin className="size-3.5" />
              <span>Nagala Park, {currentCity} · Verified Service Radius: 15 km</span>
            </p>
          </div>

          <div className="flex gap-3 text-center">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xl font-bold text-amber-300">{orders.length}</p>
              <p className="text-[11px] text-amber-100">Active Orders</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xl font-bold text-emerald-300">₹42,850</p>
              <p className="text-[11px] text-amber-100">Monthly Revenue</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-stone-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={clsx(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition',
            activeTab === 'orders'
              ? 'bg-phyto-forest text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          <Package className="size-4" />
          <span>Hyperlocal Orders &amp; Dispatches ({orders.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={clsx(
            'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition',
            activeTab === 'inventory'
              ? 'bg-phyto-forest text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          <Leaf className="size-4" />
          <span>Manage Stock &amp; Botanical Inventory ({nurseryStock.length})</span>
        </button>
      </div>

      {/* Orders View */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-bold text-phyto-forest">Incoming Local City Orders</h2>
            <span className="text-xs text-stone-500">Live order queue from {currentCity} customers</span>
          </div>

          <div className="grid gap-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-phyto-forest bg-stone-100 px-2.5 py-1 rounded-md">
                      {ord.id}
                    </span>
                    <span
                      className={clsx(
                        'rounded-full px-3 py-0.5 text-xs font-bold',
                        ord.status === 'pending_dispatch'
                          ? 'bg-amber-100 text-amber-800'
                          : ord.status === 'packed'
                          ? 'bg-blue-100 text-blue-800'
                          : ord.status === 'out_for_delivery'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      )}
                    >
                      {ord.status === 'pending_dispatch'
                        ? 'Action Required: Pack Plants'
                        : ord.status === 'packed'
                        ? 'Packed (Awaiting Courier Pickup)'
                        : ord.status === 'out_for_delivery'
                        ? 'Out for Local Delivery'
                        : 'Delivered Successfully'}
                    </span>
                    <span className="text-xs text-stone-400">· {ord.orderTime}</span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-stone-900">{ord.customerName} ({ord.phone})</p>
                    <p className="text-xs text-stone-500">{ord.address}</p>
                  </div>

                  <div className="space-y-1 border-t border-stone-100 pt-2 text-xs text-stone-700">
                    {ord.items.map((item, idx) => (
                      <p key={idx}>
                        • {item.quantity}x <strong>{item.name}</strong> — ₹{item.price}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <p className="text-xs text-stone-400">Order Value</p>
                    <p className="text-lg font-bold text-phyto-forest">₹{ord.totalAmount}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {ord.status === 'pending_dispatch' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'packed')}
                        className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition"
                      >
                        Mark as Packed &amp; Watered
                      </button>
                    )}
                    {ord.status === 'packed' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'out_for_delivery')}
                        className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
                      >
                        Handover to Delivery Fleet
                      </button>
                    )}
                    {ord.status === 'out_for_delivery' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(ord.id, 'delivered')}
                        className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                      >
                        Confirm Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory View */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-bold text-phyto-forest">Active Botanical Stock</h2>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full bg-phyto-forest px-4 py-1.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
            >
              <Plus className="size-3.5" />
              <span>Add New Plant to Nursery</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {nurseryStock.map((prod) => (
              <div key={prod.id} className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm space-y-2">
                <img
                  src={prod.imageUrl}
                  alt={prod.name}
                  className="h-32 w-full rounded-xl object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-phyto-forest line-clamp-1">{prod.name}</p>
                  <p className="text-[11px] text-stone-400">{prod.category || prod.mainCategory}</p>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-phyto-forest">₹{prod.price}</span>
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    Stock: {prod.stock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
