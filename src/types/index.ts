export type UserRole = 'teacher' | 'student'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export type ExerciseType = 'text' | 'multiple_choice' | 'file_upload' | 'audio'

export interface Exercise {
  id: string
  title: string
  description?: string
  content: string
  type: ExerciseType
  student_id?: string
  teacher_id: string
  due_date?: string
  published: boolean
  attachment_url?: string
  created_at: string
  updated_at: string
  student?: Profile
  submissions?: Submission[]
}

export type SubmissionStatus = 'pending' | 'submitted' | 'reviewed'

export interface Submission {
  id: string
  exercise_id: string
  student_id: string
  content?: string | null
  file_url?: string | null
  status: SubmissionStatus
  submitted_at?: string | null
  created_at: string
  updated_at: string
  exercise?: Exercise
  student?: Profile
  feedback?: Feedback[]
}

export interface Feedback {
  id: string
  submission_id: string
  teacher_id: string
  content: string
  grade?: string
  created_at: string
  updated_at: string
  submission?: Submission
}

export type PostCategory = 'grammar' | 'vocabulary' | 'tips' | 'culture' | 'pronunciation' | 'other'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt?: string
  content: string
  category: PostCategory
  cover_url?: string
  published: boolean
  teacher_id: string
  created_at: string
  updated_at: string
}
