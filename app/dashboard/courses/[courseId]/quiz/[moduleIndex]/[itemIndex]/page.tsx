'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  IconClock,
  IconAlertCircle,
  IconCheck,
  IconX,
  IconUpload,
  IconFileText,
} from '@tabler/icons-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function QuizTakingPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  
  const courseId = params?.courseId as string;
  const moduleIndex = parseInt((params?.moduleIndex as string) || '0');
  const itemIndex = parseInt((params?.itemIndex as string) || '0');

  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(new Date());
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  // Quiz answers
  const [mcqAnswers, setMcqAnswers] = useState<{ [key: number]: number }>({});
  const [openEndedText, setOpenEndedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Security: Prevent copy-paste
  useEffect(() => {
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.error('Copy-paste is disabled during quiz');
    };

    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
      toast.error('Right-click is disabled during quiz');
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('contextmenu', preventRightClick);

    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('contextmenu', preventRightClick);
    };
  }, []);

  // Security: Detect tab switch
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quiz && timeRemaining !== null) {
        toast.error('⚠️ Tab switching detected! This may be recorded.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [quiz, timeRemaining]);

  // Fetch quiz data
  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchQuiz = async () => {
      try {
        const response = await fetch(
          `/api/quiz/fetch?courseId=${courseId}&moduleIndex=${moduleIndex}&itemIndex=${itemIndex}`
        );

        if (!response.ok) {
          const error = await response.json();
          if (error.alreadySubmitted) {
            toast.error('You have already submitted this quiz');
            router.push(`/dashboard/courses/${courseId}/quiz/${moduleIndex}/${itemIndex}/results`);
            return;
          }
          throw new Error(error.error || 'Failed to fetch quiz');
        }

        const data = await response.json();
        setQuiz(data.quiz);

        // Initialize timer if time limit exists
        if (data.quiz.timeLimit) {
          setTimeRemaining(data.quiz.timeLimit * 60); // Convert to seconds
        }
      } catch (error: any) {
        console.error('Error fetching quiz:', error);
        toast.error(error.message || 'Failed to load quiz');
        router.push(`/dashboard/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [isLoaded, user, courseId, moduleIndex, itemIndex, router]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeRemaining === 0 && quiz) {
        toast.error('Time is up! Submitting quiz automatically...');
        handleSubmitQuiz();
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeRemaining, quiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMCQAnswer = (questionIndex: number, optionIndex: number) => {
    setMcqAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      setUploadedFile(data.url);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const validateAnswers = () => {
    if (quiz.quizType === 'mcq') {
      const answeredCount = Object.keys(mcqAnswers).length;
      const totalQuestions = quiz.questions.length;
      
      if (answeredCount < totalQuestions) {
        return `You have answered ${answeredCount} out of ${totalQuestions} questions. Some questions are unanswered.`;
      }
    } else if (quiz.quizType === 'open-ended') {
      if (!openEndedText.trim() && !uploadedFile) {
        return 'Please provide an answer (text or file upload)';
      }
      if (quiz.acceptTextAnswer && quiz.acceptFileUpload && !openEndedText.trim() && !uploadedFile) {
        return 'Please provide at least one form of answer';
      }
    }
    return null;
  };

  const handleSubmitQuiz = async () => {
    if (submitting) return;

    const validationError = validateAnswers();
    if (validationError && timeRemaining !== 0) {
      toast.error(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const submissionData: any = {
        courseId,
        moduleIndex,
        itemIndex,
        quizType: quiz.quizType,
        startedAt: startTime.toISOString(),
      };

      if (quiz.quizType === 'mcq') {
        submissionData.answers = { mcqAnswers };
      } else {
        submissionData.answers = {
          textAnswer: openEndedText,
          fileUrl: uploadedFile,
        };
      }

      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit quiz');
      }

      const result = await response.json();
      toast.success('Quiz submitted successfully!');

      // Redirect to results page
      setTimeout(() => {
        router.push(`/dashboard/courses/${courseId}/quiz/${moduleIndex}/${itemIndex}/results`);
      }, 1000);

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'Failed to submit quiz');
      setSubmitting(false);
    }
  };

  const getAnsweredCount = () => {
    if (quiz?.quizType === 'mcq') {
      return Object.keys(mcqAnswers).length;
    }
    return openEndedText.trim() || uploadedFile ? 1 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Quiz not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b pb-4 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-muted-foreground text-sm">{quiz.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                <Badge variant="outline" className="flex items-center gap-1">
                  <IconFileText className="size-3" />
                  {quiz.quizType === 'mcq' ? `${quiz.questions?.length} Questions` : 'Open-Ended'}
                </Badge>
                <Badge variant="secondary">
                  Total Points: {quiz.totalPoints}
                </Badge>
                <Badge variant="outline">
                  Passing: {quiz.passingScore}%
                </Badge>
                {quiz.attemptNumber > 1 && (
                  <Badge variant="default">
                    Attempt #{quiz.attemptNumber}
                  </Badge>
                )}
              </div>
            </div>

            {timeRemaining !== null && (
              <Card className={`${timeRemaining < 300 ? 'border-destructive' : 'border-primary'}`}>
                <CardContent className="p-4">
                  <div className="text-center">
                    <IconClock className={`size-6 mx-auto mb-1 ${timeRemaining < 300 ? 'text-destructive' : 'text-primary'}`} />
                    <p className="text-sm text-muted-foreground mb-1">Time Left</p>
                    <p className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-destructive' : ''}`}>
                      {formatTime(timeRemaining)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Security Warning */}
        <Card className="mb-6 border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <IconAlertCircle className="size-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">Quiz Guidelines</h3>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Copy-paste and right-click are disabled</li>
                  <li>• Avoid switching tabs or windows</li>
                  <li>• Your submission time will be recorded</li>
                  <li>• Make sure to review your answers before submitting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MCQ Questions */}
        {quiz.quizType === 'mcq' && (
          <div className="space-y-6">
            {quiz.questions.map((q: any, qIdx: number) => (
              <Card key={qIdx} className="border-2">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg">
                      <span className="text-muted-foreground mr-2">Q{qIdx + 1}.</span>
                      {q.question}
                    </CardTitle>
                    <Badge variant="secondary">{q.points} pts</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {q.options.map((opt: any, optIdx: number) => (
                      <button
                        key={optIdx}
                        onClick={() => handleMCQAnswer(q.questionIndex, optIdx)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          mcqAnswers[q.questionIndex] === optIdx
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`size-5 rounded-full border-2 flex items-center justify-center ${
                            mcqAnswers[q.questionIndex] === optIdx
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground'
                          }`}>
                            {mcqAnswers[q.questionIndex] === optIdx && (
                              <IconCheck className="size-3 text-primary-foreground" />
                            )}
                          </div>
                          <span className="flex-1">{opt.text}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Open-Ended Question */}
        {quiz.quizType === 'open-ended' && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {quiz.question && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="whitespace-pre-wrap">{quiz.question}</p>
                </div>
              )}

              {quiz.questionFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <a
                    href={quiz.questionFile}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <IconFileText className="size-5" />
                    View Question PDF
                  </a>
                </div>
              )}

              {quiz.acceptTextAnswer && (
                <div>
                  <Label htmlFor="answer-text">Your Answer</Label>
                  <Textarea
                    id="answer-text"
                    placeholder="Type your answer here..."
                    rows={10}
                    value={openEndedText}
                    onChange={(e) => setOpenEndedText(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {openEndedText.length} characters
                  </p>
                </div>
              )}

              {quiz.acceptFileUpload && (
                <div>
                  <Label>Upload Your Answer (PDF)</Label>
                  <div className="mt-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      <IconUpload className="size-4 mr-2" />
                      {uploading ? 'Uploading...' : uploadedFile ? 'Change File' : 'Upload PDF Answer'}
                    </Button>
                    {uploadedFile && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IconCheck className="size-4 text-green-600" />
                          <span className="text-sm text-green-800">File uploaded successfully</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setUploadedFile('')}
                        >
                          <IconX className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Submit Section */}
        <Card className="mt-6 sticky bottom-4 border-2 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold">
                  {quiz.quizType === 'mcq'
                    ? `Answered: ${getAnsweredCount()} / ${quiz.questions.length}`
                    : getAnsweredCount() > 0 ? 'Answer provided ✓' : 'No answer yet'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Make sure to review before submitting
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
                className="min-w-[150px]"
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              {quiz.quizType === 'mcq' ? (
                <>
                  You have answered {getAnsweredCount()} out of {quiz.questions.length} questions.
                  {getAnsweredCount() < quiz.questions?.length && (
                    <span className="text-orange-600 font-medium block mt-2">
                      Warning: Some questions are unanswered!
                    </span>
                  )}
                </>
              ) : (
                <>
                  {getAnsweredCount() > 0 ? (
                    'Your answer will be submitted for grading by the instructor.'
                  ) : (
                    <span className="text-destructive font-medium">
                      You haven't provided any answer yet!
                    </span>
                  )}
                </>
              )}
              <br /><br />
              {quiz.allowMultipleAttempts
                ? 'You can attempt this quiz again later.'
                : 'This is your only attempt. Once submitted, you cannot retake this quiz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Review Answers</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="bg-primary"
            >
              {submitting ? 'Submitting...' : 'Yes, Submit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
