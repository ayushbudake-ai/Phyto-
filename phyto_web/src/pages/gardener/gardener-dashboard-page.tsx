import { useState } from 'react'
import { useAuth } from '../../features/auth/auth-context'
import { useLocation } from '../../features/nursery/nursery-service'
import {
  Stethoscope,
  MapPin,
} from 'lucide-react'
import clsx from 'clsx'

interface ServiceBooking {
  id: string
  customerName: string
  phone: string
  address: string
  serviceType: string
  scheduledDate: string
  scheduledSlot: string
  notes: string
  fee: number
  status: 'confirmed' | 'in_progress' | 'completed'
}

const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'BK-1021',
    customerName: 'Shalini Joshi',
    phone: '+91 98221 33445',
    address: 'Flat 501, Tarabai Park, Kolhapur - 416003',
    serviceType: 'Plant Doctor Diagnostic & Pest Eradication Visit',
    scheduledDate: 'Today',
    scheduledSlot: '2:00 PM - 3:30 PM',
    notes: 'Monstera leaves showing brown spotting; needs root health inspection.',
    fee: 499,
    status: 'confirmed',
  },
  {
    id: 'BK-1019',
    customerName: 'Amit Saxena',
    phone: '+91 98230 77889',
    address: 'B-304, Nagala Park, Kolhapur - 416003',
    serviceType: 'Balcony Garden Seasonal Repotting & Soil Nourishment',
    scheduledDate: 'Tomorrow',
    scheduledSlot: '10:00 AM - 12:00 PM',
    notes: '12 pots requiring organic vermicompost repotting.',
    fee: 899,
    status: 'confirmed',
  },
  {
    id: 'BK-1014',
    customerName: 'Meera Deshpande',
    phone: '+91 98225 66778',
    address: 'Rowhouse 8, Saneguruji Vasahat, Kolhapur - 416012',
    serviceType: 'Bonsai Pruning & Wire Sculpting Session',
    scheduledDate: '24 Aug 2026',
    scheduledSlot: '4:00 PM - 5:30 PM',
    notes: 'Ficus and Jade Bonsai care session.',
    fee: 649,
    status: 'completed',
  },
]

export function GardenerDashboardPage() {
  const { user } = useAuth()
  const { currentCity } = useLocation()
  const [bookings, setBookings] = useState<ServiceBooking[]>(INITIAL_BOOKINGS)

  function updateBookingStatus(id: string, status: ServiceBooking['status']) {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)))
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Gardener Header */}
      <div className="rounded-3xl border border-teal-200 bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 p-8 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-teal-200">
              <Stethoscope className="size-3.5" />
              <span>Certified Plant Doctor &amp; Gardener Portal</span>
            </div>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {user?.name || 'Ramesh Shinde (Master Botanist)'}
            </h1>
            <p className="text-xs text-teal-100/90 flex items-center gap-2">
              <MapPin className="size-3.5" />
              <span>{currentCity} Urban Coverage · 8+ Years Botanical Experience</span>
            </p>
          </div>

          <div className="flex gap-3 text-center">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xl font-bold text-amber-300">Rating 4.96</p>
              <p className="text-[11px] text-teal-100">Customer Rating</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <p className="text-xl font-bold text-emerald-300">142</p>
              <p className="text-[11px] text-teal-100">Visits Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-phyto-forest">Upcoming Service Appointments</h2>
          <span className="text-xs text-stone-500">{bookings.length} Scheduled Visits</span>
        </div>

        <div className="grid gap-4">
          {bookings.map((bk) => (
            <div
              key={bk.id}
              className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-phyto-forest bg-stone-100 px-2.5 py-1 rounded-md">
                    {bk.id}
                  </span>
                  <span
                    className={clsx(
                      'rounded-full px-3 py-0.5 text-xs font-bold',
                      bk.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : bk.status === 'in_progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    )}
                  >
                    {bk.status === 'confirmed'
                      ? 'Confirmed'
                      : bk.status === 'in_progress'
                      ? 'In Progress'
                      : 'Service Completed'}
                  </span>
                  <span className="text-xs font-semibold text-stone-500">
                    {bk.scheduledDate} ({bk.scheduledSlot})
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-phyto-forest">{bk.serviceType}</h3>
                  <p className="text-xs text-stone-700 mt-0.5">
                    <strong>{bk.customerName}</strong> · {bk.phone}
                  </p>
                  <p className="text-xs text-stone-500">{bk.address}</p>
                </div>

                {bk.notes && (
                  <p className="text-xs text-stone-600 bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                    <em>Customer Notes:</em> {bk.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="text-right">
                  <p className="text-xs text-stone-400">Visiting Fee</p>
                  <p className="text-lg font-bold text-phyto-forest">₹{bk.fee}</p>
                </div>

                <div className="flex gap-2">
                  {bk.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(bk.id, 'in_progress')}
                      className="rounded-full bg-teal-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
                    >
                      Start Visit
                    </button>
                  )}
                  {bk.status === 'in_progress' && (
                    <button
                      type="button"
                      onClick={() => updateBookingStatus(bk.id, 'completed')}
                      className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                    >
                      Complete &amp; Add Green Points
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
