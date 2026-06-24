import { UserRole } from "@/contexts/auth-context";

export interface TeacherProfile {
  id: string;
  user_id: string;
  full_name: string;
  registration_code: string;
}

export interface StudentClassInfo {
  series: number;
  letter: string;
  education_level: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  rm: string;
  full_name: string;
  status: string;
  current_class?: StudentClassInfo;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  role: UserRole;
  teacher?: TeacherProfile;
  student?: StudentProfile;
}
