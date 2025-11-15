import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/admin-dashboard(.*)']);
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);
const isAdminRoute = createRouteMatcher(['/admin-dashboard(.*)']);
const isStudentRoute = createRouteMatcher(['/dashboard(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Don't protect sign-in/sign-up routes - let Clerk handle them
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId } = await auth();

  // If user is not signed in and trying to access protected routes, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.url);
    return NextResponse.redirect(signInUrl);
  }

  // For authenticated users, enforce role-based routing
  if (userId && isProtectedRoute(req)) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const userRole = (user.publicMetadata as any)?.role;
      const isAdmin = userRole === 'admin';

      // CRITICAL: Admin trying to access student dashboard -> redirect to admin dashboard
      if (isAdmin && isStudentRoute(req) && !isAdminRoute(req)) {
        console.log('Admin user attempted to access student dashboard, redirecting to admin dashboard');
        return NextResponse.redirect(new URL('/admin-dashboard', req.url));
      }

      // CRITICAL: Non-admin trying to access admin dashboard -> redirect to student dashboard
      if (!isAdmin && isAdminRoute(req)) {
        console.log('Non-admin user attempted to access admin route, redirecting to student dashboard');
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (error) {
      console.error('Error fetching user data in middleware:', error);
      // On error, redirect to student dashboard as fallback
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