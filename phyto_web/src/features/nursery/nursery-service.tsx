/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react'

export interface Nursery {
  id: string
  name: string
  area: string
  areas: string[]
  city: string
  state: string
  country: string
  address: string
  serviceArea: string
  serviceRadiusKm: number
  active: boolean
  verified: boolean
  availableCategories: string[]
  deliveryTime: string
  badge?: string
  createdAt: string
  updatedAt: string
}

export const NURSERY_NETWORK: Nursery[] = [
  // ── 18 Verified Kolhapur Nurseries (Kolhapur Network) ──────────────────
  {
    id: 'nur-kop-1',
    name: 'Shinde Nursery',
    area: 'New Palace / Nagala Park',
    areas: ['New Palace', 'Nagala Park'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'New Palace Road, Nagala Park, Kolhapur',
    serviceArea: 'Nagala Park, New Palace, Shahupuri & North Kolhapur',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Fertilizers', 'Pots'],
    deliveryTime: 'Same Day Express Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-2',
    name: "Jagtap Nursery's Garden Centre Kolhapur",
    area: 'Tarabai Park',
    areas: ['Tarabai Park'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Tarabai Park, Kolhapur',
    serviceArea: 'Tarabai Park, Collector Office, Assembly Road & Central Kolhapur',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Pots', 'Customized Kits'],
    deliveryTime: 'Same Day Express Delivery',
    badge: 'Botanical Garden Centre',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-3',
    name: 'Karan Nursery',
    area: 'Tarabai Park / Kanan Nagar',
    areas: ['Tarabai Park', 'Kanan Nagar'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Near Tarabai Park, Kanan Nagar, Kolhapur',
    serviceArea: 'Kanan Nagar, Tarabai Park, Ruikar Colony',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Fertilizers'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-4',
    name: 'Sajeev Nursery- best plant nursery',
    area: 'Kawala Naka',
    areas: ['Kawala Naka'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Near Kawala Naka Junction, Kolhapur',
    serviceArea: 'Kawala Naka, Bus Stand, Central Highway & Shahupuri',
    serviceRadiusKm: 18,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Pots', 'Fertilizers'],
    deliveryTime: 'Same Day Express Delivery',
    badge: 'Top Rated Nursery Hub',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-5',
    name: 'Biswas Nursery',
    area: 'Old Vashi Naka',
    areas: ['Old Vashi Naka', 'Vashi Naka'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Old Vashi Naka, Kolhapur',
    serviceArea: 'Vashi Naka, Rankala Lake Area & West Kolhapur',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Fertilizers'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-6',
    name: 'Savali Nursery',
    area: 'Ratnappa Kumbhar Nagar / Pachgaon',
    areas: ['Ratnappa Kumbhar Nagar', 'Pachgaon'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Ratnappa Kumbhar Nagar, Pachgaon, Kolhapur',
    serviceArea: 'Pachgaon, R.K. Nagar, Ujalaiwadi & South Kolhapur',
    serviceRadiusKm: 18,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Fertilizers', 'Pots'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-7',
    name: 'Sardar Nursery',
    area: 'Deokar Panand',
    areas: ['Deokar Panand'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Deokar Panand, Kolhapur',
    serviceArea: 'Deokar Panand, Phulewadi, Rankala & Suburbs',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Seeds'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-8',
    name: 'Nakshatra Nursery',
    area: 'Kalamba',
    areas: ['Kalamba'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Kalamba Main Road, Kolhapur',
    serviceArea: 'Kalamba, Kalamba Lake, Subhashnagar',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Pots', 'Customized Kits'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Indigenous Flora Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-9',
    name: 'Green Earth Nursery',
    area: 'Kalamba / Tapowan',
    areas: ['Kalamba', 'Tapowan'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Tapowan Road, near Kalamba, Kolhapur',
    serviceArea: 'Tapowan, Kalamba, Saneguruji Vasahat & South Kolhapur',
    serviceRadiusKm: 18,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Fertilizers', 'Pots'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Organic Farm Specialist',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-10',
    name: 'Chinmay Nursery',
    area: 'Nana Patil Nagar',
    areas: ['Nana Patil Nagar'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Nana Patil Nagar, Kolhapur',
    serviceArea: 'Nana Patil Nagar, Sambhajinagar, Ring Road',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Fertilizers'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-11',
    name: 'Sagar Nursery',
    area: 'Kasaba Bawada',
    areas: ['Kasaba Bawada', 'Bawada'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Kasaba Bawada, Kolhapur',
    serviceArea: 'Kasaba Bawada, Sugar Mills Area, Line Bazar & North Kolhapur',
    serviceRadiusKm: 16,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Fertilizers', 'Pots'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-12',
    name: 'Plant House Nursery',
    area: 'Hari Om Nagar',
    areas: ['Hari Om Nagar'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Hari Om Nagar, Kolhapur',
    serviceArea: 'Hari Om Nagar, Rajarampuri, Shahupuri',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Pots', 'Customized Kits'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Indoor Plant Boutique',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-13',
    name: 'Nisarg Nursery',
    area: 'Behind Circuit House / Tarabai Park',
    areas: ['Behind Circuit House', 'Tarabai Park', 'Circuit House'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Behind Circuit House, Tarabai Park, Kolhapur',
    serviceArea: 'Circuit House, Tarabai Park, Collector Colony',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Seeds', 'Pots'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-14',
    name: 'SAI Nursery',
    area: 'Bodre Nagar',
    areas: ['Bodre Nagar'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Bodre Nagar, Kolhapur',
    serviceArea: 'Bodre Nagar, Rajendra Nagar, Shivaji Park',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Fertilizers'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-15',
    name: 'Vishwa Mangal Nursery',
    area: 'Saneguruji Vasahat',
    areas: ['Saneguruji Vasahat', 'Sane Guruji Vasahat'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Saneguruji Vasahat, Kolhapur',
    serviceArea: 'Saneguruji Vasahat, Rankala South, Ring Road',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Fertilizers', 'Pots'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-16',
    name: 'Vishwas Nursery',
    area: 'Juna Vashi Naka',
    areas: ['Juna Vashi Naka', 'Vashi Naka'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Juna Vashi Naka, Kolhapur',
    serviceArea: 'Juna Vashi Naka, Binkhambi Ganesh Area, Mangalwar Peth',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Verified Local Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-17',
    name: 'Plant Nest',
    area: 'Panchgaon Road',
    areas: ['Panchgaon Road', 'Panchgaon'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Panchgaon Road, Kolhapur',
    serviceArea: 'Panchgaon Road, Shivaji University Area, Ujalaiwadi',
    serviceRadiusKm: 18,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Pots', 'Customized Kits'],
    deliveryTime: 'Same Day Express Delivery',
    badge: 'Contemporary Plant Studio',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-kop-18',
    name: 'Shree SAI Flora',
    area: 'Karveer Nagar',
    areas: ['Karveer Nagar', 'Karveer'],
    city: 'Kolhapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Karveer Nagar, Kolhapur',
    serviceArea: 'Karveer Nagar, Mahalaxmi Temple Precinct, Central Karveer',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Fertilizers'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Devotional & Flowering Flora Hub',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },

  // ── Pune Nurseries (Local Tier) ─────────────────────────────────────────
  {
    id: 'nur-pune-1',
    name: 'Green Leaf Nursery',
    area: 'FC Road / Shivaji Nagar',
    areas: ['FC Road', 'Shivaji Nagar'],
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    address: 'Plot 14, FC Road, Shivaji Nagar, Pune - 411005',
    serviceArea: 'Shivaji Nagar, FC Road, Deccan, Aundh & Central Pune',
    serviceRadiusKm: 15,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Pots', 'Customized Kits'],
    deliveryTime: '2-3 Hours (Express Local)',
    badge: 'Local Verified Hub',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-pune-2',
    name: 'Sahyadri Flora & Botanicals',
    area: 'Kothrud',
    areas: ['Kothrud', 'Gandhi Bhavan'],
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    address: 'Near Gandhi Bhavan, Kothrud, Pune - 411038',
    serviceArea: 'Kothrud, Karve Nagar, Bavdhan, Warje',
    serviceRadiusKm: 20,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Fertilizers', 'Seeds'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Indigenous Flora Specialist',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-pune-3',
    name: 'Osho Greenery & Bonsai World',
    area: 'Koregaon Park',
    areas: ['Koregaon Park', 'Kalyani Nagar'],
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    address: 'Lane 5, Koregaon Park, Pune - 411001',
    serviceArea: 'Koregaon Park, Kalyani Nagar, Viman Nagar, Magarpatta',
    serviceRadiusKm: 18,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Pots', 'Customized Kits'],
    deliveryTime: 'Same Day Delivery',
    badge: 'Rare & Exotic Plants',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },

  // ── Regional Maharashtra Nurseries (Tier 2) ─────────────────────────────
  {
    id: 'nur-mum-1',
    name: 'Western Ghats Botanical Nursery',
    area: 'Thane / Ghodbunder',
    areas: ['Thane', 'Ghodbunder Road'],
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    address: 'Ghodbunder Road, Thane West, Mumbai - 400607',
    serviceArea: 'Mumbai Metropolitan Region & Thane',
    serviceRadiusKm: 30,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Flowers', 'Fertilizers', 'Pots'],
    deliveryTime: '1-2 Days (Regional Express)',
    badge: 'Maharashtra Agro Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-nash-1',
    name: 'Maharashtra Agro Organic Nursery',
    area: 'Gangapur Road',
    areas: ['Gangapur Road', 'College Road'],
    city: 'Nashik',
    state: 'Maharashtra',
    country: 'India',
    address: 'Gangapur Road, Nashik - 422013',
    serviceArea: 'Nashik Metropolitan Region',
    serviceRadiusKm: 40,
    active: true,
    verified: true,
    availableCategories: ['Seeds', 'Plants', 'Fertilizers'],
    deliveryTime: '1-2 Days (Regional Express)',
    badge: 'Organic Certified Farm',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },

  // ── National Regional Hubs (Tier 3) ─────────────────────────────────────
  {
    id: 'nur-beng-1',
    name: 'Bangalore Botanical Hub',
    area: 'Indiranagar',
    areas: ['Indiranagar', 'Koramangala'],
    city: 'Bengaluru',
    state: 'Karnataka',
    country: 'India',
    address: 'Indiranagar 100ft Road, Bengaluru - 560038',
    serviceArea: 'Bengaluru Urban & Karnataka',
    serviceRadiusKm: 25,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Seeds', 'Flowers', 'Pots', 'Fertilizers'],
    deliveryTime: '2-3 Days (National Express)',
    badge: 'National Hub Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
  {
    id: 'nur-del-1',
    name: 'Delhi Green Oasis',
    area: 'Mehrauli-Gurgaon Road',
    areas: ['Mehrauli', 'Gurgaon Road'],
    city: 'Delhi NCR',
    state: 'Delhi',
    country: 'India',
    address: 'Mehrauli-Gurgaon Road, New Delhi - 110030',
    serviceArea: 'Delhi NCR, Gurgaon & Noida',
    serviceRadiusKm: 35,
    active: true,
    verified: true,
    availableCategories: ['Plants', 'Pots', 'Seeds'],
    deliveryTime: '2-3 Days (National Express)',
    badge: 'National Hub Partner',
    createdAt: '2026-08-01T00:00:00.000Z',
    updatedAt: '2026-08-24T00:00:00.000Z',
  },
]

export const SUPPORTED_CITIES = ['Kolhapur', 'Pune', 'Mumbai', 'Nashik', 'Bengaluru', 'Delhi NCR', 'Hyderabad']

interface LocationContextType {
  currentCity: string
  currentState: string
  setCurrentCity: (city: string) => void
  requestLiveLocation: () => Promise<void>
  isDetecting: boolean
  nearbyNurseries: Nursery[]
  regionalNurseries: Nursery[]
  otherNurseries: Nursery[]
}

const STORAGE_CITY_KEY = 'phyto_user_city'

const LocationContext = createContext<LocationContextType>({
  currentCity: 'Kolhapur',
  currentState: 'Maharashtra',
  setCurrentCity: () => {},
  requestLiveLocation: async () => {},
  isDetecting: false,
  nearbyNurseries: [],
  regionalNurseries: [],
  otherNurseries: [],
})

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCityState] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CITY_KEY)
      if (stored && SUPPORTED_CITIES.includes(stored)) return stored
    } catch {
      // ignore
    }
    return 'Kolhapur' // Primary default city
  })
  const [isDetecting, setIsDetecting] = useState(false)

  const setCurrentCity = useCallback((city: string) => {
    setCurrentCityState(city)
    try {
      localStorage.setItem(STORAGE_CITY_KEY, city)
    } catch {
      // ignore
    }
  }, [])

  const currentState = useMemo(() => {
    if (['Kolhapur', 'Pune', 'Mumbai', 'Nashik'].includes(currentCity)) return 'Maharashtra'
    if (['Bengaluru'].includes(currentCity)) return 'Karnataka'
    if (['Delhi NCR'].includes(currentCity)) return 'Delhi'
    return 'Maharashtra'
  }, [currentCity])

  const requestLiveLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return
    }
    setIsDetecting(true)
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsDetecting(false)
      },
      () => {
        setIsDetecting(false)
      },
      { timeout: 5000 }
    )
  }, [])

  const nearbyNurseries = useMemo(() => {
    return NURSERY_NETWORK.filter((n) => n.city.toLowerCase() === currentCity.toLowerCase())
  }, [currentCity])

  const regionalNurseries = useMemo(() => {
    return NURSERY_NETWORK.filter(
      (n) => n.city.toLowerCase() !== currentCity.toLowerCase() && n.state === currentState
    )
  }, [currentCity, currentState])

  const otherNurseries = useMemo(() => {
    return NURSERY_NETWORK.filter(
      (n) => n.city.toLowerCase() !== currentCity.toLowerCase() && n.state !== currentState
    )
  }, [currentCity, currentState])

  const value = useMemo(
    () => ({
      currentCity,
      currentState,
      setCurrentCity,
      requestLiveLocation,
      isDetecting,
      nearbyNurseries,
      regionalNurseries,
      otherNurseries,
    }),
    [
      currentCity,
      currentState,
      setCurrentCity,
      requestLiveLocation,
      isDetecting,
      nearbyNurseries,
      regionalNurseries,
      otherNurseries,
    ]
  )

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}

export function useLocation() {
  return useContext(LocationContext)
}
