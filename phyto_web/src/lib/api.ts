/**
 * FastAPI backend (MySQL + Mongo). Set VITE_API_URL in .env (e.g. http://localhost:8000).
 */
const TOKEN_KEY = 'phyto_access_token'

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

function baseUrl(): string {
  const u = import.meta.env.VITE_API_URL as string | undefined
  if (!u) throw new Error('VITE_API_URL is not set')
  return u.replace(/\/$/, '')
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null

export async function apiFetch<T = Json>(
  path: string,
  init: RequestInit & { json?: Json } = {}
): Promise<T> {
  const { json, headers: h, ...rest } = init
  const headers = new Headers(h)
  if (json !== undefined) {
    headers.set('Content-Type', 'application/json')
    rest.body = JSON.stringify(json)
  }
  const token = getAccessToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${baseUrl()}${path.startsWith('/') ? path : `/${path}`}`, {
    ...rest,
    headers,
  })
  const text = await res.text()
  const data = text ? (JSON.parse(text) as T) : (null as T)
  if (!res.ok) {
    const err = new Error(`API ${res.status}`) as Error & { status: number; body: unknown }
    err.status = res.status
    err.body = data
    throw err
  }
  return data
}
