import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../features/cart/cart-context'
import { formatInr } from '../../lib/format'
import { products } from '../../data/products'
import type { Product } from '../../features/catalog/types'
import {
  Sparkles,
  CheckCircle2,
  Plus,
  ShoppingBag,
  PackageCheck,
  Droplets,
  Sun,
  ShieldCheck,
} from 'lucide-react'
import clsx from 'clsx'

const POT_OPTIONS = [
  { id: 'ceramic-white', name: 'Matte Ceramic (Nordic White)', price: 299, image: '🏺' },
  { id: 'terracotta-raw', name: 'Handcrafted Terracotta Classic', price: 199, image: '🪴' },
  { id: 'self-watering', name: 'Smart Self-Watering Hydro-Pot', price: 399, image: '💧' },
  { id: 'jute-eco', name: 'Woven Biodegradable Jute Planter', price: 149, image: '🧶' },
]

const SOIL_OPTIONS = [
  { id: 'aroid-mix', name: 'Chunky Aroid Bark & Perlite Mix (2kg)', price: 199, desc: 'Prevents root rot; perfect for Monsteras & Pothos' },
  { id: 'succulent-grit', name: 'Porous Volcanic Succulent Grit (2kg)', price: 179, desc: 'Maximum drainage for Cacti, Jade & Haworthias' },
  { id: 'vermicompost-bio', name: 'Organic Vermicompost & Neem Enriched (3kg)', price: 149, desc: 'Nutrient-rich universal blooming mix' },
]

const ACCESSORY_OPTIONS = [
  { id: 'brass-mister', name: 'Vintage Brass Leaf Mister', price: 349, icon: '✨' },
  { id: 'pruning-shears', name: 'Precision Stainless Pruning Shears', price: 249, icon: '✂️' },
  { id: 'moisture-meter', name: 'Battery-Free Soil Moisture Meter', price: 299, icon: '📊' },
  { id: 'white-pebbles', name: 'Polished Decorative River Stones (1kg)', price: 99, icon: '🪨' },
]

