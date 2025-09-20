'use client';

import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ClerkTestPage() {
  const { user, isLoaded } = useUser();

  const checkSession = async () => {
    try {
      const response = await fetch('/api/test-session');
      const data = await response.json();
      console.log('Server session data:', data);
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>Please sign in</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Clerk Session Test</CardTitle>
          <CardDescription>Debug Clerk user data and metadata</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Client-side User Data:</h3>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
              {JSON.stringify({
                id: user.id,
                email: user.primaryEmailAddress?.emailAddress,
                publicMetadata: user.publicMetadata,
              }, null, 2)}
            </pre>
          </div>
          
          <div>
            <h3 className="font-semibold">Admin Status:</h3>
            <p>Role: {(user.publicMetadata as any)?.role || 'No role set'}</p>
            <p>Is Admin: {(user.publicMetadata as any)?.role === 'admin' ? 'Yes' : 'No'}</p>
          </div>

          <Button onClick={checkSession}>
            Check Server Session
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}