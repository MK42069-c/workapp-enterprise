'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, Course } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Clock, BookOpen, Award, Filter } from 'lucide-react'

export default function CoursesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    } else if (user) {
      loadCourses()
    }
  }, [user, authLoading, router])

  async function loadCourses() {
    setLoading(true)
    try {
      // Get all courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (coursesError) throw coursesError
      setCourses(coursesData || [])

      // Get user's enrolled courses
      if (user) {
        const { data: progressData } = await supabase
          .from('user_progress')
          .select('course_id')
          .eq('user_id', user.id)

        setEnrolledCourses(progressData?.map((p) => p.course_id) || [])
      }
    } catch (error) {
      console.error('Error loading courses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function enrollInCourse(courseId: string) {
    if (!user) return

    try {
      const { error } = await supabase.from('user_progress').insert({
        user_id: user.id,
        course_id: courseId,
        status: 'not_started',
        progress_percentage: 0,
        time_spent_minutes: 0,
        started_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update enrollment count
      const course = courses.find((c) => c.id === courseId)
      if (course) {
        await supabase
          .from('courses')
          .update({ enrollment_count: (course.enrollment_count || 0) + 1 })
          .eq('id', courseId)
      }

      setEnrolledCourses([...enrolledCourses, courseId])
      alert('Successfully enrolled in the course!')
      loadCourses() // Refresh the courses to show enrollment status
    } catch (error: any) {
      console.error('Error enrolling in course:', error)
      if (error.code === '23505') {
        // Already enrolled
        alert('You are already enrolled in this course!')
      } else {
        alert('Error enrolling in course. Please try again.')
      }
    }
  }

  const categories = ['all', ...Array.from(new Set(courses.map((c) => c.category)))]
  const filteredCourses = selectedCategory === 'all' 
    ? courses 
    : courses.filter((c) => c.category === selectedCategory)

  if (loading || authLoading || !user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Explore courses to enhance your professional skills
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-gray-600" />
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category.replace(/_/g, ' ')}
          </Button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => {
          const isEnrolled = enrolledCourses.includes(course.id)
          
          return (
            <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary" className="capitalize">
                    {course.category.replace(/_/g, ' ')}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {course.difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-3">
                  {course.short_description || course.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <div className="space-y-3 mb-4">
                  {course.duration_minutes && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
                    </div>
                  )}
                  {course.enrollment_count && course.enrollment_count > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4" />
                      <span>{course.enrollment_count} enrolled</span>
                    </div>
                  )}
                  {course.rating && course.rating > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-500">★</span>
                      <span>{course.rating.toFixed(1)} ({course.total_ratings} reviews)</span>
                    </div>
                  )}
                </div>

                {isEnrolled ? (
                  <Link href={`/courses/${course.id}`}>
                    <Button variant="outline" className="w-full">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => enrollInCourse(course.id)}
                  >
                    Enroll Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No courses found in this category.
          </p>
        </div>
      )}
    </div>
  )
}