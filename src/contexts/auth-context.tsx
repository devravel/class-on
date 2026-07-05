'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

import {
  clearSession,
  getAccessToken,
  getStoredUser,
  setSession,
} from '@/lib/auth-storage'

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function validateSession(
  token: string,
): Promise<
  | { status: 'valid'; user: AuthUser }
  | { status: 'invalid' }
  | { status: 'unavailable' }
> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.status === 401 || response.status === 403) {
      return { status: 'invalid' }
    }

    if (!response.ok) {
      return { status: 'unavailable' }
    }

    const me = (await response.json()) as AuthUser
    return { status: 'valid', user: me }
  } catch {
    return { status: 'unavailable' }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const restoreSession = async () => {
      const storedToken = getAccessToken()
      const storedUser = getStoredUser()

      if (!storedToken) {
        clearSession()
        if (isMounted) setIsLoading(false)
        return
      }

      const validation = await validateSession(storedToken)

      if (!isMounted) return

      if (validation.status === 'valid') {
        setSession(storedToken, validation.user)
        setToken(storedToken)
        setUser(validation.user)
        setIsLoading(false)
        return
      }

      if (validation.status === 'invalid') {
        clearSession()
        setToken(null)
        setUser(null)
        setIsLoading(false)
        return
      }

      if (storedUser) {
        setSession(storedToken, storedUser)
        setToken(storedToken)
        setUser(storedUser)
        setIsLoading(false)
        return
      }

      clearSession()
      setToken(null)
      setUser(null)
      setIsLoading(false)
    }

    void restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  const signIn = useCallback((newToken: string, newUser: AuthUser) => {
    setSession(newToken, newUser)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
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
