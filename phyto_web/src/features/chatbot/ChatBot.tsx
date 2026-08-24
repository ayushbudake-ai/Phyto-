import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { formatInr } from '../../lib/format'
import type { Product } from '../../features/catalog/types'
import {
  MessageCircle,
  X,
  Send,
  Leaf,
  Loader2,
  RotateCcw,
  ChevronDown,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import clsx from 'clsx'

// ── Types ───────────────────────────────────────────────────
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  suggestedPlants?: Product[]
  timestamp: Date
}

const WELCOME_MESSAGE: Message = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Namaste! 🌿 I am **Phyto Bot**, your dedicated plant care & botanical assistant.

I can help you with:
• **Plant Care & Troubleshooting** (Watering, yellow leaves, pests, root rot)
• **Sunlight & Placement** (Low-light bedroom, bright balcony, office desk)
• **Plant Recommendations** (Pet-friendly, beginner, air-purifying, flowering)
• **Soil, Fertilizers & Repotting** (Organic mixes, feeding schedules)
• **Our 100+ Plant Database** (Real-time pricing, stock & specifications)

What plant question can I solve for you today?`,
  timestamp: new Date(),
}

const QUICK_PROMPTS = [
  '🐶 Best pet-safe plants',
  '💡 Low-light bedroom plants',
  '🍂 Why are my leaves turning yellow?',
  '💧 How often should I water my plants?',
  '🪴 Best beginner plants',
  '🐛 How to treat mealybugs & pests?',
  '🌸 Fragrant outdoor flowering plants',
  '🛏️ Plants for bedroom air purification',
]

// ── Botanical Knowledge Engine ──────────────────────────────
export function generateBotanicalResponse(input: string): { reply: string; matchedPlants?: Product[] } {
  const q = input.toLowerCase().trim()

  // 1. Check if query is completely unrelated to plants / gardening / nature / flora
  const plantKeywords = [
    'plant', 'plants', 'tree', 'trees', 'flower', 'flowers', 'herb', 'herbs', 'seed', 'seeds',
    'leaf', 'leaves', 'foliage', 'soil', 'water', 'watering', 'sun', 'sunlight', 'light', 'fertilizer',
    'fertilizers', 'khad', 'pot', 'pots', 'potting', 'repot', 'repotting', 'balcony', 'garden',
    'gardening', 'indoor', 'outdoor', 'succulent', 'succulents', 'cactus', 'cacti', 'fern', 'ferns',
    'monstera', 'pothos', 'snake', 'sansevieria', 'zz', 'peace lily', 'aloe', 'jade', 'areca',
    'palm', 'tulsi', 'basil', 'mogra', 'jasmine', 'rose', 'gulab', 'hibiscus', 'curry', 'neem',
    'lavender', 'rosemary', 'mint', 'pudina', 'calathea', 'alocasia', 'aglaonema', 'begonia',
    'orchid', 'bonsai', 'ficus', 'fiddle', 'pet', 'pets', 'cat', 'cats', 'dog', 'dogs', 'toxic',
    'safe', 'pest', 'pests', 'bug', 'bugs', 'mite', 'mites', 'mealybug', 'fungus', 'gnats',
    'yellow', 'brown', 'crispy', 'drooping', 'wilting', 'rot', 'root', 'drainage', 'bedroom',
    'desk', 'office', 'terrace', 'propagate', 'propagation', 'cutting', 'prune', 'pruning', 'dhoop',
    'pani', 'peela', 'patta', 'care', 'recommend', 'suggest', 'buy', 'price', 'cost', 'kit',
    'service', 'doctor', 'botany', 'botanical', 'greenery', 'nature', 'photosynthesis', 'air', 'purify',
    'purifying', 'smell', 'fragrant', 'bloom', 'blooming', 'chlorophytum', 'spider plant', 'humidity',
    'fungicide', 'neem oil', 'vermicompost', 'perlite', 'cocopeat', 'bark', 'stem', 'sprout',
  ]

  const isPlantRelated = plantKeywords.some((kw) => q.includes(kw))

  // Non-plant query handler
  if (!isPlantRelated && q.length > 5) {
    return {
      reply: `🌱 I specialize exclusively in plant care, botanical diagnosis, plant recommendations, and gardening assistance on the Phyto platform!

