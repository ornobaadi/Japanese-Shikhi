import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const cookieStore = await cookies()
  cookieStore.set('admin_session', '', { path: '/', maxAge: 0 })
  const res = NextResponse.redirect(new URL('/admin-login', req.url))
  res.headers.set('Cache-Control', 'no-store')
  return res
}
