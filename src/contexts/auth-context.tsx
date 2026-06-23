'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type UserRole = 'SECRETARIA' | 'PROFESSOR' | 'ALUNO'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (token: string, user: AuthUser) => void
  signOut: () => void
}

const TOKEN_KEY = 'access_token'
const USER_KEY = 'auth_user'
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function setAuthCookies(token: string, role: UserRole) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  document.cookie = `auth_token=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
  document.cookie = `auth_role=${role}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax${secure}`
}

function clearAuthCookies() {
  document.cookie = 'auth_token=; path=/; max-age=0; SameSite=Lax'
  document.cookie = 'auth_role=; path=/; max-age=0; SameSite=Lax'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    const storedUser = localStorage.getItem(USER_KEY)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser
        setToken(storedToken)
        setUser(parsedUser)
        setAuthCookies(storedToken, parsedUser.role)
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
        clearAuthCookies()
      }
    }

    setIsLoading(false)
  }, [])

  const signIn = useCallback((newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, newToken)
    localStorage.setItem(USER_KEY, JSON.stringify(newUser))
    setAuthCookies(newToken, newUser.role)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    clearAuthCookies()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      signIn,
      signOut,
    }),
    [isLoading, signIn, signOut, token, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider.')
  }

  return context
}
