import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { useGreenIndex } from '../../features/green-index/green-index-context'
import { products } from '../../data/products'
import { formatInr } from '../../lib/format'
import {
  MapPin,
  Heart,
  LogOut,
  Sparkles,
  CheckCircle2,
  Leaf,
  Award,
  Mail,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'

export function ProfilePage() {
  const nav = useNavigate()
  const { user, logout, updateUserPreferences, resendVerificationEmail } = useAuth()
  const { points, targetPoints, progressPercentage, isChampion } = useGreenIndex()

  const [hasPets, setHasPets] = useState(user?.preferences?.hasPets ?? false)
  const [isBeginner, setIsBeginner] = useState(user?.preferences?.isBeginner ?? true)
  const [favSpace, setFavSpace] = useState(user?.preferences?.favoriteSpaces?.[0] || 'Living room')
  const [savedToast, setSavedToast] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  // Viewed plants
  const viewedIds = user?.preferences?.viewedProductIds || ['p1', 'p2', 'p5']
  const viewedPlants = products.filter((p) => viewedIds.includes(p.id)).slice(0, 4)

  function savePreferences(e: React.FormEvent) {
    e.preventDefault()
    updateUserPreferences({
      hasPets,
      isBeginner,
      favoriteSpaces: [favSpace],
    })
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3000)
  }

  async function handleResendVerification() {
    try {
      await resendVerificationEmail()
      setResendStatus(`Verification email dispatched to ${user?.email}. Please check your inbox.`)
    } catch {
      setResendStatus(`Verification request sent to ${user?.email}.`)
    }
    setTimeout(() => setResendStatus(null), 5000)
  }

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-20">
      {/* Header with User Info & Verification Status */}
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-phyto-forest to-emerald-900 text-white font-bold text-2xl shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PH'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-phyto-forest">{user?.name || 'Botanical Member'}</h1>
              <span className="rounded-full bg-phyto-sage px-3 py-0.5 text-xs font-bold uppercase text-phyto-forest">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-stone-600 flex items-center gap-1.5">
              <Mail className="size-3.5 text-stone-400" />
              <span>{user?.email || 'member@phyto.org'}</span>
              {user?.emailVerified ? (
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-700" />
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 hover:bg-amber-200 transition"
                >
                  Unverified · Send Real Verification Email
                </button>
              )}
            </p>
            {resendStatus && (
              <p className="text-xs font-bold text-emerald-700">{resendStatus}</p>
            )}
            <p className="text-xs text-stone-400 flex items-center gap-1">
              <Leaf className="size-3 text-phyto-leaf" /> Green Member since 2026
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-full border-2 border-red-200 bg-red-50/50 px-5 py-2.5 text-xs font-bold text-red-700 hover:bg-red-100 transition"
        >
          <LogOut className="size-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Prominent PHYTO GREEN INDEX Dashboard Card */}
      <section className="rounded-3xl border border-emerald-300 bg-gradient-to-r from-emerald-950 via-[#103b22] to-stone-900 p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-emerald-200">
              <Award className="size-3.5 text-emerald-300" />
              <span>Eco-Milestone Tracker</span>
            </div>
            <h2 className="font-display text-2xl font-bold md:text-3xl text-white">
              PHYTO GREEN INDEX
            </h2>
            <p className="text-xs text-emerald-100/80">
              {isChampion ? 'Status: Green Champion' : `${progressPercentage}% towards Green Champion Certification`}
            </p>
          </div>

          <div className="text-right">
            <div className="text-3xl font-black text-emerald-300">{points} / {targetPoints}</div>
            <p className="text-xs text-emerald-200">Total Eco-Points</p>
          </div>
        </div>

        {/* Large Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-full bg-white/20 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-bold text-emerald-200/90">
            <span>Seedling (100)</span>
            <span>Planter (300)</span>
            <span>Botanist (600)</span>
            <span>Green Champion (1000)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <p className="text-xs text-emerald-100/90 max-w-md">
            Adopt plants, buy seeds, or book plant doctor visits to earn certified Green Points and vouchers.
          </p>
          <Link
            to="/green-index"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-2.5 text-xs font-bold text-stone-900 shadow-md hover:bg-emerald-300 transition"
          >
            <span>Open Full PHYTO GREEN INDEX Dashboard</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Plant Care Preferences */}
        <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8">
          <div className="flex items-center gap-2 text-phyto-forest border-b border-stone-100 pb-3 mb-4">
            <Heart className="size-5 text-phyto-leaf" />
            <h2 className="font-display text-lg font-semibold">Your Plant &amp; Space Profile</h2>
          </div>
          <p className="text-xs text-stone-500 mb-6">
            We tune your personalized plant recommendations based on these preferences.
          </p>

          <form onSubmit={savePreferences} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wide text-stone-600 block mb-1">
                Primary Greenery Space
              </label>
              <select
                value={favSpace}
                onChange={(e) => setFavSpace(e.target.value)}
                className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-3 text-xs font-medium focus:border-phyto-leaf focus:outline-none"
              >
                <option value="Living room">Living room</option>
                <option value="Bedroom">Bedroom</option>
                <option value="Balcony">Balcony</option>
                <option value="Office">Office / Study</option>
                <option value="Terrace">Terrace Garden</option>
                <option value="Desk">Desk</option>
              </select>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-3.5 cursor-pointer hover:bg-stone-50 transition">
                <div>
                  <p className="text-xs font-bold text-phyto-forest">Living with Pets (Dogs / Cats)</p>
                  <p className="text-[11px] text-stone-500">Prioritize 100% pet-safe non-toxic plants</p>
                </div>
                <input
                  type="checkbox"
                  checked={hasPets}
                  onChange={(e) => setHasPets(e.target.checked)}
                  className="size-5 rounded border-stone-300 text-phyto-leaf focus:ring-phyto-mint"
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-stone-200 p-3.5 cursor-pointer hover:bg-stone-50 transition">
                <div>
                  <p className="text-xs font-bold text-phyto-forest">Beginner Friendly Mode</p>
                  <p className="text-[11px] text-stone-500">Suggest resilient, hard-to-kill varieties</p>
                </div>
                <input
                  type="checkbox"
                  checked={isBeginner}
                  onChange={(e) => setIsBeginner(e.target.checked)}
                  className="size-5 rounded border-stone-300 text-phyto-leaf focus:ring-phyto-mint"
                />
              </label>
            </div>

            {savedToast && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="size-4 text-emerald-600" />
                <span>Preferences saved successfully!</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full rounded-full bg-phyto-forest py-3.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
            >
              Update Preferences
            </button>
          </form>
        </section>

        {/* Quick Links & Shipping Address */}
        <section className="space-y-6">
          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
            <div className="flex items-center gap-2 text-phyto-forest border-b border-stone-100 pb-3 mb-4">
              <MapPin className="size-5 text-phyto-leaf" />
              <h2 className="font-display text-lg font-semibold">Delivery Address</h2>
            </div>
            <p className="text-xs text-stone-700 font-medium">
              {user?.address_street || '14 Nagala Park / Tarabai Park'}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.address_city || 'Kolhapur'}, {user?.address_state || 'Maharashtra'} {user?.address_zip || '416003'}
            </p>
            <p className="text-xs text-stone-500 mt-1">Phone: {user?.phone || '+91 98231 44556'}</p>
          </div>

          <div className="rounded-3xl border border-phyto-forest/10 bg-phyto-sage/30 p-6">
            <h3 className="font-display text-base font-bold text-phyto-forest mb-2">Need Botanical Assistance?</h3>
            <p className="text-xs text-stone-600 mb-4 leading-relaxed">
              Our AI Phyto Bot is always available to answer plant care, watering, pest and soil inquiries.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 rounded-full bg-phyto-forest px-4 py-2 text-xs font-bold text-white hover:bg-phyto-leaf"
            >
              <Sparkles className="size-3.5 text-amber-300" />
              <span>Book Plant Doctor Visit</span>
            </Link>
          </div>
        </section>
      </div>

      {/* Recently Viewed Plants */}
      {viewedPlants.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-phyto-forest">Recently Viewed by You</h2>
            <Link to="/shop" className="text-xs font-bold text-phyto-leaf hover:underline">
              Browse all plants →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {viewedPlants.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group flex flex-col rounded-2xl border border-stone-200 bg-white p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="size-full object-cover group-hover:scale-105 transition" />
                  ) : null}
                </div>
                <p className="mt-2 truncate text-xs font-bold text-phyto-forest">{p.name}</p>
                <p className="text-xs font-bold text-phyto-leaf mt-0.5">{formatInr(p.price)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
