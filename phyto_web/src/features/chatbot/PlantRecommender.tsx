import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import {
  Sun, Home, Heart, Wallet,
  Sparkles, Loader2,
  Check, ArrowRight
} from 'lucide-react'
import clsx from 'clsx'

// ── Types ───────────────────────────────────────────────────
interface RecommendedProduct {
  id: number | string
  name: string
  price: number
  image_url: string | null
  type: string
  match_score: number
  match_reasons: string[]
}

interface Step {
  id: string
  question: string
  icon: React.ReactNode
  options: { label: string; value: string; desc?: string }[]
  multi?: boolean
}

// ── Quiz Steps ──────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: 'environment',
    question: 'Where will your plant live?',
    icon: <Home className="w-5 h-5" />,
    options: [
      { label: 'Indoors', value: 'indoor', desc: 'Living room, bedroom, or desk' },
      { label: 'Outdoors', value: 'outdoor', desc: 'Balcony, garden, or terrace' },
      { label: 'Both', value: 'both', desc: 'Adaptable indoor-outdoor flora' },
    ],
  },
  {
    id: 'sunlight',
    question: 'How much sunlight does that spot get?',
    icon: <Sun className="w-5 h-5" />,
    options: [
      { label: 'Bright direct sunlight', value: 'full_sun', desc: 'Direct morning or afternoon sun' },
      { label: 'Medium indirect light', value: 'partial', desc: 'Bright filtered daylight' },
      { label: 'Low light / shade', value: 'shade', desc: 'Corners or low-window spaces' },
    ],
  },
  {
    id: 'experience',
    question: 'What is your gardening experience level?',
    icon: <Sparkles className="w-5 h-5" />,
    options: [
      { label: 'Complete Beginner', value: 'beginner', desc: 'Resilient and hard-to-kill plants' },
      { label: 'Intermediate', value: 'intermediate', desc: 'Comfortable with basic care routines' },
      { label: 'Green Thumb', value: 'expert', desc: 'Happy to nurture exotic plants' },
    ],
  },
  {
    id: 'pets',
    question: 'Do you have pets at home?',
    icon: <Heart className="w-5 h-5" />,
    options: [
      { label: 'Yes, need pet-safe plants', value: 'yes', desc: '100% Non-toxic to cats and dogs' },
      { label: 'No pets at home', value: 'no', desc: 'Any botanical plant is fine' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget per plant?',
    icon: <Wallet className="w-5 h-5" />,
    options: [
      { label: 'Under ₹300', value: 'low', desc: 'Pocket-friendly botanicals' },
      { label: '₹300 - ₹700', value: 'medium', desc: 'Standard potted specimens' },
      { label: 'Above ₹700', value: 'high', desc: 'Large statement plants' },
    ],
  },
]

export function PlantRecommender() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const step = STEPS[currentStep]

  function selectOption(value: string) {
    const nextAnswers = { ...answers, [step.id]: value }
    setAnswers(nextAnswers)

    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      fetchRecommendations(nextAnswers)
    }
  }

  async function fetchRecommendations(ans: Record<string, string>) {
    setLoading(true)
    setDone(true)

    try {
      const budgetMax =
        ans.budget === 'low' ? 300 : ans.budget === 'medium' ? 700 : 2500

      const data = await apiFetch<RecommendedProduct[]>('/recommendations/plants', {
        method: 'POST',
        json: {
          environment: ans.environment,
          sunlight: ans.sunlight,
          is_pet_owner: ans.pets === 'yes',
          is_beginner: ans.experience === 'beginner',
          budget_tier: ans.budget,
          max_price: budgetMax,
          limit: 3,
        },
      })
      setResults(data)
    } catch {
      // Fallback matching from local 228+ catalog
      const fallback = products
        .filter((p) => {
          if (ans.pets === 'yes' && !p.isPetFriendly) return false
          if (ans.experience === 'beginner' && !p.beginnerFriendly) return false
          if (ans.budget === 'low' && p.price > 300) return false
          if (ans.budget === 'medium' && (p.price < 300 || p.price > 700)) return false
          if (ans.budget === 'high' && p.price < 700) return false
          return true
        })
        .slice(0, 3)
        .map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.imageUrl || null,
          type: p.type || 'plants',
          match_score: 95,
          match_reasons: [
            p.beginnerFriendly ? 'Beginner Friendly' : 'Easy Care',
            p.isPetFriendly ? 'Pet Safe' : 'Standard Plant',
            'Budget Match',
          ],
        }))
      setResults(fallback)
    } finally {
      setLoading(false)
    }
  }

  function resetQuiz() {
    setAnswers({})
    setCurrentStep(0)
    setResults([])
    setDone(false)
  }

  return (
    <div className="rounded-3xl border border-phyto-forest/10 bg-white p-6 shadow-card md:p-8 space-y-6">
      {!done ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-phyto-forest text-white">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-phyto-forest">Find Your Perfect Plant</h3>
                <p className="text-xs text-stone-500">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={clsx(
                    'h-1.5 rounded-full transition-all',
                    i === currentStep
                      ? 'w-6 bg-phyto-forest'
                      : i < currentStep
                      ? 'w-2 bg-phyto-leaf'
                      : 'w-2 bg-stone-200'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          <div className="space-y-4">
            <h4 className="font-display text-base font-bold text-phyto-forest">
              {step.question}
            </h4>

            <div className="grid gap-3 sm:grid-cols-3">
              {step.options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => selectOption(opt.value)}
                  className="group flex flex-col items-start rounded-2xl border border-stone-200 bg-stone-50/60 p-4 text-left hover:border-phyto-leaf hover:bg-white hover:shadow-xs transition"
                >
                  <p className="text-xs font-bold text-phyto-forest group-hover:text-emerald-800">
                    {opt.label}
                  </p>
                  {opt.desc && (
                    <p className="mt-1 text-[11px] text-stone-500">
                      {opt.desc}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Results */
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="font-display text-xl font-bold text-phyto-forest">Your Tailored Botanical Matches</h3>
              <p className="text-xs text-stone-500">Based on your space, light, experience, and budget</p>
            </div>
            <button
              type="button"
              onClick={resetQuiz}
              className="text-xs font-bold text-phyto-leaf hover:underline"
            >
              Retake Quiz
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3">
              <Loader2 className="size-6 animate-spin text-phyto-leaf" />
              <span className="text-xs font-bold text-phyto-forest">Evaluating botanical matches…</span>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-3">
              {results.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-36 w-full rounded-xl object-cover"
                      />
                    )}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {item.match_score}% Match
                        </span>
                        <span className="font-bold text-phyto-forest text-sm">₹{item.price}</span>
                      </div>
                      <h4 className="font-display text-sm font-bold text-phyto-forest mt-1 truncate">
                        {item.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {item.match_reasons.map((r, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 rounded-md bg-stone-100 px-2 py-0.5 text-[10px] font-bold text-stone-600"
                        >
                          <Check className="size-2.5 text-emerald-600" />
                          <span>{r}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    to={`/product/${item.id}`}
                    className="flex items-center justify-center gap-1 w-full rounded-xl bg-phyto-forest py-2 text-xs font-bold text-white hover:bg-phyto-leaf transition"
                  >
                    <span>View Plant</span>
                    <ArrowRight className="size-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-xs text-stone-500">No direct matches found. Try widening your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
