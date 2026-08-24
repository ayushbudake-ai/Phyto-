export type Smell = 'non-fragrant' | 'mild' | 'strong' | 'fragrant' | string
export type Sunlight = 'full-sun' | 'partial' | 'shade' | string
export type Environment = 'indoor' | 'outdoor' | 'both' | string
export type ProductType = 'plants' | 'flowers' | 'tools' | 'seeds' | 'kits' | 'fertilizers' | 'pots' | string

export type MainCategory = 'Plants' | 'Seeds' | 'Flowers' | 'Fertilizers' | 'Pots'

export type Category =
  | 'Plants'
  | 'Seeds'
  | 'Flowers'
  | 'Fertilizers'
  | 'Pots'
  | 'Indoor Plants'
  | 'Air-Purifying Plants'
  | 'Flowering Plants'
  | 'Succulents & Cacti'
  | 'Herbs & Medicinal'
  | 'Customized Kits'
  | 'Tools'
  | string

export type SuitableSpace =
  | 'Living room'
  | 'Bedroom'
  | 'Balcony'
  | 'Office'
  | 'Desk'
  | 'Terrace'
  | 'Bathroom'
  | 'Garden'
  | string

export type PlantPurpose =
  | 'Air purification'
  | 'Decoration'
  | 'Gifting'
  | 'Herbs'
  | 'Medicinal'
  | 'Gardening'
  | 'Flowering'
  | 'Spirituality'
  | 'Stress relief'
  | 'Indoor greenery'
  | 'Balcony gardening'
  | 'Kitchen/herbs'
  | 'Beginner gardening'
  | string

export type LightRequirement = 'Low' | 'Medium' | 'Bright' | string
export type WaterRequirement = 'Low' | 'Medium' | 'High' | string
export type MaintenanceLevel = 'Low' | 'Medium' | 'High' | 'Easy' | 'Moderate' | 'Difficult' | string

export type PlantCareGuide = {
  watering: string
  sunlight: string
  soil: string
  fertilizer?: string
  temperature?: string
  humidity?: string
  repotting?: string
  commonIssues?: string
}

export type ProductTags =
  | 'pet-friendly'
  | 'air-purifying'
  | 'medicinal'
  | 'spirituality'
  | 'hanging'
  | 'low-maintenance'
  | 'fast-growing'
  | 'rare'
  | 'beginner-friendly'
  | 'flowering'
  | 'gifting'
  | 'seeds'
  | 'flowers'
  | 'fertilizer'
  | 'pots'
  | string

export type Product = {
  id: string
  sku?: string
  name: string
  scientificName?: string
  description: string
  price: number
  stock: number
  popularity: number
  type: ProductType
  category?: Category
  mainCategory?: MainCategory
  smell?: Smell
  sunlight: Sunlight
  environment: Environment
  lightRequirement?: LightRequirement
  waterRequirement?: WaterRequirement
  maintenance?: MaintenanceLevel
  difficulty?: MaintenanceLevel
  suitableSpace?: SuitableSpace[]
  purpose?: PlantPurpose[]
  isPetFriendly?: boolean
  petSafety?: 'Pet-Friendly' | 'Toxic to Pets' | string
  beginnerFriendly?: boolean
  soilType?: string
  temperature?: string
  humidity?: string
  benefits?: string
  rating?: number
  reviewsCount?: number
  careGuide?: PlantCareGuide
  care: {
    water: string
    sunlight: string
    soil?: string
    fertilizer?: string
    humidity?: string
    temperature?: string
    repotting?: string
  }
  imageUrl?: string
  tags: ProductTags[]
  // Location & Nursery fulfillment association
  nurseryId?: string
  nurseryName?: string
  nurseryCity?: string
  nurseryState?: string
  distanceKm?: number
  // Green Index Points Awarded upon purchase
  greenPointsAwarded?: number
  // Category specific attributes
  packSize?: string
  growingSeason?: string
  germinationDays?: string
  material?: string
  dimensions?: string
  color?: string
  usage?: string
  applicationFrequency?: string
}

export type CartItem = {
  product: Product
  quantity: number
  includeKit?: boolean
  addService?: boolean
}
