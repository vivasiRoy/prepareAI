'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2, Save, User, Bell, Trash2 } from 'lucide-react'

export default function SettingsPage() {
  const { data: session, update } = useSession()
  const [name, setName] = useState(session?.user?.name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    await update({ name })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      <Card className="bg-navy-800 border-white/10">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><User className="w-5 h-5 text-purple-400" /> Profile</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-purple-600 text-white text-xl">{name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-medium">{session?.user?.email}</p>
              <p className="text-gray-400 text-sm">Signed in via OAuth</p>
            </div>
          </div>
          <div>
            <Label className="text-gray-300 mb-1.5 block">Display Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} className="bg-white/5 border-white/20" placeholder="Your name" />
          </div>
          <Button variant="gradient" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-navy-800 border-white/10">
        <CardHeader><CardTitle className="flex items-center gap-2 text-white"><Bell className="w-5 h-5 text-purple-400" /> Notifications</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm">Email notification preferences coming soon.</p>
        </CardContent>
      </Card>

      <Card className="bg-navy-800 border-red-900/20">
        <CardHeader><CardTitle className="flex items-center gap-2 text-red-400"><Trash2 className="w-5 h-5" /> Danger Zone</CardTitle></CardHeader>
        <CardContent>
          <p className="text-gray-400 text-sm mb-4">Once you delete your account, there is no going back.</p>
          <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  )
}
