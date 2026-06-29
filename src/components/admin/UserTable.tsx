'use client'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Shield, UserX, ChevronUp, ChevronDown } from 'lucide-react'

interface TableUser {
  id: string
  name: string | null
  email: string
  image: string | null
  plan: string
  role: string
  createdAt: string
  _count: { events: number }
}

interface UserTableProps {
  users: TableUser[]
  onAction: (userId: string, action: 'promote' | 'demote' | 'suspend') => void
}

export function UserTable({ users, onAction }: UserTableProps) {
  const [sortField, setSortField] = useState<'createdAt' | 'plan'>('createdAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sorted = [...users].sort((a, b) => {
    const va = a[sortField] ?? ''
    const vb = b[sortField] ?? ''
    const cmp = va < vb ? -1 : va > vb ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }: { field: typeof sortField }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full">
        <thead className="bg-white/5 border-b border-white/10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('plan')}>
              <span className="flex items-center gap-1">Plan <SortIcon field="plan" /></span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Events</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer" onClick={() => toggleSort('createdAt')}>
              <span className="flex items-center gap-1">Joined <SortIcon field="createdAt" /></span>
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map(u => (
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
              <td className="px-4 py-3">
                <Badge variant={u.plan === 'PRO' ? 'purple' : u.plan === 'ENTERPRISE' ? 'cyan' : 'outline'}>{u.plan}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={u.role === 'ADMIN' ? 'destructive' : 'secondary'}>{u.role}</Badge>
              </td>
              <td className="px-4 py-3"><span className="text-gray-300 text-sm">{u._count.events}</span></td>
              <td className="px-4 py-3"><span className="text-xs text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</span></td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><MoreHorizontal className="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onAction(u.id, u.role === 'ADMIN' ? 'demote' : 'promote')}>
                      <Shield className="w-4 h-4 mr-2" /> {u.role === 'ADMIN' ? 'Remove Admin' : 'Make Admin'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onAction(u.id, 'suspend')} className="text-red-400">
                      <UserX className="w-4 h-4 mr-2" /> Suspend
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
