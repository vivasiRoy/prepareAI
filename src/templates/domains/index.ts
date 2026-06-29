import type { DomainTemplate } from '@/types'
import { EventType } from '@prisma/client'
import { softwareInterviewTemplate } from './software-interview'
import { examTemplate } from './exam'
import { presentationTemplate } from './presentation'
import { negotiationTemplate } from './negotiation'

const ALL_TEMPLATES: DomainTemplate[] = [
  softwareInterviewTemplate,
  examTemplate,
  presentationTemplate,
  negotiationTemplate,
]

export function getDomainTemplate(eventType: EventType, description: string = ''): DomainTemplate {
  const desc = description.toLowerCase()

  if (
    eventType === EventType.INTERVIEW ||
    desc.includes('interview') || desc.includes('software') ||
    desc.includes('engineer') || desc.includes('developer') || desc.includes('coding')
  ) {
    return softwareInterviewTemplate
  }

  if (
    eventType === EventType.EXAM ||
    eventType === EventType.CERTIFICATION ||
    eventType === EventType.ACADEMIC_ASSESSMENT ||
    desc.includes('exam') || desc.includes('test') || desc.includes('certif')
  ) {
    return examTemplate
  }

  if (
    eventType === EventType.NEGOTIATION ||
    eventType === EventType.COURT_CASE ||
    desc.includes('negotiat') || desc.includes('court') || desc.includes('contract')
  ) {
    return negotiationTemplate
  }

  if (
    eventType === EventType.PRESENTATION ||
    eventType === EventType.SALES_PITCH ||
    eventType === EventType.MEETING ||
    desc.includes('pitch') || desc.includes('present') || desc.includes('meeting')
  ) {
    return presentationTemplate
  }

  // Default to exam template as generic
  return examTemplate
}

export { ALL_TEMPLATES, softwareInterviewTemplate, examTemplate, presentationTemplate, negotiationTemplate }
