import type { DomainTemplate } from '@/types'
import { EventType } from '@prisma/client'

export const presentationTemplate: DomainTemplate = {
  id: 'presentation',
  name: 'Presentation & Pitch',
  eventTypes: [EventType.PRESENTATION, EventType.SALES_PITCH, EventType.MEETING],
  typicalDuration: 14,
  coreTopics: [
    'Story Structure & Narrative Arc', 'Opening Hooks & Attention Grabbers',
    'Data Visualization & Slide Design', 'Handling Q&A Confidently',
    'Body Language & Vocal Presence', 'Objection Handling',
    'Call to Action Design', 'Time Management',
  ],
  learningObjectives: [
    'Deliver a compelling 10-minute presentation from memory',
    'Handle hostile questions with confidence and poise',
    'Structure information for maximum persuasive impact',
    'Command the room with strong presence and energy',
  ],
  keySkills: [
    'Public speaking', 'Storytelling', 'Persuasion', 'Data communication',
    'Objection handling', 'Confidence under pressure',
  ],
  commonQuestions: [
    'What is your key message in one sentence?', 'Who is your audience and what do they care about?',
    'What action do you want your audience to take?', 'How will you handle the skeptic in the room?',
    'What is your opening hook?',
  ],
  simulationScenarios: [
    'Deliver your full pitch to a skeptical panel',
    'Handle rapid-fire objections from investors',
    'Present your key data slide with commentary',
    'Impromptu 2-minute elevator pitch',
  ],
  weeklyBreakdown: [
    { week: 1, focus: 'Content & Structure', activities: ['Develop core message', 'Build narrative arc', 'Create slides'] },
    { week: 2, focus: 'Delivery & Rehearsal', activities: ['Practice delivery', 'Handle objections', 'Full run-throughs'] },
  ],
}
