import { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import type { Product } from '../../features/catalog/types'
import { useTranslation } from '../i18n/i18n-context'
import {
  MessageCircle,
  X,
  Send,
  Leaf,
  Loader2,
  RotateCcw,
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

export function generateBotanicalResponse(input: string, lang: 'en' | 'hi' | 'mr' = 'en'): { reply: string; matchedPlants?: Product[] } {
  const q = input.toLowerCase().trim()

  // 1. General Plant-Related Keywords
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
    'germination', 'sowing', 'aeration', 'ph', 'compost', 'nitrogen', 'phosphorus', 'potassium',
  ]

  const isPlantRelated = plantKeywords.some((kw) => q.includes(kw))

  // Non-plant query handler
  if (!isPlantRelated && q.length > 5) {
    if (lang === 'hi') {
      return {
        reply: `मैं फाइटो बॉट हूँ, आपका वनस्पति और बागवानी सहायक। कृपया पौधे की देखभाल, पानी देने का समय, धूप, मिट्टी, जैविक खाद, बीज बोने, या कीट नियंत्रण से संबंधित प्रश्न पूछें।`,
      }
    }
    if (lang === 'mr') {
      return {
        reply: `मी फायटो बॉट आहे, आपला वनस्पती आणि बागकाम सल्लागार. कृपया रोपांची निगा, पाणी देणे, सूर्यप्रकाश, माती, सेंद्रिय खत, बियाणे किंवा कीड नियंत्रणाविषयी प्रश्न विचारा.`,
      }
    }
    return {
      reply: `I specialize exclusively in plant care, botanical diagnosis, plant recommendations, and gardening assistance on the Phyto platform.\n\nPlease ask me anything about:\n• Diagnosing plant issues (yellow leaves, pests, wilting)\n• Finding the right plants for your room, balcony, or office\n• Watering schedules, sunlight, soil, and organic fertilizers\n• Seed germination, pots, and pet-safe botanical advice.`,
    }
  }

  // 2. Specific Plant Identification & Direct Queries
  const foundPlants = products.filter((p) => {
    const nameMatch = q.includes(p.name.toLowerCase())
    const sciMatch = p.scientificName && q.includes(p.scientificName.toLowerCase())
    const singleWord = p.name.toLowerCase().split(' ')[0]
    return nameMatch || sciMatch || (singleWord.length > 3 && q.includes(singleWord))
  })

  if (foundPlants.length > 0 && (q.includes('how to care') || q.includes('care') || q.includes('water') || q.includes('sunlight') || q.includes('about') || q.includes('tell me') || q.includes('price'))) {
    const p = foundPlants[0]
    if (lang === 'hi') {
      return {
        reply: `**${p.name}** (${p.scientificName || 'Botanical Species'})\n\n• **मूल्य:** ₹${p.price}\n• **धूप की आवश्यकता:** ${p.lightRequirement || 'Medium'} (${p.care?.sunlight || 'Indirect bright light'})\n• **पानी:** ${p.care?.water || 'Check top 2 inches before watering'}\n• **देखभाल स्तर:** ${p.maintenance || 'Easy'}\n• **पालतू सुरक्षा:** ${p.isPetFriendly ? 'पालतू जानवरों के लिए सुरक्षित' : 'सावधानी: निगलने पर हानिकारक'}\n\n**विवरण:** ${p.description}`,
        matchedPlants: foundPlants.slice(0, 3),
      }
    }
    if (lang === 'mr') {
      return {
        reply: `**${p.name}** (${p.scientificName || 'Botanical Species'})\n\n• **किंमत:** ₹${p.price}\n• **सूर्यप्रकाश:** ${p.lightRequirement || 'Medium'} (${p.care?.sunlight || 'Indirect bright light'})\n• **पाणी:** ${p.care?.water || 'Check soil moisture before watering'}\n• **देखभाल:** ${p.maintenance || 'Easy'}\n• **प्राण्यांसाठी सुरक्षा:** ${p.isPetFriendly ? 'सुरक्षित' : 'सावधगिरी बाळगा'}\n\n**माहिती:** ${p.description}`,
        matchedPlants: foundPlants.slice(0, 3),
      }
    }
    return {
      reply: `**${p.name}** (${p.scientificName || 'Botanical Species'})\n\n• **Price:** ₹${p.price}\n• **Light:** ${p.lightRequirement || 'Medium'} (${p.care?.sunlight || 'Bright indirect daylight'})\n• **Watering:** ${p.care?.water || 'Water when top 2 inches of soil feel dry'}\n• **Maintenance:** ${p.maintenance || 'Easy Care'}\n• **Pet Safety:** ${p.isPetFriendly ? 'Pet-Safe (Non-Toxic)' : 'Caution: Ingestion Hazard'}\n• **Best Placed:** ${(p.suitableSpace || ['Living room']).join(', ')}\n\n**Botanical Overview:** ${p.description}`,
      matchedPlants: foundPlants.slice(0, 3),
    }
  }

  // 3. Yellow Leaves & Plant Diagnosis
  if (q.includes('yellow') || q.includes('peela') || q.includes('brown') || q.includes('droop') || q.includes('wilt') || q.includes('curl')) {
    if (lang === 'hi') {
      return {
        reply: `**पीली पत्तियों और मुरझाने के सामान्य कारण:**\n\n1. **अधिक पानी (Overwatering - 80% मामलों का कारण):** यदि पत्तियां पीली और मुलायम हैं, तो गमले की मिट्टी को सूखने दें और जल निकासी (drainage) छेद की जांच करें।\n2. **कम पानी (Underwatering):** यदि पत्तियां सूखी और कुरकुरी होकर पीली हो रही हैं, तो पौधे को अच्छी तरह पानी दें।\n3. **धूप का अभाव:** पौधे को अधिक अप्रत्यक्ष प्राकृतिक प्रकाश में रखें।\n4. **पोषक तत्वों की कमी:** महीने में एक बार जैविक वर्मीकम्पोस्ट या सीवीड लिक्विड खाद डालें।`,
      }
    }
    if (lang === 'mr') {
      return {
        reply: `**पाने पिवळी पडण्याची मुख्य कारणे व उपाय:**\n\n1. **जास्त पाणी देणे:** माती सतत ओलसर राहिल्यास मुळे सडतात. वरची 2 इंच माती कोरडी झाल्यावरच पाणी द्या.\n2. **कमी पाणी:** पाने वाळलेली व कोरडी वाटल्यास लगेच पाणी द्या.\n3. **कमी सूर्यप्रकाश:** रोपट्याला पुरेसा नैसर्गिक अप्रत्यक्ष उजेड मिळेल अशा जागी ठेवा.\n4. **खतांची कमतरता:** महिन्यातून एकदा सेंद्रिय गांडूळखत घाला.`,
      }
    }
    return {
      reply: `**Diagnostic Guide: Why Leaves Turn Yellow or Droop**\n\n1. **Overwatering (Most Common Cause):**\n   • Symptoms: Yellowing lower leaves that feel soft or limp, wet soil.\n   • Solution: Allow top 2 inches of potting mix to dry completely before watering. Ensure pot has drainage holes.\n\n2. **Underwatering:**\n   • Symptoms: Crispy brown edges, dry soil pulling away from pot rim.\n   • Solution: Give a thorough bottom-soaking soak until water drains freely.\n\n3. **Inadequate Sunlight:**\n   • Solution: Move plant to a spot with medium to bright indirect daylight.\n\n4. **Nutrient Deficiency:**\n   • Solution: Feed with organic vermicompost or balanced seaweed liquid extract monthly.`,
    }
  }

  // 4. Watering Schedule & Guidance
  if (q.includes('how often') || q.includes('water') || q.includes('pani') || q.includes('moisture')) {
    return {
      reply: `**Golden Rules for Watering Plants:**\n\n• **The 2-Inch Finger Test:** Insert your index finger 2 inches into the soil. If it feels cool and moist, wait 2 to 3 days. If bone dry, water thoroughly.\n• **Indoor Plants:** Most indoor plants (Monstera, Pothos, Snake Plant) require water once every 7 to 10 days.\n• **Succulents & Snake Plants:** Water only once every 2 to 3 weeks during summer, and once a month in winter.\n• **Drainage Check:** Always empty stagnant water from the bottom saucer within 20 minutes to prevent root rot.\n• **Morning Watering:** Best done in early morning so foliage dries before nightfall.`,
    }
  }

  // 5. Sunlight & Placement
  if (q.includes('sunlight') || q.includes('light') || q.includes('dhoop') || q.includes('window') || q.includes('placement')) {
    const lowLight = products.filter((p) => p.lightRequirement === 'Low').slice(0, 3)
    return {
      reply: `**Sunlight Placement Guide:**\n\n• **Bright Direct Sunlight:** 4-6 hours of unfiltered sun. Best for flowering plants (Roses, Mogra, Marigolds, Bougainvillea) and outdoor edible herbs.\n• **Bright Indirect Light:** Bright room near an east-facing window without direct hot rays. Ideal for Monstera, Fiddle Leaf Fig, and Peace Lily.\n• **Low Light / Shaded Corners:** Tolerates dim conditions away from windows. Snake Plant, ZZ Plant, and Cast Iron Plant thrive here.`,
      matchedPlants: lowLight,
    }
  }

  // 6. Soil, Repotting & Fertilizers
  if (q.includes('soil') || q.includes('fertilizer') || q.includes('khad') || q.includes('repot') || q.includes('vermicompost') || q.includes('cocopeat')) {
    const ferts = products.filter((p) => p.type === 'fertilizers').slice(0, 3)
    return {
      reply: `**Soil Mix & Organic Nutrition Guide:**\n\n• **Ideal Indoor Potting Mix:** 40% Cocopeat + 30% Aged Vermicompost + 20% Perlite / Pumice + 10% Neem Cake Powder (prevents soil fungal gnats).\n• **Fertilizing Schedule:** Feed during active growing season (March to October) every 3-4 weeks with organic Seaweed liquid extract or Vermicompost.\n• **When to Repot:** Repot every 12 to 18 months into a pot 2 inches wider when roots start circling the drainage hole.`,
      matchedPlants: ferts,
    }
  }

  // 7. Seeds & Germination
  if (q.includes('seed') || q.includes('seeds') || q.includes('germinat') || q.includes('sow') || q.includes('grow from')) {
    const seedProds = products.filter((p) => p.type === 'seeds').slice(0, 3)
    return {
      reply: `**Seed Sowing & Germination Guide:**\n\n• **Soil Bed:** Use fine seed-starting mix (70% Cocopeat + 30% Vermicompost). Sieve out large chunks.\n• **Depth:** Sow seeds at a depth equal to 2x the seed size. Tiny seeds (Tulsi, Petunia) should be sprinkled lightly on top.\n• **Moisture:** Mist with a spray bottle daily. Never pour heavy water directly.\n• **Germination Timeline:** Most vegetable seeds germinate within 5 to 10 days at 22°C - 28°C ambient temperature.`,
      matchedPlants: seedProds,
    }
  }

  // 8. Pots & Planter Selection
  if (q.includes('pot') || q.includes('pots') || q.includes('planter') || q.includes('ceramic') || q.includes('terracotta')) {
    const potProds = products.filter((p) => p.type === 'pots').slice(0, 3)
    return {
      reply: `**Choosing the Right Pot:**\n\n• **Terracotta / Clay:** Porous and breathable; prevents overwatering. Ideal for succulents, cacti, and moisture-sensitive plants.\n• **Ceramic (Glazed):** Retains moisture longer and provides high aesthetic appeal for indoor living rooms and work desks.\n• **Self-Watering Hydro Pots:** Perfect for frequent travelers and busy plant parents.\n• **Drainage Hole Mandate:** Every pot must have at least one bottom drainage hole.`,
      matchedPlants: potProds,
    }
  }

  // 9. Pest & Disease Management
  if (q.includes('pest') || q.includes('bug') || q.includes('mealybug') || q.includes('mite') || q.includes('gnat') || q.includes('fungus')) {
    return {
      reply: `**Organic Pest Eradication Guide:**\n\n1. **Mealybugs (White Cottony Patches):** Dip a cotton swab in 70% rubbing alcohol and touch each bug directly. Follow with neem oil spray.\n2. **Spider Mites (Fine Webbing):** Rinse the foliage with a lukewarm shower spray, then apply organic neem oil soap spray weekly.\n3. **Fungus Gnats (Tiny black flies in soil):** Allow top soil to dry completely. Water with a 1:4 hydrogen peroxide to water solution.\n4. **Organic Neem Recipe:** Mix 5ml cold-pressed pure neem oil + 2ml liquid dish soap in 1 liter of lukewarm water. Spray leaves every 10 days.`,
    }
  }

  // 10. Pet-Safe Plants
  if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('toxic') || q.includes('safe')) {
    const petSafe = products.filter((p) => p.isPetFriendly).slice(0, 4)
    return {
      reply: `**Top 100% Pet-Safe Plants (Non-Toxic to Dogs & Cats):**\n\n• **Spider Plant (Chlorophytum):** Resilient, fast-growing, non-toxic.\n• **Areca Palm & Parlor Palm:** Safe tropical palms that add lush foliage.\n• **Calathea & Maranta (Prayer Plants):** Beautiful foliage and completely pet-safe.\n• **Boston Fern:** Safe humidity-boosting lush green fern.\n\n*Caution: Monstera, Pothos, and Snake Plants contain insoluble calcium oxalates and should be placed out of pets' reach.*`,
      matchedPlants: petSafe,
    }
  }

  // 11. Beginner Plants (Hard to Kill)
  if (q.includes('beginner') || q.includes('easy') || q.includes('hard to kill') || q.includes('new') || q.includes('starter')) {
    const easyPlants = products.filter((p) => p.beginnerFriendly).slice(0, 4)
    return {
      reply: `**Top Plants for Beginners (Virtually Indestructible):**\n\n• **Snake Plant Laurentii:** Survives low light, neglect, and irregular watering.\n• **ZZ Plant (Zamioculcas zamiifolia):** Thrives in shaded rooms with glossy dark leaves.\n• **Golden Pothos (Money Plant):** Fast-growing vine in water or soil.\n• **Jade Plant (Crassula ovata):** Resilient succulent bringing auspicious vibes.\n• **Spider Plant:** Highly forgiving and produces baby plantlets.`,
      matchedPlants: easyPlants,
    }
  }

  // 12. General Plant Recommendation Fallback
  const popularPlants = products.slice(0, 3)
  return {
    reply: `I can help you find the exact botanical plant, seed, flower, fertilizer, or pot for your space!\n\nTell me:\n1. Where do you want to keep the plant? (Living room, balcony, bedroom, office)\n2. How much sunlight does that spot receive?\n3. Do you have pets or prefer low-maintenance varieties?`,
    matchedPlants: popularPlants,
  }
}

