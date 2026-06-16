export interface Subject {
  id: string
  name: string
  description: string
}

export interface CreateSubjectRequest {
  name: string
  description: string
}

export interface UpdateSubjectRequest {
  name?: string
  description?: string
}
