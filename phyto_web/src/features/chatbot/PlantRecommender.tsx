// phyto_web/src/features/chatbot/PlantRecommender.tsx
// ─────────────────────────────────────────────────────────────
// Algorithm-based "Find Your Perfect Plant" widget
// HOW TO ADD:
//   Import and drop anywhere on the page:
//   import { PlantRecommender } from '../../features/chatbot/PlantRecommender'
//   <PlantRecommender />
//
//   Best placed on HomePage after the hero section.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { apiFetch } from '../../lib/api'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import {
  Sun, Home, Heart, Wallet,
  Sparkles, Loader2, ChevronRight, Star
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
  options: { label: string; value: string; emoji: string }[]
  multi?: boolean
}

// ── Quiz Steps ──────────────────────────────────────────────
const STEPS: Step[] = [
  {
    id: 'environment',
    question: 'Where will your plant live?',
    icon: <Home className="w-5 h-5" />,
    options: [
      { label: 'Indoors', value: 'indoor', emoji: '🏠' },
      { label: 'Outdoors', value: 'outdoor', emoji: '🌳' },
      { label: 'Both', value: 'both', emoji: '🌿' },
    ],
  },
  {
    id: 'sunlight',
    question: 'How much sunlight does that spot get?',
    icon: <Sun className="w-5 h-5" />,
    options: [
      { label: 'Bright sunlight', value: 'full_sun', emoji: '☀️' },
      { label: 'Partial / filtered', value: 'partial', emoji: '⛅' },
      { label: 'Low light / shade', value: 'shade', emoji: '🌥️' },
    ],
  },
  {
    id: 'maintenance',
    question: 'How much time can you give?',
    icon: <Heart className="w-5 h-5" />,
    options: [
      { label: 'Minimal — set & forget', value: 'low', emoji: '😌' },
      { label: 'Some weekly care', value: 'medium', emoji: '🙂' },
      { label: 'I love tending plants!', value: 'high', emoji: '🤗' },
    ],
  },
  {
    id: 'budget',
    question: 'What is your budget per plant?',
    icon: <Wallet className="w-5 h-5" />,
    options: [
      { label: 'Under ₹200', value: '200', emoji: '💰' },
      { label: '₹200 – ₹600', value: '600', emoji: '💵' },
      { label: '₹600+', value: '9999', emoji: '✨' },
    ],
  },
]

