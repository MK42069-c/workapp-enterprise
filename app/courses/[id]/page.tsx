import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { CourseDetail } from '@/components/courses/CourseDetail'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface CoursePageProps {
  params: {
    id: string
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-6xl mx-auto p-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <CourseDetail courseId={params.id} />
          </Suspense>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export async function generateMetadata({ params }: CoursePageProps) {
  return {
    title: `Course Details - ${params.id}`,
    description: `Detailed view of course ${params.id}`,
  }
}