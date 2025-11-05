'use client'

import { supabase } from './analytics-service'

export interface AIRecommendation {
  title: string
  reason: string
  priority: 'high' | 'medium' | 'low'
  category: string
}

export interface RecommendationResponse {
  recommendations: AIRecommendation[]
  source: 'ai' | 'rules'
  model: string
}

const AI_RECOMMENDATIONS_URL = 'https://hdkrfwgcmkxeeazkceiv.supabase.co/functions/v1/ai-recommendations'

export async function getAIRecommendations(
  mbtiType?: string,
  tkiMode?: string,
  currentCourses?: string[],
  completedCourses?: string[]
): Promise<RecommendationResponse> {
  try {
    // Get the current user's session token
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      throw new Error('User not authenticated')
    }

    const response = await fetch(AI_RECOMMENDATIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mbtiType,
        tkiMode,
        currentCourses: currentCourses || [],
        completedCourses: completedCourses || [],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to fetch recommendations')
    }

    const result = await response.json()
    return result.data
  } catch (error) {
    console.error('Error fetching AI recommendations:', error)
    
    // Fallback to simple recommendations
    return {
      recommendations: [
        {
          title: 'Complete Your Assessments',
          reason: 'Take MBTI and TKI assessments to receive personalized recommendations',
          priority: 'high',
          category: 'Getting Started'
        },
        {
          title: 'Explore Course Catalog',
          reason: 'Browse available courses across various categories',
          priority: 'medium',
          category: 'Learning'
        }
      ],
      source: 'rules',
      model: 'fallback'
    }
  }
}

// Fetch user's course data for recommendations
export async function getUserCourseData(userId: string): Promise<{
  currentCourses: string[]
  completedCourses: string[]
}> {
  try {
    const { data: progress, error } = await supabase
      .from('user_progress')
      .select('course_id, status')
      .eq('user_id', userId)

    if (error) throw error

    // Fetch course names
    if (!progress || progress.length === 0) {
      return { currentCourses: [], completedCourses: [] }
    }

    const courseIds = progress.map(p => p.course_id)
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id, title')
      .in('id', courseIds)

    if (coursesError) throw coursesError

    const courseMap = new Map(courses?.map(c => [c.id, c.title]) || [])

    const currentCourses = progress
      .filter(p => p.status === 'in_progress')
      .map(p => courseMap.get(p.course_id))
      .filter(Boolean) as string[]

    const completedCourses = progress
      .filter(p => p.status === 'completed')
      .map(p => courseMap.get(p.course_id))
      .filter(Boolean) as string[]

    return { currentCourses, completedCourses }
  } catch (error) {
    console.error('Error fetching user course data:', error)
    return { currentCourses: [], completedCourses: [] }
  }
}