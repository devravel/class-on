export interface Task {
  id: string
  assignment_id: string
  title: string
  description: string
  status: string
  target_mode: string
  deadline: string
  created_at: string
}

export interface CreateTaskRequest {
  assignment_id: string
  title: string
  description: string
  deadline: string
}

export interface TaskSubmissionSummary {
  id: string
  status: string
  observation: string | null
  submitted_at: string
}

export interface StudentTask extends Task {
  assignments: {
    subjects: {
      id: string
      name: string
    }
    teachers: {
      id: string
      full_name: string
      registration_code: string
    }
    classes: {
      series: string
      letter: string
      shift: string
      academic_years: {
        id: string
        year: number
      }
    }
  }
  task_submissions: TaskSubmissionSummary[]
}

export interface SubmitTaskRequest {
  observation?: string
}

export interface TaskSubmissionResponse {
  id: string
  task_id: string
  student_id: string
  status: string
  observation: string | null
  submitted_at: string
  created_at: string
}
