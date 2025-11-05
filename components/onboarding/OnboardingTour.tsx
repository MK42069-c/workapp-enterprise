'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  BookOpen, 
  Trophy, 
  CheckCircle, 
  ArrowRight,
  X 
} from 'lucide-react'

const steps = [
  {
    icon: Brain,
    title: 'Welcome to The Work App',
    description: 'Your personalized journey to professional development starts here.',
    content: 'Discover your strengths through interactive assessments and unlock tailored learning paths.',
  },
  {
    icon: BookOpen,
    title: 'Take an Assessment',
    description: 'Complete MBTI or TKI assessment to understand your personality and work style.',
    content: 'These scientifically validated assessments help us recommend the perfect courses for you.',
  },
  {
    icon: Trophy,
    title: 'Start Learning',
    description: 'Browse our course catalog or follow AI-powered recommendations.',
    content: 'Track your progress, earn certificates, and unlock achievements as you grow.',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export function OnboardingTour({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    setIsVisible(false)
    localStorage.setItem('onboarding_completed', 'true')
    setTimeout(onComplete, 300)
  }

  const progress = ((currentStep + 1) / steps.length) * 100
  const step = steps[currentStep]
  const Icon = step.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
          >
            <Card className="w-full max-w-lg">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSkip}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-2xl">{step.title}</CardTitle>
                <CardDescription className="text-base">{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {step.content}
                </p>

                <Progress value={progress} className="mb-6" />

                <div className="flex justify-between items-center">
                  <div className="flex space-x-2">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentStep
                            ? 'bg-blue-600'
                            : index < currentStep
                            ? 'bg-blue-400'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleSkip}>
                      Skip
                    </Button>
                    <Button onClick={handleNext}>
                      {currentStep === steps.length - 1 ? (
                        <>
                          Get Started
                          <CheckCircle className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed')
    if (!completed) {
      setShowOnboarding(true)
    }
  }, [])

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed')
    setShowOnboarding(true)
  }

  return {
    showOnboarding,
    setShowOnboarding,
    resetOnboarding,
  }
}