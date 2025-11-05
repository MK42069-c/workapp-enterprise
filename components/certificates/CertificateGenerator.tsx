'use client'

import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { Download, Award, Share2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CertificateData {
  userName: string
  courseName: string
  completionDate: Date
  score?: number
  skills?: string[]
  certificateId: string
}

export function CertificateGenerator({ data }: { data: CertificateData }) {
  const { toast } = useToast()

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // Border
    doc.setLineWidth(2)
    doc.setDrawColor(37, 99, 235) // Blue
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // Inner border
    doc.setLineWidth(0.5)
    doc.setDrawColor(156, 163, 175) // Gray
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30)

    // Header
    doc.setFontSize(40)
    doc.setFont('helvetica', 'bold')
    doc.text('Certificate of Achievement', pageWidth / 2, 40, { align: 'center' })

    // Subheader
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('This certifies that', pageWidth / 2, 55, { align: 'center' })

    // Name
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(37, 99, 235)
    doc.text(data.userName, pageWidth / 2, 75, { align: 'center' })

    // Course info
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text('has successfully completed', pageWidth / 2, 90, { align: 'center' })

    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text(data.courseName, pageWidth / 2, 105, { align: 'center' })

    // Date
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    const dateStr = data.completionDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    doc.text(`Completed on: ${dateStr}`, pageWidth / 2, 120, { align: 'center' })

    // Score (if available)
    if (data.score) {
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text(`Final Score: ${data.score}%`, pageWidth / 2, 130, { align: 'center' })
    }

    // Skills table (if available)
    if (data.skills && data.skills.length > 0) {
      autoTable(doc, {
        startY: 140,
        head: [['Skills Acquired']],
        body: data.skills.map(skill => [skill]),
        theme: 'grid',
        styles: { halign: 'center' },
        margin: { left: pageWidth / 4, right: pageWidth / 4 },
      })
    }

    // Certificate ID
    const finalY = data.skills ? (doc as any).lastAutoTable.finalY + 10 : 145
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Certificate ID: ${data.certificateId}`, pageWidth / 2, finalY, { align: 'center' })

    // Signature line
    const signatureY = pageHeight - 40
    doc.setLineWidth(0.5)
    doc.line(40, signatureY, 90, signatureY)
    doc.line(pageWidth - 90, signatureY, pageWidth - 40, signatureY)

    doc.setFontSize(10)
    doc.text('The Work App', 65, signatureY + 7, { align: 'center' })
    doc.text('Verified Platform', pageWidth - 65, signatureY + 7, { align: 'center' })

    // Save PDF
    doc.save(`${data.courseName.replace(/\s+/g, '_')}_Certificate.pdf`)

    toast({
      title: 'Certificate Downloaded',
      description: 'Your certificate has been generated and downloaded successfully.',
    })
  }

  const shareCertificate = () => {
    if (navigator.share) {
      navigator.share({
        title: `${data.courseName} Certificate`,
        text: `I've completed ${data.courseName} on The Work App!`,
        url: window.location.href,
      })
    } else {
      toast({
        title: 'Share',
        description: 'Copy the URL to share your achievement!',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Button onClick={generatePDF} size="lg" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Download Certificate
        </Button>
        <Button onClick={shareCertificate} variant="outline" size="lg" className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Share Achievement
        </Button>
      </div>

      {/* Preview */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">{data.courseName}</h3>
        <p className="text-gray-600 dark:text-gray-300">Certificate Preview</p>
        <p className="text-sm text-gray-500 mt-2">Click Download to generate your official certificate</p>
      </div>
    </div>
  )
}