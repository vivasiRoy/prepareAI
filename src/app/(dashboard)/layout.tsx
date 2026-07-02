import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { Sidebar } from '@/components/shared/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  if (!session?.user) redirect('/signin')

  return (
    <div className="flex min-h-screen bg-mesh">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
