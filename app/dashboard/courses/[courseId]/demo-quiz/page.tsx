'use client';

/**
 * Interactive Demo Quiz - Single Attempt Only
 * 
 * Features:
 * - Students can only take the quiz once
 * - After submission, they cannot access the quiz again
 * - Automatic redirect if quiz is already completed
 * 
 * Testing Instructions:
 * To reset the quiz completion status, open browser console and run:
 * localStorage.removeItem('quiz_YOUR_COURSE_ID_YOUR_USER_ID')
 * Or to clear all: localStorage.clear()
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    IconClock,
    IconAlertCircle,
    IconCheck,
    IconFileText,
    IconArrowLeft,
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
import Link from 'next/link';

// Demo quiz data for testing
const DEMO_QUIZ = {
    _id: 'demo-quiz-1',
    title: 'Japanese Hiragana Quiz',
    description: 'Test your knowledge of basic Japanese hiragana characters',
    quizType: 'mcq',
    timeLimit: null, // No time limit for demo
    totalPoints: 100,
    passingScore: 70,
    allowMultipleAttempts: false,
    questions: [
        {
            questionIndex: 0,
            question: 'What does the hiragana character あ (a) represent?',
            points: 25,
            options: [
                { text: 'The sound "ah" as in "father"', correct: true },
                { text: 'The sound "eh" as in "pet"', correct: false },
                { text: 'The sound "ee" as in "see"', correct: false },
                { text: 'The sound "oh" as in "go"', correct: false }
            ]
        },
        {
            questionIndex: 1,
            question: 'Which hiragana character represents the sound "ka"?',
            points: 25,
            options: [
                { text: 'き (ki)', correct: false },
                { text: 'か (ka)', correct: true },
                { text: 'く (ku)', correct: false },
                { text: 'け (ke)', correct: false }
            ]
        },
        {
            questionIndex: 2,
            question: 'What is the correct reading of this hiragana: さくら?',
            points: 25,
            options: [
                { text: 'sakura (cherry blossom)', correct: true },
                { text: 'takura', correct: false },
                { text: 'nakura', correct: false },
                { text: 'makura', correct: false }
            ]
        },
        {
            questionIndex: 3,
            question: 'Which of these is the hiragana for "ni"?',
            points: 25,
            options: [
                { text: 'な (na)', correct: false },
                { text: 'に (ni)', correct: true },
                { text: 'ぬ (nu)', correct: false },
                { text: 'ね (ne)', correct: false }
            ]
        }
    ]
};

export default function DemoQuizPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const courseId = params?.courseId as string;

    const [quiz] = useState(DEMO_QUIZ);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [alreadyCompleted, setAlreadyCompleted] = useState(false);

    // Quiz answers
    const [mcqAnswers, setMcqAnswers] = useState<{ [key: number]: number }>({});

    // Check if user has already taken this quiz - redirect if completed
    useEffect(() => {
        if (!isLoaded || !user || !courseId) return;

        const quizIdentifier = quiz.title.replace(/\s+/g, '_').toLowerCase();
        const quizKey = `quiz_${courseId}_${user.id}_${quizIdentifier}`;
        const savedQuizData = localStorage.getItem(quizKey);

        if (savedQuizData) {
            // Quiz already completed - redirect back to course
            setAlreadyCompleted(true);
            toast.error('You have already completed this quiz. Redirecting...', {
                duration: 3000
            });

            setTimeout(() => {
                router.push(`/dashboard/courses/${courseId}`);
            }, 2000);
        } else {
            // Quiz not completed yet - allow access
            setLoading(false);
        }
    }, [isLoaded, user, courseId, router]);

    const handleMCQAnswer = (questionIndex: number, optionIndex: number) => {
        if (submitted) return;

        setMcqAnswers(prev => ({
            ...prev,
            [questionIndex]: optionIndex
        }));

        // Visual feedback
        toast.success('Answer selected!');
    };

    const calculateScore = () => {
        let correct = 0;
        let total = 0;

        quiz.questions.forEach((q: any) => {
            const userAnswer = mcqAnswers[q.questionIndex];
            if (userAnswer !== undefined) {
                total += q.points;
                if (q.options[userAnswer]?.correct) {
                    correct += q.points;
                }
            }
        });

        return { correct, total, percentage: total > 0 ? Math.round((correct / total) * 100) : 0 };
    };

    const handleSubmitQuiz = async () => {
        if (submitting || submitted) return;

        const answeredCount = Object.keys(mcqAnswers).length;
        if (answeredCount < quiz.questions.length) {
            toast.error(`Please answer all ${quiz.questions.length} questions before submitting.`);
            return;
        }

        setSubmitting(true);

        // Simulate submission delay with visual feedback
        toast.loading('Submitting your quiz...', { duration: 1500 });

        setTimeout(() => {
            setSubmitted(true);
            setSubmitting(false);
            setShowSubmitDialog(false);

            const score = calculateScore();
            const passed = score.percentage >= quiz.passingScore;

            // Save quiz completion to localStorage with unique identifier
            if (user && courseId) {
                const quizIdentifier = quiz.title.replace(/\s+/g, '_').toLowerCase();
                const quizKey = `quiz_${courseId}_${user.id}_${quizIdentifier}`;
                const quizData = {
                    completed: true,
                    userId: user.id,
                    answers: mcqAnswers,
                    score: score.percentage,
                    quizTitle: quiz.title,
                    courseName: 'Japanese Course', // You can make this dynamic
                    completedAt: new Date().toISOString()
                };
                localStorage.setItem(quizKey, JSON.stringify(quizData));
                console.log('Quiz completion saved to localStorage:', quizKey);

                // Trigger storage event for same-tab updates
                window.dispatchEvent(new Event('storage'));
            }

            toast.success(
                passed
                    ? `🎉 Quiz submitted! You scored ${score.percentage}% - PASSED!`
                    : `Quiz submitted. You scored ${score.percentage}% - Quiz completed.`,
                { duration: 3000 }
            );

            // Redirect to course page after showing results briefly
            toast.info('Redirecting to course page...', { duration: 2000 });

            setTimeout(() => {
                router.push(`/dashboard/courses/${courseId}`);
            }, 3000);
        }, 1500);
    };



    const getAnsweredCount = () => {
        return Object.keys(mcqAnswers).length;
    };

    if (loading || alreadyCompleted) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Card className="max-w-md">
                    <CardContent className="pt-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <h3 className="text-lg font-semibold mb-2">
                            {alreadyCompleted ? '⚠️ Quiz Already Completed' : 'Loading quiz...'}
                        </h3>
                        {alreadyCompleted && (
                            <p className="text-muted-foreground">
                                You have already taken this quiz. Redirecting to course page...
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }

    const score = submitted ? calculateScore() : null;

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-4">
                    <Link href={`/dashboard/courses/${courseId}`}>
                        <Button variant="outline" size="sm" className="gap-2">
                            <IconArrowLeft className="size-4" />
                            Back to Course
                        </Button>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
                            {quiz.description && (
                                <p className="text-muted-foreground">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3 flex-wrap">
                                <Badge variant="outline" className="flex items-center gap-1">
                                    <IconFileText className="size-3" />
                                    {quiz.questions?.length} Questions
                                </Badge>
                                <Badge variant="secondary">
                                    Total Points: {quiz.totalPoints}
                                </Badge>
                                <Badge variant="outline">
                                    Passing: {quiz.passingScore}%
                                </Badge>
                                <Badge variant="default" className="bg-green-600">
                                    Interactive Demo
                                </Badge>
                                {submitted && (
                                    <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
                                        ✓ Completed
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {submitted && score && (
                        <Card className="border-2 mb-6 border-primary bg-primary/5">
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <div className="animate-pulse mb-4">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2">
                                        ✅ Quiz Submitted Successfully!
                                    </h3>
                                    <p className="text-lg mb-2">
                                        Your Score: <span className="font-bold">{score.correct}/{score.total} points ({score.percentage}%)</span>
                                    </p>
                                    <p className="text-muted-foreground mb-4">
                                        {score.percentage >= quiz.passingScore
                                            ? '🎉 Congratulations! You passed the quiz.'
                                            : `You scored ${score.percentage}%. Keep learning!`}
                                    </p>
                                    <p className="text-sm font-semibold text-orange-600 mb-2">
                                        Redirecting you back to the course page...
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        This quiz cannot be retaken. Your results have been saved.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Instructions - Hide after submission */}
                {!submitted && (
                    <Card className="mb-6 border-blue-200 bg-blue-50/50">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <IconAlertCircle className="size-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Quiz Instructions</h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• This is a single-attempt quiz - you can only take it once</li>
                                        <li>• Click on your chosen answer for each question</li>
                                        <li>• You can change your answers before submitting</li>
                                        <li>• Answer all questions to enable submission</li>
                                        <li>• ⚠️ Once submitted, you cannot retake this quiz</li>
                                        <li>• Results are shown immediately after submission</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* MCQ Questions - Hide after submission */}
                {!submitted && (
                    <div className="space-y-6">
                        {quiz.questions.map((q: any, qIdx: number) => {
                            const userAnswer = mcqAnswers[q.questionIndex];
                            const showResults = submitted;

                            return (
                                <Card key={qIdx} className="border-2 hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <div className="flex items-start justify-between gap-4">
                                            <CardTitle className="text-lg">
                                                <span className="text-muted-foreground mr-2">Question {qIdx + 1}.</span>
                                                {q.question}
                                            </CardTitle>
                                            <div className="flex gap-2">
                                                <Badge variant="secondary">{q.points} pts</Badge>
                                                {showResults && userAnswer !== undefined && (
                                                    <Badge variant={q.options[userAnswer]?.correct ? "default" : "destructive"} className="text-white">
                                                        {q.options[userAnswer]?.correct ? "✓ Correct" : "✗ Wrong"}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {q.options.map((opt: any, optIdx: number) => {
                                                const isSelected = userAnswer === optIdx;
                                                const isCorrect = opt.correct;

                                                let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all ";

                                                if (submitted) {
                                                    // Show results
                                                    if (isCorrect) {
                                                        buttonClass += "border-green-500 bg-green-100 text-green-800";
                                                    } else if (isSelected && !isCorrect) {
                                                        buttonClass += "border-red-500 bg-red-100 text-red-800";
                                                    } else {
                                                        buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
                                                    }
                                                } else {
                                                    // Interactive mode
                                                    if (isSelected) {
                                                        buttonClass += "border-primary bg-primary/10 shadow-sm";
                                                    } else {
                                                        buttonClass += "border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer";
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={optIdx}
                                                        onClick={() => handleMCQAnswer(q.questionIndex, optIdx)}
                                                        disabled={submitted}
                                                        className={buttonClass}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`size-5 rounded-full border-2 flex items-center justify-center ${submitted
                                                                ? (isCorrect
                                                                    ? 'border-green-500 bg-green-500'
                                                                    : isSelected
                                                                        ? 'border-red-500 bg-red-500'
                                                                        : 'border-gray-300'
                                                                )
                                                                : (isSelected
                                                                    ? 'border-primary bg-primary'
                                                                    : 'border-muted-foreground'
                                                                )
                                                                }`}>
                                                                {((submitted && isCorrect) || (!submitted && isSelected)) && (
                                                                    <IconCheck className="size-3 text-white" />
                                                                )}
                                                            </div>
                                                            <span className="flex-1">{opt.text}</span>
                                                            {submitted && isCorrect && (
                                                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                                                    Correct Answer
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Submit Section */}
                {!submitted && (
                    <Card className="mt-6 sticky bottom-4 border-2 border-primary bg-white/95 backdrop-blur-sm shadow-lg">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">
                                        Progress: {getAnsweredCount()} / {quiz.questions.length} answered
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {getAnsweredCount() === quiz.questions.length
                                            ? "✅ All questions answered - Ready to submit!"
                                            : "⚠️ Please answer all questions to submit"}
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => setShowSubmitDialog(true)}
                                    disabled={submitting || getAnsweredCount() < quiz.questions.length}
                                    className="min-w-[150px] bg-primary hover:bg-primary/90"
                                >
                                    {submitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        'Submit Quiz'
                                    )}
                                </Button>
                            </div>
                            {getAnsweredCount() < quiz.questions.length && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all duration-300"
                                            style={{ width: `${(getAnsweredCount() / quiz.questions.length) * 100}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {Math.round((getAnsweredCount() / quiz.questions.length) * 100)}% complete
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Submit Confirmation Dialog */}
            <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have answered {getAnsweredCount()} out of {quiz.questions.length} questions.
                            <br /><br />
                            <strong className="text-orange-600">⚠️ Warning: This is a single-attempt quiz!</strong>
                            <br />
                            Once you submit, you cannot retake this quiz or change your answers.
                            <br /><br />
                            Your answers will be evaluated and results shown immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={submitting}>Review Answers</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSubmitQuiz}
                            disabled={submitting}
                            className="bg-primary"
                        >
                            {submitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Yes, Submit Quiz'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}