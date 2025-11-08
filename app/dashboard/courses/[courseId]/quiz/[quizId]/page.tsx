'use client';

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

// Demo quiz data for testing
const DEMO_QUIZ = {
    _id: 'demo-quiz-1',
    title: 'Japanese Hiragana Quiz',
    description: 'Test your knowledge of basic Japanese hiragana characters',
    quizType: 'mcq',
    timeLimit: null, // No time limit for demo
    totalPoints: 100,
    passingScore: 70,
    allowMultipleAttempts: true,
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

export default function QuizDemoPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isLoaded } = useUser();

    const courseId = params?.courseId as string;
    const quizId = params?.quizId as string;

    const [quiz] = useState(DEMO_QUIZ);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    // Quiz answers
    const [mcqAnswers, setMcqAnswers] = useState<{ [key: number]: number }>({});

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

        // Simulate submission delay
        setTimeout(() => {
            setSubmitted(true);
            setSubmitting(false);
            setShowSubmitDialog(false);

            const score = calculateScore();
            const passed = score.percentage >= quiz.passingScore;

            toast.success(
                passed
                    ? `🎉 Quiz submitted! You scored ${score.percentage}% - PASSED!`
                    : `Quiz submitted. You scored ${score.percentage}% - Try again to improve!`
            );
        }, 1500);
    };

    const resetQuiz = () => {
        setMcqAnswers({});
        setSubmitted(false);
        toast.info('Quiz reset! Try again.');
    };

    const getAnsweredCount = () => {
        return Object.keys(mcqAnswers).length;
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

    const score = submitted ? calculateScore() : null;

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
                            {quiz.description && (
                                <p className="text-muted-foreground text-sm">{quiz.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
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
                                <Badge variant="default">
                                    Demo Quiz
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {submitted && score && (
                        <Card className={`border-2 ${score.percentage >= quiz.passingScore ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <h3 className="text-xl font-bold mb-2">
                                        {score.percentage >= quiz.passingScore ? '🎉 Congratulations!' : '📚 Keep Learning!'}
                                    </h3>
                                    <p className="text-lg">
                                        Your Score: <span className="font-bold">{score.correct}/{score.total} ({score.percentage}%)</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {score.percentage >= quiz.passingScore
                                            ? 'Great job! You passed the quiz.'
                                            : `You need ${quiz.passingScore}% to pass. Try again!`}
                                    </p>
                                    <Button onClick={resetQuiz} className="mt-4">
                                        Try Again
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Instructions */}
                <Card className="mb-6 border-blue-200 bg-blue-50/50">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <IconAlertCircle className="size-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Quiz Instructions</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• This is an interactive demo quiz</li>
                                    <li>• Click on your chosen answer for each question</li>
                                    <li>• You can change your answers before submitting</li>
                                    <li>• Answer all questions to enable submission</li>
                                    <li>• You can retake the quiz as many times as you want</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* MCQ Questions */}
                <div className="space-y-6">
                    {quiz.questions.map((q: any, qIdx: number) => {
                        const userAnswer = mcqAnswers[q.questionIndex];
                        const showResults = submitted;

                        return (
                            <Card key={qIdx} className="border-2">
                                <CardHeader>
                                    <div className="flex items-start justify-between gap-4">
                                        <CardTitle className="text-lg">
                                            <span className="text-muted-foreground mr-2">Q{qIdx + 1}.</span>
                                            {q.question}
                                        </CardTitle>
                                        <div className="flex gap-2">
                                            <Badge variant="secondary">{q.points} pts</Badge>
                                            {showResults && userAnswer !== undefined && (
                                                <Badge variant={q.options[userAnswer]?.correct ? "default" : "destructive"}>
                                                    {q.options[userAnswer]?.correct ? "Correct" : "Wrong"}
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
                                                    buttonClass += "border-primary bg-primary/10";
                                                } else {
                                                    buttonClass += "border-border hover:border-primary/50 hover:bg-muted/50";
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

                {/* Submit Section */}
                {!submitted && (
                    <Card className="mt-6 sticky bottom-4 border-2 border-primary">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold">
                                        Answered: {getAnsweredCount()} / {quiz.questions.length}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {getAnsweredCount() === quiz.questions.length
                                            ? "Ready to submit!"
                                            : "Answer all questions to submit"}
                                    </p>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => setShowSubmitDialog(true)}
                                    disabled={submitting || getAnsweredCount() < quiz.questions.length}
                                    className="min-w-[150px]"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            </div>
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
                            This is a demo quiz, so you can retake it as many times as you want to practice!
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