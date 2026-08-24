import type { Product } from '../features/catalog/types'
import { livingPlants } from './living_plants_data'
import { flowersData } from './flowers_data'
import { seedsData } from './seeds_data'
import { fertilizersData } from './fertilizers_data'
import { potsData } from './pots_data'

// Combine all 228+ unique realistic botanical products across all 5 main categories
export const products: Product[] = [
  ...livingPlants,
  ...flowersData,
  ...seedsData,
  ...fertilizersData,
  ...potsData,
]

export const totalProductsCount = products.length
