import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

async function login(formData: FormData) {
  'use server'
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    redirect('/admin-login?error=server')
  }

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    const next = String(formData.get('next') || '')
    redirect(next && next.startsWith('/admin') ? next : '/admin')
  }

  redirect('/admin-login?error=1')
}

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = await searchParams
  const next = typeof params?.next === 'string' ? params.next : ''
  const error = typeof params?.error === 'string' ? params.error : ''
  return (
    <div className="min-h-[calc(100dvh-0px)] grid place-items-center bg-gradient-to-br from-background to-muted/30 px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in with your admin credentials</p>
        </div>
        <form action={login} className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="admin@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
        {error && (
          <p className="text-xs text-destructive mt-3 text-center">
            {error === 'server' ? 'Server misconfigured. Set ADMIN_EMAIL and ADMIN_PASSWORD.' : 'Invalid credentials.'}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Use credentials from <code>.env.local</code>
        </p>
      </div>
    </div>
  )
}
