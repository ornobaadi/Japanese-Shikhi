'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  IconArrowLeft,
  IconFileText,
  IconCheck,
  IconClock,
  IconDownload,
  IconAlertCircle,
} from '@tabler/icons-react';

export default function AdminGradingPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = params?.id as string;
  const moduleIndex = parseInt((params?.moduleIndex as string) || '0');
  const itemIndex = parseInt((params?.itemIndex as string) || '0');

  const [submissions, setSubmissions] = useState<any>({ ungraded: [], graded: [] });
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [grading, setGrading] = useState(false);
  const [gradeForm, setGradeForm] = useState({ score: 0, feedback: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch course and quiz details
        const courseResponse = await fetch(`/api/admin/courses/${courseId}`);
        if (courseResponse.ok) {
          const courseData = await courseResponse.json();
          const module = courseData.course?.curriculum?.modules[moduleIndex];
          const quizItem = module?.items[itemIndex];
          setQuiz(quizItem);
        }

        // Fetch submissions
        const submissionsResponse = await fetch(
          `/api/quiz/grade?courseId=${courseId}&moduleIndex=${moduleIndex}&itemIndex=${itemIndex}`
        );

        if (!submissionsResponse.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = await submissionsResponse.json();
        setSubmissions({ ungraded: data.ungraded, graded: data.graded });
      } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, moduleIndex, itemIndex]);

  const handleGradeSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setGradeForm({
      score: submission.openEndedAnswer?.gradedScore || 0,
      feedback: submission.openEndedAnswer?.feedback || '',
    });
  };

  const handleSubmitGrade = async () => {
    if (!selectedSubmission) return;

    if (gradeForm.score < 0 || gradeForm.score > quiz.quizData.totalPoints) {
      toast.error(`Score must be between 0 and ${quiz.quizData.totalPoints}`);
      return;
    }

    setGrading(true);
    try {
      const response = await fetch('/api/quiz/grade', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId: selectedSubmission._id,
          score: gradeForm.score,
          feedback: gradeForm.feedback,
          courseId,
          moduleIndex,
          itemIndex,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to grade submission');
      }

      const result = await response.json();
      toast.success('Submission graded successfully');

      // Update submissions list
      setSubmissions((prev: any) => ({
        ungraded: prev.ungraded.filter((s: any) => s._id !== selectedSubmission._id),
        graded: [result.submission, ...prev.graded],
      }));

      setSelectedSubmission(null);
      setGradeForm({ score: 0, feedback: '' });
    } catch (error: any) {
      console.error('Grading error:', error);
      toast.error(error.message || 'Failed to grade submission');
    } finally {
      setGrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{
        '--sidebar-width': 'calc(var(--spacing) * 72)',
        '--header-height': 'calc(var(--spacing) * 12)',
      } as React.CSSProperties}
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin-dashboard/courses/${courseId}`}>
                    <IconArrowLeft className="size-4 mr-2" />
                    Back to Course
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Grade Quiz Submissions</h1>
                  {quiz && <p className="text-muted-foreground">{quiz.title}</p>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pending Grading</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{submissions.ungraded.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Graded</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{submissions.graded.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Total Submissions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">
                    {submissions.ungraded.length + submissions.graded.length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Submissions Tabs */}
            <Tabs defaultValue="ungraded" className="space-y-4">
              <TabsList>
                <TabsTrigger value="ungraded">
                  Pending ({submissions.ungraded.length})
                </TabsTrigger>
                <TabsTrigger value="graded">
                  Graded ({submissions.graded.length})
                </TabsTrigger>
              </TabsList>

              {/* Ungraded Submissions */}
              <TabsContent value="ungraded" className="space-y-4">
                {submissions.ungraded.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <IconCheck className="size-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">All submissions have been graded!</p>
                    </CardContent>
                  </Card>
                ) : (
                  submissions.ungraded.map((submission: any) => (
                    <Card key={submission._id} className="border-2 border-orange-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="flex items-center gap-1">
                                <IconClock className="size-3" />
                                Submitted {formatDate(submission.submittedAt)}
                              </Badge>
                              {submission.attemptNumber > 1 && (
                                <Badge variant="secondary">Attempt #{submission.attemptNumber}</Badge>
                              )}
                            </div>
                          </div>
                          <Badge variant="destructive">Pending</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {submission.openEndedAnswer?.textAnswer && (
                          <div className="mb-4">
                            <Label className="mb-2">Text Answer:</Label>
                            <div className="p-4 bg-muted rounded-lg max-h-60 overflow-y-auto">
                              <p className="whitespace-pre-wrap text-sm">
                                {submission.openEndedAnswer.textAnswer}
                              </p>
                            </div>
                          </div>
                        )}

                        {submission.openEndedAnswer?.fileUrl && (
                          <div className="mb-4">
                            <Button variant="outline" asChild>
                              <a
                                href={submission.openEndedAnswer.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconDownload className="size-4 mr-2" />
                                Download Answer PDF
                              </a>
                            </Button>
                          </div>
                        )}

                        <Button onClick={() => handleGradeSubmission(submission)}>
                          Grade This Submission
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              {/* Graded Submissions */}
              <TabsContent value="graded" className="space-y-4">
                {submissions.graded.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <IconAlertCircle className="size-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">No graded submissions yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  submissions.graded.map((submission: any) => (
                    <Card key={submission._id} className="border-2 border-green-200">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                            <p className="text-sm text-muted-foreground">{submission.studentEmail}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                Submitted {formatDate(submission.submittedAt)}
                              </Badge>
                              <Badge variant="outline">
                                Graded {formatDate(submission.openEndedAnswer?.gradedAt)}
                              </Badge>
                              {submission.attemptNumber > 1 && (
                                <Badge variant="secondary">Attempt #{submission.attemptNumber}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold">{submission.percentage}%</p>
                            <p className="text-sm text-muted-foreground">
                              {submission.score} / {submission.totalPoints} pts
                            </p>
                            <Badge variant={submission.passed ? 'default' : 'destructive'} className="mt-2">
                              {submission.passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {submission.openEndedAnswer?.textAnswer && (
                          <div className="mb-4">
                            <Label className="mb-2">Answer:</Label>
                            <div className="p-4 bg-muted rounded-lg max-h-40 overflow-y-auto">
                              <p className="whitespace-pre-wrap text-sm">
                                {submission.openEndedAnswer.textAnswer}
                              </p>
                            </div>
                          </div>
                        )}

                        {submission.openEndedAnswer?.fileUrl && (
                          <div className="mb-4">
                            <Button variant="outline" size="sm" asChild>
                              <a
                                href={submission.openEndedAnswer.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <IconFileText className="size-4 mr-2" />
                                View PDF
                              </a>
                            </Button>
                          </div>
                        )}

                        {submission.openEndedAnswer?.feedback && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <Label className="text-blue-900 mb-2">Feedback:</Label>
                            <p className="text-sm text-blue-800 whitespace-pre-wrap">
                              {submission.openEndedAnswer.feedback}
                            </p>
                          </div>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGradeSubmission(submission)}
                          className="mt-4"
                        >
                          Re-grade
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </SidebarInset>

      {/* Grading Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Student: {selectedSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Question */}
              {quiz?.quizData?.openEndedQuestion && (
                <div>
                  <Label className="mb-2">Question:</Label>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="whitespace-pre-wrap text-sm">{quiz.quizData.openEndedQuestion}</p>
                  </div>
                </div>
              )}

              {quiz?.quizData?.openEndedQuestionFile && (
                <Button variant="outline" size="sm" asChild>
                  <a
                    href={quiz.quizData.openEndedQuestionFile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconFileText className="size-4 mr-2" />
                    View Question PDF
                  </a>
                </Button>
              )}

              {/* Student Answer */}
              <div>
                <Label className="mb-2">Student Answer:</Label>
                {selectedSubmission.openEndedAnswer?.textAnswer && (
                  <div className="p-4 bg-muted rounded-lg max-h-60 overflow-y-auto mb-2">
                    <p className="whitespace-pre-wrap text-sm">
                      {selectedSubmission.openEndedAnswer.textAnswer}
                    </p>
                  </div>
                )}

                {selectedSubmission.openEndedAnswer?.fileUrl && (
                  <Button variant="outline" asChild className="w-full">
                    <a
                      href={selectedSubmission.openEndedAnswer.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconDownload className="size-4 mr-2" />
                      Download Answer PDF
                    </a>
                  </Button>
                )}
              </div>

              {/* Grading Form */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="score">Score (out of {quiz?.quizData?.totalPoints}) *</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      max={quiz?.quizData?.totalPoints || 100}
                      value={gradeForm.score}
                      onChange={(e) =>
                        setGradeForm({ ...gradeForm, score: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div>
                    <Label>Percentage</Label>
                    <div className="h-10 px-3 py-2 border rounded-md flex items-center bg-muted">
                      <p className="font-medium">
                        {quiz?.quizData?.totalPoints
                          ? Math.round((gradeForm.score / quiz.quizData.totalPoints) * 100)
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="feedback">Feedback (optional)</Label>
                  <Textarea
                    id="feedback"
                    placeholder="Provide feedback to the student..."
                    rows={5}
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedSubmission(null)} disabled={grading}>
              Cancel
            </Button>
            <Button onClick={handleSubmitGrade} disabled={grading}>
              {grading ? 'Saving...' : 'Submit Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