// ── Main Component ──────────────────────────────────────────
export function PlantRecommender() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const currentStep = STEPS[step]

  const select = async (value: string) => {
    const newAnswers = { ...answers, [currentStep.id]: value }
    setAnswers(newAnswers)

    if (step < STEPS.length - 1) {
      setStep(s => s + 1)
      return
    }

    // Final step — fetch recommendations
    setLoading(true)
    setDone(true)

    try {
      const data = await apiFetch<{ recommendations: RecommendedProduct[] }>(
        '/chatbot/recommend/quick?' + new URLSearchParams({
          environment: newAnswers.environment ?? '',
          sunlight: newAnswers.sunlight ?? '',
          budget: newAnswers.budget ?? '9999',
          limit: '4',
        }).toString()
      )
      const apiResults = data.recommendations ?? []
      setResults(apiResults.length > 0 ? apiResults : localRecommendations(newAnswers))
    } catch {
      // Fallback to local catalog matching when backend/DB is unavailable.
      setResults(localRecommendations(newAnswers))
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep(0)
    setAnswers({})
    setResults([])
    setDone(false)
    setLoading(false)
  }

  return (
    <section className="bg-[rgb(var(--phyto-forest))] rounded-2xl p-6 md:p-10 my-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-green-400/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-green-300" />
        </div>
        <div>
          <h2 className="text-white font-display text-xl font-semibold">
            Find Your Perfect Plant
          </h2>
          <p className="text-green-300 text-sm">
            Answer 4 quick questions — our algorithm picks the best match for you
          </p>
        </div>
      </div>

      {/* Quiz */}
      {!done && (
        <>
          {/* Progress bar */}
          <div className="flex gap-1.5 mb-6">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={clsx(
                  'h-1 flex-1 rounded-full transition-all duration-300',
                  i <= step ? 'bg-green-400' : 'bg-white/20'
                )}
              />
            ))}
          </div>

          {/* Question */}
          <div className="flex items-center gap-2 text-green-200 text-sm font-medium mb-4">
            {currentStep.icon}
            <span>Step {step + 1} of {STEPS.length}</span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-5">
            {currentStep.question}
          </h3>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentStep.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={clsx(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150',
                  'border-white/20 bg-white/5 text-white',
                  'hover:bg-white/15 hover:border-green-400 hover:scale-105',
                  'active:scale-100'
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className="text-sm font-medium text-center">{opt.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Results */}
      {done && (
        <>
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-10">
              <Loader2 className="w-6 h-6 animate-spin text-green-300" />
              <span className="text-green-200 text-sm">Finding your perfect plants...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-semibold text-lg">
                  🌱 Your Perfect Matches
                </h3>
                <button
                  onClick={reset}
                  className="text-green-300 text-sm hover:text-white transition-colors underline underline-offset-2"
                >
                  Start over
                </button>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 text-green-200">
                  <p>No exact matches found — try different preferences!</p>
                  <button onClick={reset} className="mt-3 text-sm underline text-green-300 hover:text-white">
                    Try again
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {results.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className={clsx(
                        'group bg-white rounded-xl overflow-hidden transition-all duration-200',
                        'hover:shadow-lg hover:-translate-y-1'
                      )}
                    >
                      {/* Image */}
                      <div className="aspect-square bg-stone-100 overflow-hidden">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            🌿
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-2.5">
                        <p className="text-stone-800 text-xs font-semibold line-clamp-1 mb-1">
                          {product.name}
                        </p>

                        {/* Match score stars */}
                        <div className="flex items-center gap-1 mb-1.5">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              className={clsx(
                                'w-2.5 h-2.5',
                                product.match_score > s * 20
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-stone-200 fill-stone-200'
                              )}
                            />
                          ))}
                          <span className="text-[10px] text-stone-400 ml-0.5">
                            {product.match_score}% match
                          </span>
                        </div>

                        <p className="text-green-700 text-xs font-bold">
                          ₹{product.price.toFixed(0)}
                        </p>

                        {/* First reason */}
                        {product.match_reasons?.[0] && (
                          <p className="text-stone-400 text-[10px] mt-1 line-clamp-1">
                            ✓ {product.match_reasons[0]}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-4 flex justify-center">
                <Link
                  to="/shop"
                  className={clsx(
                    'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                    'bg-white/10 text-white text-sm font-medium',
                    'hover:bg-white/20 transition-colors'
                  )}
                >
                  Browse all plants <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}

function localRecommendations(answers: Record<string, string>): RecommendedProduct[] {
  const budget = Number(answers.budget ?? '9999')
  const scored = products.map((p) => {
    let score = 0
    const reasons: string[] = []

    if (answers.environment && p.environment === answers.environment) {
      score += 30
      reasons.push(`Great for ${answers.environment} spaces`)
    }
    if (answers.sunlight && p.sunlight.replace('-', '_') === answers.sunlight) {
      score += 30
      reasons.push('Matches your light preference')
    }
    if (Number.isFinite(budget) && p.price <= budget) {
      score += 20
      reasons.push('Within your budget')
    }
    if (answers.maintenance === 'low' && p.tags.includes('low-maintenance')) {
      score += 15
      reasons.push('Low-maintenance choice')
    }
    score += Math.min(20, Math.round(p.popularity / 5))

    return {
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.imageUrl ?? null,
      type: p.type,
      match_score: Math.min(100, score),
      match_reasons: reasons.length > 0 ? reasons : ['Popular pick for most homes'],
    }
  })

  return scored.sort((a, b) => b.match_score - a.match_score).slice(0, 4)
}
