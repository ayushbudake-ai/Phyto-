export type ProductType = 'plants' | 'flowers' | 'seeds' | 'fertilizers' | 'tools'

export type Smell = 'fragrant' | 'non-fragrant' | 'strong' | 'mild'
export type Sunlight = 'full-sun' | 'partial' | 'shade'
export type Environment = 'indoor' | 'outdoor'

export type ProductTags =
  | 'pet-friendly'
  | 'air-purifying'
  | 'medicinal'
  | 'spirituality'
  | 'hanging'
  | 'low-maintenance'
  | 'fast-growing'
  | 'rare'

export type Product = {
  id: string
  sku?: string
  name: string
  description: string
  price: number
  popularity: number
  type: ProductType
  smell: Smell
  sunlight: Sunlight
  environment: Environment
  tags: ProductTags[]
  imageUrl?: string
  care: {
    water: string
    sunlight: string
  }
}

