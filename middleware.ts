import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const session = req.cookies.get('admin_session')?.value

  if (pathname === '/admin-login') {
    if (session === 'true') {
      const url = req.nextUrl.clone()
      url.pathname = '/admin'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (session === 'true') {
      return NextResponse.next()
    }
    const url = req.nextUrl.clone()
    url.pathname = '/admin-login'
    if (pathname !== '/admin') {
      url.searchParams.set('next', `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`)
    }
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/admin-login'],
}
