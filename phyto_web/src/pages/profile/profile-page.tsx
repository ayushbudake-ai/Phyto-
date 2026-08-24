import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/auth-context'
import { products } from '../../data/products'
import { formatInr } from '../../lib/format'
import {
  MapPin,
  Heart,
  LogOut,
  Sparkles,
  CheckCircle2,
  Leaf,
} from 'lucide-react'

export function ProfilePage() {
  const nav = useNavigate()
  const { user, logout, updateUserPreferences } = useAuth()

  const [hasPets, setHasPets] = useState(user?.preferences?.hasPets ?? false)
  const [isBeginner, setIsBeginner] = useState(user?.preferences?.isBeginner ?? true)
  const [favSpace, setFavSpace] = useState(user?.preferences?.favoriteSpaces?.[0] || 'Living room')
  const [savedToast, setSavedToast] = useState(false)

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

  function handleLogout() {
    logout()
    nav('/login')
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-2xl bg-gradient-to-br from-phyto-forest to-emerald-900 text-white font-bold text-2xl shadow-md">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'PH'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-phyto-forest">{user?.name || 'Botanical Member'}</h1>
              <span className="rounded-full bg-phyto-sage px-2.5 py-0.5 text-[10px] font-bold uppercase text-phyto-forest">
                {user?.role || 'Customer'}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">{user?.email || 'member@phyto.com'}</p>
            <p className="text-xs text-stone-400 mt-1 flex items-center gap-1">
              <Leaf className="size-3 text-phyto-leaf" /> Green Thumb Member since 2026
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
                className="w-full rounded-2xl border border-phyto-forest/15 px-4 py-2.5 text-xs font-medium focus:border-phyto-leaf focus:outline-none"
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
              className="mt-2 w-full rounded-full bg-phyto-forest py-3 text-xs font-bold text-white hover:bg-phyto-leaf transition"
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
              {user?.address_street || '12 Botanical Heights, 4th Block'}
            </p>
            <p className="text-xs text-stone-500 mt-0.5">
              {user?.address_city || 'Bengaluru'}, {user?.address_state || 'Karnataka'} {user?.address_zip || '560034'}
            </p>
            <p className="text-xs text-stone-500 mt-1">Phone: {user?.phone || '+91 98765 43210'}</p>
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
