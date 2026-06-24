'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { AnnouncementList } from '@/components/announcements/AnnouncementList'

export default function ProfessorComunicadosPage() {
  return (
    <PageContainer>
      <AnnouncementList
        showCreateButton={true}
        emptyMessage="Nenhum comunicado encontrado. Você pode criar comunicados para suas turmas atribuídas."
      />
    </PageContainer>
  )
}