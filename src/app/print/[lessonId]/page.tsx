import { redirect, notFound } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PrintButton } from './PrintButton'

export const metadata = { title: 'Print Lesson' }

// LLM content occasionally returns objects where strings are expected —
// coerce so a shape variance can't crash the print render.
function toText(v: unknown): string {
  if (typeof v === 'string') return v
  if (v == null) return ''
  if (typeof v === 'object') {
    const o = v as Record<string, unknown>
    const c = o.point ?? o.text ?? o.content ?? o.example ?? o.front ?? o.title
    if (typeof c === 'string') return c
    try { return Object.values(o).filter(x => typeof x === 'string').join(' — ') } catch { return '' }
  }
  return String(v)
}

// A clean, branded, print-optimized rendering of one lesson — users hit
// "Print / Save as PDF" and get a physical-ready copy.
export default async function PrintLessonPage({ params }: { params: { lessonId: string } }) {
  const session = await getServerSession()
  if (!session?.user) redirect('/signin')

  const lesson = await prisma.lesson.findUnique({
    where: { id: params.lessonId },
    include: {
      quizzes: true,
      curriculum: { include: { event: { select: { userId: true, title: true, targetDate: true } } } },
    },
  })
  if (!lesson || lesson.curriculum.event.userId !== session.user.id) notFound()

  const content = lesson.content as any
  const event = lesson.curriculum.event

  return (
    <div className="min-h-screen bg-white text-neutral-900" style={{ colorScheme: 'light' }}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          @page { margin: 18mm 16mm; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-8 py-10 font-serif">
        {/* Brand header */}
        <header className="flex items-center justify-between pb-5 border-b-2 border-neutral-900 mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-lg font-bold" style={{ background: 'linear-gradient(135deg, #7c3aed, #22d3ee)' }}>⚡</div>
            <div>
              <div className="font-sans font-bold text-lg leading-none tracking-tight">PrepareAI</div>
              <div className="font-sans text-[11px] text-neutral-500">prepareai.co</div>
            </div>
          </div>
          <div className="text-right font-sans text-xs text-neutral-500">
            <div className="font-semibold text-neutral-700">{event.title}</div>
            <div>Day {lesson.dayNumber} · {lesson.type.replace(/_/g, ' ')} · {lesson.duration} min</div>
          </div>
        </header>

        <PrintButton />

        <h1 className="font-sans text-3xl font-bold tracking-tight mb-6">{lesson.title}</h1>

        {content?.summary && (
          <section className="mb-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-violet-700 mb-2">Overview</h2>
            <p className="leading-relaxed text-[15px]">{toText(content.summary)}</p>
          </section>
        )}

        {content?.keyPoints?.length > 0 && (
          <section className="mb-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-violet-700 mb-3">Key Points</h2>
            <ol className="space-y-2 list-none">
              {content.keyPoints.map((p: string, i: number) => (
                <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
                  <span className="font-sans font-bold text-violet-700 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <span>{toText(p)}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {content?.examples?.length > 0 && (
          <section className="mb-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-violet-700 mb-3">Worked Examples</h2>
            <div className="space-y-3">
              {content.examples.map((ex: unknown, i: number) => (
                <div key={i} className="p-4 rounded-lg border border-neutral-200 bg-neutral-50 text-[14px] leading-relaxed">
                  {toText(ex)}
                </div>
              ))}
            </div>
          </section>
        )}

        {content?.flashcards?.length > 0 && (
          <section className="mb-8" style={{ breakInside: 'avoid' }}>
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-violet-700 mb-3">Flashcards</h2>
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="font-sans text-left border-b-2 border-neutral-300">
                  <th className="py-2 pr-4 w-1/2">Prompt</th>
                  <th className="py-2">Answer</th>
                </tr>
              </thead>
              <tbody>
                {content.flashcards.map((f: any, i: number) => (
                  <tr key={i} className="border-b border-neutral-200 align-top">
                    <td className="py-2.5 pr-4 font-medium">{toText(f?.front)}</td>
                    <td className="py-2.5">{toText(f?.back)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {lesson.quizzes.length > 0 && (
          <section className="mb-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-violet-700 mb-3">Practice Questions</h2>
            <div className="space-y-4">
              {lesson.quizzes.map((q, i) => (
                <div key={q.id} style={{ breakInside: 'avoid' }}>
                  <p className="text-[14px] font-medium mb-1.5">{i + 1}. {q.question}</p>
                  {Array.isArray(q.options) && (q.options as string[]).length > 0 && (
                    <ul className="ml-5 space-y-0.5 text-[13px] text-neutral-700">
                      {(q.options as string[]).map((o, j) => <li key={j}>{o}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-dashed border-neutral-300">
              <h3 className="font-sans text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400 mb-2">Answer Key</h3>
              <ol className="text-[12px] text-neutral-600 space-y-1">
                {lesson.quizzes.map((q, i) => (
                  <li key={q.id}><span className="font-semibold">{i + 1}.</span> {q.correctAnswer}{q.explanation ? ` — ${q.explanation}` : ''}</li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {content?.furtherReading?.length > 0 && (
          <section className="mb-8">
            <h2 className="font-sans text-xs font-bold uppercase tracking-[0.15em] text-violet-700 mb-2">Further Reading</h2>
            <ul className="space-y-1 text-[13px]">
              {content.furtherReading.map((r: any, i: number) => (
                <li key={i}>{toText(r?.title)} — <span className="text-neutral-500">{toText(r?.url)}</span></li>
              ))}
            </ul>
          </section>
        )}

        <footer className="pt-5 mt-10 border-t border-neutral-200 flex justify-between font-sans text-[11px] text-neutral-400">
          <span>Generated by PrepareAI for {session.user.name || session.user.email}</span>
          <span>prepareai.co · Prepare for anything. Win everything.</span>
        </footer>
      </div>
    </div>
  )
}
