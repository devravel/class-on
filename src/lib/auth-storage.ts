export const TOKEN_KEY = 'access_token'
export const USER_KEY = 'auth_user'
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export type AuthRole = 'SECRETARIA' | 'PROFESSOR' | 'ALUNO'

export interface StoredAuthUser {
  id: string
  email: string
  role: AuthRole
}

function getTokenFromCookie(): string | null {
  if (typeof document === 'undefined') return null

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=')
    if (name === 'auth_token') {
      const value = rest.join('=')
      return value ? decodeURIComponent(value) : null
    }
  }

  return null
}

export function setAuthCookies(token: string, role: AuthRole) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
  document.cookie = `auth_role=${role}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

export function clearAuthCookies() {
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax'
  document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Lax'
}

export function getStoredUser(): StoredAuthUser | null {
  if (typeof window === 'undefined') return null

  const storedUser = localStorage.getItem(USER_KEY)
  if (!storedUser) return null

  try {
    return JSON.parse(storedUser) as StoredAuthUser
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null

  const fromStorage = localStorage.getItem(TOKEN_KEY)
  if (fromStorage) return fromStorage

  const fromCookie = getTokenFromCookie()
  if (fromCookie) {
    localStorage.setItem(TOKEN_KEY, fromCookie)
    return fromCookie
  }

  return null
}

export function setSession(token: string, user: StoredAuthUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  setAuthCookies(token, user.role)
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
  clearAuthCookies()
}
