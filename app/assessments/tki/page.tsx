import { Suspense } from 'react'
import { TKIAssessment } from '@/components/assessments/TKIAssessment'
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton'

export default function TKIAssessmentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Suspense fallback={<DashboardSkeleton />}>
          <TKIAssessment />
        </Suspense>
      </div>
    </div>
  )
}