'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Award, 
  Clock, 
  Target,
  Calendar
} from 'lucide-react'

interface AssessmentData {
  type: string
  result: string
  score?: number
  completedAt: Date
}

interface AssessmentAnalyticsProps {
  assessments: AssessmentData[]
  learningTime: number // in minutes
  coursesCompleted: number
  achievements: number
}

export function AssessmentAnalytics({ 
  assessments, 
  learningTime, 
  coursesCompleted,
  achievements 
}: AssessmentAnalyticsProps) {
  // Calculate statistics
  const totalAssessments = assessments.length
  const avgScore = assessments.reduce((acc, a) => acc + (a.score || 0), 0) / totalAssessments || 0
  
  // Monthly trend data
  const monthlyData = getMonthlyTrend(assessments)
  
  // Assessment type distribution
  const typeDistribution = getTypeDistribution(assessments)

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssessments}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-medium">Learning Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(learningTime / 60)}h</div>
            <p className="text-xs text-gray-500">{learningTime % 60}m</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesCompleted}</div>
            <p className="text-xs text-gray-500">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements}</div>
            <p className="text-xs text-gray-500">Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Placeholder - Will render charts on client */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assessment Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <div className="text-center space-y-2">
                <TrendingUp className="h-12 w-12 mx-auto text-blue-600" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Assessment progress chart
                </p>
                <div className="flex items-center justify-center space-x-4 text-sm">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="text-center">
                      <div className="font-bold text-blue-600">{d.count}</div>
                      <div className="text-gray-500">{d.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="space-y-3 w-full">
                {typeDistribution.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-500">{item.value} completed</span>
                    </div>
                    <Progress value={(item.value / totalAssessments) * 100} />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assessments.slice(0, 5).map((assessment, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline">{assessment.type}</Badge>
                    <span className="font-medium">{assessment.result}</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(assessment.completedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                {assessment.score && (
                  <div className="text-right">
                    <div className="text-2xl font-bold">{assessment.score}%</div>
                    <Progress value={assessment.score} className="w-24 mt-1" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Skills & Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Personality Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Analytical Thinking</span>
                <span className="text-sm text-gray-500">85%</span>
              </div>
              <Progress value={85} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Creative Problem Solving</span>
                <span className="text-sm text-gray-500">72%</span>
              </div>
              <Progress value={72} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Leadership Potential</span>
                <span className="text-sm text-gray-500">68%</span>
              </div>
              <Progress value={68} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Team Collaboration</span>
                <span className="text-sm text-gray-500">90%</span>
              </div>
              <Progress value={90} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function getMonthlyTrend(assessments: AssessmentData[]) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month, index) => ({
    month,
    count: Math.floor(Math.random() * 5) + 1, // Mock data
  }))
}

function getTypeDistribution(assessments: AssessmentData[]) {
  const distribution: { [key: string]: number } = {}
  assessments.forEach(a => {
    distribution[a.type] = (distribution[a.type] || 0) + 1
  })
  
  return Object.entries(distribution).map(([name, value]) => ({
    name,
    value,
  }))
}