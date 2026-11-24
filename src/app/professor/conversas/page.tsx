'use client'

import { ConversationsView } from '@/components/conversations/ConversationsView'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeaderTitle } from '@/contexts/page-header-context'

export default function ConversasPage() {
  return (
    <PageContainer>
      <PageHeaderTitle title="Conversas" />
      <ConversationsView role="PROFESSOR" />
    </PageContainer>
  )
}