export function ChatBot() {
  const { language } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        language === 'hi'
          ? `नमस्ते! मैं **फाइटो बॉट** हूँ, आपका वनस्पति और बागवानी सहायक। मैं पौधों की देखभाल, पानी के नियम, धूप, मिट्टी, बीज और उत्पाद शिफारिशों में आपकी सहायता कर सकता हूँ। आज आप क्या जानना चाहते हैं?`
          : language === 'mr'
          ? `नमस्कार! मी **फायटो बॉट** आहे, आपला वनस्पती व बागकाम सल्लागार. मी रोपांची निगा, पाणी, सूर्यप्रकाश, खते व बियाण्यांविषयी मार्गदर्शन करू शकतो. आज आपल्याला कोणती माहिती हवी आहे?`
          : `Hello! I am **Phyto Bot**, your dedicated botanical and plant care assistant.\n\nI can assist you with:\n• Plant Care & Troubleshooting (Watering, yellow leaves, pests, soil)\n• Sunlight & Placement (Low-light bedrooms, bright balconies, work desks)\n• Plant & Seed Recommendations (Pet-safe, beginner-friendly, flowering)\n• Fertilizers, Soil Mixes, Pots & Doctor Services\n\nWhat botanical question can I answer for you today?`,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const quickPrompts = [
    'Best pet-safe indoor plants',
    'Low-light bedroom plants',
    'Why are my leaves turning yellow?',
    'How often should I water my plants?',
    'Best beginner plants',
    'How to treat mealybugs and pests?',
    'Fragrant flowering plants',
    'Ideal potting soil mix',
  ]

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, scrollToBottom])

  function handleSend(textToSend?: string) {
    const queryText = (textToSend || input).trim()
    if (!queryText) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: queryText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInput('')
    setIsTyping(true)

    // Simulate botanical reasoning delay
    setTimeout(() => {
      const { reply, matchedPlants } = generateBotanicalResponse(queryText, language)
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: reply,
        suggestedPlants: matchedPlants,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botMessage])
      setIsTyping(false)
    }, 400)
  }

  function resetChat() {
    setMessages([
      {
        id: 'msg-welcome-reset',
        role: 'assistant',
        content: `Chat session reset. What plant or gardening topic would you like to explore?`,
        timestamp: new Date(),
      },
    ])
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Plant Assistant Chatbot"
          className="group flex items-center gap-2.5 rounded-full bg-phyto-forest px-5 py-3 text-xs font-bold text-white shadow-xl hover:bg-phyto-leaf transition duration-200"
        >
          <div className="grid size-7 place-items-center rounded-full bg-white/20 text-white group-hover:rotate-12 transition duration-200">
            <MessageCircle className="size-4" />
          </div>
          <span className="hidden sm:inline">Ask Phyto Bot</span>
        </button>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div className="flex h-[560px] w-[350px] sm:w-[410px] flex-col rounded-3xl border border-phyto-forest/15 bg-white shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-phyto-forest px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-2xl bg-white/15 text-white">
                <Leaf className="size-5 text-phyto-mint" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold leading-none">Phyto Botanical Assistant</h3>
                <span className="text-[10px] font-semibold text-phyto-sage">Online · Botanical AI</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetChat}
                title="Reset Conversation"
                className="grid size-7 place-items-center rounded-full text-stone-300 hover:bg-white/10 hover:text-white transition"
              >
                <RotateCcw className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="grid size-7 place-items-center rounded-full text-stone-300 hover:bg-white/10 hover:text-white transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="border-b border-stone-100 bg-stone-50/80 px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1 px-1">Quick Inquiries</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700 whitespace-nowrap hover:border-phyto-forest hover:bg-emerald-50 transition"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4 text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={msg.id}
                  className={clsx('flex flex-col', isUser ? 'items-end' : 'items-start')}
                >
                  <div
                    className={clsx(
                      'max-w-[88%] rounded-2xl p-3.5 leading-relaxed whitespace-pre-wrap',
                      isUser
                        ? 'bg-phyto-forest text-white shadow-sm'
                        : 'border border-stone-200/80 bg-stone-50/90 text-stone-800 shadow-xs'
                    )}
                  >
                    {msg.content}

                    {/* Matched Product Cards */}
                    {msg.suggestedPlants && msg.suggestedPlants.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-stone-200/60 pt-2.5">
                        <p className="text-[11px] font-bold text-phyto-forest">Recommended Botanical Items:</p>
                        <div className="grid gap-2">
                          {msg.suggestedPlants.map((plant) => (
                            <Link
                              key={plant.id}
                              to={`/product/${plant.id}`}
                              onClick={() => setIsOpen(false)}
                              className="flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-2 hover:bg-emerald-50 transition"
                            >
                              <img
                                src={plant.imageUrl}
                                alt={plant.name}
                                className="size-10 rounded-lg object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-phyto-forest truncate">{plant.name}</p>
                                <p className="text-[10px] text-stone-500">₹{plant.price} · {plant.maintenance || 'Easy Care'}</p>
                              </div>
                              <ExternalLink className="size-3 text-stone-400" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="mt-1 px-1 text-[9px] text-stone-400 font-mono">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-stone-400 text-[11px] italic p-1">
                <Loader2 className="size-3 animate-spin text-phyto-leaf" />
                <span>Phyto Bot is reasoning…</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="flex items-center gap-2 border-t border-stone-200 bg-white p-3"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about watering, sunlight, soil, seeds..."
              className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs focus:border-phyto-leaf focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="grid size-8 place-items-center rounded-xl bg-phyto-forest text-white transition hover:bg-phyto-leaf disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