Please ask me anything about:
• Diagnosing plant issues (yellow leaves, pests, wilting)
• Finding the right plants for your room, balcony, or office
• Watering schedules, sunlight, and soil requirements
• Pet-safe or beginner-friendly plant advice`,
    }
  }

  // 2. Specific Plant Identification & Direct Queries
  const foundPlants = products.filter((p) => {
    const nameMatch = q.includes(p.name.toLowerCase())
    const sciMatch = p.scientificName && q.includes(p.scientificName.toLowerCase())
    const singleWord = p.name.toLowerCase().split(' ')[0]
    return nameMatch || sciMatch || (singleWord.length > 3 && q.includes(singleWord))
  })

  // Case A: Query specifically asks about a known plant in our catalog
  if (foundPlants.length > 0) {
    const p = foundPlants[0]
    let reply = `🌿 **${p.name}** (*${p.scientificName || p.name}*)\n\n`
    reply += `• **Category**: ${p.category || p.type}\n`
    reply += `• **Light Requirement**: ${p.lightRequirement || 'Medium'} (${p.sunlight})\n`
    reply += `• **Watering**: ${p.care.water}\n`
    reply += `• **Ideal Soil**: ${p.soilType || 'Well-draining rich houseplant mix'}\n`
    reply += `• **Pet Safety**: ${p.petSafety || (p.isPetFriendly ? 'Pet-Friendly' : 'Toxic to Pets')}\n`
    reply += `• **Best Space**: ${(p.suitableSpace || ['Living room', 'Bedroom']).join(', ')}\n`
    reply += `• **Key Benefit**: ${p.benefits || p.description}\n\n`
    reply += `Available in our catalog for **${formatInr(p.price)}** (In Stock: ${p.stock} units).`

    return {
      reply,
      matchedPlants: foundPlants.slice(0, 3),
    }
  }

  // Case B: Yellow Leaves / Overwatering / Wilting / Brown Tips
  if (q.includes('yellow') || q.includes('peela') || q.includes('wilting') || q.includes('droop') || q.includes('dying')) {
    const resilientPicks = products.filter((p) => p.maintenance === 'Easy' && p.type === 'plants').slice(0, 3)
    return {
      reply: `🍂 **Diagnosing Yellowing or Drooping Leaves**:

