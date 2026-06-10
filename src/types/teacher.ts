export interface TeacherUser {
  id: string
  email: string
  role: string
  is_active: boolean
  created_at: string
}

export interface Teacher {
  id: string
  user_id: string
  full_name: string
  registration_code: string
  users: TeacherUser
}

export interface CreateTeacherResponse {
  teacher: Teacher
  provisional_password: string
}

export interface CreateTeacherRequest {
  full_name: string
  email: string
  registration_code: string
}

export interface UpdateTeacherRequest {
  full_name?: string
  email?: string
  registration_code?: string
  is_active?: boolean
}
