import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ROLE_ROUTE_PREFIXES = {
  '/secretaria': 'SECRETARIA',
  '/professor': 'PROFESSOR',
  '/aluno': 'ALUNO',
} as const

const ROLE_HOME: Record<string, string> = {
  SECRETARIA: '/secretaria',
  PROFESSOR: '/professor',
  ALUNO: '/aluno',
}

function matchesRolePrefix(pathname: string): keyof typeof ROLE_ROUTE_PREFIXES | null {
  for (const prefix of Object.keys(ROLE_ROUTE_PREFIXES) as Array<
    keyof typeof ROLE_ROUTE_PREFIXES
  >) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return prefix
    }
  }

  return null
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value
  const role = request.cookies.get('auth_role')?.value
  const rolePrefix = matchesRolePrefix(pathname)

  if (rolePrefix) {
    const requiredRole = ROLE_ROUTE_PREFIXES[rolePrefix]

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (role !== requiredRole) {
      const destination = role ? ROLE_HOME[role] ?? '/login' : '/login'
      return NextResponse.redirect(new URL(destination, request.url))
    }
  }

  if (pathname === '/login' && token && role && ROLE_HOME[role]) {
    return NextResponse.redirect(new URL(ROLE_HOME[role], request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/secretaria/:path*', '/professor/:path*', '/aluno/:path*', '/login'],
}
