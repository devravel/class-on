'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AlunoPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  function handleSignOut() {
    signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <header className="flex items-center justify-between border-b border-border bg-surface px-8 py-4 shadow-light">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo/no_name_logo.svg" alt="ClassOn" width={28} height={26} />
          <span className="text-sm font-semibold text-text-primary">ClassOn — Aluno</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="cursor-pointer rounded-[8px] bg-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-300"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-8 py-10">
        <h1 className="text-2xl font-bold text-text-primary">Painel do Aluno</h1>
        <p className="mt-2 text-sm text-text-secondary">Em construção.</p>
      </main>
    </div>
  )
}
