'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { AdvancedSearch, PopularSearches } from "@/components/search/AdvancedSearch"
import { OnboardingTour, useOnboarding } from "@/components/onboarding/OnboardingTour"
import { 
  Brain, 
  Target, 
  BookOpen, 
  Users, 
  Trophy, 
  Zap,
  ArrowRight,
  CheckCircle,
  BarChart3,
  Shield,
  Sparkles
} from "lucide-react"

export default function HomePage() {
  const { showOnboarding, setShowOnboarding } = useOnboarding()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query)
    // In production, navigate to search results or filter content
    console.log('Search:', query, filters)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}

      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            />
            <span className="text-xl font-bold">The Work App</span>
          </Link>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Link href="/auth">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/auth">
              <Button>
                Get Started
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            {...fadeInUp}
          >
            <Badge className="mb-4" variant="secondary">
              <Zap className="w-4 h-4 mr-1" />
              Powered by AI & Advanced Analytics
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Discover Your Creative Potential
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Transform your career through personalized assessments, skill development, 
              and AI-powered recommendations designed for the modern creative professional.
            </p>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <AdvancedSearch onSearch={handleSearch} />
              <div className="mt-4">
                <PopularSearches onSearch={(query) => handleSearch(query, {})} />
              </div>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Link href="/dashboard">
                <Button size="lg" className="text-lg group">
                  Start Assessment
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/courses">
                <Button size="lg" variant="outline" className="text-lg">
                  Explore Courses
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-gray-50 dark:bg-gray-800/50">
        <div className="container mx-auto">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Grow</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive tools for creative professionals
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full hover:shadow-xl transition-shadow border-2 hover:border-blue-200 dark:hover:border-blue-800">
                  <CardHeader>
                    <feature.icon className={`w-8 h-8 ${feature.color} mb-2`} />
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      {feature.items.map((item, i) => (
                        <li key={i} className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Trusted by Creatives Worldwide
          </motion.h2>
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <motion.div 
          className="container mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of creative professionals who have discovered their potential
          </p>
          <Link href="/auth">
            <Button size="lg" variant="secondary" className="text-lg">
              Start Free Assessment
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded"></div>
                <span className="text-lg font-bold">The Work App</span>
              </div>
              <p className="text-gray-400">
                Empowering creative professionals through personalized assessments and learning.
              </p>
            </div>
            {footerLinks.map((section, index) => (
              <div key={index}>
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <Link href={link.href} className="hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 The Work App. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

const features = [
  {
    icon: Brain,
    color: 'text-blue-600',
    title: 'Creative Assessment',
    description: 'Interactive assessments to understand your personality, skills, and creative style',
    items: ['MBTI Assessment', 'TKI Conflict Style', 'Creative Preferences'],
  },
  {
    icon: BookOpen,
    color: 'text-green-600',
    title: 'Personalized Courses',
    description: 'AI-curated learning paths based on your assessment results and goals',
    items: ['Skill-based recommendations', 'Progress tracking', 'Interactive content'],
  },
  {
    icon: Target,
    color: 'text-purple-600',
    title: 'Goal Setting',
    description: 'Set and track your career goals with smart recommendations and milestones',
    items: ['SMART goals framework', 'Milestone tracking', 'Progress analytics'],
  },
  {
    icon: Users,
    color: 'text-orange-600',
    title: 'Community Features',
    description: 'Connect with other creative professionals and share your journey',
    items: ['Peer connections', 'Study groups', 'Mentorship programs'],
  },
  {
    icon: Trophy,
    color: 'text-yellow-600',
    title: 'Achievements',
    description: 'Earn badges and certificates as you complete assessments and courses',
    items: ['Skill badges', 'Course certificates', 'Leaderboards'],
  },
  {
    icon: Zap,
    color: 'text-red-600',
    title: 'AI Recommendations',
    description: 'Get personalized suggestions for courses, career paths, and skill development',
    items: ['Smart suggestions', 'Career insights', 'Learning optimization'],
  },
]

const stats = [
  { value: '50K+', label: 'Assessments Completed', color: 'text-blue-600' },
  { value: '1,200+', label: 'Courses Available', color: 'text-green-600' },
  { value: '95%', label: 'User Satisfaction', color: 'text-purple-600' },
  { value: '200+', label: 'Expert Instructors', color: 'text-orange-600' },
]

const footerLinks = [
  {
    title: 'Features',
    links: [
      { label: 'Creative Assessments', href: '/assessments' },
      { label: 'Course Catalog', href: '/courses' },
      { label: 'Progress Tracking', href: '/dashboard' },
      { label: 'AI Recommendations', href: '/dashboard' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
  {
    title: 'Connect',
    links: [
      { label: 'Newsletter', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Events', href: '#' },
    ],
  },
]