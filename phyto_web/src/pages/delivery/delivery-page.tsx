import { useAuth } from '../../features/auth/auth-context'
import { Check, Clock, MapPin, Truck } from 'lucide-react'

const assigned = [
  {
    id: '#PH-99210',
    tags: ['Ready for pickup'],
    customer: 'Priya Sharma',
    phone: '+91 98765 43210',
    address: '12 Palm Grove, Indiranagar, Bengaluru',
  },
  {
    id: '#PH-99214',
    tags: ['Fragile'],
    customer: 'Alex Chen',
    phone: '+1 415 555 0199',
    address: '88 Fern Alley, San Francisco, CA',
  },
]

const history = [
  { id: '#PH-98901', customer: 'Jordan Lee', loc: 'Mission District', time: '11:45 AM' },
  { id: '#PH-98882', customer: 'Sam Rivera', loc: 'SOMA', time: '10:12 AM' },
  { id: '#PH-98774', customer: 'Taylor Kim', loc: 'Hayes Valley', time: 'Yesterday' },
]

export function DeliveryPage() {
  const { user, role, logout } = useAuth()

  return (
    <div className="space-y-8">
      {user && role && role !== 'delivery' && role !== 'admin' ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your account role is <strong>{role}</strong>. Delivery tools are optimized for delivery partners.
        </div>
      ) : null}

      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-phyto-forest/10 pb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-phyto-leaf">Phyto delivery portal</div>
          <h1 className="font-display text-3xl font-semibold text-phyto-forest">Hello, {user?.name || 'Partner'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-full border border-phyto-forest/20 px-5 py-2 text-sm font-bold text-phyto-forest hover:bg-phyto-sage/50"
            >
              Log out
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-full bg-phyto-forest px-5 py-2 text-sm font-bold text-white hover:bg-phyto-leaf"
          >
            Sync data
          </button>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Truck className="size-6 text-phyto-leaf" />} label="Active shipments" value="04" />
        <StatCard icon={<Check className="size-6 text-phyto-leaf" />} label="Completed today" value="12" />
        <StatCard icon={<Clock className="size-6 text-orange-500" />} label="Total hours" value="06:45" />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-phyto-forest">Assigned shipments</h2>
          <span className="inline-flex items-center gap-2 rounded-full bg-phyto-sage/80 px-3 py-1 text-xs font-bold text-phyto-forest">
            <span className="size-2 animate-pulse rounded-full bg-phyto-leaf" />
            Live tracking enabled
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {assigned.map((o) => (
            <div key={o.id} className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-lg font-bold text-phyto-forest">{o.id}</span>
                {o.tags.map((t) => (
                  <span key={t} className="rounded-full bg-phyto-sage px-2 py-0.5 text-[10px] font-bold uppercase text-phyto-forest">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <div className="font-semibold text-phyto-forest">{o.customer}</div>
                <div className="text-stone-500">{o.phone}</div>
                <div className="flex gap-2 text-stone-600">
                  <MapPin className="size-4 shrink-0 text-phyto-leaf" />
                  {o.address}
                </div>
                <button type="button" className="text-xs font-bold text-phyto-leaf underline">
                  View on map
                </button>
              </div>
              <div className="mt-6 flex gap-3">
                <button type="button" className="flex-1 rounded-full border border-phyto-forest/25 py-2.5 text-sm font-bold text-phyto-forest">
                  Out for delivery
                </button>
                <button type="button" className="flex-1 rounded-full bg-phyto-forest py-2.5 text-sm font-bold text-white">
                  Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-phyto-forest">Delivery history</h2>
          <button type="button" className="text-sm font-bold text-phyto-leaf">
            View all history →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-phyto-forest/10 text-xs font-bold uppercase tracking-wide text-stone-500">
                <th className="pb-3 pr-4">Order</th>
                <th className="pb-3 pr-4">Customer</th>
                <th className="pb-3 pr-4">Location</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id} className="border-b border-stone-100">
                  <td className="py-4 font-mono font-bold text-phyto-forest">{h.id}</td>
                  <td className="py-4 font-medium">{h.customer}</td>
                  <td className="py-4 text-stone-600">{h.loc}</td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 font-bold text-phyto-leaf">
                      <Check className="size-4" /> Delivered
                    </span>
                  </td>
                  <td className="py-4 text-stone-500">{h.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-3xl border border-phyto-forest/10 bg-white p-5 shadow-sm">
      <div className="grid size-12 place-items-center rounded-2xl bg-phyto-sage/60">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-phyto-forest">{value}</div>
        <div className="text-xs font-bold uppercase tracking-wide text-stone-500">{label}</div>
      </div>
    </div>
  )
}
