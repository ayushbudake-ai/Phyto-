import { useState } from 'react'
import { useCart } from '../../features/cart/cart-context'
import { formatInr } from '../../lib/format'
import { products } from '../../data/products'
import type { Product } from '../../features/catalog/types'
import {
  Sparkles,
  CheckCircle2,
  ShoppingBag,
} from 'lucide-react'
import clsx from 'clsx'

const POT_OPTIONS = [
  { id: 'ceramic-white', name: 'Matte Ceramic (Nordic White)', price: 299, desc: 'Glazed porcelain with saucer' },
  { id: 'terracotta-raw', name: 'Handcrafted Terracotta Classic', price: 199, desc: 'Porous breathable baked clay' },
  { id: 'self-watering', name: 'Smart Self-Watering Hydro-Pot', price: 399, desc: 'Built-in water reservoir' },
  { id: 'jute-eco', name: 'Woven Biodegradable Jute Planter', price: 149, desc: 'Natural fiber pot cover' },
]

const SOIL_OPTIONS = [
  { id: 'aroid-mix', name: 'Chunky Aroid Bark & Perlite Mix (2kg)', price: 199, desc: 'Prevents root rot; perfect for Monsteras & Pothos' },
  { id: 'succulent-grit', name: 'Porous Volcanic Succulent Grit (2kg)', price: 179, desc: 'Maximum drainage for Cacti, Jade & Haworthias' },
  { id: 'vermicompost-bio', name: 'Organic Vermicompost & Neem Enriched (3kg)', price: 149, desc: 'Nutrient-rich universal blooming mix' },
]

const ACCESSORY_OPTIONS = [
  { id: 'brass-mister', name: 'Vintage Brass Leaf Mister', price: 349, desc: 'Fine humidity misting nozzle' },
  { id: 'pruning-shears', name: 'Precision Stainless Pruning Shears', price: 249, desc: 'Surgical edge steel blades' },
  { id: 'moisture-meter', name: 'Battery-Free Soil Moisture Meter', price: 299, desc: 'Instant 3-in-1 probe test' },
  { id: 'white-pebbles', name: 'Polished Decorative River Stones (1kg)', price: 99, desc: 'White marble top-dressing' },
]

