"use client";

import { SignIn } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export default function SignInPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isSignedIn) {
      // Check if there's a pending course enrollment
      const pendingCourseId = localStorage.getItem('pendingCourseEnrollment');
      const redirectUrl = searchParams.get('redirect_url');
      
      if (pendingCourseId) {
        localStorage.removeItem('pendingCourseEnrollment');
        router.push(`/payment/${pendingCourseId}`);
      } else if (redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push('/dashboard');
      }
    }
  }, [isSignedIn, router, searchParams]);

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