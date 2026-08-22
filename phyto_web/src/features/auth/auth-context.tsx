/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import { apiFetch, getAccessToken, setAccessToken } from '../../lib/api'

export type Role = 'customer' | 'nursery' | 'delivery' | 'admin'

export type User = {
  id: number
  email: string
  name: string
  phone?: string | null
  role: Role
  address_street?: string | null
  address_city?: string | null
  address_state?: string | null
  address_zip?: string | null
  profile_image_url?: string | null
}

export type RegisterData = {
  email: string
  password: string
  name: string
  phone?: string
  role?: Role
  address_street?: string
  address_city?: string
  address_state?: string
  address_zip?: string
}

type AuthState = {
  user: User | null
  role: Role | null
  loading: boolean
  firebaseReady: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => void
}

const AuthCtx = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
  firebaseReady: true,
  login: async () => {
    throw new Error('AuthProvider not initialized')
  },
  register: async () => {
    throw new Error('AuthProvider not initialized')
  },
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const role = user?.role ?? null

  const fetchCurrentUser = useCallback(async () => {
    const token = getAccessToken()
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const me = await apiFetch<User>('/auth/me')
      setUser(me)
    } catch {
      setAccessToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCurrentUser()
  }, [fetchCurrentUser])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await apiFetch<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      json: { email, password },
    })
    setAccessToken(res.access_token)
    setUser(res.user)
    return res.user
  }, [])

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    const res = await apiFetch<{ access_token: string; user: User }>('/auth/register', {
      method: 'POST',
      json: data,
    })
    setAccessToken(res.access_token)
    setUser(res.user)
    return res.user
  }, [])

  const logout = useCallback(() => {
    setAccessToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      firebaseReady: true,
      login,
      register,
      logout,
    }),
    [user, role, loading, login, register, logout]
  )

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export function useAuth() {
  return useContext(AuthCtx)
}
