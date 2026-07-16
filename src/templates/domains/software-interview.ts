import type { DomainTemplate } from '@/types'
import { EventType } from '@/generated/prisma'

export const softwareInterviewTemplate: DomainTemplate = {
  id: 'software-interview',
  name: 'Software Engineering Interview',
  eventTypes: [EventType.SOFTWARE_INTERVIEW, EventType.JOB_INTERVIEW],
  typicalDuration: 28,
  coreTopics: [
    'Arrays & Strings', 'Linked Lists', 'Trees & Graphs', 'Dynamic Programming',
    'Sorting & Searching', 'Hash Tables', 'Stacks & Queues', 'Recursion & Backtracking',
    'System Design Fundamentals', 'Database Design', 'API Design', 'Scalability & Caching',
    'Behavioral Questions (STAR)', 'Leadership & Conflict', 'Problem-Solving Framework',
  ],
  learningObjectives: [
    'Solve LeetCode medium problems within 30 minutes',
    'Design scalable systems for 1M+ users',
    'Articulate past experiences using the STAR method',
    'Write clean, well-commented production code',
    'Ask clarifying questions and think aloud effectively',
  ],
  keySkills: [
    'Algorithmic thinking', 'Time/space complexity analysis', 'Code optimization',
    'System design', 'Communication', 'Problem decomposition',
  ],
  commonQuestions: [
    'Two Sum (Array hashing)', 'Merge Intervals', 'LRU Cache implementation',
    'Binary Tree Level Order Traversal', 'Longest Palindromic Substring',
    'Number of Islands (BFS/DFS)', 'Word Break (DP)', 'Merge K Sorted Lists',
    'Design a URL Shortener', 'Design Twitter/Instagram feed',
    'Tell me about yourself', 'Why this company?', 'Describe a challenging project',
    'How do you handle disagreements with your team?', 'Where do you see yourself in 5 years?',
  ],
  simulationScenarios: [
    'Technical phone screen: implement a hash map from scratch',
    'Whiteboard: solve two-sum then optimize to O(n)',
    'System design: design a ride-sharing application',
    'Behavioral: describe a time you failed and what you learned',
    'Code review: find bugs in a given piece of code',
  ],
  weeklyBreakdown: [
    { week: 1, focus: 'Data Structures Fundamentals', activities: ['Arrays, Strings, Hash Maps', 'Linked Lists & Stacks', 'Trees & Binary Search'] },
    { week: 2, focus: 'Algorithms', activities: ['Sorting algorithms', 'BFS/DFS patterns', 'Dynamic programming basics'] },
    { week: 3, focus: 'System Design & Behavioral', activities: ['System design patterns', 'STAR method practice', 'Mock behavioral interviews'] },
    { week: 4, focus: 'Full Mock Interviews', activities: ['Full technical rounds', 'System design mocks', 'Offer negotiation prep'] },
  ],
}
