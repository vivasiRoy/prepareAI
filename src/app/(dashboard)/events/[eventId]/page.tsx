import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateDaysUntil, formatDate, getEventTypeLabel } from '@/lib/utils'
import { SuccessMeter } from '@/components/shared/SuccessMeter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PlayCircle, FileText, BarChart3, Edit, Calendar, Target, BookOpen, Zap, Network } from 'lucide-react'
import { GenerateCurriculum } from '@/components/events/GenerateCurriculum'
import { CurriculumMindmap } from '@/components/events/CurriculumMindmap'
import { ShareReadinessCard } from '@/components/events/ShareReadinessCard'
import type { EventWithRelations } from '@/types'

export default async function EventDetailPage({ params }: { params: { eventId: string } }) {
  const session = await getServerSession()
  if (!session?.user) redirect('/signin')

  const event = await prisma.event.findFirst({
    where: { id: params.eventId, userId: session.user.id },
    include: {
      curriculum: {
        include: {
          lessons: {
            include: {
              attempts: { where: { userId: session.user.id }, orderBy: { createdAt: 'desc' }, take: 1 },
              quizzes: true,
            },
            orderBy: [{ dayNumber: 'asc' }, { order: 'asc' }],
          },
        },
      },
      goals: true,
      materials: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      metrics: { orderBy: { date: 'desc' }, take: 7 },
    },
  })

  if (!event) notFound()

  const totalLessons = event.curriculum?.lessons?.length || 0
  const completedLessons = event.curriculum?.lessons?.filter(l => l.completed).length || 0
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0
  const daysUntil = calculateDaysUntil(event.targetDate)
  const todayLessons = event.curriculum?.lessons?.filter(l => !l.completed).slice(0, 3) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="purple">{getEventTypeLabel(event.type)}</Badge>
            <Badge variant={event.status === 'ACTIVE' ? 'success' : 'warning'}>{event.status}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{formatDate(event.targetDate)}</span>
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4" />{daysUntil > 0 ? `${daysUntil} days to go` : 'Today!'}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ShareReadinessCard
            eventTitle={event.title}
            eventType={event.type}
            readiness={progress > 0 ? Math.max(event.successScore, progress) : event.successScore}
            daysToGo={daysUntil}
            userId={session.user.id}
          />
          <Link href={`/events/${event.id}/edit`}><Button variant="outline" size="sm" className="border-white/20"><Edit className="w-4 h-4 mr-1.5" /> Edit</Button></Link>
          <Link href={`/events/${event.id}/mock-exam`}>
            <Button variant="outline" size="sm" className={
              daysUntil <= 3 ? 'border-red-500/60 text-red-400 hover:bg-red-500/10 animate-pulse' :
              daysUntil <= 7 ? 'border-red-500/50 text-red-400 hover:bg-red-500/10' :
              daysUntil <= 14 ? 'border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/10' :
              'border-white/20'
            }>
              <Zap className="w-4 h-4 mr-1.5" />
              {daysUntil <= 7 ? `Mock Exam (${daysUntil}d!)` : 'Mock Exam'}
            </Button>
          </Link>
          <Link href={`/events/${event.id}/learn`}><Button variant="gradient"><PlayCircle className="w-4 h-4 mr-1.5" /> Start Session</Button></Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-navy-800 border-white/10 col-span-2 md:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center">
            <SuccessMeter score={event.successScore || 0} size="md" />
            <p className="text-xs text-gray-400 mt-2">Success Probability</p>
          </CardContent>
        </Card>
        <Card className="bg-navy-800 border-white/10">
          <CardContent className="pt-6">
            <p className="text-gray-400 text-xs mb-1">Progress</p>
            <p className="text-2xl font-bold text-white">{Math.round(progress)}%</p>
            <Progress value={progress} className="mt-2 h-1.5" />
            <p className="text-xs text-gray-500 mt-1">{completedLessons}/{totalLessons} lessons</p>
          </CardContent>
        </Card>
        <Card className="bg-navy-800 border-white/10">
          <CardContent className="pt-6">
            <p className="text-gray-400 text-xs mb-1">Today</p>
            <p className="text-2xl font-bold text-white">{todayLessons.length}</p>
            <p className="text-xs text-gray-500 mt-1">lessons remaining</p>
          </CardContent>
        </Card>
        <Card className="bg-navy-800 border-white/10">
          <CardContent className="pt-6">
            <p className="text-gray-400 text-xs mb-1">Accuracy</p>
            <p className="text-2xl font-bold text-white">{Math.round(event.metrics[0]?.accuracyRate || 0)}%</p>
            <p className="text-xs text-gray-500 mt-1">overall rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue={event.curriculum ? 'map' : 'curriculum'} className="w-full">
        <TabsList className="bg-white/5 border border-white/10">
          {event.curriculum && <TabsTrigger value="map"><Network className="w-4 h-4 mr-1.5" /> Map</TabsTrigger>}
          <TabsTrigger value="curriculum"><BookOpen className="w-4 h-4 mr-1.5" /> Curriculum</TabsTrigger>
          <TabsTrigger value="materials"><FileText className="w-4 h-4 mr-1.5" /> Materials</TabsTrigger>
          <TabsTrigger value="progress"><BarChart3 className="w-4 h-4 mr-1.5" /> Progress</TabsTrigger>
        </TabsList>

        {event.curriculum && (
          <TabsContent value="map" className="mt-6">
            <CurriculumMindmap
              eventId={event.id}
              eventTitle={event.title}
              lessons={event.curriculum.lessons.map(l => ({
                id: l.id,
                title: l.title,
                type: l.type,
                dayNumber: l.dayNumber,
                difficulty: l.difficulty,
                completed: l.completed,
                lastScore: l.attempts?.[0]?.score ?? null,
              }))}
            />
          </TabsContent>
        )}

        <TabsContent value="curriculum" className="mt-6">
          {event.curriculum ? (
            <div className="space-y-3">
              {event.curriculum.lessons.map(lesson => (
                <div key={lesson.id} className={`p-4 rounded-lg border flex items-center gap-4 ${lesson.completed ? 'border-green-500/20 bg-green-500/5' : 'border-white/10 bg-white/2'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${lesson.completed ? 'bg-green-500/20 text-green-400' : 'bg-purple-500/20 text-purple-400'}`}>
                    {lesson.dayNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${lesson.completed ? 'text-gray-400 line-through' : 'text-white'}`}>{lesson.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{lesson.type.replace('_', ' ')} • {lesson.duration} min • Difficulty {lesson.difficulty}/5</p>
                  </div>
                  <Link href={`/events/${event.id}/learn?lesson=${lesson.id}`}>
                    <Button size="sm" variant="ghost" className="shrink-0">{lesson.completed ? 'Review' : 'Start'}</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <GenerateCurriculum eventId={event.id} />
          )}
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <div className="text-center py-12">
            {event.materials.length === 0 ? (
              <p className="text-gray-400">No materials uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {event.materials.map(m => (
                  <div key={m.id} className="p-4 rounded-lg border border-white/10 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-400" />
                    <span className="text-white">{m.name}</span>
                    <Badge variant="outline" className="ml-auto">{m.type}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          <div className="space-y-4">
            {event.metrics.length === 0 ? (
              <p className="text-gray-400 text-center py-12">Complete some lessons to see your progress.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {event.metrics.map(m => (
                  <Card key={m.id} className="bg-navy-800 border-white/10">
                    <CardContent className="pt-4">
                      <p className="text-xs text-gray-400">{new Date(m.date).toLocaleDateString()}</p>
                      <p className="text-lg font-bold text-white mt-1">Score: {Math.round(m.successScore)}%</p>
                      <p className="text-xs text-gray-500">Accuracy: {Math.round(m.accuracyRate)}% • Questions: {m.questionsAnswered}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
