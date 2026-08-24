/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useMemo, useCallback } from 'react'

export interface GreenActivity {
  id: string
  title: string
  points: number
  category: 'plant' | 'seed' | 'kit' | 'service' | 'eco_action'
  timestamp: string
  orderId?: string | number
}

export interface GreenMilestoneReward {
  claimed: boolean
  claimedAt?: string
  certificateId?: string
  voucherCode?: string
  rewardSeedName?: string
}

interface GreenIndexContextType {
  points: number
  targetPoints: number
  progressPercentage: number
  isChampion: boolean
  activities: GreenActivity[]
  rewardState: GreenMilestoneReward
  addPoints: (points: number, title: string, category: GreenActivity['category'], orderId?: string | number) => void
  claimMilestoneRewards: () => GreenMilestoneReward
  resetPointsForDemo: () => void
}

const STORAGE_ACTIVITIES_KEY = 'phyto_green_activities'
const STORAGE_REWARD_KEY = 'phyto_green_rewards'

const TARGET_POINTS = 1000

const INITIAL_ACTIVITIES: GreenActivity[] = [
  {
    id: 'act-1',
    title: 'Adopted Monstera Deliciosa Living Plant',
    points: 100,
    category: 'plant',
    timestamp: 'Yesterday at 4:15 PM',
    orderId: 'ORD-8921',
  },
  {
    id: 'act-2',
    title: 'Purchased 2 Heirloom Tomato & Basil Seed Packs',
    points: 80,
    category: 'seed',
    timestamp: '3 days ago',
    orderId: 'ORD-8410',
  },
  {
    id: 'act-3',
    title: 'Ordered Biodegradable Terracotta Potting Kit',
    points: 70,
    category: 'kit',
    timestamp: '1 week ago',
    orderId: 'ORD-7992',
  },
  {
    id: 'act-4',
    title: 'Booked Certified Plant Doctor Diagnostic Visit',
    points: 80,
    category: 'service',
    timestamp: '2 weeks ago',
    orderId: 'ORD-7201',
  },
  {
    id: 'act-5',
    title: 'Welcome Eco-Onboarding Green Bonus',
    points: 420,
    category: 'eco_action',
    timestamp: '3 weeks ago',
  },
] // Total initial = 750 / 1000 points (75% to champion)

const GreenIndexContext = createContext<GreenIndexContextType>({
  points: 750,
  targetPoints: TARGET_POINTS,
  progressPercentage: 75,
  isChampion: false,
  activities: INITIAL_ACTIVITIES,
  rewardState: { claimed: false },
  addPoints: () => {},
  claimMilestoneRewards: () => ({ claimed: false }),
  resetPointsForDemo: () => {},
})

export function GreenIndexProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<GreenActivity[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ACTIVITIES_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return INITIAL_ACTIVITIES
  })

  const [rewardState, setRewardState] = useState<GreenMilestoneReward>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_REWARD_KEY)
      if (stored) return JSON.parse(stored)
    } catch {
      // ignore
    }
    return { claimed: false }
  })

  const points = useMemo(() => {
    return activities.reduce((sum, act) => sum + act.points, 0)
  }, [activities])

  const progressPercentage = Math.min(100, Math.round((points / TARGET_POINTS) * 100))
  const isChampion = points >= TARGET_POINTS

  const addPoints = useCallback(
    (pointsToAdd: number, title: string, category: GreenActivity['category'], orderId?: string | number) => {
      const newActivity: GreenActivity = {
        id: `act-${Date.now()}`,
        title,
        points: pointsToAdd,
        category,
        timestamp: 'Just now',
        orderId,
      }
      setActivities((prev) => {
        const next = [newActivity, ...prev]
        try {
          localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(next))
        } catch {
          // ignore
        }
        return next
      })
    },
    []
  )

  const claimMilestoneRewards = useCallback((): GreenMilestoneReward => {
    if (!isChampion || rewardState.claimed) {
      return rewardState
    }

    const certId = `PHYTO-GC-${Math.floor(100000 + Math.random() * 900000)}`
    const claimedReward: GreenMilestoneReward = {
      claimed: true,
      claimedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      certificateId: certId,
      voucherCode: 'GREENCHAMP25',
      rewardSeedName: 'Rare Organic Heirloom Krishna Tulsi & Saffron Seed Pack',
    }

    setRewardState(claimedReward)
    try {
      localStorage.setItem(STORAGE_REWARD_KEY, JSON.stringify(claimedReward))
    } catch {
      // ignore
    }
    return claimedReward
  }, [isChampion, rewardState])

  const resetPointsForDemo = useCallback(() => {
    setActivities(INITIAL_ACTIVITIES)
    setRewardState({ claimed: false })
    try {
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(INITIAL_ACTIVITIES))
      localStorage.setItem(STORAGE_REWARD_KEY, JSON.stringify({ claimed: false }))
    } catch {
      // ignore
    }
  }, [])

  const value = useMemo(
    () => ({
      points,
      targetPoints: TARGET_POINTS,
      progressPercentage,
      isChampion,
      activities,
      rewardState,
      addPoints,
      claimMilestoneRewards,
      resetPointsForDemo,
    }),
    [
      points,
      progressPercentage,
      isChampion,
      activities,
      rewardState,
      addPoints,
      claimMilestoneRewards,
      resetPointsForDemo,
    ]
  )

  return <GreenIndexContext.Provider value={value}>{children}</GreenIndexContext.Provider>
}

export function useGreenIndex() {
  return useContext(GreenIndexContext)
}
