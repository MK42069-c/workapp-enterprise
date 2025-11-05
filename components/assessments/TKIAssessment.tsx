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
  Users, 
  Clock,
  User,
  Scale,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { AssessmentReportGenerator } from './AssessmentReportGenerator'

interface TKISituation {
  id: number
  scenario: string
  responses: Array<{
    text: string
    conflict_mode: string
  }>
}

interface TKIResult {
  mode: string
  description: string
  style: string
  scores: {
    competing: number
    collaborating: number
    compromising: number
    avoiding: number
    accommodating: number
  }
  insights: string[]
  communicationTips: string[]
  growthAreas: string[]
}

const TKI_SITUATIONS: TKISituation[] = [
  { id: 1, scenario: "Your team has been assigned a project with a tight deadline. You have a clear plan for how to proceed, but a team member suggests a completely different approach that would take longer. How do you respond?", responses: [{ text: "Insist on following your plan since time is critical", conflict_mode: "competing" }, { text: "Work together to find a solution that incorporates both approaches", conflict_mode: "collaborating" }, { text: "Suggest combining elements of both approaches for a middle ground", conflict_mode: "compromising" }, { text: "Avoid confrontation and let others decide", conflict_mode: "avoiding" }, { text: "Go along with their suggestion to keep the peace", conflict_mode: "accommodating" }] },
  { id: 2, scenario: "A colleague has been taking credit for your ideas in meetings. You need to address this issue. What do you do?", responses: [{ text: "Confront them directly and demand they stop", conflict_mode: "competing" }, { text: "Discuss the situation openly and work toward a solution", conflict_mode: "collaborating" }, { text: "Address it in a way that allows both of you to save face", conflict_mode: "compromising" }, { text: "Ignore it and hope it stops on its own", conflict_mode: "avoiding" }, { text: "Let it go to maintain your working relationship", conflict_mode: "accommodating" }] },
  { id: 3, scenario: "During a meeting, two team members are arguing about how to handle a client issue. The argument is getting heated and disrupting the meeting. How do you handle this?", responses: [{ text: "Take charge and make a decision immediately", conflict_mode: "competing" }, { text: "Facilitate a discussion to find a solution that addresses both concerns", conflict_mode: "collaborating" }, { text: "Suggest a compromise that incorporates elements from both sides", conflict_mode: "compromising" }, { text: "Try to defuse the tension without addressing the core issue", conflict_mode: "avoiding" }, { text: "Support whichever person you have a better relationship with", conflict_mode: "accommodating" }] },
  { id: 4, scenario: "Your supervisor asks you to work late to complete a project, but you have important family commitments. How do you respond?", responses: [{ text: "Explain that family commitments come first", conflict_mode: "competing" }, { text: "Discuss alternative solutions that could address both concerns", conflict_mode: "collaborating" }, { text: "Offer to stay late some nights to help out", conflict_mode: "compromising" }, { text: "Don't respond and hope the issue resolves itself", conflict_mode: "avoiding" }, { text: "Agree to work late despite your family commitments", conflict_mode: "accommodating" }] },
  { id: 5, scenario: "A friend asks to borrow money that you really need for your own expenses. What do you do?", responses: [{ text: "Refuse and explain that you need the money yourself", conflict_mode: "competing" }, { text: "Work together to find alternative solutions to their financial needs", conflict_mode: "collaborating" }, { text: "Lend some money but not the full amount", conflict_mode: "compromising" }, { text: "Avoid giving a clear answer", conflict_mode: "avoiding" }, { text: "Lend the money despite your own needs", conflict_mode: "accommodating" }] },
  { id: 6, scenario: "You and your partner have different ideas about how to spend your weekend. One wants to be active outdoors, the other wants to relax at home. How do you resolve this?", responses: [{ text: "Insist on your preferred activity", conflict_mode: "competing" }, { text: "Work together to find an activity you both enjoy", conflict_mode: "collaborating" }, { text: "Spend part of the time on each activity", conflict_mode: "compromising" }, { text: "Accept whatever the other person decides", conflict_mode: "avoiding" }, { text: "Go along with your partner's choice to keep the peace", conflict_mode: "accommodating" }] },
  { id: 7, scenario: "Your neighbor plays music loudly late at night. You've mentioned it before, but it continues. How do you handle this situation?", responses: [{ text: "Take a firm stance and demand they stop", conflict_mode: "competing" }, { text: "Have a conversation to understand their perspective and find a solution", conflict_mode: "collaborating" }, { text: "Suggest they lower the volume at certain times", conflict_mode: "compromising" }, { text: "Accept the noise and try to ignore it", conflict_mode: "avoiding" }, { text: "Use earplugs and avoid bringing it up again", conflict_mode: "accommodating" }] },
  { id: 8, scenario: "At work, there's disagreement about the best way to present information to a client. How do you handle the conflict?", responses: [{ text: "Push for your preferred presentation style", conflict_mode: "competing" }, { text: "Facilitate a team discussion to create the best possible presentation", conflict_mode: "collaborating" }, { text: "Combine elements from different presentation approaches", conflict_mode: "compromising" }, { text: "Let others decide and go along with whatever they choose", conflict_mode: "avoiding" }, { text: "Support the most popular idea even if it's not your preference", conflict_mode: "accommodating" }] },
  { id: 9, scenario: "A family member constantly criticizes your life choices. How do you respond?", responses: [{ text: "Defend your choices and tell them to stop interfering", conflict_mode: "competing" }, { text: "Have an open conversation about your different perspectives", conflict_mode: "collaborating" }, { text: "Acknowledge some of their points while maintaining your position", conflict_mode: "compromising" }, { text: "Change the subject or avoid the conversation", conflict_mode: "avoiding" }, { text: "Listen quietly without defending yourself", conflict_mode: "accommodating" }] },
  { id: 10, scenario: "You and a coworker disagree about how to divide tasks for a joint project. How do you resolve this?", responses: [{ text: "Insist on getting the tasks you prefer", conflict_mode: "competing" }, { text: "Work together to assign tasks based on each person's strengths", conflict_mode: "collaborating" }, { text: "Each take on some tasks you want and some you don't", conflict_mode: "compromising" }, { text: "Let the other person decide the task division", conflict_mode: "avoiding" }, { text: "Take on the tasks the other person wants to avoid conflict", conflict_mode: "accommodating" }] },
  { id: 11, scenario: "During a group project, one member isn't pulling their weight. How do you address this?", responses: [{ text: "Confront them directly about their lack of contribution", conflict_mode: "competing" }, { text: "Talk with them to understand any barriers and find solutions", conflict_mode: "collaborating" }, { text: "Cover for them while also addressing the issue diplomatically", conflict_mode: "compromising" }, { text: "Don't say anything and hope they improve on their own", conflict_mode: "avoiding" }, { text: "Do extra work to compensate for their lack of contribution", conflict_mode: "accommodating" }] },
  { id: 12, scenario: "Your friend asks you to lie to cover for them with their partner. How do you respond?", responses: [{ text: "Refuse firmly and explain why you won't lie", conflict_mode: "competing" }, { text: "Discuss the situation and suggest they be honest with their partner", conflict_mode: "collaborating" }, { text: "Suggest a partial truth rather than a complete lie", conflict_mode: "compromising" }, { text: "Avoid giving a direct answer", conflict_mode: "avoiding" }, { text: "Agree to lie to help your friend", conflict_mode: "accommodating" }] },
  { id: 13, scenario: "You're in a restaurant and receive the wrong order. The staff seems busy and you don't want to make a scene. How do you handle this?", responses: [{ text: "Insist on getting the correct order regardless of the inconvenience", conflict_mode: "competing" }, { text: "Politely ask to speak with the manager to resolve the issue properly", conflict_mode: "collaborating" }, { text: "Accept the order but ask for something to make up for the mistake", conflict_mode: "compromising" }, { text: "Accept the wrong order without complaint", conflict_mode: "avoiding" }, { text: "Thank them and accept whatever they bring", conflict_mode: "accommodating" }] },
  { id: 14, scenario: "You and your roommate disagree about household expenses. How do you handle this financial conflict?", responses: [{ text: "Insist on your view of fair expense sharing", conflict_mode: "competing" }, { text: "Work together to create a budget system that works for both of you", conflict_mode: "collaborating" }, { text: "Split the difference on disputed expenses", conflict_mode: "compromising" }, { text: "Pay whatever they suggest to avoid the argument", conflict_mode: "avoiding" }, { text: "Cover more expenses to keep the peace", conflict_mode: "accommodating" }] },
  { id: 15, scenario: "During a meeting, someone consistently interrupts you when you're speaking. How do you address this?", responses: [{ text: "Directly tell them to stop interrupting you", conflict_mode: "competing" }, { text: "Address the communication pattern and work on better meeting dynamics", conflict_mode: "collaborating" }, { text: "Wait for them to finish and then continue your point", conflict_mode: "compromising" }, { text: "Say nothing and hope they realize they're being rude", conflict_mode: "avoiding" }, { text: "Let them have the floor and don't try to regain it", conflict_mode: "accommodating" }] },
  { id: 16, scenario: "You and your partner have different opinions about how to discipline your child. How do you resolve this parenting disagreement?", responses: [{ text: "Insist on your disciplinary approach", conflict_mode: "competing" }, { text: "Work together to develop a unified parenting strategy", conflict_mode: "collaborating" }, { text: "Each use your preferred approach in different situations", conflict_mode: "compromising" }, { text: "Avoid discussing it and hope it works itself out", conflict_mode: "avoiding" }, { text: "Defer to your partner's approach to maintain harmony", conflict_mode: "accommodating" }] },
  { id: 17, scenario: "Your boss gives you an assignment that you think is poorly planned and will fail. How do you respond?", responses: [{ text: "Express your concerns and suggest changes to the plan", conflict_mode: "competing" }, { text: "Discuss your concerns and work together to improve the project", conflict_mode: "collaborating" }, { text: "Suggest some modifications while agreeing to the basic plan", conflict_mode: "compromising" }, { text: "Complete the assignment as given without comment", conflict_mode: "avoiding" }, { text: "Accept the assignment without expressing any concerns", conflict_mode: "accommodating" }] },
  { id: 18, scenario: "You're shopping and receive incorrect change. You notice it but the cashier seems stressed. How do you handle this?", responses: [{ text: "Point out the error and request the correct change", conflict_mode: "competing" }, { text: "Politely mention the error and work with them to correct it", conflict_mode: "collaborating" }, { text: "Accept some of the overage but give back the rest", conflict_mode: "compromising" }, { text: "Say nothing and keep the extra money", conflict_mode: "avoiding" }, { text: "Give back all the extra money despite needing it", conflict_mode: "accommodating" }] },
  { id: 19, scenario: "Two of your friends are having a conflict and each wants you to take their side. How do you respond?", responses: [{ text: "Choose sides based on who you think is right", conflict_mode: "competing" }, { text: "Work with both friends to help them resolve their differences", conflict_mode: "collaborating" }, { text: "Try to find middle ground that satisfies both friends", conflict_mode: "compromising" }, { text: "Stay neutral and avoid taking any position", conflict_mode: "avoiding" }, { text: "Support whichever friend needs you more", conflict_mode: "accommodating" }] },
  { id: 20, scenario: "You're part of a committee planning an event, but you disagree with the budget allocation. How do you handle this?", responses: [{ text: "Push for your preferred budget allocation", conflict_mode: "competing" }, { text: "Work together to create a budget that optimizes everyone's priorities", conflict_mode: "collaborating" }, { text: "Compromise by adjusting some budget items", conflict_mode: "compromising" }, { text: "Accept whatever budget the majority decides", conflict_mode: "avoiding" }, { text: "Give up your preferences to support the group decision", conflict_mode: "accommodating" }] },
  { id: 21, scenario: "A service provider shows up late for an appointment and seems unprepared. How do you address this issue?", responses: [{ text: "Express your dissatisfaction and demand better service", conflict_mode: "competing" }, { text: "Discuss your expectations and work together to improve the service", conflict_mode: "collaborating" }, { text: "Address the issue but agree to a compromise solution", conflict_mode: "compromising" }, { text: "Accept the poor service without complaint", conflict_mode: "avoiding" }, { text: "Be understanding and patient despite your frustration", conflict_mode: "accommodating" }] },
  { id: 22, scenario: "You and your sibling disagree about how to care for an aging parent. How do you handle this family conflict?", responses: [{ text: "Insist on your preferred approach to caregiving", conflict_mode: "competing" }, { text: "Work together to create a care plan that addresses everyone's concerns", conflict_mode: "collaborating" }, { text: "Each take responsibility for different aspects of care", conflict_mode: "compromising" }, { text: "Let others make the decisions", conflict_mode: "avoiding" }, { text: "Take on more responsibility than you prefer to accommodate others", conflict_mode: "accommodating" }] },
  { id: 23, scenario: "In a group setting, someone makes a comment that you find offensive. How do you respond?", responses: [{ text: "Immediately challenge the offensive comment", conflict_mode: "competing" }, { text: "Address the issue constructively to promote understanding", conflict_mode: "collaborating" }, { text: "Politely suggest a different way to express the same idea", conflict_mode: "compromising" }, { text: "Ignore the comment and hope someone else addresses it", conflict_mode: "avoiding" }, { text: "Let the comment pass to avoid confrontation", conflict_mode: "accommodating" }] },
  { id: 24, scenario: "Your business partner wants to expand quickly, but you prefer a slower, more careful approach. How do you resolve this disagreement?", responses: [{ text: "Push for your preferred timeline", conflict_mode: "competing" }, { text: "Work together to find a balanced growth strategy", conflict_mode: "collaborating" }, { text: "Compromise with a moderate expansion pace", conflict_mode: "compromising" }, { text: "Let your partner make the decision", conflict_mode: "avoiding" }, { text: "Agree to the faster expansion despite your concerns", conflict_mode: "accommodating" }] },
  { id: 25, scenario: "You're trying to concentrate on work, but a colleague keeps asking questions. How do you handle this interruption?", responses: [{ text: "Tell them clearly that you need to focus and can't be interrupted", conflict_mode: "competing" }, { text: "Discuss finding a better time for questions that works for both of you", conflict_mode: "collaborating" }, { text: "Answer some questions but set boundaries on others", conflict_mode: "compromising" }, { text: "Answer all questions to be helpful despite your need to focus", conflict_mode: "accommodating" }, { text: "Ignore them and hope they stop asking questions", conflict_mode: "avoiding" }] },
  { id: 26, scenario: "You and your colleague have different communication styles that are causing friction. How do you address this workplace conflict?", responses: [{ text: "Insist they adapt to your communication style", conflict_mode: "competing" }, { text: "Work together to find a communication approach that works for both", conflict_mode: "collaborating" }, { text: "Each adapt somewhat to meet in the middle", conflict_mode: "compromising" }, { text: "Avoid interaction as much as possible", conflict_mode: "avoiding" }, { text: "Adapt completely to their communication style", conflict_mode: "accommodating" }] },
  { id: 27, scenario: "You receive feedback that you consider unfair or harsh. How do you respond?", responses: [{ text: "Defend yourself and challenge the feedback", conflict_mode: "competing" }, { text: "Discuss the feedback openly to understand different perspectives", conflict_mode: "collaborating" }, { text: "Acknowledge some points while disagreeing with others", conflict_mode: "compromising" }, { text: "Dismiss the feedback and ignore it", conflict_mode: "avoiding" }, { text: "Accept all the feedback without question", conflict_mode: "accommodating" }] },
  { id: 28, scenario: "You and your partner have different expectations about household responsibilities. How do you resolve this ongoing issue?", responses: [{ text: "Insist on your preferred division of responsibilities", conflict_mode: "competing" }, { text: "Work together to create a system that works for both of you", conflict_mode: "collaborating" }, { text: "Compromise by each taking on some preferred and some disliked tasks", conflict_mode: "compromising" }, { text: "Let your partner decide the division of responsibilities", conflict_mode: "avoiding" }, { text: "Take on more responsibilities than your share", conflict_mode: "accommodating" }] },
  { id: 29, scenario: "You're in a meeting and a decision needs to be made, but you have serious concerns about the proposed solution. How do you respond?", responses: [{ text: "Voice your concerns and push for a better solution", conflict_mode: "competing" }, { text: "Facilitate discussion to develop a solution that addresses concerns", conflict_mode: "collaborating" }, { text: "Suggest modifications to make the solution more acceptable", conflict_mode: "compromising" }, { text: "Don't express your concerns and go along with the decision", conflict_mode: "avoiding" }, { text: "Support the decision despite your concerns", conflict_mode: "accommodating" }] },
  { id: 30, scenario: "You witness someone being treated unfairly at work. How do you handle this situation?", responses: [{ text: "Immediately speak up against the unfair treatment", conflict_mode: "competing" }, { text: "Work with appropriate parties to address the unfair treatment", conflict_mode: "collaborating" }, { text: "Express concern but look for a moderate response", conflict_mode: "compromising" }, { text: "Mind your own business and don't get involved", conflict_mode: "avoiding" }, { text: "Stay quiet to maintain workplace harmony", conflict_mode: "accommodating" }] },
  { id: 31, scenario: "You and your friend have different political views that come up frequently in conversation. How do you handle this recurring conflict?", responses: [{ text: "Argue for your political positions", conflict_mode: "competing" }, { text: "Engage in thoughtful dialogue to understand different perspectives", conflict_mode: "collaborating" }, { text: "Find areas of agreement while respecting differences", conflict_mode: "compromising" }, { text: "Avoid political discussions altogether", conflict_mode: "avoiding" }, { text: "Agree with your friend to maintain harmony", conflict_mode: "accommodating" }] },
  { id: 32, scenario: "A team member is consistently late to meetings, affecting project progress. How do you address this?", responses: [{ text: "Confront them directly about their lateness", conflict_mode: "competing" }, { text: "Discuss the impact and work together to find solutions", conflict_mode: "collaborating" }, { text: "Set some boundaries while being flexible with others", conflict_mode: "compromising" }, { text: "Don't address it and hope they improve on their own", conflict_mode: "avoiding" }, { text: "Accommodate their schedule changes indefinitely", conflict_mode: "accommodating" }] },
  { id: 33, scenario: "You and your supervisor disagree about your job performance and career development. How do you handle this professional conflict?", responses: [{ text: "Defend your performance and push for your preferred development path", conflict_mode: "competing" }, { text: "Work together to create a performance improvement and development plan", conflict_mode: "collaborating" }, { text: "Compromise on some performance areas and development goals", conflict_mode: "compromising" }, { text: "Let your supervisor decide without input from you", conflict_mode: "avoiding" }, { text: "Accept feedback and suggestions without advocating for your perspective", conflict_mode: "accommodating" }] },
  { id: 34, scenario: "You're in a relationship where your partner makes decisions without consulting you. How do you address this pattern?", responses: [{ text: "Demand they start including you in decisions", conflict_mode: "competing" }, { text: "Discuss the importance of collaborative decision-making", conflict_mode: "collaborating" }, { text: "Agree that some decisions are theirs while others are shared", conflict_mode: "compromising" }, { text: "Accept their unilateral decisions to avoid conflict", conflict_mode: "avoiding" }, { text: "Support their decisions even when you disagree", conflict_mode: "accommodating" }] },
  { id: 35, scenario: "You're part of a community group, but there's disagreement about the group's direction and priorities. How do you handle this conflict about purpose?", responses: [{ text: "Push for your vision of what the group should prioritize", conflict_mode: "competing" }, { text: "Facilitate discussion to find a shared vision and priorities", conflict_mode: "collaborating" }, { text: "Compromise by incorporating multiple priorities", conflict_mode: "compromising" }, { text: "Let others decide the group's direction", conflict_mode: "avoiding" }, { text: "Support the majority vision even if it differs from yours", conflict_mode: "accommodating" }] }
]

