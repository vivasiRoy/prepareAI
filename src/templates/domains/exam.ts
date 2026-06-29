import type { DomainTemplate } from '@/types'
import { EventType } from '@prisma/client'

export const examTemplate: DomainTemplate = {
  id: 'exam',
  name: 'Exam & Certification',
  eventTypes: [EventType.EXAM, EventType.CERTIFICATION, EventType.ACADEMIC_ASSESSMENT],
  typicalDuration: 21,
  coreTopics: [
    'Core Subject Matter Review', 'Practice Problem Sets', 'Exam Format & Strategy',
    'Time Management Under Pressure', 'Key Formulas & Definitions', 'Common Question Patterns',
    'Essay Structure & Writing', 'Case Study Analysis', 'Spaced Repetition Practice',
  ],
  learningObjectives: [
    'Master all core topics at required depth',
    'Complete practice exams within time limits',
    'Identify and eliminate personal knowledge gaps',
    'Develop effective test-taking strategies',
  ],
  keySkills: [
    'Active recall', 'Spaced repetition', 'Time management', 'Stress management',
    'Critical analysis', 'Written communication',
  ],
  commonQuestions: [
    'Multiple choice: identify key concepts', 'Short answer: define and explain',
    'Essay: analyze and argue a position', 'Case study: apply theory to practice',
    'Calculation problems with step-by-step solutions',
  ],
  simulationScenarios: [
    'Full timed practice exam under realistic conditions',
    'Rapid-fire flashcard review of key definitions',
    'Essay writing with 45-minute time limit',
    'Case study analysis and recommendation',
  ],
  weeklyBreakdown: [
    { week: 1, focus: 'Content Review', activities: ['Core concepts', 'Key definitions', 'Foundational principles'] },
    { week: 2, focus: 'Practice & Application', activities: ['Practice questions', 'Case studies', 'Timed exercises'] },
    { week: 3, focus: 'Exam Simulation', activities: ['Full mock exams', 'Review weak areas', 'Final cramming'] },
  ],
}
