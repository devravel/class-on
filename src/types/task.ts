export interface Task {
  id: string
  assignment_id: string
  title: string
  description: string
  status: string
  target_mode: string
  deadline: string
  created_at: string
  assignments?: {
    subjects: {
      id: string
      name: string
    }
    classes: {
      id?: string
      series: number | string
      letter: string
      shift: string
      education_level?: 'FUNDAMENTAL' | 'MEDIO'
      academic_years: {
        id: string
        year: number
      }
    }
  }
}

export interface CreateTaskRequest {
  assignment_id: string
  title: string
  description: string
  deadline: string
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  deadline?: string
  status?: 'OPEN' | 'CLOSED'
}

export interface TaskStudentSubmission {
  student: {
    id: string
    full_name: string
    rm: string
  }
  submission: {
    status: string
    observation: string | null
    submitted_at: string | null
  }
}

export interface TaskSubmissionsResponse {
  task: Task
  submissions: TaskStudentSubmission[]
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