const CONFLICT_MODES = {
  competing: {
    name: "Competing",
    description: "You pursue your own concerns at the expense of others. This style is appropriate when quick, decisive action is needed on vital issues.",
    color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
    icon: "⚔️"
  },
  collaborating: {
    name: "Collaborating", 
    description: "You work with others to find a solution that fully satisfies everyone's concerns. This style produces the best long-term solutions.",
    color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
    icon: "🤝"
  },
  compromising: {
    name: "Compromising",
    description: "You look for a middle ground where both parties can give up something to reach a mutually acceptable solution.",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
    icon: "⚖️"
  },
  avoiding: {
    name: "Avoiding",
    description: "You sidestep the conflict rather than dealing with it directly. This style can be appropriate when issues are trivial.",
    color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300",
    icon: "🚶"
  },
  accommodating: {
    name: "Accommodating",
    description: "You neglect your own concerns to satisfy the concerns of others. This style is appropriate when maintaining relationships is most important.",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    icon: "🙏"
  }
}

export function TKIAssessment() {
  const [currentSituation, setCurrentSituation] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [result, setResult] = useState<TKIResult | null>(null)

  const progress = ((currentSituation + 1) / TKI_SITUATIONS.length) * 100
  const canProceed = answers[TKI_SITUATIONS[currentSituation].id] !== undefined
  const canFinish = Object.keys(answers).length === TKI_SITUATIONS.length

  const handleAnswer = (conflictMode: string) => {
    const situation = TKI_SITUATIONS[currentSituation]
    setAnswers(prev => ({
      ...prev,
      [situation.id]: conflictMode
    }))
  }

  const nextSituation = () => {
    if (currentSituation < TKI_SITUATIONS.length - 1) {
      setCurrentSituation(prev => prev + 1)
    } else {
      finishAssessment()
    }
  }

  const prevSituation = () => {
    if (currentSituation > 0) {
      setCurrentSituation(prev => prev - 1)
    }
  }

  const finishAssessment = () => {
    const scores = { competing: 0, collaborating: 0, compromising: 0, avoiding: 0, accommodating: 0 }
    
    Object.entries(answers).forEach(([situationId, conflictMode]) => {
      scores[conflictMode as keyof typeof scores]++
    })

    const primaryMode = Object.entries(scores).reduce((a, b) => scores[a[0] as keyof typeof scores] > scores[b[0] as keyof typeof scores] ? a : b)[0]
    const primaryModeData = CONFLICT_MODES[primaryMode as keyof typeof CONFLICT_MODES]

    const tkiResult: TKIResult = {
      mode: primaryMode,
      description: primaryModeData.description,
      style: primaryModeData.name,
      scores: {
        competing: Math.round((scores.competing / TKI_SITUATIONS.length) * 100),
        collaborating: Math.round((scores.collaborating / TKI_SITUATIONS.length) * 100),
        compromising: Math.round((scores.compromising / TKI_SITUATIONS.length) * 100),
        avoiding: Math.round((scores.avoiding / TKI_SITUATIONS.length) * 100),
        accommodating: Math.round((scores.accommodating / TKI_SITUATIONS.length) * 100)
      },
      insights: generateInsights(primaryMode, scores),
      communicationTips: generateCommunicationTips(primaryMode),
      growthAreas: generateGrowthAreas(primaryMode)
    }

    setResult(tkiResult)
    setShowResults(true)
  }

  const generateInsights = (mode: string, scores: Record<string, number>) => {
    const insights = {
      competing: [
        "You tend to be direct and assertive in conflict situations",
        "You prioritize results and quick decision-making",
        "You may need to balance assertiveness with relationship-building"
      ],
      collaborating: [
        "You seek win-win solutions that benefit all parties",
        "You invest time in understanding different perspectives",
        "You value relationship preservation alongside problem-solving"
      ],
      compromising: {
        competing: [
          "You look for fair middle-ground solutions",
          "You're practical and willing to make concessions",
          "You balance assertiveness with cooperation"
        ],
        collaborating: [
          "You balance assertiveness with finding workable solutions",
          "You're diplomatic in conflict situations",
          "You adapt your approach based on the situation"
        ]
      },
      avoiding: [
        "You prefer to step back from conflict when possible",
        "You may need more practice addressing issues directly",
        "You might benefit from developing conflict resolution skills"
      ],
      accommodating: [
        "You prioritize harmony and others' needs",
        "You may need to advocate more for your own interests",
        "You excel at maintaining positive relationships"
      ]
    }

    return insights[mode as keyof typeof insights] || insights.avoiding
  }

  const generateCommunicationTips = (mode: string) => {
    const tips = {
      competing: [
        "Practice active listening to understand others' perspectives",
        "Pause before responding to consider diplomatic language",
        "Focus on facts and logic while remaining open to feedback"
      ],
      collaborating: [
        "Continue building on your natural strength for finding common ground",
        "Set clear boundaries around time and energy investments",
        "Practice assertive communication when your needs aren't being met"
      ],
      compromising: [
        "Develop skills for more assertive communication when needed",
        "Practice distinguishing between flexible and firm positions",
        "Build confidence in advocating for your core interests"
      ],
      avoiding: [
        "Start with low-stakes conflicts to practice direct communication",
        "Prepare talking points before difficult conversations",
        "Remember that addressing issues early prevents escalation"
      ],
      accommodating: [
        "Practice stating your needs and preferences clearly",
        "Use 'I' statements to express your perspective",
        "Remember that your needs matter and deserve consideration"
      ]
    }

    return tips[mode as keyof typeof tips] || tips.avoiding
  }

  const generateGrowthAreas = (mode: string) => {
    const areas = {
      competing: [
        "Developing patience with different communication styles",
        "Learning to delegate and trust others' abilities",
        "Balancing results focus with relationship maintenance"
      ],
      collaborating: [
        "Setting healthy boundaries around time and energy",
        "Recognizing when quick decisions are needed",
        "Managing perfectionism in problem-solving processes"
      ],
      compromising: [
        "Building confidence in more assertive approaches",
        "Learning when collaboration would be more effective",
        "Distinguishing between core values and negotiable preferences"
      ],
      avoiding: [
        "Developing comfort with direct conflict discussion",
        "Practicing assertiveness in low-stakes situations",
        "Learning that avoidance often makes problems worse"
      ],
      accommodating: [
        "Building confidence in advocating for personal needs",
        "Developing skills for difficult conversations",
        "Learning to balance self-care with care for others"
      ]
    }

    return areas[mode as keyof typeof areas] || areas.avoiding
  }

  const resetAssessment = () => {
    setCurrentSituation(0)
    setAnswers({})
    setShowResults(false)
    setResult(null)
  }

  if (showResults && result) {
    const sortedScores = Object.entries(result.scores)
      .sort(([,a], [,b]) => b - a)
      .map(([mode, score]) => ({ mode, score }))

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Results Header */}
        <Card className="text-center bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Users className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              Your Conflict Style: {result.style}
            </CardTitle>
            <p className="text-lg text-purple-700 dark:text-purple-300">{result.mode}</p>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">{result.description}</p>
            <div className="grid grid-cols-5 gap-2 mt-6">
              {sortedScores.map(({ mode, score }) => (
                <div key={mode} className="text-center">
                  <div className={`text-2xl mb-1`}>
                    {CONFLICT_MODES[mode as keyof typeof CONFLICT_MODES].icon}
                  </div>
                  <div className="text-sm font-medium">{CONFLICT_MODES[mode as keyof typeof CONFLICT_MODES].name}</div>
                  <div className="text-xs text-gray-500">{score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-600" />
              Conflict Mode Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sortedScores.map(({ mode, score }) => (
                <div key={mode} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CONFLICT_MODES[mode as keyof typeof CONFLICT_MODES].icon}</span>
                      <span className="font-medium">{CONFLICT_MODES[mode as keyof typeof CONFLICT_MODES].name}</span>
                    </div>
                    <Badge variant="secondary">{score}%</Badge>
                  </div>
                  <Progress value={score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Personal Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Communication Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
              Communication Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.communicationTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">{index + 1}</span>
                  </div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Growth Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.growthAreas.map((area, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>{area}</span>
                </div>
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
                assessmentType: 'TKI',
                result: result.style,
                completedDate: new Date(),
                tkiMode: result.mode,
                tkiScores: result.scores,
                conflictInsights: result.insights,
                communicationTips: result.communicationTips,
                reportId: `TKI-${Date.now()}`
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

  const situation = TKI_SITUATIONS[currentSituation]

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">TKI Conflict Resolution Assessment</CardTitle>
          <p className="text-gray-600 dark:text-gray-400">Discover your conflict resolution style</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>10-15 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Situation {currentSituation + 1} of {TKI_SITUATIONS.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>
          <Progress value={progress} className="mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Choose the response that most closely matches how you would typically handle this conflict. There are no right or wrong answers.
          </p>
        </CardContent>
      </Card>

      {/* Situation Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
              Conflict Scenario
            </Badge>
            <span className="text-sm text-gray-500">Situation {situation.id}</span>
          </div>
          <CardTitle className="text-xl leading-relaxed">{situation.scenario}</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={answers[situation.id] || ''} 
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {situation.responses.map((response, index) => {
              const modeData = CONFLICT_MODES[response.conflict_mode as keyof typeof CONFLICT_MODES]
              return (
                <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                  <RadioGroupItem value={response.conflict_mode} id={`option-${index}`} />
                  <Label 
                    htmlFor={`option-${index}`} 
                    className="flex-1 cursor-pointer text-base leading-relaxed"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{modeData.icon}</span>
                      <div>
                        <div className="font-medium text-sm mb-1">{modeData.name}</div>
                        <div>{response.text}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          onClick={prevSituation} 
          variant="outline" 
          disabled={currentSituation === 0}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button 
          onClick={nextSituation} 
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          {currentSituation === TKI_SITUATIONS.length - 1 ? 'Finish Assessment' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}