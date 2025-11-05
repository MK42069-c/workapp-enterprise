'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Download, Share2, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface AssessmentReportData {
  userName: string
  assessmentType: 'MBTI' | 'TKI'
  result: string
  completedDate: Date
  
  // MBTI specific
  mbtiType?: string
  mbtiDimensions?: {
    EI: { letter: string; description: string; score: number }
    SN: { letter: string; description: string; score: number }
    TF: { letter: string; description: string; score: number }
    JP: { letter: string; description: string; score: number }
  }
  strengths?: string[]
  developmentAreas?: string[]
  careerSuggestions?: string[]
  
  // TKI specific
  tkiMode?: string
  tkiScores?: {
    competing: number
    collaborating: number
    compromising: number
    avoiding: number
    accommodating: number
  }
  conflictInsights?: string[]
  communicationTips?: string[]
  
  reportId: string
}

export function AssessmentReportGenerator({ data }: { data: AssessmentReportData }) {
  const { toast } = useToast()

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    // Header with border
    doc.setLineWidth(1)
    doc.setDrawColor(37, 99, 235)
    doc.rect(10, 10, pageWidth - 20, 30)
    
    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(37, 99, 235)
    doc.text(`${data.assessmentType} Assessment Report`, pageWidth / 2, 25, { align: 'center' })
    
    // Subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Professional Development Analysis', pageWidth / 2, 32, { align: 'center' })

    yPos = 50

    // User Information Section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0, 0, 0)
    doc.text('Assessment Summary', 15, yPos)
    yPos += 10

    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${data.userName}`, 15, yPos)
    yPos += 6
    doc.text(`Assessment Type: ${data.assessmentType}`, 15, yPos)
    yPos += 6
    doc.text(`Result: ${data.result}`, 15, yPos)
    yPos += 6
    doc.text(`Completed: ${data.completedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, yPos)
    yPos += 12

    if (data.assessmentType === 'MBTI' && data.mbtiDimensions) {
      // MBTI Dimensions
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Personality Dimensions', 15, yPos)
      yPos += 8

      const dimensions = [
        ['Dimension', 'Preference', 'Description', 'Score'],
        ['Energy', data.mbtiDimensions.EI.letter === 'E' ? 'Extraversion (E)' : 'Introversion (I)', data.mbtiDimensions.EI.description, `${data.mbtiDimensions.EI.score}%`],
        ['Perception', data.mbtiDimensions.SN.letter === 'S' ? 'Sensing (S)' : 'Intuition (N)', data.mbtiDimensions.SN.description, `${data.mbtiDimensions.SN.score}%`],
        ['Judgment', data.mbtiDimensions.TF.letter === 'T' ? 'Thinking (T)' : 'Feeling (F)', data.mbtiDimensions.TF.description, `${data.mbtiDimensions.TF.score}%`],
        ['Lifestyle', data.mbtiDimensions.JP.letter === 'J' ? 'Judging (J)' : 'Perceiving (P)', data.mbtiDimensions.JP.description, `${data.mbtiDimensions.JP.score}%`],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [dimensions[0]],
        body: dimensions.slice(1),
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        margin: { left: 15, right: 15 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 12

      // Strengths
      if (data.strengths && data.strengths.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Key Strengths', 15, yPos)
        yPos += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        data.strengths.forEach((strength, index) => {
          doc.text(`${index + 1}. ${strength}`, 20, yPos)
          yPos += 5
        })
        yPos += 5
      }

      // Development Areas
      if (data.developmentAreas && data.developmentAreas.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Development Areas', 15, yPos)
        yPos += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        data.developmentAreas.forEach((area, index) => {
          doc.text(`${index + 1}. ${area}`, 20, yPos)
          yPos += 5
        })
        yPos += 5
      }

      // Career Suggestions
      if (data.careerSuggestions && data.careerSuggestions.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Career Development Suggestions', 15, yPos)
        yPos += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        data.careerSuggestions.forEach((suggestion, index) => {
          const lines = doc.splitTextToSize(suggestion, pageWidth - 35)
          doc.text(`${index + 1}. `, 20, yPos)
          doc.text(lines, 25, yPos)
          yPos += lines.length * 5 + 2
        })
      }
    }

    if (data.assessmentType === 'TKI' && data.tkiScores) {
      // TKI Scores
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('Conflict Management Modes', 15, yPos)
      yPos += 8

      const tkiData = [
        ['Mode', 'Score', 'Description'],
        ['Competing', `${data.tkiScores.competing}%`, 'Assertive and uncooperative'],
        ['Collaborating', `${data.tkiScores.collaborating}%`, 'Assertive and cooperative'],
        ['Compromising', `${data.tkiScores.compromising}%`, 'Moderate assertiveness and cooperation'],
        ['Avoiding', `${data.tkiScores.avoiding}%`, 'Unassertive and uncooperative'],
        ['Accommodating', `${data.tkiScores.accommodating}%`, 'Unassertive and cooperative'],
      ]

      autoTable(doc, {
        startY: yPos,
        head: [tkiData[0]],
        body: tkiData.slice(1),
        theme: 'grid',
        styles: { fontSize: 10, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: 255 },
        margin: { left: 15, right: 15 },
      })

      yPos = (doc as any).lastAutoTable.finalY + 12

      // Conflict Insights
      if (data.conflictInsights && data.conflictInsights.length > 0) {
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Conflict Management Insights', 15, yPos)
        yPos += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        data.conflictInsights.forEach((insight, index) => {
          const lines = doc.splitTextToSize(insight, pageWidth - 35)
          doc.text(`${index + 1}. `, 20, yPos)
          doc.text(lines, 25, yPos)
          yPos += lines.length * 5 + 2
        })
        yPos += 5
      }

      // Communication Tips
      if (data.communicationTips && data.communicationTips.length > 0) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }

        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text('Communication Tips', 15, yPos)
        yPos += 6

        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        data.communicationTips.forEach((tip, index) => {
          const lines = doc.splitTextToSize(tip, pageWidth - 35)
          doc.text(`${index + 1}. `, 20, yPos)
          doc.text(lines, 25, yPos)
          yPos += lines.length * 5 + 2
        })
      }
    }

    // Footer on last page
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, 285, { align: 'center' })
      doc.text(`Report ID: ${data.reportId}`, pageWidth / 2, 290, { align: 'center' })
      doc.text('Generated by The Work App - Professional Development Platform', pageWidth / 2, 295, { align: 'center' })
    }

    // Save PDF
    const fileName = `${data.assessmentType}_Assessment_${data.userName.replace(/\s+/g, '_')}.pdf`
    doc.save(fileName)

    toast({
      title: 'Report Downloaded',
      description: `Your ${data.assessmentType} assessment report has been generated successfully.`,
    })
  }

  const shareReport = () => {
    const reportText = `I completed my ${data.assessmentType} assessment on The Work App!\n\nResult: ${data.result}\n\nDiscover your potential: ${window.location.origin}`
    
    if (navigator.share) {
      navigator.share({
        title: `${data.assessmentType} Assessment Results`,
        text: reportText,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(reportText)
      toast({
        title: 'Copied to Clipboard',
        description: 'Share text has been copied to your clipboard.',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button onClick={generatePDF} size="lg" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Full Report (PDF)
        </Button>
        <Button onClick={shareReport} variant="outline" size="lg" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Results
        </Button>
      </div>

      {/* Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">{data.assessmentType} Assessment Report</h3>
        <p className="text-lg text-blue-600 dark:text-blue-400 mb-2">{data.result}</p>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Completed on {data.completedDate.toLocaleDateString()}
        </p>
        <p className="text-sm text-gray-500">
          Click Download to generate your comprehensive professional assessment report with detailed insights, strengths, and development recommendations.
        </p>
      </div>
    </div>
  )
}