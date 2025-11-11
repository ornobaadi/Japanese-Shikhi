"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PaymentForm } from '@/components/PaymentForm';
import { ArrowLeft, Clock, Users, BookOpen, CheckCircle } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  level: string;
  estimatedDuration: number;
  enrolledStudents?: number;
  actualPrice?: number;
  discountedPrice?: number;
  thumbnailUrl?: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const fetchCourse = async () => {
      try {
        const res = await fetch(`/api/courses/${params?.id}`);
        const data = await res.json();
        if (data.success) setCourse(data.data);
        else setError(data.error || 'Course not found');
      } catch (error) {
        setError('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [params?.id, isSignedIn, router]);

  const formatBDT = (amount: number) => `৳${amount.toLocaleString()}`;
  const finalPrice = course?.discountedPrice || course?.actualPrice || 0;
  const originalPrice = course?.actualPrice || 0;
  const discount = originalPrice - finalPrice;

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col min-h-screen">
            <div className="container mx-auto px-4 py-8">
              <Skeleton className="h-96 w-full" />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (error || !course) {
    return (
      <SidebarProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-2xl">
              <Card className="border-red-200">
                <CardContent className="py-12 text-center">
                  <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
                  <Button onClick={() => router.back()}>Go Back</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div>
                  <h3 className="font-bold text-xl mb-2">{course.title}</h3>
                  <Badge variant="secondary">{course.level}</Badge>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {course.estimatedDuration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {course.estimatedDuration} hours
                    </div>
                  )}
                  {course.enrolledStudents !== undefined && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {course.enrolledStudents} students enrolled
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">What's included:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
                      Lifetime access to course materials
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
                      Interactive lessons and exercises
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
                      Progress tracking
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500 mt-0.5" />
                      Certificate of completion
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course Price:</span>
                    <span className={discount > 0 ? "line-through text-gray-400" : "font-bold"}>
                      {formatBDT(originalPrice)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>You Save:</span>
                        <span className="font-semibold">{formatBDT(discount)}</span>
                      </div>
                      <div className="flex justify-between text-xl font-bold pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatBDT(finalPrice)}</span>
                      </div>
                    </>
                  )}
                  {!discount && (
                    <div className="flex justify-between text-xl font-bold pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatBDT(finalPrice)}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <h3 className="font-semibold mb-4 text-center">
                    Complete Payment to Enroll
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    Pay via bKash, Nagad, Upay, or Rocket
                  </p>
                  <Button 
                    size="lg"
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    onClick={() => setShowPaymentForm(true)}
                  >
                    Proceed to Payment ({formatBDT(finalPrice)})
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  By enrolling, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {showPaymentForm && (
          <PaymentForm
            open={showPaymentForm}
            onOpenChange={setShowPaymentForm}
            courseId={course._id}
            courseTitle={course.title}
            coursePrice={finalPrice}
          />
        )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}