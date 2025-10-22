'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  IconCheck,
  IconX,
  IconClock,
  IconTrophy,
  IconArrowLeft,
  IconDownload,
  IconAlertCircle,
  IconFileText,
  IconRefresh,
} from '@tabler/icons-react';

export default function QuizResultsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const courseId = params?.courseId as string;
  const moduleIndex = parseInt((params?.moduleIndex as string) || '0');
  const itemIndex = parseInt((params?.itemIndex as string) || '0');

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/quiz/results?courseId=${courseId}&moduleIndex=${moduleIndex}&itemIndex=${itemIndex}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        setResults(data);
      } catch (error: any) {
        console.error('Error fetching results:', error);
        toast.error(error.message || 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [isLoaded, user, courseId, moduleIndex, itemIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
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

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 75) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 85) return 'A';
    if (percentage >= 80) return 'A-';
    if (percentage >= 75) return 'B+';
    if (percentage >= 70) return 'B';
    if (percentage >= 65) return 'B-';
    if (percentage >= 60) return 'C+';
    if (percentage >= 55) return 'C';
    if (percentage >= 50) return 'C-';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading results...</p>
        </div>
      </div>
    );
  }

  if (!results || !results.submissions || results.submissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">No results found</p>
            <Button asChild>
              <Link href={`/dashboard/courses/${courseId}`}>
                <IconArrowLeft className="size-4 mr-2" />
                Back to Course
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const latestSubmission = results.submissions[0];
  const isMCQ = latestSubmission.mcqAnswers !== undefined;
  const isGraded = isMCQ || (latestSubmission.openEndedAnswer?.gradedScore !== undefined);

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/dashboard/courses/${courseId}`}>
              <IconArrowLeft className="size-4 mr-2" />
              Back to Course
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Quiz Results</h1>
        </div>

        {/* Score Overview */}
        <Card className={`mb-6 border-2 ${getGradeColor(latestSubmission.percentage)}`}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <IconTrophy className="size-12 mx-auto mb-2" />
                <p className="text-4xl font-bold">{getGrade(latestSubmission.percentage)}</p>
                <p className="text-sm text-muted-foreground">Grade</p>
              </div>
              
              <div className="text-center">
                <p className="text-4xl font-bold">{latestSubmission.percentage}%</p>
                <p className="text-sm text-muted-foreground">Score</p>
                <Badge variant={latestSubmission.passed ? 'default' : 'destructive'} className="mt-2">
                  {latestSubmission.passed ? 'Passed' : 'Failed'}
                </Badge>
              </div>

              <div className="text-center">
                <p className="text-3xl font-bold">
                  {latestSubmission.score} / {latestSubmission.totalPoints}
                </p>
                <p className="text-sm text-muted-foreground">Points Earned</p>
              </div>

              <div className="text-center">
                <IconClock className="size-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatTime(latestSubmission.timeSpent)}</p>
                <p className="text-sm text-muted-foreground">Time Taken</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t text-center">
              <p className="text-sm text-muted-foreground">
                Submitted on {formatDate(latestSubmission.submittedAt)}
                {latestSubmission.attemptNumber > 1 && ` • Attempt #${latestSubmission.attemptNumber}`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* MCQ Results with Answers */}
        {isMCQ && results.showAnswers && results.questions && (
          <div className="space-y-4 mb-6">
            <h2 className="text-2xl font-bold mb-4">Question Review</h2>
            {results.questions.map((q: any, qIdx: number) => {
              const studentAnswer = latestSubmission.mcqAnswers.find(
                (a: any) => a.questionIndex === qIdx
              );
              const correctOptionIndex = q.options.findIndex((opt: any) => opt.isCorrect);
              const isCorrect = studentAnswer?.isCorrect || false;

              return (
                <Card key={qIdx} className={`border-2 ${isCorrect ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <CardTitle className="text-lg flex items-start gap-2">
                        {isCorrect ? (
                          <IconCheck className="size-6 text-green-600 mt-0.5" />
                        ) : (
                          <IconX className="size-6 text-red-600 mt-0.5" />
                        )}
                        <span>
                          <span className="text-muted-foreground mr-2">Q{qIdx + 1}.</span>
                          {q.question}
                        </span>
                      </CardTitle>
                      <Badge variant={isCorrect ? 'default' : 'destructive'}>
                        {studentAnswer?.pointsEarned || 0} / {q.points} pts
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {q.options.map((opt: any, optIdx: number) => {
                        const isStudentAnswer = studentAnswer?.selectedOptionIndex === optIdx;
                        const isCorrectOption = optIdx === correctOptionIndex;

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border-2 ${
                              isCorrectOption
                                ? 'border-green-500 bg-green-50'
                                : isStudentAnswer
                                ? 'border-red-500 bg-red-50'
                                : 'border-border'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              {isCorrectOption && (
                                <IconCheck className="size-5 text-green-600" />
                              )}
                              {isStudentAnswer && !isCorrectOption && (
                                <IconX className="size-5 text-red-600" />
                              )}
                              <span className="flex-1">
                                {opt.text}
                                {isCorrectOption && (
                                  <Badge variant="outline" className="ml-2 text-xs text-green-600">
                                    Correct Answer
                                  </Badge>
                                )}
                                {isStudentAnswer && !isCorrectOption && (
                                  <Badge variant="outline" className="ml-2 text-xs text-red-600">
                                    Your Answer
                                  </Badge>
                                )}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && !isCorrect && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Explanation:</p>
                        <p className="text-sm text-blue-800">{q.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* MCQ Results without Answers */}
        {isMCQ && !results.showAnswers && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <IconAlertCircle className="size-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Detailed answers are not available for this quiz</p>
                <p className="text-sm mt-2">The instructor has chosen not to display correct answers.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Open-Ended Results */}
        {!isMCQ && (
          <div className="space-y-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent>
                {results.question && (
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <p className="whitespace-pre-wrap">{results.question}</p>
                  </div>
                )}
                
                {results.questionFile && (
                  <Button variant="outline" asChild className="mb-4">
                    <a href={results.questionFile} target="_blank" rel="noopener noreferrer">
                      <IconFileText className="size-4 mr-2" />
                      View Question PDF
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Your Answer</CardTitle>
              </CardHeader>
              <CardContent>
                {latestSubmission.openEndedAnswer?.textAnswer && (
                  <div className="p-4 bg-muted rounded-lg mb-4">
                    <p className="whitespace-pre-wrap">{latestSubmission.openEndedAnswer.textAnswer}</p>
                  </div>
                )}

                {latestSubmission.openEndedAnswer?.fileUrl && (
                  <Button variant="outline" asChild>
                    <a href={latestSubmission.openEndedAnswer.fileUrl} target="_blank" rel="noopener noreferrer">
                      <IconDownload className="size-4 mr-2" />
                      Download Your Answer PDF
                    </a>
                  </Button>
                )}

                {!isGraded && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <IconClock className="size-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-900">Pending Grading</p>
                        <p className="text-sm text-yellow-800 mt-1">
                          Your answer has been submitted and is awaiting review by the instructor.
                          You will be notified once it has been graded.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isGraded && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <IconCheck className="size-5 text-green-600" />
                        <p className="font-medium text-green-900">Graded</p>
                      </div>
                      <p className="text-sm text-green-800">
                        Graded on {formatDate(latestSubmission.openEndedAnswer.gradedAt)}
                      </p>
                    </div>

                    {latestSubmission.openEndedAnswer.feedback && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-medium text-blue-900 mb-2">Instructor Feedback:</p>
                        <p className="text-sm text-blue-800 whitespace-pre-wrap">
                          {latestSubmission.openEndedAnswer.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Multiple Attempts */}
        {results.submissions.length > 1 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>All Attempts ({results.submissions.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.submissions.map((submission: any, idx: number) => (
                  <div
                    key={submission._id}
                    className={`p-4 rounded-lg border ${
                      idx === 0 ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <Badge variant={idx === 0 ? 'default' : 'secondary'} className="mb-2">
                          Attempt #{submission.attemptNumber}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(submission.submittedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{submission.percentage}%</p>
                        <p className="text-sm text-muted-foreground">
                          {submission.score} / {submission.totalPoints} pts
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/courses/${courseId}`}>
              <IconArrowLeft className="size-4 mr-2" />
              Back to Course
            </Link>
          </Button>

          {/* Show retake button only for MCQ or if allowed */}
          {results.submissions[0].quizType === 'mcq' && (
            <Button asChild>
              <Link href={`/dashboard/courses/${courseId}/quiz/${moduleIndex}/${itemIndex}`}>
                <IconRefresh className="size-4 mr-2" />
                Retake Quiz
              </Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
