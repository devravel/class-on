export type UserRole = 'SECRETARIA' | 'PROFESSOR' | 'ALUNO'

export const ROLE_HOME: Record<UserRole, string> = {
  SECRETARIA: '/secretaria',
  PROFESSOR: '/professor',
  ALUNO: '/aluno',
}

export function getRoleHome(role: UserRole | string | undefined): string {
  if (role === 'SECRETARIA' || role === 'PROFESSOR' || role === 'ALUNO') {
    return ROLE_HOME[role]
  }

  return '/login'
}
