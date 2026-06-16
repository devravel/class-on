'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { AnnouncementList } from '@/components/announcements/AnnouncementList'

export default function AlunoComunicadosPage() {
  return (
    <PageContainer>
      <AnnouncementList 
        title="Meus Comunicados"
        showCreateButton={false}
        emptyMessage="Você não possui comunicados no momento. Comunicados da escola e de seus professores aparecerão aqui."
      />
    </PageContainer>
  )
}