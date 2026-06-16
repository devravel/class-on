'use client'

import { PageContainer } from '@/components/layout/PageContainer'
import { AnnouncementList } from '@/components/announcements/AnnouncementList'

export default function SecretariaComunicadosPage() {
  return (
    <PageContainer>
      <AnnouncementList 
        title="Comunicados"
        showCreateButton={true}
        emptyMessage="Nenhum comunicado criado ainda. Crie o primeiro comunicado para a comunidade escolar."
      />
    </PageContainer>
  )
}