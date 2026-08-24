import type { Product, LightRequirement, WaterRequirement, MaintenanceLevel, SuitableSpace, PlantPurpose } from '../catalog/types'

export interface RecommendationWeights {
  maintenance: number // default 0.25 (25%)
  purpose: number // default 0.20 (20%)
  price: number // default 0.20 (20%)
  light: number // default 0.15 (15%)
  space: number // default 0.10 (10%)
  water: number // default 0.05 (5%)
  preferences: number // default 0.05 (5%)
}

export const DEFAULT_WEIGHTS: RecommendationWeights = {
  maintenance: 0.25,
  purpose: 0.20,
  price: 0.20,
  light: 0.15,
  space: 0.10,
  water: 0.05,
  preferences: 0.05,
}

export type BudgetTier = 'low' | 'medium' | 'premium' | 'all'

export interface RecommendationCriteria {
  maintenance?: MaintenanceLevel | 'any'
  purpose?: PlantPurpose | 'any'
  budgetTier?: BudgetTier
  minPrice?: number
  maxPrice?: number
  light?: LightRequirement | 'any'
  space?: SuitableSpace | 'any'
  water?: WaterRequirement | 'any'
  petOnly?: boolean
  beginnerOnly?: boolean
  recentSearches?: string[]
  viewedProductIds?: string[]
}

export interface RecommendationMatch {
  product: Product
  scorePercentage: number
  matchPoints: {
    maintenanceMatch: boolean
    purposeMatch: boolean
    budgetMatch: boolean
    lightMatch: boolean
    spaceMatch: boolean
    waterMatch: boolean
    petMatch: boolean
  }
  highlightBadges: string[]
}