1. **Overwatering (#1 Cause)**: If the soil feels soggy and lower leaves turn yellow/mushy, you may be overwatering. Let the top 2-3 inches of soil dry completely between waterings.
2. **Underwatering / Drought**: If leaves are crisp, papery, or curled inward, soak the root ball thoroughly until water drains from the bottom.
3. **Lighting Shock**: Moving a plant suddenly into dark shade or harsh scorching sun causes stress. Provide bright, filtered indirect light.
4. **Nutrient Deficiency**: Pale yellow leaves with green veins (chlorosis) indicate iron or nitrogen deficiency. Apply balanced liquid fertilizer.
5. **Drainage Issues**: Ensure your pot has drainage holes so water never sits stagnantly.

Would you like advice for a specific plant or want to book our in-home **Plant Doctor Service**?`,
      matchedPlants: resilientPicks,
    }
  }

  // Case C: Pests, Mealybugs, Spider Mites, Fungus Gnats
  if (q.includes('pest') || q.includes('bug') || q.includes('mealybug') || q.includes('mite') || q.includes('gnat') || q.includes('insect') || q.includes('neem')) {
    return {
      reply: `🐛 **Pest Control & Treatment Guide**:

• **Mealybugs (White cottony clusters)**: Dab them directly with a cotton swab dipped in 70% rubbing alcohol. Then spray the entire plant with cold-pressed **Neem Oil solution** (5ml neem oil + 2ml mild soap in 1L water).
• **Spider Mites (Fine webbing under leaves)**: Increase humidity and wash foliage under a gentle shower. Spray insecticidal soap every 4-5 days for 2 weeks.
• **Fungus Gnats (Tiny black flies on soil)**: Allow the top 2 inches of soil to dry out completely. Top dress soil with coarse sand or neem cake powder.
• **Scale Insects (Brown shell bumps)**: Scrape off gently and wipe stems with neem oil wash.

*Tip: Always isolate infected plants to prevent bugs from spreading.*`,
      matchedPlants: products.filter((p) => p.tags.includes('air-purifying')).slice(0, 2),
    }
  }

  // Case D: Pet-Safe / Non-Toxic Plants
  if (q.includes('pet') || q.includes('cat') || q.includes('dog') || q.includes('billi') || q.includes('kutta') || q.includes('non-toxic') || q.includes('safe')) {
    const petSafe = products.filter((p) => p.isPetFriendly || p.petSafety === 'Pet-Friendly').slice(0, 4)
    return {
      reply: `🐶🐱 **100% Pet-Friendly & Non-Toxic Plants**:

If you have curious cats or dogs, here are safe, non-toxic plants verified by ASPCA standards:

1. **Spider Plant (*Chlorophytum*)**: Playful arching leaves, safe for cats & top air filter.
2. **Areca Palm / Parlor Palm**: Magnificent feathery tropical palms, 100% safe.
3. **Boston Fern**: Lush cascading greenery that loves humidity.
4. **Calathea / Prayer Plants**: Artistic foliage that poses zero hazard to pets.
5. **Pilea Peperomioides (Chinese Money Plant)**: Coin-like succulent leaves safe for pets.

⚠️ *Avoid: Peace Lilies, Monsteras, Pothos, ZZ Plants, and Dieffenbachia if pets chew on foliage.*`,
      matchedPlants: petSafe,
    }
  }

  // Case E: Low Light / Bedroom Plants
  if (q.includes('low light') || q.includes('shade') || q.includes('dark') || q.includes('bedroom') || q.includes('night') || q.includes('windowless')) {
    const lowLightPicks = products.filter((p) => p.lightRequirement === 'Low' || p.sunlight === 'shade').slice(0, 4)
    return {
      reply: `💡🛏️ **Best Plants for Low Light & Bedrooms**:

These resilient plants thrive without direct sunlight and enhance your sleep quality:

1. **Snake Plant Laurentii**: Releases oxygen at night while you sleep and tolerates dark corners.
2. **ZZ Plant (Zanzibar Gem)**: Glossy emerald leaves that survive low light and infrequent watering.
3. **Aglaonema (Chinese Evergreen)**: Gorgeous silver and pink leaves that tolerate fluorescent office light.
4. **Cast Iron Plant (*Aspidistra*)**: Named for its indestructible resilience in shade.
5. **Peace Lily**: Graceful white blooms that signal when they need water.`,
      matchedPlants: lowLightPicks,
    }
  }

  // Case F: Beginner / Easy Care / Hard to Kill
  if (q.includes('beginner') || q.includes('easy') || q.includes('starter') || q.includes('first plant') || q.includes('neglect') || q.includes('simple')) {
    const beginnerPicks = products.filter((p) => p.beginnerFriendly || p.maintenance === 'Easy').slice(0, 4)
    return {
      reply: `🌱 **Top Plants for Beginners (Hard-to-Kill)**:

If you are just starting your plant journey, these varieties are extremely forgiving:

1. **Golden Pothos (Money Plant)**: Fast-growing trailing vine; easily grows in soil or glass bottles with water.
2. **Snake Plant**: Needs water only once every 2-3 weeks.
3. **ZZ Plant**: Thrives on minimal care and handles irregular schedules.
4. **Jade Plant**: Drought-tolerant succulent good-fortune plant.
5. **Aloe Vera**: Multipurpose medicinal succulent that thrives on sunny windowsills.`,
      matchedPlants: beginnerPicks,
    }
  }

  // Case G: Balcony / Outdoor / Full Sun / Terrace
  if (q.includes('balcony') || q.includes('outdoor') || q.includes('terrace') || q.includes('sun') || q.includes('dhoop') || q.includes('heat')) {
    const outdoorPicks = products.filter((p) => p.environment === 'outdoor' || p.sunlight === 'full-sun').slice(0, 4)
    return {
      reply: `☀️🌿 **Best Plants for Sunny Balconies & Terraces**:

For spaces receiving direct Indian sunlight and heat:

1. **Bougainvillea**: Explosive magenta and pink blooms, extreme drought resilience.
2. **Mogra (Arabian Jasmine)**: Intoxicating evening fragrance and white star flowers.
3. **Tulsi (Holy Basil)**: Sacred, highly aromatic, and loves morning sun.
4. **Hibiscus (Gudhal)**: Giant ruffled flowers in red, orange, and pink.
5. **Rosemary & Sweet Basil**: Fragrant culinary herbs that love full sunshine.
6. **Adenium (Desert Rose)**: Sculptural succulent with dazzling trumpet blooms.`,
      matchedPlants: outdoorPicks,
    }
  }

  // Case H: Watering Frequency & Care Instructions
  if (q.includes('water') || q.includes('watering') || q.includes('pani') || q.includes('schedule') || q.includes('how often')) {
    return {
      reply: `💧 **Golden Rules for Watering Plants**:

• **The Finger Test**: Insert your finger 2 inches into the soil. If it feels dry, water thoroughly until liquid drips from the bottom drainage hole. If it feels cool and damp, wait 2-3 days.
• **Succulents & Snake/ZZ Plants**: Water once every 2-3 weeks (soak and dry method).
• **Tropical Aroids (Monstera, Pothos, Philodendron)**: Water once every 7-10 days.
• **Ferns & Calatheas**: Keep soil evenly moist (every 4-6 days), never bone dry.
• **Seasonal Note**: Plants drink more water in summer (March-June) and need much less water in winter (November-January).
• **Bottom Drainage**: Always empty standing water from the saucer after 15 minutes to prevent root rot.`,
      matchedPlants: products.slice(0, 3),
    }
  }

  // Case I: Soil & Fertilizers
  if (q.includes('soil') || q.includes('fertilizer') || q.includes('khad') || q.includes('repot') || q.includes('nutrition')) {
    const soilPicks = products.filter((p) => p.category === 'Fertilizers' || p.category === 'Tools').slice(0, 3)
    return {
      reply: `🪴 **Soil Mixes & Feeding Guide**:

• **Aroids (Monstera, Pothos, Syngonium)**: Chunky mix (40% coco chips/bark, 30% perlite, 20% coco peat, 10% worm castings).
• **Succulents & Cacti**: Gritty mineral mix (50% coarse sand/pumice, 30% perlite, 20% soil).
• **Herbs & Flowering**: Rich fertile loamy soil with 30% organic vermicompost.
• **Fertilizing Schedule**: Feed indoor plants once a month from February to September with diluted organic seaweed or NPK fertilizer. Pause feeding during cold winter dormancy.`,
      matchedPlants: soilPicks.length > 0 ? soilPicks : products.slice(0, 2),
    }
  }

  // Case J: Air-Purifying Plants
  if (q.includes('air') || q.includes('purif') || q.includes('breathe') || q.includes('toxin') || q.includes('oxygen')) {
    const airPicks = products.filter((p) => p.tags.includes('air-purifying')).slice(0, 4)
    return {
      reply: `🍃 **Top NASA-Proven Air-Purifying Plants**:

These plants effectively filter airborne toxins like formaldehyde, benzene, xylene, and carbon monoxide:

1. **Snake Plant**: Exceptional night oxygen generator.
2. **Peace Lily**: Removes VOCs and increases humidity.
3. **Areca Palm**: High-volume natural air filter and humidifier.
4. **Spider Plant**: Removes 95% of airborne toxins in 24 hours.
5. **English Ivy**: Great at reducing airborne mold particles.`,
      matchedPlants: airPicks,
    }
  }

  // General fallback with helpful recommendations
  const generalPicks = products.slice(0, 4)
  return {
    reply: `🌿 **Botanical Assistance from Phyto Bot**:

I can help with plant recommendations, watering, sunlight, soil mixes, pet safety, and troubleshooting. 

Here are some popular, vetted varieties from our 100+ plant database:`,
    matchedPlants: generalPicks,
  }
}

// ── ChatBot Component ───────────────────────────────────────
export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [open])

  const handleSendMessage = useCallback(
    async (text?: string) => {
      const userText = (text ?? input).trim()
      if (!userText || loading) return

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setLoading(true)

      // Simulate realistic AI reasoning time
      setTimeout(() => {
        const { reply, matchedPlants } = generateBotanicalResponse(userText)

        const botMsg: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: reply,
          suggestedPlants: matchedPlants,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, botMsg])
        setLoading(false)

        if (!open) {
          setUnread((n) => n + 1)
        }
      }, 450)
    },
    [input, loading, open]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  function handleReset() {
    setMessages([WELCOME_MESSAGE])
    setInput('')
  }

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full shadow-2xl transition-all duration-300',
          'bg-phyto-forest text-white hover:bg-phyto-leaf hover:scale-105 active:scale-95',
          open && 'rotate-0 ring-4 ring-phyto-leaf/30'
        )}
        aria-label="Open Phyto Botanical Assistant"
      >
        {open ? (
          <ChevronDown className="size-7" />
        ) : (
          <>
            <MessageCircle className="size-7 text-white" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-md animate-bounce">
                {unread}
              </span>
            )}
            <span className="absolute -top-8 right-0 rounded-full bg-phyto-forest/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm whitespace-nowrap hidden sm:inline">
              Ask Phyto Bot 🌱
            </span>
          </>
        )}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className={clsx(
            'fixed bottom-24 right-4 sm:right-6 z-50 flex w-[92vw] sm:w-[420px] max-h-[80vh] flex-col overflow-hidden',
            'rounded-3xl border border-phyto-forest/15 bg-white shadow-2xl',
            'animate-in slide-in-from-bottom-5 duration-200'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-phyto-forest to-emerald-900 px-5 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-white/20">
                <Leaf className="size-5 text-green-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-sm font-bold leading-none">Phyto Bot</h3>
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-green-200 mt-0.5">Botanical Expert · 100+ Plants</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-lg p-1.5 text-green-200 hover:bg-white/10 hover:text-white transition"
                title="Restart conversation"
              >
                <RotateCcw className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-green-200 hover:bg-white/10 hover:text-white transition"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto bg-stone-50/80 p-4 space-y-4 max-h-[50vh]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div key={msg.id} className={clsx('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
                  <div
                    className={clsx(
                      'max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm whitespace-pre-line',
                      isUser
                        ? 'rounded-br-none bg-phyto-forest text-white'
                        : 'rounded-bl-none border border-stone-200 bg-white text-stone-800'
                    )}
                  >
                    {msg.content}

                    {/* Render matching plant recommendation cards if available */}
                    {msg.suggestedPlants && msg.suggestedPlants.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-stone-100 pt-2.5">
                        <p className="font-bold text-[11px] text-phyto-forest flex items-center gap-1">
                          <Sparkles className="size-3 text-amber-500" />
                          <span>Matching Plants in Phyto Shop:</span>
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestedPlants.map((p) => (
                            <Link
                              key={p.id}
                              to={`/product/${p.id}`}
                              onClick={() => setOpen(false)}
                              className="group flex items-center gap-2.5 rounded-xl border border-stone-200 bg-stone-50/80 p-2 hover:bg-phyto-sage/30 hover:border-phyto-leaf transition"
                            >
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=400&q=80'}
                                alt={p.name}
                                className="size-11 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-bold text-phyto-forest group-hover:text-phyto-leaf">
                                  {p.name}
                                </p>
                                <p className="text-[10px] text-stone-500">
                                  {p.lightRequirement || 'Medium'} light · {p.petSafety || 'Pet friendly'}
                                </p>
                                <p className="text-xs font-bold text-phyto-forest">{formatInr(p.price)}</p>
                              </div>
                              <ExternalLink className="size-3.5 text-stone-400 group-hover:text-phyto-forest shrink-0 mr-1" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="px-1 text-[9px] text-stone-400">
                    {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}

            {loading && (
              <div className="flex items-start">
                <div className="rounded-2xl rounded-bl-none border border-stone-200 bg-white p-3 shadow-sm">
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    <Loader2 className="size-4 animate-spin text-phyto-leaf" />
                    <span>Analyzing botanical database…</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          {messages.length <= 3 && !loading && (
            <div className="border-t border-stone-100 bg-stone-50 p-2.5">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1.5 px-1">Quick Inquiries</p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="rounded-full border border-phyto-forest/15 bg-white px-2.5 py-1 text-[11px] font-semibold text-phyto-forest shadow-2xs hover:bg-phyto-sage/40 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Input Field */}
          <div className="flex items-center gap-2 border-t border-stone-200 bg-white p-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about plant care, pests, watering…"
              disabled={loading}
              className="flex-1 rounded-2xl border border-stone-200 px-4 py-2.5 text-xs text-stone-800 outline-none focus:border-phyto-leaf focus:ring-1 focus:ring-phyto-leaf/20 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || loading}
              className="flex size-10 items-center justify-center rounded-2xl bg-phyto-forest text-white transition hover:bg-phyto-leaf active:scale-95 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
