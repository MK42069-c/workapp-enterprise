'use client'

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://hdkrfwgcmkxeeazkceiv.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhka3Jmd2djbWt4ZWVhemtjZWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwODM1MTIsImV4cCI6MjA3NzY1OTUxMn0.dQrxkDN24a0yaRr-1DsssacRK3TuhSytWU93UCEOKXY"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AssessmentRecord {
  id: string
  user_id: string
  assessment_type: 'mbti' | 'tki' | 'skills_assessment' | 'learning_style'
  mbti_type?: string
  mbti_confidence_score?: number
  tki_primary_mode?: string
  tki_scores?: any
  raw_results?: any
  percentile_scores?: any
  completed_at: string
  is_valid: boolean
}

export interface CourseProgress {
  id: string
  user_id: string
  course_id: string
  progress_percentage: number
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  started_at: string
  completed_at?: string
  last_accessed_at: string
  time_spent_minutes: number
}

export interface UserStats {
  totalAssessments: number
  totalLearningTime: number
  coursesCompleted: number
  coursesInProgress: number
  achievements: number
  currentStreak: number
  longestStreak: number
}

// Fetch user's assessment history
export async function fetchUserAssessments(userId: string): Promise<AssessmentRecord[]> {
  const { data, error } = await supabase
    .from('user_assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('is_valid', true)
    .order('completed_at', { ascending: false })

  if (error) {
    console.error('Error fetching assessments:', error)
    return []
  }

  return data || []
}

// Fetch user's latest assessment by type
export async function fetchLatestAssessment(
  userId: string, 
  type: 'mbti' | 'tki'
): Promise<AssessmentRecord | null> {
  const { data, error } = await supabase
    .from('user_assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('assessment_type', type)
    .eq('is_valid', true)
    .order('completed_at', { ascending: false })
    .maybeSingle()

  if (error) {
    console.error(`Error fetching ${type} assessment:`, error)
    return null
  }

  return data
}

// Fetch user's course progress
export async function fetchUserProgress(userId: string): Promise<CourseProgress[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .order('last_accessed_at', { ascending: false })

  if (error) {
    console.error('Error fetching progress:', error)
    return []
  }

  return data || []
}

// Calculate user statistics
export async function fetchUserStats(userId: string): Promise<UserStats> {
  try {
    // Fetch assessments
    const assessments = await fetchUserAssessments(userId)
    
    // Fetch course progress
    const progress = await fetchUserProgress(userId)
    
    // Calculate statistics
    const coursesCompleted = progress.filter(p => p.status === 'completed').length
    const coursesInProgress = progress.filter(p => p.status === 'in_progress').length
    const totalLearningTime = progress.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0)
    
    // Calculate streaks (simplified - in production, use learning_activity table)
    const currentStreak = calculateCurrentStreak(progress)
    const longestStreak = Math.max(currentStreak, 14) // Mock for now
    
    // Calculate achievements (based on milestones)
    const achievements = calculateAchievements(assessments.length, coursesCompleted, currentStreak)

    return {
      totalAssessments: assessments.length,
      totalLearningTime,
      coursesCompleted,
      coursesInProgress,
      achievements,
      currentStreak,
      longestStreak,
    }
  } catch (error) {
    console.error('Error calculating stats:', error)
    return {
      totalAssessments: 0,
      totalLearningTime: 0,
      coursesCompleted: 0,
      coursesInProgress: 0,
      achievements: 0,
      currentStreak: 0,
      longestStreak: 0,
    }
  }
}

// Helper function to calculate current streak
function calculateCurrentStreak(progress: CourseProgress[]): number {
  if (progress.length === 0) return 0
  
  const today = new Date()
  const oneDay = 24 * 60 * 60 * 1000
  
  let streak = 0
  let currentDate = today
  
  // Check last 30 days
  for (let i = 0; i < 30; i++) {
    const hasActivity = progress.some(p => {
      const activityDate = new Date(p.last_accessed_at)
      return activityDate.toDateString() === currentDate.toDateString()
    })
    
    if (hasActivity) {
      streak++
      currentDate = new Date(currentDate.getTime() - oneDay)
    } else {
      break
    }
  }
  
  return streak
}

// Helper function to calculate achievements
function calculateAchievements(
  assessments: number, 
  courses: number, 
  streak: number
): number {
  let count = 0
  
  // Assessment achievements
  if (assessments >= 1) count++
  if (assessments >= 2) count++
  if (assessments >= 5) count++
  
  // Course achievements
  if (courses >= 1) count++
  if (courses >= 5) count++
  if (courses >= 10) count++
  
  // Streak achievements
  if (streak >= 7) count++
  if (streak >= 30) count++
  
  return count
}

// Fetch monthly assessment trend
export async function fetchMonthlyTrend(userId: string): Promise<Array<{month: string, count: number}>> {
  const assessments = await fetchUserAssessments(userId)
  
  const monthCounts: { [key: string]: number } = {}
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  // Initialize all months to 0
  months.forEach(month => monthCounts[month] = 0)
  
  // Count assessments per month
  assessments.forEach(assessment => {
    const date = new Date(assessment.completed_at)
    const month = months[date.getMonth()]
    monthCounts[month]++
  })
  
  // Get last 6 months
  const currentMonth = new Date().getMonth()
  const last6Months = []
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12
    last6Months.push({
      month: months[monthIndex],
      count: monthCounts[months[monthIndex]]
    })
  }
  
  return last6Months
}

// Fetch assessment type distribution
export async function fetchTypeDistribution(userId: string): Promise<Array<{name: string, value: number}>> {
  const assessments = await fetchUserAssessments(userId)
  
  const distribution: { [key: string]: number } = {}
  
  assessments.forEach(a => {
    const typeName = a.assessment_type.toUpperCase()
    distribution[typeName] = (distribution[typeName] || 0) + 1
  })
  
  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
  }))
}