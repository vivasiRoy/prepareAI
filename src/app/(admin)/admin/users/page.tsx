'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface AdminUser {
  id: string; name: string | null; email: string; image: string | null
  plan: string; role: string; createdAt: string
  _count: { events: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/users?page=${page}&search=${search}`)
      .then(r => r.json())
      .then(d => { setUsers(d.data?.items || []); setTotal(d.data?.total || 0); setLoading(false) })
  }, [page, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users ({total})</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search users..." className="pl-10 bg-white/5 border-white/20" />
        </div>
      </div>

      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {['User', 'Plan', 'Role', 'Events', 'Joined'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={u.image || ''} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">{u.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm text-white font-medium">{u.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant={u.plan === 'PRO' ? 'purple' : u.plan === 'ENTERPRISE' ? 'cyan' : 'outline'}>{u.plan}</Badge></td>
                <td className="px-4 py-3"><Badge variant={u.role === 'ADMIN' ? 'destructive' : 'secondary'}>{u.role}</Badge></td>
                <td className="px-4 py-3"><span className="text-gray-300">{u._count.events}</span></td>
                <td className="px-4 py-3"><span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">Showing {users.length} of {total}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/20" onClick={() => setPage(p => p - 1)} disabled={page === 1}><ChevronLeft className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" className="border-white/20" onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}><ChevronRight className="w-4 h-4" /></Button>
        </div>
      </div>
    </div>
  )
}
