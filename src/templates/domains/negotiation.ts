import type { DomainTemplate } from '@/types'
import { EventType } from '@/generated/prisma'

export const negotiationTemplate: DomainTemplate = {
  id: 'negotiation',
  name: 'Negotiation',
  eventTypes: [EventType.NEGOTIATION, EventType.COURT_CASE],
  typicalDuration: 14,
  coreTopics: [
    'BATNA Analysis', 'Anchoring & First Offers', 'Active Listening Tactics',
    'Concession Strategy', 'Framing & Reframing', 'Emotional Intelligence',
    'Win-Win vs Win-Lose Strategies', 'Closing Techniques',
  ],
  learningObjectives: [
    'Identify and strengthen your BATNA before any negotiation',
    'Use anchoring to set favorable terms',
    'Make strategic concessions without leaving value on the table',
    'Reach agreements that preserve long-term relationships',
  ],
  keySkills: [
    'Strategic thinking', 'Emotional regulation', 'Active listening',
    'Creative problem-solving', 'Persuasion', 'Risk assessment',
  ],
  commonQuestions: [
    'What is your walk-away point?', 'What does the other party truly value?',
    'How will you respond to their first offer?', 'What concessions are you willing to make?',
  ],
  simulationScenarios: [
    'Salary negotiation roleplay with tough employer',
    'Contract terms negotiation with pushback',
    'Multi-party deal with conflicting interests',
  ],
  weeklyBreakdown: [
    { week: 1, focus: 'Frameworks & Strategy', activities: ['BATNA', 'Anchoring', 'Concession planning'] },
    { week: 2, focus: 'Practice & Roleplay', activities: ['Roleplay simulations', 'Debrief sessions', 'Final strategy review'] },
  ],
}
