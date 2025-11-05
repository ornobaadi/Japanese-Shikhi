"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const setupAdmin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
        toast.success('Admin role set successfully!');
      } else {
        toast.error(data.error || 'Failed to set admin role');
      }
    } catch (error) {
      toast.error('Failed to set admin role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>
            Click the button below to set yourself as admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={setupAdmin} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Setting up...' : 'Set as Admin'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">Success!</p>
              <p className="text-sm text-green-600 mt-1">Email: {result.email}</p>
              <p className="text-sm text-green-600">User ID: {result.userId}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
