'use client'

import { PageHeaderTitle } from '@/contexts/page-header-context'

interface DashboardPageHeaderProps {
  title: string
}

export function DashboardPageHeader({ title }: DashboardPageHeaderProps) {
  return <PageHeaderTitle title={title} />
}