export function evaluatePlantRecommendation(
  product: Product,
  criteria: RecommendationCriteria,
  weights: RecommendationWeights = DEFAULT_WEIGHTS
): RecommendationMatch {
  let totalScore = 0

  // 1. Maintenance Effort Match (Weight: 25%)
  let maintenanceMatch = false
  if (!criteria.maintenance || criteria.maintenance === 'any') {
    totalScore += weights.maintenance * 100
    maintenanceMatch = true
  } else {
    const prodMaint = (product.maintenance || 'Easy').toLowerCase()
    const critMaint = criteria.maintenance.toLowerCase()
    if (prodMaint === critMaint || (critMaint === 'low' && prodMaint === 'easy') || (critMaint === 'easy' && prodMaint === 'low')) {
      totalScore += weights.maintenance * 100
      maintenanceMatch = true
    } else if (critMaint === 'medium' && (prodMaint === 'moderate' || prodMaint === 'medium')) {
      totalScore += weights.maintenance * 100
      maintenanceMatch = true
    } else {
      totalScore += weights.maintenance * 40
    }
  }

  // 2. Plant Purpose Match (Weight: 20%)
  let purposeMatch = false
  if (!criteria.purpose || criteria.purpose === 'any') {
    totalScore += weights.purpose * 100
    purposeMatch = true
  } else {
    const pList = (product.purpose || []).map((p) => p.toLowerCase())
    const targetPurpose = criteria.purpose.toLowerCase()
    if (pList.some((p) => p.includes(targetPurpose) || targetPurpose.includes(p))) {
      totalScore += weights.purpose * 100
      purposeMatch = true
    } else {
      totalScore += weights.purpose * 30
    }
  }

  // 3. Price Range / Budget Match (Weight: 20%)
  let budgetMatch = false
  const price = product.price
  if (criteria.budgetTier) {
    if (criteria.budgetTier === 'all') {
      totalScore += weights.price * 100
      budgetMatch = true
    } else if (criteria.budgetTier === 'low' && price <= 300) {
      totalScore += weights.price * 100
      budgetMatch = true
    } else if (criteria.budgetTier === 'medium' && price > 300 && price <= 800) {
      totalScore += weights.price * 100
      budgetMatch = true
    } else if (criteria.budgetTier === 'premium' && price > 800) {
      totalScore += weights.price * 100
      budgetMatch = true
    } else {
      totalScore += weights.price * 45
    }
  } else if (criteria.minPrice !== undefined && criteria.maxPrice !== undefined) {
    if (price >= criteria.minPrice && price <= criteria.maxPrice) {
      totalScore += weights.price * 100
      budgetMatch = true
    } else {
      totalScore += weights.price * 30
    }
  } else {
    totalScore += weights.price * 100
    budgetMatch = true
  }

  // 4. Sunlight Exposure Match (Weight: 15%)
  let lightMatch = false
  if (!criteria.light || criteria.light === 'any') {
    totalScore += weights.light * 100
    lightMatch = true
  } else {
    const prodLight = (product.lightRequirement || 'Medium').toLowerCase()
    const critLight = criteria.light.toLowerCase()
    if (prodLight === critLight || prodLight.includes(critLight)) {
      totalScore += weights.light * 100
      lightMatch = true
    } else {
      totalScore += weights.light * 35
    }
  }

  // 5. Available Space Match (Weight: 10%)
  let spaceMatch = false
  if (!criteria.space || criteria.space === 'any') {
    totalScore += weights.space * 100
    spaceMatch = true
  } else {
    const spaces = (product.suitableSpace || []).map((s) => s.toLowerCase())
    if (spaces.includes(criteria.space.toLowerCase())) {
      totalScore += weights.space * 100
      spaceMatch = true
    } else {
      totalScore += weights.space * 30
    }
  }

  // 6. Water Requirement Match (Weight: 5%)
  let waterMatch = false
  if (!criteria.water || criteria.water === 'any') {
    totalScore += weights.water * 100
    waterMatch = true
  } else {
    const prodWater = (product.waterRequirement || 'Medium').toLowerCase()
    if (prodWater === criteria.water.toLowerCase()) {
      totalScore += weights.water * 100
      waterMatch = true
    } else {
      totalScore += weights.water * 40
    }
  }

  // 7. Preferences / Pet / History Bonus (Weight: 5%)
  let petMatch = true
  let prefScore = 0
  if (criteria.petOnly) {
    if (product.isPetFriendly || product.petSafety === 'Pet-Friendly') {
      prefScore += 50
    } else {
      petMatch = false
      totalScore -= 25 // Penalize heavily if pet-safe requested and plant is toxic
    }
  } else {
    prefScore += 25
  }

  if (criteria.beginnerOnly) {
    if (product.beginnerFriendly || product.maintenance === 'Easy' || product.maintenance === 'Low') {
      prefScore += 30
    }
  }

  if (criteria.viewedProductIds?.includes(product.id)) {
    prefScore += 20
  }

  totalScore += weights.preferences * Math.min(100, prefScore)

  // Clamp score between 60% and 99% for realistic recommendation UX
  const finalPercentage = Math.min(99, Math.max(60, Math.round(totalScore)))

  // Generate clear user-facing breakdown checkmarks
  const highlightBadges: string[] = []
  if (maintenanceMatch) {
    highlightBadges.push(product.maintenance === 'Easy' || product.maintenance === 'Low' ? 'Low Maintenance ✓' : 'Care Match ✓')
  }
  if (lightMatch) {
    highlightBadges.push(`${product.lightRequirement || 'Medium'} Light ✓`)
  }
  if (spaceMatch && criteria.space && criteria.space !== 'any') {
    highlightBadges.push(`${criteria.space} Match ✓`)
  } else if (product.environment === 'indoor') {
    highlightBadges.push('Indoor Space ✓')
  }
  if (budgetMatch) {
    highlightBadges.push('Budget Match ✓')
  }
  if (product.isPetFriendly || product.petSafety === 'Pet-Friendly') {
    highlightBadges.push('Pet Safe ✓')
  }

  return {
    product,
    scorePercentage: finalPercentage,
    matchPoints: {
      maintenanceMatch,
      purposeMatch,
      budgetMatch,
      lightMatch,
      spaceMatch,
      waterMatch,
      petMatch,
    },
    highlightBadges: highlightBadges.slice(0, 4),
  }
}

export function rankProductRecommendations(
  productsList: Product[],
  criteria: RecommendationCriteria,
  weights: RecommendationWeights = DEFAULT_WEIGHTS,
  limit: number = 8
): RecommendationMatch[] {
  return productsList
    .map((p) => evaluatePlantRecommendation(p, criteria, weights))
    .filter((m) => m.matchPoints.petMatch) // Only show pet-safe if requested
    .sort((a, b) => b.scorePercentage - a.scorePercentage)
    .slice(0, limit)
}
