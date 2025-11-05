'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Brain, 
  Clock,
  User,
  Target,
  Lightbulb,
  Calendar
} from 'lucide-react'
import { AssessmentReportGenerator } from './AssessmentReportGenerator'

interface MBTIQuestion {
  id: number
  dimension: 'EI' | 'SN' | 'TF' | 'JP'
  question: string
  options: Array<{
    text: string
    value: string
  }>
}

interface MBTIResult {
  type: string
  dimensions: {
    EI: { letter: string; description: string; score: number }
    SN: { letter: string; description: string; score: number }
    TF: { letter: string; description: string; score: number }
    JP: { letter: string; description: string; score: number }
  }
  name: string
  description: string
  strengths: string[]
  developmentAreas: string[]
  careerSuggestions: string[]
}

const MBTI_QUESTIONS: MBTIQuestion[] = [
  { id: 1, dimension: 'EI', question: "In social situations, I typically:", options: [{ text: "Seek out conversations and engage with many people", value: "E" }, { text: "Prefer deeper conversations with a few close friends", value: "I" }] },
  { id: 2, dimension: 'SN', question: "When learning something new, I prefer to:", options: [{ text: "Start with practical examples and step-by-step details", value: "S" }, { text: "Understand the big picture and underlying concepts first", value: "N" }] },
  { id: 3, dimension: 'TF', question: "When making decisions, I primarily consider:", options: [{ text: "Logic, facts, and objective analysis", value: "T" }, { text: "Values, relationships, and personal impact", value: "F" }] },
  { id: 4, dimension: 'JP', question: "My approach to deadlines is:", options: [{ text: "I prefer to complete tasks early and stick to my schedule", value: "J" }, { text: "I work best under pressure and prefer to keep options open", value: "P" }] },
  { id: 5, dimension: 'EI', question: "After a busy day, I recharge by:", options: [{ text: "Spending time with friends or in social activities", value: "E" }, { text: "Having quiet time alone to reflect", value: "I" }] },
  { id: 6, dimension: 'SN', question: "I pay more attention to:", options: [{ text: "Specific facts, details, and what is actually happening", value: "S" }, { text: "Patterns, possibilities, and what could be", value: "N" }] },
  { id: 7, dimension: 'TF', question: "I am more convinced by:", options: [{ text: "Well-reasoned arguments and logical evidence", value: "T" }, { text: "Strong emotional appeals and personal testimonials", value: "F" }] },
  { id: 8, dimension: 'JP', question: "I prefer to:", options: [{ text: "Plan my time and stick to organized schedules", value: "J" }, { text: "Be spontaneous and adapt as situations arise", value: "P" }] },
  { id: 9, dimension: 'EI', question: "In meetings, I typically:", options: [{ text: "Contribute ideas freely and think out loud", value: "E" }, { text: "Listen carefully and contribute when I have something solid to add", value: "I" }] },
  { id: 10, dimension: 'SN', question: "When reading, I prefer content that:", options: [{ text: "Provides practical information and concrete examples", value: "S" }, { text: "Explores abstract theories and future possibilities", value: "N" }] },
  { id: 11, dimension: 'TF', question: "When giving feedback, I focus on:", options: [{ text: "Objective standards and areas for improvement", value: "T" }, { text: "Strengths and encouragement to maintain confidence", value: "F" }] },
  { id: 12, dimension: 'JP', question: "My workspace is usually:", options: [{ text: "Well-organized with everything in its proper place", value: "J" }, { text: "Somewhat cluttered but I know where everything is", value: "P" }] },
  { id: 13, dimension: 'EI', question: "I feel most energized when:", options: [{ text: "I'm actively participating in group activities", value: "E" }, { text: "I'm working independently on projects I'm passionate about", value: "I" }] },
  { id: 14, dimension: 'SN', question: "I remember events by:", options: [{ text: "Specific details, dates, and what actually happened", value: "S" }, { text: "General impressions and the overall feeling or meaning", value: "N" }] },
  { id: 15, dimension: 'TF', question: "I tend to be more:", options: [{ text: "Fair and objective in my judgments", value: "T" }, { text: "Compassionate and considerate of others' feelings", value: "F" }] },
  { id: 16, dimension: 'JP', question: "I prefer my vacation plans to be:", options: [{ text: "Well-planned with reservations and detailed itineraries", value: "J" }, { text: "Flexible with room for spontaneous discoveries", value: "P" }] },
  { id: 17, dimension: 'EI', question: "When solving problems, I prefer to:", options: [{ text: "Brainstorm with others and discuss ideas aloud", value: "E" }, { text: "Think through problems carefully on my own first", value: "I" }] },
  { id: 18, dimension: 'SN', question: "I am more interested in:", options: [{ text: "How things work and practical applications", value: "S" }, { text: "What things could mean and future potential", value: "N" }] },
  { id: 19, dimension: 'TF', question: "When making important life decisions, I:", options: [{ text: "Analyze pros and cons systematically", value: "T" }, { text: "Consider how it will affect my values and relationships", value: "F" }] },
  { id: 20, dimension: 'JP', question: "I like to make decisions:", options: [{ text: "Early, so I can move forward with confidence", value: "J" }, { text: "When necessary, keeping my options open as long as possible", value: "P" }] },
  { id: 21, dimension: 'EI', question: "In social gatherings, I:", options: [{ text: "Circulate and talk to many different people", value: "E" }, { text: "Tend to have deeper conversations with fewer people", value: "I" }] },
  { id: 22, dimension: 'SN', question: "I trust information that is:", options: [{ text: "Based on established facts and proven methods", value: "S" }, { text: "Innovative and based on new insights or theories", value: "N" }] },
  { id: 23, dimension: 'TF', question: "I am more motivated by:", options: [{ text: "Achievement and mastery of skills", value: "T" }, { text: "Harmony and making a positive difference", value: "F" }] },
  { id: 24, dimension: 'JP', question: "I prefer projects that:", options: [{ text: "Have clear deadlines and milestones", value: "J" }, { text: "Allow for exploration and discovery along the way", value: "P" }] },
  { id: 25, dimension: 'EI', question: "I learn best by:", options: [{ text: "Discussing ideas with others and group activities", value: "E" }, { text: "Studying independently and reflecting on concepts", value: "I" }] },
  { id: 26, dimension: 'SN', question: "When given instructions, I prefer:", options: [{ text: "Clear, step-by-step directions", value: "S" }, { text: "General guidance with flexibility to interpret", value: "N" }] },
  { id: 27, dimension: 'TF', question: "I am more likely to notice:", options: [{ text: "Inconsistencies and errors that need correction", value: "T" }, { text: "The feelings and needs of others", value: "F" }] },
  { id: 28, dimension: 'JP', question: "I am more comfortable with:", options: [{ text: "Making decisions and closing on options", value: "J" }, { text: "Keeping options open and delaying final decisions", value: "P" }] },
  { id: 29, dimension: 'EI', question: "In teamwork, I:", options: [{ text: "Thrive on group energy and collaborative brainstorming", value: "E" }, { text: "Prefer to contribute my best work through individual effort", value: "I" }] },
  { id: 30, dimension: 'SN', question: "I am more drawn to:", options: [{ text: "Practical skills that I can use immediately", value: "S" }, { text: "Theoretical concepts that open up new ways of thinking", value: "N" }] },
  { id: 31, dimension: 'TF', question: "When conflicts arise, I:", options: [{ text: "Address the issue objectively to find a logical solution", value: "T" }, { text: "Consider the emotional impact on all parties involved", value: "F" }] },
  { id: 32, dimension: 'JP', question: "I prefer my free time to be:", options: [{ text: "Structured with planned activities", value: "J" }, { text: "Open-ended with the freedom to do whatever appeals", value: "P" }] },
  { id: 33, dimension: 'EI', question: "I feel most confident when:", options: [{ text: "I'm actively engaged with others and sharing ideas", value: "E" }, { text: "I've had time to prepare and think things through", value: "I" }] },
  { id: 34, dimension: 'SN', question: "I am more interested in:", options: [{ text: "Learning about the present and how things currently work", value: "S" }, { text: "Exploring possibilities and what might be in the future", value: "N" }] },
  { id: 35, dimension: 'TF', question: "I believe the best solutions are those that:", options: [{ text: "Are logical and based on objective criteria", value: "T" }, { text: "Take into account personal values and relationships", value: "F" }] },
  { id: 36, dimension: 'JP', question: "I like to:", options: [{ text: "Get things settled and completed as soon as possible", value: "J" }, { text: "Keep things open to adapt to new information", value: "P" }] },
  { id: 37, dimension: 'EI', question: "When traveling, I prefer to:", options: [{ text: "Visit popular attractions and meet new people", value: "E" }, { text: "Explore quietly and absorb the local atmosphere", value: "I" }] },
  { id: 38, dimension: 'SN', question: "I remember information better when I:", options: [{ text: "Have concrete examples and practice applying it", value: "S" }, { text: "Understand the underlying principles and connections", value: "N" }] },
  { id: 39, dimension: 'TF', question: "I am more concerned about:", options: [{ text: "Being accurate and maintaining standards", value: "T" }, { text: "Being tactful and preserving harmony", value: "F" }] },
  { id: 40, dimension: 'JP', question: "I prefer activities that:", options: [{ text: "Have clear rules and established procedures", value: "J" }, { text: "Allow for improvisation and personal interpretation", value: "P" }] },
  { id: 41, dimension: 'EI', question: "I process my thoughts by:", options: [{ text: "Talking them through with others", value: "E" }, { text: "Thinking them through internally", value: "I" }] },
  { id: 42, dimension: 'SN', question: "When evaluating ideas, I focus on:", options: [{ text: "How practical and useful they are in reality", value: "S" }, { text: "How innovative and inspiring they could be", value: "N" }] },
  { id: 43, dimension: 'TF', question: "I am more likely to:", options: [{ text: "Analyze situations logically before acting", value: "T" }, { text: "Trust my intuition about what feels right", value: "F" }] },
  { id: 44, dimension: 'JP', question: "I feel more comfortable when:", options: [{ text: "My schedule and commitments are set in advance", value: "J" }, { text: "I have the flexibility to change plans if needed", value: "P" }] },
  { id: 45, dimension: 'EI', question: "In difficult situations, I:", options: [{ text: "Seek support and discussion from others", value: "E" }, { text: "Retreat to think and process alone", value: "I" }] },
  { id: 46, dimension: 'SN', question: "I am more interested in:", options: [{ text: "Facts and information I can verify", value: "S" }, { text: "Patterns and meanings I can discover", value: "N" }] },
  { id: 47, dimension: 'TF', question: "When criticizing work, I:", options: [{ text: "Focus on objective standards and constructive feedback", value: "T" }, { text: "Consider the person's feelings and provide supportive guidance", value: "F" }] },
  { id: 48, dimension: 'JP', question: "I prefer to:", options: [{ text: "Follow through on commitments and finish what I start", value: "J" }, { text: "Keep my options open and pursue multiple interests", value: "P" }] },
  { id: 49, dimension: 'EI', question: "I get my best ideas when:", options: [{ text: "I'm collaborating and exchanging ideas with others", value: "E" }, { text: "I'm alone and have time to reflect deeply", value: "I" }] },
  { id: 50, dimension: 'SN', question: "When giving presentations, I:", options: [{ text: "Focus on practical applications and concrete data", value: "S" }, { text: "Emphasize concepts and future possibilities", value: "N" }] },
  { id: 51, dimension: 'TF', question: "I am more motivated by:", options: [{ text: "Personal competence and mastery", value: "T" }, { text: "Making a positive impact on others", value: "F" }] },
  { id: 52, dimension: 'JP', question: "I like to have my projects:", options: [{ text: "Well-organized with detailed plans", value: "J" }, { text: "Flexible with room to adapt as I go", value: "P" }] },
  { id: 53, dimension: 'EI', question: "In social situations, I:", options: [{ text: "Make new connections easily and enjoy networking", value: "E" }, { text: "Enjoy meaningful conversations with familiar people", value: "I" }] },
  { id: 54, dimension: 'SN', question: "I learn better when information is:", options: [{ text: "Presented in an orderly, sequential manner", value: "S" }, { text: "Connected to broader themes and concepts", value: "N" }] },
  { id: 55, dimension: 'TF', question: "When working with a team, I:", options: [{ text: "Focus on efficiency and achieving goals", value: "T" }, { text: "Focus on collaboration and team harmony", value: "F" }] },
  { id: 56, dimension: 'JP', question: "I prefer to:", options: [{ text: "Complete tasks before moving to new ones", value: "J" }, { text: "Work on multiple projects simultaneously", value: "P" }] },
  { id: 57, dimension: 'EI', question: "I feel energized by:", options: [{ text: "Being around people and engaging in group activities", value: "E" }, { text: "Having quiet time to recharge and reflect", value: "I" }] },
  { id: 58, dimension: 'SN', question: "I am more interested in:", options: [{ text: "How things have worked in the past", value: "S" }, { text: "What could work in the future", value: "N" }] },
  { id: 59, dimension: 'TF', question: "I make decisions based on:", options: [{ text: "Logical analysis and objective criteria", value: "T" }, { text: "Personal values and consideration for others", value: "F" }] },
  { id: 60, dimension: 'JP', question: "I prefer to:", options: [{ text: "Establish routines and stick to them", value: "J" }, { text: "Vary my routine and adapt to circumstances", value: "P" }] },
  { id: 61, dimension: 'EI', question: "When faced with a challenge, I:", options: [{ text: "Turn to others for support and advice", value: "E" }, { text: "Work through it independently using my own resources", value: "I" }] },
  { id: 62, dimension: 'SN', question: "I am more attracted to:", options: [{ text: "Practical solutions that work in the real world", value: "S" }, { text: "Innovative ideas that could change the world", value: "N" }] },
  { id: 63, dimension: 'TF', question: "I am more concerned about:", options: [{ text: "Maintaining fairness and consistency", value: "T" }, { text: "Maintaining harmony and consideration", value: "F" }] },
  { id: 64, dimension: 'JP', question: "I feel more comfortable:", options: [{ text: "When decisions are made and things are settled", value: "J" }, { text: "When all options remain available", value: "P" }] }
]

