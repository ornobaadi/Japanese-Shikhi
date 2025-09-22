"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft,
  Clock, 
  Users, 
  BookOpen,
  DollarSign,
  CheckCircle,
  CreditCard,
  Shield
} from 'lucide-react';
import { Navbar5 } from '@/components/navbar-5';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Course {
  _id: string;
  title: string;
  level: string;
  estimatedDuration: number;
  enrolledStudents: number;
  totalLessons: number;
  actualPrice?: number;
  discountedPrice?: number;
  thumbnailUrl?: string;
  formattedDuration: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [alreadyEnrolled, setAlreadyEnrolled] = useState(false);
  const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
  
  // Form states for dummy payment
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const fetchCourse = async () => {
      try {
        const courseId = params?.id;
        if (!courseId) {
          setError('Course ID not found');
          setLoading(false);
          return;
        }
        
        const res = await fetch(`/api/courses/${courseId}`);
        const data = await res.json();
        
        if (data.success) {
          setCourse(data.data);
          // After loading course, check enrollment status
          try {
            const enrollCheckRes = await fetch('/api/users/me/courses');
            const enrollCheckJson = await enrollCheckRes.json();
            if (enrollCheckJson.success && Array.isArray(enrollCheckJson.data)) {
              const found = enrollCheckJson.data.some((c: any) => c._id === courseId);
              if (found) {
                setAlreadyEnrolled(true);
                setEnrollmentMessage('You are already enrolled in this course. Redirecting...');
                setTimeout(() => router.push('/dashboard/courses'), 1800);
              }
            }
          } catch (e) {
            console.warn('Enrollment status check failed', e);
          }
        } else {
          setError(data.error || 'Course not found');
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
        setError('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (params?.id) {
      fetchCourse();
    }
  }, [params?.id, isSignedIn, router]);

  const handlePayment = async () => {
    if (!course) return;
    if (alreadyEnrolled) {
      router.push('/dashboard/courses');
      return;
    }
    const finalPrice = course.discountedPrice || course.actualPrice || 0;
    
    // Skip card validation for free courses
    if (finalPrice > 0) {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
        alert('Please fill in all payment fields');
        return;
      }
    }
    
    setProcessing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Prepare enrollment data
      const enrollmentPayload: any = {
        courseId: course._id
      };
      if (finalPrice > 0) {
        enrollmentPayload.paymentData = {
          amount: finalPrice,
          paymentMethod: 'dummy_card',
          transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
      }

      console.log('Sending enrollment data:', enrollmentPayload);
      
      // Process the enrollment through our API
      let enrollmentResponse = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentPayload),
      });
      let enrollmentData = await enrollmentResponse.json();

      // If user was auto-created in backend and first call failed due to race, retry once
      if (!enrollmentData.success && enrollmentData.error?.toLowerCase().includes('user not found')) {
        console.warn('First enrollment attempt failed due to missing user. Retrying...');
        await new Promise(r => setTimeout(r, 400));
        enrollmentResponse = await fetch('/api/courses/enroll', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(enrollmentPayload),
        });
        enrollmentData = await enrollmentResponse.json();
      }

      if (!enrollmentData.success && !enrollmentData.alreadyEnrolled) {
        throw new Error(enrollmentData.error || 'Enrollment failed');
      }

      if (enrollmentData.alreadyEnrolled) {
        setEnrollmentMessage('You were already enrolled. Redirecting to your courses...');
      } else {
        setEnrollmentMessage(finalPrice > 0 ? 'Payment successful! Enrollment complete.' : 'Enrollment successful!');
      }
      
      // Redirect to dashboard courses page
      setTimeout(() => router.push('/dashboard/courses'), 1200);
    } catch (error) {
      console.error('Payment/Enrollment failed:', error);
  setEnrollmentMessage(`Enrollment failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isSignedIn) {
    return null; // Will redirect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-24" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-foreground mb-2">Course Not Found</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/courses')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const finalPrice = course.discountedPrice ?? course.actualPrice ?? 999;
  const savings = course.actualPrice && course.discountedPrice 
    ? course.actualPrice - course.discountedPrice 
    : 0;

  const formatBDT = (v: number) => `৳${v}`;

  // Debug log to check pricing
  console.log('Course pricing:', {
    actualPrice: course.actualPrice,
    discountedPrice: course.discountedPrice,
    finalPrice,
    savings
  });

  // Show a warning if course has no pricing
  if (finalPrice === 0 && !course.actualPrice && !course.discountedPrice) {
    console.warn('Course has no pricing data set');
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar5 />
      
      {/* Top spacing for floating navbar */}
      <div className="h-24" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button 
          onClick={() => router.push(`/courses/${course._id}/curriculum`)} 
          variant="ghost" 
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Course Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Course Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {course.thumbnailUrl && (
                  <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                    <img 
                      src={course.thumbnailUrl} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-semibold mb-3 text-foreground">{course.title}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Level:</span>
                    <Badge variant="secondary">{course.level || '-'}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.formattedDuration || '-'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lessons:</span>
                    <div className="flex items-center text-muted-foreground">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.totalLessons || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students:</span>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrolledStudents || 0}
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3 text-foreground">What's included:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-muted-foreground">Lifetime access to course materials</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-muted-foreground">Interactive lessons and exercises</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-muted-foreground">Progress tracking</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm text-muted-foreground">Certificate of completion</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Course Price:</span>
                                    {course.actualPrice && course.discountedPrice ? (
                                      <div className="text-right">
                                        <div className="text-lg font-semibold text-foreground">
                                          {formatBDT(course.discountedPrice as number)}
                                        </div>
                                        <div className="text-sm text-muted-foreground line-through">
                                          {formatBDT(course.actualPrice as number)}
                                        </div>
                                      </div>
                                    ) : (
                                      <span className="text-lg font-semibold text-foreground">
                                        {formatBDT(finalPrice)}
                                      </span>
                                    )}
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>You Save:</span>
                      <span className="font-semibold">{formatBDT(savings)}</span>
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="flex items-center justify-between text-lg font-bold text-foreground">
                    <span>Total:</span>
                    <span>{formatBDT(finalPrice)}</span>
                  </div>
                </div>

                {/* Payment / Enrollment Form */}
                {finalPrice > 0 && !alreadyEnrolled && (
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="cardholderName" className="block text-sm font-medium text-foreground mb-2">
                      Cardholder Name
                    </Label>
                    <Input
                      id="cardholderName"
                      name="cardholderName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.cardholderName}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="cardNumber" className="block text-sm font-medium text-foreground mb-2">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      name="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className="w-full"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate" className="block text-sm font-medium text-foreground mb-2">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiryDate"
                        name="expiryDate"
                        type="text"
                        placeholder="MM/YY"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        maxLength={5}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cvv" className="block text-sm font-medium text-foreground mb-2">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        name="cvv"
                        type="text"
                        placeholder="123"
                        value={formData.cvv}
                        onChange={handleInputChange}
                        maxLength={4}
                      />
                    </div>
                  </div>
                </div>
                )}

                {finalPrice === 0 && !alreadyEnrolled && (
                  <div className="mb-6 p-4 rounded-md border text-sm text-muted-foreground">
                    This course is free. Click the button below to enroll instantly.
                  </div>
                )}

                {/* Security Notice (only for paid) */}
                {finalPrice > 0 && !alreadyEnrolled && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        Secure Payment
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-200">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>
                )}

                {/* Enroll Button */}
                <Button 
                  onClick={handlePayment}
                  disabled={processing || alreadyEnrolled}
                  className="w-full text-lg py-6"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : alreadyEnrolled ? (
                    'Already Enrolled'
                  ) : finalPrice > 0 ? (
                    <>
                      <DollarSign className="w-5 h-5 mr-2" />
                      Complete Enrollment ({formatBDT(finalPrice)})
                    </>
                  ) : (
                    'Enroll Free'
                  )}
                </Button>

                {enrollmentMessage && (
                  <p className="text-xs text-center mt-4 text-muted-foreground">
                    {enrollmentMessage}
                  </p>
                )}

                {!enrollmentMessage && (
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By enrolling, you agree to our Terms of Service and Privacy Policy.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}