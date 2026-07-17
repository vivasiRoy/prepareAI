import { PrismaClient } from '@prisma/client'
import { PrismaNeon } from '@prisma/adapter-neon'
import { Pool, neonConfig } from '@neondatabase/serverless'
// @ts-ignore
import ws from 'ws'
import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'

if (typeof WebSocket === 'undefined') neonConfig.webSocketConstructor = ws
const adapter = new PrismaNeon({ connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding database...')

  // Never hardcode the admin password — this repo is public. Provide it via
  // SEED_ADMIN_PASSWORD, or a random one is generated and printed once.
  const rawAdminPassword = process.env.SEED_ADMIN_PASSWORD
    || randomBytes(12).toString('base64url')
  if (!process.env.SEED_ADMIN_PASSWORD) {
    console.log(`🔑 Generated admin password (save it now): ${rawAdminPassword}`)
  }
  const adminPassword = await bcrypt.hash(rawAdminPassword, 12)
  const admin = await prisma.user.upsert({
    where: { email: 'royvivasi@gmail.com' },
    update: {},
    create: {
      email: 'royvivasi@gmail.com',
      name: 'Roy Vivasi',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      password: adminPassword,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Admin user:', admin.email)

  const demoPassword = await bcrypt.hash('demo123!', 12)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@prepareai.com' },
    update: {},
    create: {
      email: 'demo@prepareai.com',
      name: 'Demo User',
      role: 'USER',
      plan: 'PRO',
      password: demoPassword,
      emailVerified: new Date(),
    },
  })
  console.log('✅ Demo user:', demo.email)

  await prisma.event.deleteMany({ where: { id: 'demo-event-001' } })

  const event = await prisma.event.create({
    data: {
      id: 'demo-event-001',
      userId: demo.id,
      title: 'Google SWE Interview — L5',
      description: 'Preparing for Google L5 software engineer interview focusing on algorithms, system design, and behavioral.',
      goalOutcome: 'Pass all 5 interview rounds and receive an L5 offer',
      type: 'SOFTWARE_INTERVIEW',
      status: 'ACTIVE',
      targetDate: new Date(Date.now() + 30 * 86400000),
      successScore: 67,
      goals: {
        create: [
          { title: 'Master DS&A patterns', priority: 1 },
          { title: 'Complete 3 system design mocks', priority: 2 },
          { title: 'Practice STAR behavioral answers', priority: 3 },
        ],
      },
    },
  })

  const outline = {
    dailyTopics: [
      { day: 1, topic: 'Arrays & Two Pointers', focus: 'Master sliding window and two-pointer patterns', lessonType: 'FLASHCARD', duration: 30, difficulty: 2 },
      { day: 2, topic: 'Binary Search', focus: 'Binary search variants and rotated arrays', lessonType: 'QUIZ', duration: 45, difficulty: 3 },
      { day: 3, topic: 'Trees: BFS & DFS', focus: 'Tree traversal patterns', lessonType: 'MICRO_LESSON', duration: 45, difficulty: 3 },
    ],
    weeklyMilestones: [
      { week: 1, milestone: 'Complete all DS&A fundamentals' },
      { week: 2, milestone: 'Advanced algorithms and DP' },
      { week: 3, milestone: 'System design mastery' },
      { week: 4, milestone: 'Mock interviews and polish' },
    ],
  }

  const curriculum = await prisma.curriculum.create({
    data: {
      eventId: event.id,
      totalDays: 30,
      generated: true,
      outline: outline as any,
      skillTree: { nodes: [{ id: 'arrays', name: 'Arrays', prerequisites: [] }, { id: 'trees', name: 'Trees', prerequisites: ['arrays'] }] } as any,
      domainContext: { primaryDomain: 'Software Engineering', templateUsed: 'software-interview' } as any,
    },
  })

  await prisma.lesson.createMany({
    data: [
      {
        curriculumId: curriculum.id,
        dayNumber: 1,
        order: 0,
        title: 'Arrays & Two Pointers',
        type: 'FLASHCARD',
        duration: 30,
        difficulty: 2,
        completed: true,
        completedAt: new Date(Date.now() - 2 * 86400000),
        content: {
          summary: 'Master the two-pointer technique for solving array problems efficiently.',
          keyPoints: [
            'Use two pointers to reduce O(n²) to O(n)',
            'Common patterns: left-right, slow-fast pointers',
            'Works best with sorted arrays',
          ],
          flashcards: [
            { front: 'What is the Two Sum problem?', back: 'Find two numbers that add up to target. Use a hash map for O(n).' },
            { front: 'When to use two pointers vs sliding window?', back: 'Two pointers for pairs; sliding window for subarrays with a constraint.' },
            { front: 'How to detect a cycle in a linked list?', back: "Floyd's: slow moves 1, fast moves 2. If they meet, there's a cycle." },
          ],
        },
      },
      {
        curriculumId: curriculum.id,
        dayNumber: 2,
        order: 0,
        title: 'Binary Search Mastery',
        type: 'QUIZ',
        duration: 45,
        difficulty: 3,
        completed: true,
        completedAt: new Date(Date.now() - 86400000),
        content: {
          summary: 'Binary search and its variants — from basic to rotated arrays.',
          keyPoints: [
            'Binary search: O(log n) on sorted data',
            'Template: lo=0, hi=n-1, mid=(lo+hi)>>1',
            'Watch off-by-one errors',
          ],
        },
      },
      {
        curriculumId: curriculum.id,
        dayNumber: 3,
        order: 0,
        title: 'Trees: BFS & DFS Patterns',
        type: 'MICRO_LESSON',
        duration: 45,
        difficulty: 3,
        completed: false,
        content: {
          summary: 'Tree traversal patterns and when to apply each.',
          keyPoints: [
            'BFS: level-order, uses a queue. Best for shortest path.',
            'DFS: pre/in/post-order. Uses recursion or explicit stack.',
            'Most tree problems solved with one of these two patterns.',
          ],
        },
      },
    ],
  })

  console.log('✅ Demo event with curriculum and lessons created')

  console.log('\n🎉 Seeding complete!')
  console.log('\nCredentials:')
  console.log('  Admin: royvivasi@gmail.com / (password printed above)')
  console.log('  Demo:  demo@prepareai.com  / demo123!')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
