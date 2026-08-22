import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
}

const apiKey = String(firebaseConfig.apiKey ?? '')
const configured = apiKey.length > 8 && apiKey !== 'undefined'

let firebaseApp: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (configured) {
  try {
    firebaseApp = initializeApp(firebaseConfig as Record<string, string>)
    auth = getAuth(firebaseApp)
    db = getFirestore(firebaseApp)
  } catch {
    firebaseApp = null
    auth = null
    db = null
  }
}

export { firebaseApp, auth, db }
export const firebaseEnabled = configured && auth !== null
