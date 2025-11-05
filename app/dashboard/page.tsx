'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Course, UserProgress, Assessment } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, ClipboardCheck, Award, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    completedAssessments: 0,
    totalTimeSpent: 0,
  })
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  async function loadDashboardData() {
    if (!user) return

    setLoading(true)
    try {
      // Get user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*, courses(*)')
        .eq('user_id', user.id)
        .order('last_accessed_at', { ascending: false })
        .limit(5)

      // Get assessments
      const { data: assessmentData } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })

      // Calculate stats
      const enrolledCount = progress?.length || 0
      const completedCount = progress?.filter((p) => p.status === 'completed').length || 0
      const totalTime = progress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0

      setStats({
        enrolledCourses: enrolledCount,
        completedCourses: completedCount,
        completedAssessments: assessmentData?.length || 0,
        totalTimeSpent: totalTime,
      })

      setRecentCourses(progress || [])
      setAssessments(assessmentData || [])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's an overview of your learning progress
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolledCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Assessments Completed</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedAssessments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(stats.totalTimeSpent / 60)}h</div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {stats.totalTimeSpent % 60}m
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with assessments and courses</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/assessments/mbti">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />
              <span>Take MBTI Assessment</span>
            </Button>
          </Link>
          <Link href="/assessments/tki">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <ClipboardCheck className="h-6 w-6" />
              <span>Take TKI Assessment</span>
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="outline" className="w-full h-auto py-4 flex flex-col items-center gap-2">
              <BookOpen className="h-6 w-6" />
              <span>Browse Courses</span>
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Courses */}
      {recentCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentCourses.map((progress: any) => (
              <div key={progress.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{progress.courses?.title}</h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{progress.progress_percentage}% complete</span>
                    <Badge variant={progress.status === 'completed' ? 'default' : 'secondary'}>
                      {progress.status}
                    </Badge>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${progress.progress_percentage}%` }}
                    />
                  </div>
                </div>
                <Link href={`/courses/${progress.course_id}`}>
                  <Button size="sm" className="ml-4">
                    {progress.status === 'completed' ? 'Review' : 'Continue'}
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Assessments */}
      {assessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Assessments</CardTitle>
            <CardDescription>View your personality and skills assessments</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assessments.map((assessment) => (
              <div key={assessment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold capitalize">{assessment.assessment_type} Assessment</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Completed {new Date(assessment.completed_at).toLocaleDateString()}
                  </p>
                  {assessment.mbti_type && (
                    <Badge className="mt-2">{assessment.mbti_type}</Badge>
                  )}
                  {assessment.tki_primary_mode && (
                    <Badge className="mt-2 capitalize">{assessment.tki_primary_mode}</Badge>
                  )}
                </div>
                <Link href="/assessments/results">
                  <Button size="sm" variant="outline">
                    View Results
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}