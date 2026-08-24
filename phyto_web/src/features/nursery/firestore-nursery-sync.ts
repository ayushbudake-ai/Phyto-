import { db } from '../../lib/firebase'
import { collection, getDocs, doc, setDoc } from 'firebase/firestore'
import { NURSERY_NETWORK } from './nursery-service'

/**
 * Normalizes nursery name for deduplication comparison.
 */
export function normalizeNurseryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

/**
 * Synchronizes initial 18 Kolhapur and regional nursery listings with Firebase Firestore.
 * Matches by normalized name and city to prevent duplicate records.
 */
export async function syncNurseriesToFirestore(): Promise<{ added: number; updated: number }> {
  if (!db) {
    return { added: 0, updated: 0 }
  }

  let added = 0
  let updated = 0

  try {
    const nurseriesCol = collection(db, 'nurseries')
    const snapshot = await getDocs(nurseriesCol)

    const existingMap = new Map<string, { docId: string; data: Record<string, unknown> }>()
    snapshot.forEach((d) => {
      const data = d.data()
      const normKey = `${normalizeNurseryName(data.name || '')}_${(data.city || '').toLowerCase()}`
      existingMap.set(normKey, { docId: d.id, data })
    })

    for (const nursery of NURSERY_NETWORK) {
      const normKey = `${normalizeNurseryName(nursery.name)}_${nursery.city.toLowerCase()}`
      const existing = existingMap.get(normKey)

      if (existing) {
        // Update missing fields while preserving existing custom data
        const mergedData = {
          ...nursery,
          ...existing.data,
          areas: nursery.areas,
          serviceArea: nursery.serviceArea,
          updatedAt: new Date().toISOString(),
        }
        await setDoc(doc(db, 'nurseries', existing.docId), mergedData, { merge: true })
        updated++
      } else {
        // Insert new verified nursery listing
        await setDoc(doc(db, 'nurseries', nursery.id), {
          ...nursery,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        added++
      }
    }
  } catch {
    // Firestore offline or not configured
  }

  return { added, updated }
}
