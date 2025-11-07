'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Award, Calendar, User, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface CertificateData {
  valid: boolean;
  certificate?: {
    certificateId: string;
    studentName: string;
    courseName: string;
    completedAt: string;
    progressPercentage: number;
  };
  error?: string;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const certificateId = params?.certificateId as string;
  const [data, setData] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (certificateId) {
      fetch(`/api/certificates/verify/${certificateId}`)
        .then(res => res.json())
        .then(json => {
          setData(json);
          setLoading(false);
        })
        .catch(err => {
          console.error('Verification error:', err);
          setData({ valid: false, error: 'Failed to verify certificate' });
          setLoading(false);
        });
    }
  }, [certificateId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-gray-600">Verifying certificate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Award className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Certificate Verification
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of Japanese Shikhi certificates
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-center space-x-3">
              {data?.valid ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <CardTitle className="text-2xl text-green-600">
                    Certificate Valid
                  </CardTitle>
                </>
              ) : (
                <>
                  <XCircle className="h-8 w-8 text-red-600" />
                  <CardTitle className="text-2xl text-red-600">
                    Certificate Invalid
                  </CardTitle>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data?.valid && data.certificate ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <User className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Student Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {data.certificate.studentName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <BookOpen className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Course Name</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {data.certificate.courseName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Calendar className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Completion Date</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(data.certificate.completedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Certificate ID</p>
                        <p className="text-lg font-mono font-semibold text-gray-900">
                          {data.certificate.certificateId}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <Badge className="bg-green-100 text-green-800 px-3 py-1">
                        ✓ Verified • {data.certificate.progressPercentage}% Complete
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Verification Notice:</strong> This certificate has been verified as authentic 
                    and was issued by Japanese Shikhi Platform. The student has successfully completed 
                    the course requirements.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                  <p className="text-red-800">
                    {data?.error || 'This certificate could not be verified. The certificate ID may be invalid or the certificate has not been issued yet.'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    If you believe this is an error, please contact support.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-center space-x-4">
                <Button asChild variant="outline">
                  <Link href="/">Return to Home</Link>
                </Button>
                {data?.valid && (
                  <Button asChild>
                    <Link href="/courses">Browse Courses</Link>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>Japanese Shikhi Platform • Certificate Verification System</p>
          <p className="mt-2">
            For support, contact us at{' '}
            <a href="mailto:support@japaneseshikhi.com" className="text-blue-600 hover:underline">
              support@japaneseshikhi.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
