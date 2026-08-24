import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { formatInr } from '../../lib/format'
import type { Product } from '../../features/catalog/types'
import {
  Stethoscope,
  Sprout,
  Sun,
  Scissors,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Award,
  Sparkles,
  Plus,
} from 'lucide-react'

type Service = {
  id: string
  name: string
  tagline: string
  description: string
  price: number
  duration: string
  icon: typeof Stethoscope
  features: string[]
  badge?: string
}

const SERVICES: Service[] = [
  {
    id: 'srv-doctor',
    name: 'Plant Doctor & Health Diagnostic',
    tagline: 'Expert in-person diagnosis and recovery plan',
    description:
      'Certified botanist visits your home to inspect sick plants, diagnose pests, yellowing leaves, or root rot, and administers on-site organic treatment.',
    price: 399,
    duration: '45 mins',
    icon: Stethoscope,
    badge: 'Most Popular',
    features: [
      'Comprehensive root, stem & leaf health analysis',
      'Organic pest eradication (Mealybugs, Mites, Fungus)',
      'Customized watering & light adjustment prescription',
      'Free 14-day WhatsApp follow-up support',
    ],
  },
  {
    id: 'srv-potting',
    name: 'Hyperlocal Repotting & Potting Service',
    tagline: 'Mess-free repotting with premium organic mixes',
    description:
      'Our skilled gardeners repot up to 5 plants with specialized aroid/succulent potting soil, slow-release bio-nutrients, and clean up afterwards.',
    price: 249,
    duration: '60 mins',
    icon: Sprout,
    badge: 'Essential',
    features: [
      'Gentle root-ball untangling & root rot pruning',
      'Fresh premium chunky soil & vermicompost mix included',
      'Proper drainage testing and topstone dressing',
      'Zero-mess cleanup in your balcony or living area',
    ],
  },
  {
    id: 'srv-balcony',
    name: 'Balcony & Terrace Garden Makeover',
    tagline: 'Turn empty balconies into lush green sanctuaries',
    description:
      'Complete urban garden setup with zoned sunlight arrangement, vertical planters, micro-irrigation advice, and aesthetic plant curation.',
    price: 1499,
    duration: '2-3 hours',
    icon: Sun,
    badge: 'Transformative',
    features: [
      'Custom microclimate & sunlight trajectory assessment',
      'Arrangement of up to 15 plants for maximum aesthetic impact',
      'Vertical railing planter installation & safety checks',
      'Personalized seasonal maintenance calendar',
    ],
  },
  {
    id: 'srv-maintenance',
    name: 'Seasonal Pruning & Nutrition Care',
    tagline: 'Regular monthly wellness for all your plants',
    description:
      'Periodic upkeep for residential gardens: leaf trimming, shaping, neem oil wash, aeration, and high-potency bio-fertilizer feeding.',
    price: 499,
    duration: '90 mins',
    icon: Scissors,
    features: [
      'Sanitary pruning of dead, leggy, or yellow foliage',
      'Soil aeration and bio-enzyme organic feeding',
      'Preventive organic neem spray against pest attacks',
      'Foliage shine and dust removal',
    ],
  },
]