const PERSONALITY_TYPES: Record<string, any> = {
  ISTJ: { name: "The Inspector", description: "Quiet, practical, and responsible. ISTJs are dependable, detail-oriented, and excel at organizing and managing people and projects.", strengths: ["Reliable and conscientious", "Excellent organizational skills", "Strong sense of duty"], careerFields: ["Accounting", "Banking", "Engineering", "Healthcare Administration"] },
  ISFJ: { name: "The Protector", description: "Warm, dedicated, and responsible. ISFJs are supportive, caring individuals who are attentive to others' needs and excel at creating harmony.", strengths: ["Strong sense of loyalty", "Excellent people skills", "Reliable and conscientious"], careerFields: ["Healthcare", "Education", "Social Work", "Human Resources"] },
  INFJ: { name: "The Counselor", description: "Inspiring, intuitive, and idealistic. INFJs are thoughtful, creative individuals with a strong sense of purpose.", strengths: ["Intuitive understanding of people", "Strong values and ideals", "Creative problem-solving"], careerFields: ["Psychology", "Social Work", "Education", "Writing"] },
  INTJ: { name: "The Architect", description: "Strategic, independent, and visionary. INTJs are innovative, logical thinkers who excel at long-term planning and complex problem-solving.", strengths: ["Strategic thinking", "Independent and confident", "Strong problem-solving abilities"], careerFields: ["Engineering", "Science", "Research", "Strategic Planning"] },
  ISTP: { name: "The Craftsman", description: "Practical, adaptable, and hands-on. ISTPs are skilled at working with tools and technology, excel at problem-solving in real-world situations.", strengths: ["Excellent practical skills", "Calm under pressure", "Problem-solving abilities"], careerFields: ["Engineering", "Automotive", "Aviation", "Computer Programming"] },
  ISFP: { name: "The Composer", description: "Gentle, artistic, and sensitive. ISFPs are creative, empathetic individuals who value harmony and personal authenticity.", strengths: ["Empathy and sensitivity", "Creative and artistic abilities", "Adaptability"], careerFields: ["Arts and Design", "Healthcare", "Social Work", "Music"] },
  INFP: { name: "The Mediator", description: "Idealistic, creative, and committed. INFPs are gentle, idealistic individuals with strong values and deep emotional insight.", strengths: ["Strong values and ideals", "Creative problem-solving", "Empathy and understanding"], careerFields: ["Psychology", "Writing", "Social Work", "Education"] },
  INTP: { name: "The Thinker", description: "Analytical, objective, and innovative. INTPs are independent thinkers who excel at theoretical analysis and complex problem-solving.", strengths: ["Analytical thinking", "Innovation and creativity", "Independent work style"], careerFields: ["Science", "Research", "Philosophy", "Computer Science"] },
  ESTP: { name: "The Promoter", description: "Energetic, flexible, and action-oriented. ESTPs are dynamic, enthusiastic individuals who thrive in social situations and excel at motivating others.", strengths: ["Enthusiasm and energy", "Social skills", "Practical problem-solving"], careerFields: ["Sales", "Marketing", "Entrepreneurship", "Entertainment"] },
  ESFP: { name: "The Entertainer", description: "Warm, enthusiastic, and spontaneous. ESFPs are energetic, people-oriented individuals who bring joy and excitement to situations.", strengths: ["Social and friendly nature", "Enthusiasm and energy", "Practical skills"], careerFields: ["Entertainment", "Hospitality", "Sales", "Social Work"] },
  ENFP: { name: "The Champion", description: "Enthusiastic, creative, and inspiring. ENFPs are warm, energetic individuals who inspire others and excel at building relationships.", strengths: ["Inspiring and motivating others", "Creative problem-solving", "Social skills"], careerFields: ["Psychology", "Sales", "Education", "Consulting"] },
  ENTP: { name: "The Debater", description: "Innovative, curious, and versatile. ENTPs are energetic, intelligent individuals who love intellectual challenges and exploring new possibilities.", strengths: ["Innovation and creativity", "Intellectual curiosity", "Adaptability"], careerFields: ["Entrepreneurship", "Consulting", "Marketing", "Engineering"] },
  ESTJ: { name: "The Supervisor", description: "Practical, decisive, and organized. ESTJs are natural leaders who excel at organizing people and projects to achieve goals.", strengths: ["Leadership abilities", "Organization and planning", "Reliability"], careerFields: ["Management", "Banking", "Government", "Military"] },
  ESFJ: { name: "The Provider", description: "Warm, responsible, and conscientious. ESFJs are caring, reliable individuals who excel at creating harmony and serving others.", strengths: ["Caring and supportive nature", "Strong sense of duty", "People skills"], careerFields: ["Education", "Healthcare", "Social Work", "Human Resources"] },
  ENFJ: { name: "The Teacher", description: "Charismatic, idealistic, and inspiring. ENFJs are warm, passionate individuals who excel at guiding and inspiring others to reach their potential.", strengths: ["Inspiring and motivating others", "People skills", "Natural leadership"], careerFields: ["Education", "Psychology", "Social Work", "Training and Development"] },
  ENTJ: { name: "The Commander", description: "Strategic, decisive, and natural leaders. ENTJs are confident, efficient individuals who excel at organizing people and resources to achieve goals.", strengths: ["Natural leadership abilities", "Strategic thinking", "Decisiveness"], careerFields: ["Business Leadership", "Entrepreneurship", "Law", "Politics"] }
}

