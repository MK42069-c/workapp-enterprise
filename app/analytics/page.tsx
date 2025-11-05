'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'
import { motion } from 'framer-motion'
import { 
  Brain, 
  BookOpen, 
  Award, 
  TrendingUp,
  ArrowRight,
  Calendar,
  Clock,
  Target,
  Sparkles
} from 'lucide-react'
import {
  fetchUserAssessments,
  fetchUserStats,
  fetchMonthlyTrend,
  fetchTypeDistribution,
  fetchLatestAssessment,
  type AssessmentRecord
} from '@/lib/analytics-service'
import {
  getAIRecommendations,
  getUserCourseData,
  type AIRecommendation
} from '@/lib/ai-recommendations-service'
import { AssessmentAnalytics } from '@/components/analytics/AssessmentAnalytics'
import { CertificateGenerator } from '@/components/certificates/CertificateGenerator'

export default function AnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [stats, setStats] = useState({
    totalAssessments: 0,
    totalLearningTime: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    achievements: 0,
    currentStreak: 0,
    longestStreak: 0,
  })
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [recommendationSource, setRecommendationSource] = useState<string>('')
  const [loadingRecommendations, setLoadingRecommendations] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    } else if (user) {
      loadData()
    }
  }, [user, loading, router])

  const loadData = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)

      // Fetch all analytics data
      const [assessmentsData, statsData] = await Promise.all([
        fetchUserAssessments(user.id),
        fetchUserStats(user.id),
      ])

      setAssessments(assessmentsData)
      setStats(statsData)

      // Fetch AI recommendations
      loadRecommendations(user.id)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecommendations = async (userId: string) => {
    try {
      setLoadingRecommendations(true)

      // Fetch latest assessments
      const [mbtiAssessment, tkiAssessment] = await Promise.all([
        fetchLatestAssessment(userId, 'mbti'),
        fetchLatestAssessment(userId, 'tki'),
      ])

      // Fetch course data
      const { currentCourses, completedCourses } = await getUserCourseData(userId)

      // Get AI recommendations
      const result = await getAIRecommendations(
        mbtiAssessment?.mbti_type,
        tkiAssessment?.tki_primary_mode,
        currentCourses,
        completedCourses
      )

      setRecommendations(result.recommendations)
      setRecommendationSource(result.source === 'ai' ? result.model : 'rule-based')
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setLoadingRecommendations(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  const certificateData = {
    userName: user?.user_metadata?.full_name || user?.email || 'User',
    courseName: 'Advanced JavaScript Programming',
    completionDate: new Date(),
    score: 92,
    skills: ['ES6+ Features', 'Async Programming', 'API Integration', 'Testing'],
    certificateId: `CERT-${Date.now()}`,
  }

  // Prepare data for AssessmentAnalytics component
  const analyticsData = assessments.map(a => ({
    type: a.assessment_type.toUpperCase(),
    result: a.mbti_type || a.tki_primary_mode || 'Completed',
    score: a.mbti_confidence_score ? Math.round(a.mbti_confidence_score * 100) : undefined,
    completedAt: new Date(a.completed_at),
  }))

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Learning Analytics</h1>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your progress and insights across all assessments and courses
          </p>
        </motion.div>

        {/* Main Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <AssessmentAnalytics
            assessments={analyticsData}
            learningTime={stats.totalLearningTime}
            coursesCompleted={stats.coursesCompleted}
            achievements={stats.achievements}
          />
        </motion.div>

        {/* AI-Powered Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <span>AI-Powered Recommendations</span>
                <Badge variant="outline" className="ml-auto text-xs">
                  {recommendationSource}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingRecommendations ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : recommendations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Complete your assessments to receive personalized recommendations</p>
                  <Button className="mt-4" onClick={() => router.push('/assessments')}>
                    Take Assessments
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                        rec.priority === 'high'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : rec.priority === 'medium'
                          ? 'border-green-600 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-300 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <BookOpen className={`h-5 w-5 ${
                            rec.priority === 'high' ? 'text-blue-600' :
                            rec.priority === 'medium' ? 'text-green-600' : 'text-gray-600'
                          }`} />
                          <div>
                            <p className="font-medium">{rec.title}</p>
                            <Badge variant="outline" className="text-xs mt-1">{rec.category}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 ml-8">
                          {rec.reason}
                        </p>
                      </div>
                      <Button size="sm" variant={rec.priority === 'high' ? 'default' : 'outline'} onClick={() => router.push('/courses')}>
                        Explore
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Certificate Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-yellow-600" />
                <span>Your Certificates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.coursesCompleted > 0 ? (
                <CertificateGenerator data={certificateData} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Award className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Complete courses to earn certificates</p>
                  <Button className="mt-4" onClick={() => router.push('/courses')}>
                    Browse Courses
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Learning Streak */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <span>Learning Streak</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                  <div className="text-3xl font-bold text-blue-600">{stats.currentStreak}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Current Streak (days)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                  <div className="text-3xl font-bold text-purple-600">{stats.longestStreak}</div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Longest Streak (days)</p>
                </div>
                <div className="text-center p-4 border rounded-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                  <div className="text-3xl font-bold text-orange-600">
                    {stats.currentStreak > 0 ? Math.round((stats.currentStreak / stats.longestStreak) * 100) : 0}%
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Consistency Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}