/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react'
import type { Product } from '../catalog/types'
import { useAuth } from '../auth/auth-context'
import { apiFetch, getAccessToken } from '../../lib/api'

export type CartItem = {
  id?: number
  product: Product
  quantity: number
  includeKit: boolean
  addService: boolean
}

type CartState = {
  items: Record<string, CartItem>
}

type Action =
  | { type: 'setAll'; items: CartItem[] }
  | { type: 'add'; product: Product; quantity?: number; includeKit?: boolean; addService?: boolean }
  | { type: 'remove'; id: string }
  | { type: 'setQty'; id: string; quantity: number }
  | { type: 'setOptions'; id: string; includeKit: boolean; addService: boolean }
  | { type: 'clear' }

const CartCtx = createContext<{
  items: CartItem[]
  totalItems: number
  subtotal: number
  addToCart: (p: Product, opts?: { quantity?: number; includeKit?: boolean; addService?: boolean }) => Promise<void>
  removeFromCart: (id: string) => Promise<void>
  setQty: (id: string, quantity: number) => Promise<void>
  setOptions: (id: string, opts: { includeKit: boolean; addService: boolean }) => Promise<void>
  clear: () => Promise<void>
  syncWithServer: () => Promise<void>
} | null>(null)

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'setAll': {
      const mapped: Record<string, CartItem> = {}
      for (const it of action.items) {
        mapped[it.product.id] = it
      }
      return { items: mapped }
    }
    case 'add': {
      const id = String(action.product.id)
      const existing = state.items[id]
      const nextQty = (existing?.quantity ?? 0) + (action.quantity ?? 1)
      return {
        items: {
          ...state.items,
          [id]: {
            id: existing?.id,
            product: action.product,
            quantity: Math.max(1, nextQty),
            includeKit: action.includeKit ?? existing?.includeKit ?? false,
            addService: action.addService ?? existing?.addService ?? false,
          },
        },
      }
    }
    case 'remove': {
      const { [action.id]: removed, ...rest } = state.items
      void removed
      return { items: rest }
    }
    case 'setQty': {
      const it = state.items[action.id]
      if (!it) return state
      return { items: { ...state.items, [action.id]: { ...it, quantity: Math.max(1, action.quantity) } } }
    }
    case 'setOptions': {
      const it = state.items[action.id]
      if (!it) return state
      return {
        items: {
          ...state.items,
          [action.id]: {
            ...it,
            includeKit: action.includeKit,
            addService: action.addService,
          },
        },
      }
    }
    case 'clear':
      return { items: {} }
    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { items: {} })
  const { user } = useAuth()

  const syncWithServer = useCallback(async () => {
    const token = getAccessToken()
    if (!token) return

    try {
      type ApiCartItem = {
        id: number
        product_id: number
        quantity: number
        include_kit: boolean
        include_service: boolean
        product?: {
          id: number
          name: string
          description?: string
          price: number
          type?: string
          sunlight?: string
          environment?: string
          image_url?: string
          popularity_score?: number
          tags?: Array<{ tag: string }>
        }
      }
      type ApiCart = {
        items: ApiCartItem[]
      }
      const cart = await apiFetch<ApiCart>('/cart')
      if (cart && Array.isArray(cart.items)) {
        const mappedItems: CartItem[] = cart.items
          .filter((it) => it.product)
          .map((it) => ({
            id: it.id,
            quantity: it.quantity,
            includeKit: it.include_kit,
            addService: it.include_service,
            product: {
              id: String(it.product!.id),
              name: it.product!.name,
              description: it.product!.description || '',
              price: it.product!.price,
              type: (it.product!.type as any) || 'plants',
              sunlight: (it.product!.sunlight as any) || 'partial',
              environment: (it.product!.environment as any) || 'indoor',
              smell: 'mild',
              popularity: it.product!.popularity_score || 0,
              imageUrl: it.product!.image_url,
              tags: (it.product!.tags || []).map((t) => t.tag as any),
              care: { water: 'Weekly', sunlight: 'Moderate' },
            },
          }))
        dispatch({ type: 'setAll', items: mappedItems })
      }
    } catch {
      // Best-effort server sync
    }
  }, [])

  useEffect(() => {
    if (user) {
      syncWithServer()
    }
  }, [user, syncWithServer])

  const addToCart = useCallback(
    async (p: Product, opts?: { quantity?: number; includeKit?: boolean; addService?: boolean }) => {
      dispatch({ type: 'add', product: p, ...opts })
      if (getAccessToken()) {
        try {
          const numId = Number(p.id)
          if (!isNaN(numId)) {
            await apiFetch('/cart/items', {
              method: 'POST',
              json: {
                product_id: numId,
                quantity: opts?.quantity ?? 1,
                include_kit: opts?.includeKit ?? false,
                include_service: opts?.addService ?? false,
              },
            })
            await syncWithServer()
          }
        } catch {
          // Fallback to local state
        }
      }
    },
    [syncWithServer]
  )

  const removeFromCart = useCallback(
    async (id: string) => {
      const it = state.items[id]
      dispatch({ type: 'remove', id })
      if (getAccessToken() && it?.id) {
        try {
          await apiFetch(`/cart/items/${it.id}`, { method: 'DELETE' })
        } catch {
          // Fallback to local state
        }
      }
    },
    [state.items]
  )

  const setQty = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        await removeFromCart(id)
        return
      }
      const it = state.items[id]
      dispatch({ type: 'setQty', id, quantity })
      if (getAccessToken() && it?.id) {
        try {
          await apiFetch(`/cart/items/${it.id}`, {
            method: 'PATCH',
            json: { quantity },
          })
        } catch {
          // Fallback to local state
        }
      }
    },
    [state.items, removeFromCart]
  )

  const setOptions = useCallback(
    async (id: string, opts: { includeKit: boolean; addService: boolean }) => {
      const it = state.items[id]
      dispatch({ type: 'setOptions', id, ...opts })
      if (getAccessToken() && it?.id) {
        try {
          await apiFetch(`/cart/items/${it.id}`, {
            method: 'PATCH',
            json: {
              include_kit: opts.includeKit,
              include_service: opts.addService,
            },
          })
        } catch {
          // Fallback to local state
        }
      }
    },
    [state.items]
  )

  const clear = useCallback(async () => {
    dispatch({ type: 'clear' })
    if (getAccessToken()) {
      try {
        await apiFetch('/cart', { method: 'DELETE' })
      } catch {
        // Fallback to local state
      }
    }
  }, [])

  const items = useMemo(() => Object.values(state.items), [state.items])
  const totalItems = useMemo(() => items.reduce((acc, it) => acc + it.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((acc, it) => acc + it.quantity * it.product.price, 0), [items])

  const value = useMemo(
    () => ({
      items,
      totalItems,
      subtotal,
      addToCart,
      removeFromCart,
      setQty,
      setOptions,
      clear,
      syncWithServer,
    }),
    [items, totalItems, subtotal, addToCart, removeFromCart, setQty, setOptions, clear, syncWithServer]
  )

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
