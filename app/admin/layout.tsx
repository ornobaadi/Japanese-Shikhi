import type { ReactNode } from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const isAuthed = cookieStore.get('admin_session')?.value === 'true'
  
  if (!isAuthed) {
    redirect('/admin-login')
  }

  return (
    <div className="min-h-dvh grid grid-cols-1 md:grid-cols-[280px_1fr]">
      <aside className="hidden md:flex flex-col gap-4 border-r bg-sidebar p-6">
        <div className="text-lg font-semibold tracking-tight">Admin</div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/admin" className="px-3 py-2 rounded-md hover:bg-accent">Dashboard</Link>
        </nav>
        <div className="mt-auto">
          <form action="/admin/logout" method="post">
            <Button type="submit" variant="outline" className="w-full">Logout</Button>
          </form>
        </div>
      </aside>
      <main className="p-6 md:p-8 bg-gradient-to-b from-background to-muted/20">
        <header className="mb-6 flex items-center justify-between md:hidden">
          <div className="text-lg font-semibold tracking-tight">Admin</div>
          <form action="/admin/logout" method="post">
            <Button type="submit" variant="outline">Logout</Button>
          </form>
        </header>
        {children}
      </main>
    </div>
  )
}
