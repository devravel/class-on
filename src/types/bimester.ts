export type BimesterStatus = 'ABERTO' | 'FECHADO'

export interface Bimester {
  id: string
  number: number
  status: BimesterStatus
  year_id: string
}
