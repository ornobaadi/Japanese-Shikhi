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
    
    // Basic validation for dummy form
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardholderName) {
      alert('Please fill in all payment fields');
      return;
    }
    
    setProcessing(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Replace with actual payment processing
      console.log('Processing payment with dummy data:', {
        courseId: course._id,
        userId: user?.id,
        amount: finalPrice,
        paymentData: formData
      });
      
      // Simulate successful payment
      alert(`Payment successful! You have enrolled in "${course.title}"`);
      
      // Redirect to dashboard or course page
      router.push(`/dashboard/courses/${course._id}`);
    } catch (error) {
      console.error('Payment failed:', error);
      alert('Payment failed. Please try again.');
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
      <div className="min-h-screen bg-gray-50">
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/courses')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const finalPrice = course.discountedPrice || course.actualPrice || 0;
  const savings = course.actualPrice && course.discountedPrice 
    ? course.actualPrice - course.discountedPrice 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
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
                
                <h3 className="text-xl font-semibold mb-3">{course.title}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Level:</span>
                    <Badge>{course.level || '-'}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {course.formattedDuration || '-'}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Lessons:</span>
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {course.totalLessons || 0}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Students:</span>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {course.enrolledStudents || 0}
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">What's included:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Lifetime access to course materials</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Interactive lessons and exercises</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Progress tracking</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-sm">Certificate of completion</span>
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
                    <span>Course Price:</span>
                    {course.actualPrice && course.discountedPrice ? (
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          ${course.discountedPrice}
                        </div>
                        <div className="text-sm text-gray-500 line-through">
                          ${course.actualPrice}
                        </div>
                      </div>
                    ) : (
                      <span className="text-lg font-semibold">
                        ${finalPrice}
                      </span>
                    )}
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex items-center justify-between text-green-600">
                      <span>You Save:</span>
                      <span className="font-semibold">${savings}</span>
                    </div>
                  )}
                  
                  <hr />
                  
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${finalPrice}</span>
                  </div>
                </div>

                {/* Payment Form */}
                <div className="space-y-4 mb-6">
                  <div>
                    <Label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-2">
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
                    <Label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
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
                      <Label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
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
                      <Label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
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

                {/* Security Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-900">
                        Secure Payment
                      </h4>
                      <p className="text-sm text-blue-700">
                        Your payment information is encrypted and secure.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enroll Button */}
                <Button 
                  onClick={handlePayment}
                  disabled={processing}
                  className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:opacity-90 text-lg py-6"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5 mr-2" />
                      Complete Enrollment (${finalPrice})
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  By enrolling, you agree to our Terms of Service and Privacy Policy.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}