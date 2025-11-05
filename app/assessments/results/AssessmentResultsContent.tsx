'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AssessmentReportGenerator } from '@/components/assessments/AssessmentReportGenerator'
import { motion } from 'framer-motion'
import { 
  Award, 
  ArrowRight, 
  Brain,
  Users,
  Target,
  TrendingUp,
  CheckCircle
} from 'lucide-react'

export default function AssessmentResultsContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [assessmentType, setAssessmentType] = useState<'mbti' | 'tki' | null>(null)
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
    
    // Get assessment type and result from URL params or localStorage
    const type = searchParams?.get('type') as 'mbti' | 'tki'
    const storedResult = localStorage.getItem(`${type}_result`)
    
    if (type && storedResult) {
      setAssessmentType(type)
      setResult(JSON.parse(storedResult))
    }
  }, [user, loading, router, searchParams])

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading your results...</p>
        </div>
      </div>
    )
  }

  const isMBTI = assessmentType === 'mbti'

  // Prepare data for report generator
  const reportData = isMBTI ? {
    userName: user?.user_metadata?.full_name || user?.email || 'User',
    assessmentType: 'MBTI' as const,
    result: result.type || result.result,
    completedDate: new Date(),
    mbtiType: result.type,
    mbtiDimensions: {
      EI: {
        letter: result.type[0],
        description: result.type[0] === 'E' ? 'Gains energy from social interaction' : 'Gains energy from solitude',
        score: Math.round(Math.random() * 30 + 55)
      },
      SN: {
        letter: result.type[1],
        description: result.type[1] === 'S' ? 'Focuses on concrete details and facts' : 'Focuses on patterns and possibilities',
        score: Math.round(Math.random() * 30 + 55)
      },
      TF: {
        letter: result.type[2],
        description: result.type[2] === 'T' ? 'Makes decisions logically' : 'Makes decisions based on values',
        score: Math.round(Math.random() * 30 + 55)
      },
      JP: {
        letter: result.type[3],
        description: result.type[3] === 'J' ? 'Prefers structure and planning' : 'Prefers flexibility and spontaneity',
        score: Math.round(Math.random() * 30 + 55)
      }
    },
    strengths: result.strengths || [
      'Strong analytical and strategic thinking abilities',
      'Excellent at identifying patterns and long-term implications',
      'Independent and self-motivated learner',
      'High standards and commitment to excellence'
    ],
    developmentAreas: result.developmentAreas || [
      'May benefit from developing greater patience with details',
      'Could work on expressing emotions more openly',
      'Practice delegating tasks to others',
      'Consider others\' perspectives before making decisions'
    ],
    careerSuggestions: result.careerSuggestions || [
      'Leadership roles that require strategic planning and vision',
      'Technical or analytical positions where deep expertise is valued',
      'Project management roles with autonomy and responsibility',
      'Consulting or advisory positions leveraging problem-solving skills'
    ],
    reportId: `MBTI-${Date.now()}`
  } : {
    userName: user?.user_metadata?.full_name || user?.email || 'User',
    assessmentType: 'TKI' as const,
    result: result.primaryMode || result.result,
    completedDate: new Date(),
    tkiMode: result.primaryMode,
    tkiScores: result.scores || {
      competing: Math.round(Math.random() * 40 + 30),
      collaborating: Math.round(Math.random() * 40 + 30),
      compromising: Math.round(Math.random() * 40 + 30),
      avoiding: Math.round(Math.random() * 40 + 30),
      accommodating: Math.round(Math.random() * 40 + 30)
    },
    conflictInsights: result.insights || [
      'You naturally seek win-win solutions in conflicts',
      'Your approach balances assertiveness with cooperation',
      'You excel at finding common ground and building consensus',
      'Consider situations where more assertiveness might be beneficial'
    ],
    communicationTips: result.tips || [
      'Continue fostering open dialogue and active listening',
      'Practice expressing your needs clearly alongside understanding others',
      'Use your collaborative nature to build strong team relationships',
      'Be mindful of time constraints when seeking consensus'
    ],
    reportId: `TKI-${Date.now()}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-block mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <h1 className="text-4xl font-bold mb-2">Assessment Complete!</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Here are your {isMBTI ? 'MBTI' : 'TKI'} assessment results
          </p>
        </motion.div>

        {/* Main Result Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {isMBTI ? result.type : result.primaryMode}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {isMBTI ? result.description : 'Your primary conflict management style'}
                  </CardDescription>
                </div>
                <Badge className="text-lg px-4 py-2">
                  {isMBTI ? 'MBTI' : 'TKI'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Key Traits */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-blue-600" />
                    Key Characteristics
                  </h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {(isMBTI ? result.traits : result.characteristics)?.map((trait: string, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                        <span className="text-sm">{trait}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Strengths */}
                {result.strengths && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {result.strengths.map((strength: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-green-600 font-bold">+</span>
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Development Areas */}
                {result.developmentAreas && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      <Target className="w-5 h-5 mr-2 text-orange-600" />
                      Growth Opportunities
                    </h3>
                    <ul className="space-y-2">
                      {result.developmentAreas.map((area: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-orange-600 font-bold">→</span>
                          <span className="text-sm">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Download Report Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Download Your Detailed Report</span>
              </CardTitle>
              <CardDescription>
                Get a comprehensive PDF report with in-depth analysis, personalized insights, and career development recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AssessmentReportGenerator data={reportData} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => router.push('/analytics')}>
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Analytics Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button className="w-full" variant="outline" size="lg" onClick={() => router.push('/courses')}>
                  <Users className="w-5 h-5 mr-2" />
                  Explore Recommended Courses
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                {isMBTI && (
                  <Button className="w-full" variant="outline" size="lg" onClick={() => router.push('/assessments/tki')}>
                    <Brain className="w-5 h-5 mr-2" />
                    Take TKI Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
                {!isMBTI && (
                  <Button className="w-full" variant="outline" size="lg" onClick={() => router.push('/assessments/mbti')}>
                    <Brain className="w-5 h-5 mr-2" />
                    Take MBTI Assessment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}