export function KitsPage() {
  const nav = useNavigate()
  const { addToCart } = useCart()

  // Kit Builder State
  const basePlants = products.filter((p) => p.type === 'plants' && p.stock > 0).slice(0, 8)
  const [selectedPlant, setSelectedPlant] = useState<Product>(basePlants[0] || products[0])
  const [selectedPot, setSelectedPot] = useState(POT_OPTIONS[0])
  const [selectedSoil, setSelectedSoil] = useState(SOIL_OPTIONS[0])
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['brass-mister'])
  const [addedToast, setAddedToast] = useState(false)

  // Pre-assembled curated kits
  const curatedKits = products.filter((p) => p.type === 'kits' || p.tags.includes('gifting')).slice(0, 4)

  const accessoryTotal = selectedAccessories.reduce((acc, id) => {
    const item = ACCESSORY_OPTIONS.find((a) => a.id === id)
    return acc + (item ? item.price : 0)
  }, 0)

  const kitTotalPrice = selectedPlant.price + selectedPot.price + selectedSoil.price + accessoryTotal

  function toggleAccessory(id: string) {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  async function handleAddCustomKit() {
    // Create custom kit product object
    const customKitProduct: Product = {
      id: `custom-kit-${Date.now()}`,
      name: `Custom Kit: ${selectedPlant.name} + ${selectedPot.name.split('(')[0]}`,
      description: `Includes ${selectedPlant.name}, ${selectedPot.name}, ${selectedSoil.name}, and ${selectedAccessories.length} selected accessories.`,
      price: kitTotalPrice,
      stock: 20,
      popularity: 99,
      type: 'kits',
      environment: selectedPlant.environment,
      sunlight: selectedPlant.sunlight,
      care: selectedPlant.care,
      imageUrl: selectedPlant.imageUrl,
      tags: ['gifting', 'beginner-friendly'],
    }

    await addToCart(customKitProduct, { quantity: 1, includeKit: true, addService: false })
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3500)
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl border border-phyto-forest/10 bg-gradient-to-r from-phyto-forest via-phyto-forest to-emerald-950 p-8 text-white shadow-xl md:p-12">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-phyto-sage">
            <Sparkles className="size-3.5" />
            <span>DIY Customized Plant Kits</span>
          </div>
          <h1 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Build Your Own Botanical Kit
          </h1>
          <p className="mt-3 text-base leading-relaxed text-white/85">
            Pair your favorite plant with premium designer pots, specialized soil mixes, and handcrafted gardening tools. Everything you need to thrive.
          </p>
        </div>
      </div>

      {/* Interactive Kit Builder */}
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          {/* Step 1: Select Plant */}
          <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-phyto-forest text-sm font-bold text-white">
                1
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-phyto-forest">Select Your Base Plant</h2>
                <p className="text-xs text-stone-500">Pick from our hand-vetted lush indoor varieties</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {basePlants.map((p) => {
                const isSelected = selectedPlant.id === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlant(p)}
                    className={clsx(
                      'group relative flex flex-col overflow-hidden rounded-2xl border-2 p-2 text-left transition',
                      isSelected
                        ? 'border-phyto-leaf bg-phyto-sage/30 ring-2 ring-phyto-mint'
                        : 'border-stone-200 bg-white hover:border-phyto-forest/30'
                    )}
                  >
                    <div className="aspect-square w-full overflow-hidden rounded-xl bg-stone-100">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="size-full object-cover group-hover:scale-105 transition" />
                      ) : null}
                    </div>
                    <div className="mt-2 min-w-0">
                      <p className="truncate text-xs font-bold text-phyto-forest">{p.name}</p>
                      <p className="text-xs font-semibold text-phyto-leaf">{formatInr(p.price)}</p>
                    </div>
                    {isSelected && (
                      <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-phyto-forest text-[10px] text-white">
                        ✓
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Step 2: Choose Planter */}
          <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-phyto-forest text-sm font-bold text-white">
                2
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-phyto-forest">Choose a Designer Pot</h2>
                <p className="text-xs text-stone-500">Includes matching drainage tray</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {POT_OPTIONS.map((pot) => {
                const isSelected = selectedPot.id === pot.id
                return (
                  <button
                    key={pot.id}
                    type="button"
                    onClick={() => setSelectedPot(pot)}
                    className={clsx(
                      'flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition',
                      isSelected
                        ? 'border-phyto-leaf bg-phyto-sage/30 ring-2 ring-phyto-mint'
                        : 'border-stone-200 bg-white hover:border-phyto-forest/30'
                    )}
                  >
                    <span className="text-3xl">{pot.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-phyto-forest">{pot.name}</p>
                      <p className="text-xs font-semibold text-phyto-leaf">+{formatInr(pot.price)}</p>
                    </div>
                    {isSelected && <CheckCircle2 className="size-5 text-phyto-leaf shrink-0" />}
                  </button>
                )
              })}
            </div>
          </section>

          {/* Step 3: Choose Soil Blend */}
          <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-phyto-forest text-sm font-bold text-white">
                3
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-phyto-forest">Specialized Soil &amp; Nutrients</h2>
                <p className="text-xs text-stone-500">Engineered for maximum root aeration and growth</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {SOIL_OPTIONS.map((soil) => {
                const isSelected = selectedSoil.id === soil.id
                return (
                  <button
                    key={soil.id}
                    type="button"
                    onClick={() => setSelectedSoil(soil)}
                    className={clsx(
                      'flex w-full items-center justify-between rounded-2xl border-2 p-4 text-left transition',
                      isSelected
                        ? 'border-phyto-leaf bg-phyto-sage/30 ring-2 ring-phyto-mint'
                        : 'border-stone-200 bg-white hover:border-phyto-forest/30'
                    )}
                  >
                    <div>
                      <p className="text-sm font-bold text-phyto-forest">{soil.name}</p>
                      <p className="text-xs text-stone-500">{soil.desc}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-bold text-phyto-leaf">+{formatInr(soil.price)}</p>
                      {isSelected ? <span className="text-xs text-phyto-forest font-bold">✓ Selected</span> : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Step 4: Add Care Accessories */}
          <section className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="grid size-8 place-items-center rounded-full bg-phyto-forest text-sm font-bold text-white">
                4
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-phyto-forest">Optional Tools &amp; Accessories</h2>
                <p className="text-xs text-stone-500">Pick any finishing touches for your kit</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {ACCESSORY_OPTIONS.map((acc) => {
                const isSelected = selectedAccessories.includes(acc.id)
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggleAccessory(acc.id)}
                    className={clsx(
                      'flex items-center justify-between rounded-2xl border-2 p-3 text-left transition',
                      isSelected
                        ? 'border-phyto-leaf bg-phyto-sage/20'
                        : 'border-stone-200 bg-white hover:border-phyto-forest/20'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl">{acc.icon}</span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-phyto-forest">{acc.name}</p>
                        <p className="text-xs font-semibold text-stone-600">+{formatInr(acc.price)}</p>
                      </div>
                    </div>
                    <span
                      className={clsx(
                        'grid size-5 shrink-0 place-items-center rounded-md border text-xs font-bold',
                        isSelected ? 'border-phyto-leaf bg-phyto-leaf text-white' : 'border-stone-300 bg-white'
                      )}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Live Kit Summary Sticky Card */}
        <div>
          <aside className="sticky top-24 space-y-6 rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold text-phyto-forest">Your Customized Kit</h2>

            <div className="overflow-hidden rounded-2xl bg-phyto-sage/30 p-4">
              <div className="flex gap-3">
                <img
                  src={selectedPlant.imageUrl}
                  alt={selectedPlant.name}
                  className="size-16 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-phyto-forest text-sm">{selectedPlant.name}</p>
                  <p className="text-xs text-stone-500">{selectedPlant.scientificName}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-stone-600">
                    <span className="flex items-center gap-0.5"><Sun className="size-3 text-amber-500" /> {selectedPlant.lightRequirement || 'Medium'} light</span>
                    <span className="flex items-center gap-0.5"><Droplets className="size-3 text-blue-500" /> {selectedPlant.waterRequirement || 'Medium'} water</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Base Plant</span>
                <span className="font-semibold text-phyto-forest">{formatInr(selectedPlant.price)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Planter: {selectedPot.name.split('(')[0]}</span>
                <span className="font-semibold text-phyto-forest">{formatInr(selectedPot.price)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Soil: {selectedSoil.name.split('(')[0]}</span>
                <span className="font-semibold text-phyto-forest">{formatInr(selectedSoil.price)}</span>
              </div>
              {selectedAccessories.length > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Accessories ({selectedAccessories.length})</span>
                  <span className="font-semibold text-phyto-forest">{formatInr(accessoryTotal)}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-bold text-phyto-forest">
                <span>Total Kit Price</span>
                <span className="text-phyto-leaf">{formatInr(kitTotalPrice)}</span>
              </div>
            </div>

            {addedToast && (
              <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-bold text-emerald-800 animate-in fade-in">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                <span>Custom kit added to cart!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddCustomKit}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-4 text-sm font-bold text-white shadow-md transition hover:bg-phyto-leaf"
            >
              <ShoppingBag className="size-4" />
              <span>Add Custom Kit to Cart</span>
            </button>

            <div className="space-y-2 border-t border-stone-100 pt-4 text-[11px] text-stone-500">
              <div className="flex items-center gap-2">
                <PackageCheck className="size-4 text-phyto-leaf shrink-0" />
                <span>Pre-potted with drainage test &amp; moisture lock packaging</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-phyto-leaf shrink-0" />
                <span>14-day alive &amp; thriving plant guarantee</span>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Ready-to-Ship Curated Kits */}
      <section className="mt-16 space-y-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-phyto-leaf">Pre-assembled Favorites</div>
          <h2 className="font-display text-2xl font-semibold text-phyto-forest">Bestselling Curated Gift Kits</h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {curatedKits.map((k) => (
            <div
              key={k.id}
              className="group flex flex-col overflow-hidden rounded-3xl border border-phyto-forest/10 bg-white p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-stone-100">
                {k.imageUrl ? (
                  <img src={k.imageUrl} alt={k.name} className="size-full object-cover group-hover:scale-105 transition duration-300" />
                ) : null}
              </div>
              <div className="mt-4 flex-1 flex flex-col">
                <h3 className="font-display text-base font-semibold text-phyto-forest">{k.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-stone-600 flex-1">{k.description}</p>
                <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                  <span className="text-base font-bold text-phyto-forest">{formatInr(k.price)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(k, { quantity: 1, includeKit: true })
                      nav('/cart')
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-phyto-forest px-3.5 py-1.5 text-xs font-bold text-white hover:bg-phyto-leaf transition"
                  >
                    <Plus className="size-3.5" />
                    <span>Get Kit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
