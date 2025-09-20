import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin-dashboard(.*)']);
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isAdminRoute = createRouteMatcher(['/admin-dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // If user is not signed in and trying to access protected routes, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // For admin routes, we need to fetch the user data to check the role
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }
    
    try {
      // Fetch user data directly from Clerk to get publicMetadata
      const user = await (await clerkClient()).users.getUser(userId);
      const userRole = (user.publicMetadata as any)?.role;
      const isAdmin = userRole === 'admin';
      
      if (!isAdmin) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // If user is signed in and trying to access sign-in/sign-up, redirect to appropriate dashboard
  if (userId && isPublicRoute(req)) {
    try {
      const user = await (await clerkClient()).users.getUser(userId);
      const isAdmin = (user.publicMetadata as any)?.role === 'admin';
      const redirectUrl = isAdmin ? '/admin-dashboard' : '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    } catch (error) {
      console.error('Error fetching user for redirect:', error);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};