'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ProfessorPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  function handleSignOut() {
    signOut()
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4 shadow-light">
        <div className="flex items-center gap-3">
          <Image src="/assets/logo/no_name_logo.svg" alt="ClassOn" width={28} height={26} />
          <span className="text-sm font-semibold text-gray-900">ClassOn — Professor</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleSignOut}
            className="rounded-[8px] bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300 cursor-pointer"
          >
            Sair
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900">Painel do Professor</h1>
        <p className="mt-2 text-sm text-gray-600">Em construção.</p>
      </main>
    </div>
  )
}
