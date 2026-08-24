import { useState } from 'react'
import { useAuth } from '../../features/auth/auth-context'
import { useLocation } from '../../features/nursery/nursery-service'
import { MapPin, Truck, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'

interface DeliveryTask {
  id: string
  nurseryOrigin: string
  customer: string
  phone: string
  address: string
  tags: string[]
  itemsSummary: string
  status: 'pickup_pending' | 'in_transit' | 'delivered'
}

const INITIAL_TASKS: DeliveryTask[] = [
  {
    id: '#PH-99210',
    nurseryOrigin: 'Shinde Nursery (Nagala Park, Kolhapur)',
    customer: 'Aarav Patil',
    phone: '+91 98231 44556',
    address: 'Plot 14, Tarabai Park, Kolhapur - 416003',
    tags: ['Living Plant · Keep Upright', 'Fragile Ceramic Pot'],
    itemsSummary: '1x Monstera Deliciosa + 1x Ceramic Planter',
    status: 'pickup_pending',
  },
  {
    id: '#PH-99214',
    nurseryOrigin: 'Sajeev Nursery (Kawala Naka, Kolhapur)',
    customer: 'Pooja Kulkarni',
    phone: '+91 98220 88990',
    address: 'Bungalow 12, Rankala Lake Road, Kolhapur - 416012',
    tags: ['Fresh Flowering Plant', 'Express Delivery'],
    itemsSummary: '2x Mogra Plants + 1x Organic Vermicompost',
    status: 'in_transit',
  },
]

export function DeliveryPage() {
  const { user, logout } = useAuth()
  const { currentCity } = useLocation()
  const [tasks, setTasks] = useState<DeliveryTask[]>(INITIAL_TASKS)

  function updateStatus(taskId: string, newStatus: DeliveryTask['status']) {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    )
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-950 via-slate-900 to-teal-950 p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-blue-200">
              <Truck className="size-3.5" />
              <span>Phyto Fleet Delivery Partner · {currentCity} Zone</span>
            </div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              Hello, {user?.name || 'Delivery Partner'}
            </h1>
            <p className="text-xs text-blue-100/90 flex items-center gap-2">
              <MapPin className="size-3.5" />
              <span>Vehicle: {user?.stakeholderDetails?.vehicleType || 'Electric Two-Wheeler (Eco Fleet)'}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/10"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-phyto-forest">Assigned Local Deliveries</h2>
          <span className="text-xs text-stone-500">{tasks.length} Assigned Routes</span>
        </div>

        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-phyto-forest bg-stone-100 px-2.5 py-1 rounded-md">
                    {task.id}
                  </span>
                  <span
                    className={clsx(
                      'rounded-full px-3 py-0.5 text-xs font-bold',
                      task.status === 'pickup_pending'
                        ? 'bg-amber-100 text-amber-800'
                        : task.status === 'in_transit'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    )}
                  >
                    {task.status === 'pickup_pending'
                      ? 'Pickup from Nursery'
                      : task.status === 'in_transit'
                      ? 'In Transit to Customer'
                      : 'Delivered Successfully'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {task.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="text-xs space-y-1 pt-1">
                  <p className="text-stone-500">
                    <strong>Nursery Origin:</strong> {task.nurseryOrigin}
                  </p>
                  <p className="text-stone-900 font-bold">
                    <strong>Customer:</strong> {task.customer} ({task.phone})
                  </p>
                  <p className="text-stone-600">
                    <strong>Delivery Address:</strong> {task.address}
                  </p>
                  <p className="text-stone-700 font-medium">
                    <strong>Items:</strong> {task.itemsSummary}
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                {task.status === 'pickup_pending' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(task.id, 'in_transit')}
                    className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-600 transition"
                  >
                    <Truck className="size-3.5" />
                    <span>Confirm Nursery Pickup</span>
                  </button>
                )}

                {task.status === 'in_transit' && (
                  <button
                    type="button"
                    onClick={() => updateStatus(task.id, 'delivered')}
                    className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                  >
                    <CheckCircle2 className="size-3.5" />
                    <span>Mark Handed to Customer</span>
                  </button>
                )}

                {task.status === 'delivered' && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    Completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
