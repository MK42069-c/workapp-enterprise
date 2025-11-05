'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Brain, Users } from 'lucide-react'

export default function AssessmentsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading || !user) {
    return <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Assessments</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Discover your personality and conflict resolution style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="h-8 w-8 text-purple-600" />
              <CardTitle>MBTI Personality Assessment</CardTitle>
            </div>
            <CardDescription>
              Discover your Myers-Briggs personality type
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              A comprehensive 64-question assessment to determine your personality type across four dimensions:
              Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, and Judging/Perceiving.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                64 Questions
              </span>
              <span>15-20 minutes</span>
            </div>
            <Link href="/assessments/mbti">
              <Button className="w-full">
                Take Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <CardTitle>TKI Conflict Resolution</CardTitle>
            </div>
            <CardDescription>
              Identify your conflict resolution style
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              The Thomas-Kilmann Conflict Mode Instrument helps you understand your preferred approach to conflict
              across five modes: Competing, Collaborating, Compromising, Avoiding, and Accommodating.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <ClipboardList className="h-4 w-4" />
                35 Situations
              </span>
              <span>10-15 minutes</span>
            </div>
            <Link href="/assessments/tki">
              <Button className="w-full">
                Take Assessment
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}