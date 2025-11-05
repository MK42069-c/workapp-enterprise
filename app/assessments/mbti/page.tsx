import { Suspense } from 'react'
import { MBTIAssessment } from '@/components/assessments/MBTIAssessment'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'

export default function MBTIAssessmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<DashboardSkeleton />}>
          <MBTIAssessment />
        </Suspense>
      </div>
    </div>
  )
}