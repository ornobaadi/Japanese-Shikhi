"use client";

import { SignIn } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Check user role to determine correct dashboard
      const userRole = (user.publicMetadata as any)?.role;
      const isAdmin = userRole === 'admin';

      // Check if there's a pending course enrollment
      const pendingCourseId = localStorage.getItem('pendingCourseEnrollment');
      // Use window.location.search on the client to avoid useSearchParams suspense during prerender
      const redirectUrl = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect_url')
        : null;

      if (pendingCourseId) {
        localStorage.removeItem('pendingCourseEnrollment');
        router.push(`/payment/${pendingCourseId}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        // CRITICAL: Redirect based on user role
        if (isAdmin) {
          console.log('Admin signed in, redirecting to admin dashboard');
          router.push('/admin-dashboard');
        } else {
          console.log('Student signed in, redirecting to student dashboard');
          router.push('/dashboard');
        }
      }
    }
  }, [isSignedIn, user, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            এসো জাপানিজ শিখি
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
            },
          }}
        />
      </div>
    </div>
  );
}