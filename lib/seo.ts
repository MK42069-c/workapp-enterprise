import type { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  ogImage?: string
  canonical?: string
  noindex?: boolean
}

export function generateSEO({
  title = 'The Work App - Professional Development Platform',
  description = 'Discover your potential through interactive assessments, personalized courses, and skill development tools. MBTI, TKI assessments, and AI-powered learning paths.',
  keywords = ['assessment', 'MBTI', 'TKI', 'professional development', 'online learning', 'skill development', 'personality test'],
  ogImage = '/og-image.png',
  canonical,
  noindex = false,
}: SEOProps = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://workapp.com'
  const fullTitle = title.includes('The Work App') ? title : `${title} | The Work App`

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: [{ name: 'The Work App Team' }],
    creator: 'The Work App',
    publisher: 'The Work App',
    robots: noindex ? 'noindex,nofollow' : 'index,follow',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: canonical || baseUrl,
      title: fullTitle,
      description,
      siteName: 'The Work App',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
      creator: '@theworkapp',
    },
    alternates: {
      canonical: canonical || baseUrl,
    },
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
    category: 'education',
  }
}

// JSON-LD Structured Data
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'The Work App',
    description: 'Professional development platform with assessments and courses',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://workapp.com',
    logo: '/logo.png',
    sameAs: [
      'https://twitter.com/theworkapp',
      'https://linkedin.com/company/theworkapp',
    ],
  }
}

export function generateCourseSchema(course: {
  name: string
  description: string
  provider: string
  duration: string
  level: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.name,
    description: course.description,
    provider: {
      '@type': 'Organization',
      name: course.provider,
    },
    timeRequired: course.duration,
    courseLevel: course.level,
  }
}

export function generateAssessmentSchema(assessment: {
  name: string
  description: string
  questions: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: assessment.name,
    description: assessment.description,
    numberOfQuestions: assessment.questions,
    educationalLevel: 'Professional',
  }
}