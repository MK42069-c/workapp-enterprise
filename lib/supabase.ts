import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export type User = {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  department?: string
  job_title?: string
  experience_level?: 'entry' | 'junior' | 'mid' | 'senior' | 'executive'
  bio?: string
  created_at: string
  updated_at: string
}

export type Course = {
  id: string
  title: string
  description?: string
  short_description?: string
  category: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration_minutes?: number
  instructor_name?: string
  instructor_bio?: string
  thumbnail_url?: string
  content_url?: string
  status: 'draft' | 'published' | 'archived'
  tags?: string[]
  rating?: number
  total_ratings?: number
  enrollment_count?: number
  completion_rate?: number
  created_at: string
  updated_at: string
}

export type UserProgress = {
  id: string
  user_id: string
  course_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  progress_percentage: number
  time_spent_minutes: number
  last_accessed_at: string
  started_at?: string
  completed_at?: string
  notes?: string
  personal_rating?: number
  created_at: string
  updated_at: string
}

export type Assessment = {
  id: string
  user_id: string
  assessment_type: 'mbti' | 'tki' | 'skills_assessment' | 'learning_style'
  mbti_type?: string
  mbti_confidence_score?: number
  tki_primary_mode?: string
  tki_scores?: Record<string, number>
  raw_results?: any
  percentile_scores?: any
  completed_at: string
  is_valid: boolean
}