export function MBTIAssessment() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<MBTIResult | null>(null)

  const progress = ((currentQuestion + 1) / MBTI_QUESTIONS.length) * 100
  const canProceed = answers[MBTI_QUESTIONS[currentQuestion].id] !== undefined
  const canFinish = Object.keys(answers).length === MBTI_QUESTIONS.length

  const handleAnswer = (value: string) => {
    const question = MBTI_QUESTIONS[currentQuestion]
    setAnswers(prev => ({
      ...prev,
      [question.id]: value
    }))
  }

  const nextQuestion = () => {
    if (currentQuestion < MBTI_QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      finishAssessment()
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const finishAssessment = () => {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = MBTI_QUESTIONS.find(q => q.id === parseInt(questionId))
      if (question) {
        scores[answer as keyof typeof scores]++
      }
    })

    const resultType = (
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P')
    )

    const personalityData = PERSONALITY_TYPES[resultType] || PERSONALITY_TYPES.INTJ
    
    const mbtiResult: MBTIResult = {
      type: resultType,
      dimensions: {
        EI: { 
          letter: scores.E >= scores.I ? 'E' : 'I', 
          description: scores.E >= scores.I ? 'Extraversion - You gain energy from external interaction' : 'Introversion - You gain energy from internal reflection', 
          score: Math.round((Math.max(scores.E, scores.I) / (scores.E + scores.I)) * 100) 
        },
        SN: { 
          letter: scores.S >= scores.N ? 'S' : 'N', 
          description: scores.S >= scores.N ? 'Sensing - You prefer concrete, factual information' : 'Intuition - You prefer abstract concepts and possibilities', 
          score: Math.round((Math.max(scores.S, scores.N) / (scores.S + scores.N)) * 100) 
        },
        TF: { 
          letter: scores.T >= scores.F ? 'T' : 'F', 
          description: scores.T >= scores.F ? 'Thinking - You focus on logical analysis and objective criteria' : 'Feeling - You focus on values and impact on people', 
          score: Math.round((Math.max(scores.T, scores.F) / (scores.T + scores.F)) * 100) 
        },
        JP: { 
          letter: scores.J >= scores.P ? 'J' : 'P', 
          description: scores.J >= scores.P ? 'Judging - You prefer structure, plans, and closure' : 'Perceiving - You prefer flexibility, spontaneity, and keeping options open', 
          score: Math.round((Math.max(scores.J, scores.P) / (scores.J + scores.P)) * 100) 
        }
      },
      name: personalityData.name,
      description: personalityData.description,
      strengths: personalityData.strengths,
      developmentAreas: ["Understanding different personality types", "Adapting communication styles", "Working with different preferences"],
      careerSuggestions: personalityData.careerFields
    }

    setResult(mbtiResult)
    setShowResults(true)
  }

  const resetAssessment = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setShowResults(false)
    setResult(null)
  }

  if (showResults && result) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Results Header */}
        <Card className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Brain className="h-12 w-12 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              Your MBTI Type: {result.type}
            </CardTitle>
            <p className="text-xl text-blue-700 dark:text-blue-300">{result.name}</p>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{result.description}</p>
            <div className="flex justify-center space-x-4">
              <Badge variant="outline" className="text-lg px-4 py-2">
                {result.dimensions.EI.letter} - {result.dimensions.EI.letter === 'E' ? 'Extravert' : 'Introvert'}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {result.dimensions.SN.letter} - {result.dimensions.SN.letter === 'S' ? 'Sensor' : 'Intuitive'}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {result.dimensions.TF.letter} - {result.dimensions.TF.letter === 'T' ? 'Thinker' : 'Feeler'}
              </Badge>
              <Badge variant="outline" className="text-lg px-4 py-2">
                {result.dimensions.JP.letter} - {result.dimensions.JP.letter === 'J' ? 'Judger' : 'Perceiver'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Dimension Breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(result.dimensions).map(([key, dim]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{key === 'EI' ? 'Energy Direction' : key === 'SN' ? 'Information Processing' : key === 'TF' ? 'Decision Making' : 'Lifestyle Preference'}</span>
                  <Badge variant="secondary">{dim.letter}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={dim.score} className="mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{dim.description}</p>
                <p className="text-xs text-gray-500 mt-2">Confidence: {dim.score}%</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Key Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {result.strengths.map((strength, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{strength}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Career Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Suggested Career Fields
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.careerSuggestions.map((field, index) => (
                <Badge key={index} variant="outline" className="bg-yellow-50 dark:bg-yellow-900/20">
                  {field}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Detailed Report</CardTitle>
          </CardHeader>
          <CardContent>
            <AssessmentReportGenerator 
              data={{
                userName: "Current User", // This would come from auth context
                assessmentType: 'MBTI',
                result: result.type,
                completedDate: new Date(),
                mbtiType: result.type,
                mbtiDimensions: result.dimensions,
                strengths: result.strengths,
                developmentAreas: result.developmentAreas,
                careerSuggestions: result.careerSuggestions,
                reportId: `MBTI-${Date.now()}`
              }}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <Button onClick={resetAssessment} variant="outline">
            Retake Assessment
          </Button>
        </div>
      </div>
    )
  }

  const question = MBTI_QUESTIONS[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">MBTI Personality Assessment</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">Discover your personality type and strengths</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>15-20 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Question {currentQuestion + 1} of {MBTI_QUESTIONS.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Choose the response that best describes your natural tendencies. There are no right or wrong answers.
          </p>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              {question.dimension === 'EI' ? 'Energy Direction' : 
               question.dimension === 'SN' ? 'Information Processing' : 
               question.dimension === 'TF' ? 'Decision Making' : 'Lifestyle Preference'}
            </Badge>
            <span className="text-sm text-gray-500">Question {question.id}</span>
          </div>
          <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[question.id] || ''} 
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <RadioGroupItem value={option.value} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-base leading-relaxed"
                >
                  {option.text}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={prevQuestion} 
          variant="outline" 
          disabled={currentQuestion === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={nextQuestion} 
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          {currentQuestion === MBTI_QUESTIONS.length - 1 ? 'Finish Assessment' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}