export function ServicesPage() {
  const nav = useNavigate()
  const { addToCart } = useCart()

  const [bookingService, setBookingService] = useState<Service | null>(null)
  const [bookingDate, setBookingDate] = useState('')
  const [bookingTime, setBookingTime] = useState('10:00 AM - 12:00 PM')
  const [bookingCity, setBookingCity] = useState('Bengaluru')
  const [bookedSuccess, setBookedSuccess] = useState(false)

  async function handleBookService(e: React.FormEvent) {
    e.preventDefault()
    if (!bookingService) return

    const serviceProduct: Product = {
      id: `service-${bookingService.id}-${Date.now()}`,
      name: `${bookingService.name} (Scheduled for ${bookingDate || 'Next Available'})`,
      description: `Professional on-site service in ${bookingCity} (${bookingTime}). Includes all tools and materials.`,
      price: bookingService.price,
      stock: 100,
      popularity: 99,
      type: 'tools',
      environment: 'indoor',
      sunlight: 'partial',
      care: { water: 'N/A', sunlight: 'N/A' },
      imageUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?auto=format&fit=crop&w=800&q=80',
      tags: ['low-maintenance'],
    }

    await addToCart(serviceProduct, { quantity: 1, addService: true })
    setBookedSuccess(true)
    setTimeout(() => {
      setBookedSuccess(false)
      setBookingService(null)
      nav('/cart')
    }, 2000)
  }

  return (
    <div className="space-y-12">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-phyto-forest/10 bg-gradient-to-br from-phyto-forest via-phyto-forest to-emerald-900 p-8 text-white shadow-xl md:p-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-phyto-sage">
            <Award className="size-3.5" />
            <span>Phyto Certified Plant Doctors &amp; Gardeners</span>
          </div>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Professional Plant Care Services
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/85">
            Book certified botanists and experienced gardeners at your doorstep. From saving dying plants to full balcony garden transformations.
          </p>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl border border-phyto-forest/10 bg-white p-4 shadow-sm">
          <ShieldCheck className="size-8 text-phyto-leaf shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-phyto-forest">100% Verified Experts</p>
            <p className="text-stone-500">Background checked botanists</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-phyto-forest/10 bg-white p-4 shadow-sm">
          <Award className="size-8 text-amber-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-phyto-forest">Organic Treatments</p>
            <p className="text-stone-500">Zero chemical toxins</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-phyto-forest/10 bg-white p-4 shadow-sm">
          <Clock className="size-8 text-blue-500 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-phyto-forest">On-Time Guarantee</p>
            <p className="text-stone-500">Scheduled 2-hour slots</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-phyto-forest/10 bg-white p-4 shadow-sm">
          <Sparkles className="size-8 text-emerald-600 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-phyto-forest">Mess-Free Service</p>
            <p className="text-stone-500">Spotless post-service cleanup</p>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {SERVICES.map((s) => {
          const Icon = s.icon
          return (
            <div
              key={s.id}
              className="flex flex-col justify-between rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card transition hover:shadow-lg md:p-8"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="grid size-14 place-items-center rounded-2xl bg-phyto-sage/40 text-phyto-forest">
                    <Icon className="size-7 text-phyto-leaf" />
                  </div>
                  {s.badge && (
                    <span className="rounded-full bg-phyto-sage px-3 py-1 text-xs font-bold text-phyto-forest">
                      {s.badge}
                    </span>
                  )}
                </div>

                <h3 className="font-display mt-4 text-xl font-semibold text-phyto-forest">{s.name}</h3>
                <p className="text-xs font-semibold text-phyto-leaf mt-0.5">{s.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-stone-600">{s.description}</p>

                <div className="mt-6 space-y-2 border-t border-stone-100 pt-4">
                  {s.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-stone-700">
                      <CheckCircle2 className="size-4 text-phyto-leaf shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-4">
                <div>
                  <span className="text-xs text-stone-500">Starting from</span>
                  <div className="text-2xl font-bold text-phyto-forest">{formatInr(s.price)}</div>
                  <span className="text-[11px] text-stone-400">Duration: {s.duration}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBookingService(s)}
                  className="flex items-center gap-1.5 rounded-full bg-phyto-forest px-6 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-phyto-leaf"
                >
                  <Plus className="size-4" />
                  <span>Book Service</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Booking Modal / Dialog */}
      {bookingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-2xl md:p-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="font-display text-xl font-semibold text-phyto-forest">Book {bookingService.name}</h3>
                <p className="text-xs text-stone-500">Select date &amp; preferred time window</p>
              </div>
              <button
                type="button"
                onClick={() => setBookingService(null)}
                className="grid size-8 place-items-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
              >
                ✕
              </button>
            </div>

            {bookedSuccess ? (
              <div className="py-10 text-center space-y-3">
                <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-10" />
                </div>
                <h4 className="font-display text-lg font-bold text-phyto-forest">Service Added to Cart!</h4>
                <p className="text-xs text-stone-600">Redirecting to cart to complete checkout…</p>
              </div>
            ) : (
              <form onSubmit={handleBookService} className="mt-6 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-stone-600 flex items-center gap-1">
                    <Calendar className="size-3.5" /> Preferred Date
                  </label>
                  <input
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-phyto-forest/15 px-4 py-2.5 text-sm font-medium focus:border-phyto-leaf focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-stone-600 flex items-center gap-1">
                      <Clock className="size-3.5" /> Time Slot
                    </label>
                    <select
                      value={bookingTime}
                      onChange={(e) => setBookingTime(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-phyto-forest/15 px-3 py-2.5 text-xs font-medium focus:border-phyto-leaf focus:outline-none"
                    >
                      <option value="09:00 AM - 11:00 AM">09:00 AM - 11:00 AM</option>
                      <option value="11:00 AM - 01:00 PM">11:00 AM - 01:00 PM</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-stone-600 flex items-center gap-1">
                      <MapPin className="size-3.5" /> City
                    </label>
                    <select
                      value={bookingCity}
                      onChange={(e) => setBookingCity(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-phyto-forest/15 px-3 py-2.5 text-xs font-medium focus:border-phyto-leaf focus:outline-none"
                    >
                      <option value="Bengaluru">Bengaluru</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi NCR">Delhi NCR</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Pune">Pune</option>
                    </select>
                  </div>
                </div>

                <div className="rounded-2xl bg-phyto-sage/30 p-3 text-xs flex justify-between items-center text-phyto-forest">
                  <span className="font-semibold">Estimated Price:</span>
                  <span className="font-bold text-base">{formatInr(bookingService.price)}</span>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBookingService(null)}
                    className="flex-1 rounded-full border border-stone-200 py-3 text-xs font-bold text-stone-600 hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-full bg-phyto-forest py-3 text-xs font-bold text-white shadow-md hover:bg-phyto-leaf"
                  >
                    Confirm &amp; Add to Cart
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