export function KitsPage() {
  const { addToCart } = useCart()

  // Kit Builder State
  const basePlants = products.filter((p) => p.type === 'plants' && p.stock > 0).slice(0, 8)
  const [selectedPlant, setSelectedPlant] = useState<Product>(basePlants[0] || products[0])
  const [selectedPot, setSelectedPot] = useState(POT_OPTIONS[0])
  const [selectedSoil, setSelectedSoil] = useState(SOIL_OPTIONS[0])
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>(['brass-mister'])
  const [addedToast, setAddedToast] = useState(false)

  const accessoryTotal = selectedAccessories.reduce((acc, id) => {
    const item = ACCESSORY_OPTIONS.find((a) => a.id === id)
    return acc + (item ? item.price : 0)
  }, 0)

  const kitTotalPrice = selectedPlant.price + selectedPot.price + selectedSoil.price + accessoryTotal

  function toggleAccessory(id: string) {
    setSelectedAccessories((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  function handleAddCustomKit() {
    const customKitProduct: Product = {
      id: `custom-kit-${Date.now()}`,
      sku: `KIT-CUST-${Date.now().toString().slice(-6)}`,
      name: `Custom Botanical Kit: ${selectedPlant.name}`,
      description: `Includes 1x ${selectedPlant.name}, 1x ${selectedPot.name}, 1x ${selectedSoil.name}, plus ${selectedAccessories.length} botanical accessories.`,
      price: kitTotalPrice,
      stock: 50,
      popularity: 99,
      type: 'kits',
      category: 'Customized Kits',
      mainCategory: 'Plants',
      sunlight: selectedPlant.sunlight,
      environment: selectedPlant.environment,
      lightRequirement: selectedPlant.lightRequirement,
      waterRequirement: selectedPlant.waterRequirement,
      maintenance: selectedPlant.maintenance,
      suitableSpace: selectedPlant.suitableSpace,
      purpose: selectedPlant.purpose,
      isPetFriendly: selectedPlant.isPetFriendly,
      petSafety: selectedPlant.petSafety,
      rating: 4.95,
      reviewsCount: 1,
      greenPointsAwarded: 150,
      nurseryCity: selectedPlant.nurseryCity || 'Pune',
      nurseryName: selectedPlant.nurseryName || 'Green Leaf Nursery',
      imageUrl: selectedPlant.imageUrl,
      tags: ['custom-kit', 'bundle', 'care-package'],
      care: selectedPlant.care,
    }

    addToCart(customKitProduct, { quantity: 1 })
    setAddedToast(true)
    setTimeout(() => setAddedToast(false), 3000)
  }

  return (
    <div className="space-y-12 pb-16 max-w-6xl mx-auto">
      {/* Hero Banner */}
      <section className="rounded-3xl border border-phyto-forest/10 bg-gradient-to-r from-phyto-forest via-[#1b3825] to-phyto-forest p-8 text-white shadow-card md:p-12">
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-phyto-mint">
            <Sparkles className="size-3.5" />
            <span>Interactive Botanical Builder</span>
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-5xl">
            Customized Plant &amp; Care Kits
          </h1>
          <p className="text-xs sm:text-sm text-stone-200">
            Build your tailored botanical bundle with living plants, organic soil blends, designer pots, and care tools. Assembled and delivered in one eco-friendly package.
          </p>
        </div>
      </section>

      {/* Main Interactive 4-Step Builder */}
      <section className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="space-y-8 lg:col-span-8">
          {/* Step 1: Select Plant */}
          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-phyto-forest text-xs font-bold text-white">
                1
              </span>
              <h2 className="font-display text-base font-bold text-phyto-forest">
                Select Your Base Living Plant
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {basePlants.map((plant) => {
                const isSel = selectedPlant.id === plant.id
                return (
                  <button
                    key={plant.id}
                    type="button"
                    onClick={() => setSelectedPlant(plant)}
                    className={clsx(
                      'rounded-2xl border p-2.5 text-left transition relative flex flex-col justify-between',
                      isSel
                        ? 'border-phyto-forest bg-emerald-50/60 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-white'
                    )}
                  >
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      className="aspect-square w-full rounded-xl object-cover"
                    />
                    <div className="mt-2">
                      <p className="text-xs font-bold text-phyto-forest truncate">{plant.name}</p>
                      <p className="text-[11px] font-semibold text-emerald-800">{formatInr(plant.price)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 2: Select Pot */}
          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-phyto-forest text-xs font-bold text-white">
                2
              </span>
              <h2 className="font-display text-base font-bold text-phyto-forest">
                Select Matching Pot / Planter
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {POT_OPTIONS.map((pot) => {
                const isSel = selectedPot.id === pot.id
                return (
                  <button
                    key={pot.id}
                    type="button"
                    onClick={() => setSelectedPot(pot)}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition flex items-center justify-between',
                      isSel
                        ? 'border-phyto-forest bg-emerald-50/60 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-white'
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-phyto-forest">{pot.name}</p>
                      <p className="text-[11px] text-stone-500">{pot.desc}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-800">{formatInr(pot.price)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 3: Select Soil Mix */}
          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-phyto-forest text-xs font-bold text-white">
                3
              </span>
              <h2 className="font-display text-base font-bold text-phyto-forest">
                Select Specialized Soil Blend
              </h2>
            </div>
            <div className="space-y-2.5">
              {SOIL_OPTIONS.map((soil) => {
                const isSel = selectedSoil.id === soil.id
                return (
                  <button
                    key={soil.id}
                    type="button"
                    onClick={() => setSelectedSoil(soil)}
                    className={clsx(
                      'w-full rounded-2xl border p-4 text-left transition flex items-center justify-between',
                      isSel
                        ? 'border-phyto-forest bg-emerald-50/60 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-white'
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-phyto-forest">{soil.name}</p>
                      <p className="text-[11px] text-stone-500">{soil.desc}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-800">{formatInr(soil.price)}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Step 4: Optional Care Accessories */}
          <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <span className="grid size-7 place-items-center rounded-full bg-phyto-forest text-xs font-bold text-white">
                4
              </span>
              <h2 className="font-display text-base font-bold text-phyto-forest">
                Optional Botanical Accessories
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ACCESSORY_OPTIONS.map((acc) => {
                const isSel = selectedAccessories.includes(acc.id)
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => toggleAccessory(acc.id)}
                    className={clsx(
                      'rounded-2xl border p-4 text-left transition flex items-center justify-between',
                      isSel
                        ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30'
                        : 'border-stone-200 bg-stone-50/50 hover:bg-white'
                    )}
                  >
                    <div>
                      <p className="text-xs font-bold text-phyto-forest">{acc.name}</p>
                      <p className="text-[11px] text-stone-500">{acc.desc}</p>
                    </div>
                    <span className="font-bold text-xs text-emerald-800">{formatInr(acc.price)}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Live Kit Summary & Checkout Card */}
        <aside className="sticky top-24 space-y-4 rounded-3xl border border-phyto-forest/10 bg-stone-50/90 p-6 shadow-card lg:col-span-4">
          <h2 className="font-display text-base font-bold text-phyto-forest">
            Your Custom Kit Package
          </h2>

          <div className="space-y-3 text-xs border-b border-stone-200 pb-4">
            <div className="flex justify-between">
              <span className="text-stone-600">Living Plant: {selectedPlant.name}</span>
              <span className="font-bold text-phyto-forest">{formatInr(selectedPlant.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Planter: {selectedPot.name}</span>
              <span className="font-bold text-phyto-forest">{formatInr(selectedPot.price)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Soil: {selectedSoil.name}</span>
              <span className="font-bold text-phyto-forest">{formatInr(selectedSoil.price)}</span>
            </div>
            {selectedAccessories.length > 0 && (
              <div className="flex justify-between">
                <span className="text-stone-600">Accessories ({selectedAccessories.length}):</span>
                <span className="font-bold text-phyto-forest">{formatInr(accessoryTotal)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm font-bold text-phyto-forest pt-1">
            <span>Total Bundle Value</span>
            <span className="text-lg text-emerald-700">{formatInr(kitTotalPrice)}</span>
          </div>

          <div className="rounded-xl bg-emerald-100/60 p-2.5 text-center text-xs font-bold text-emerald-900">
            Earns +150 PHYTO GREEN INDEX Points
          </div>

          {addedToast && (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Custom kit added to cart!</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleAddCustomKit}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-phyto-forest py-3.5 text-xs font-bold text-white shadow-md hover:bg-phyto-leaf transition"
          >
            <ShoppingBag className="size-4" />
            <span>Add Custom Kit to Cart</span>
          </button>
        </aside>
      </section>
    </div>
  )
}
