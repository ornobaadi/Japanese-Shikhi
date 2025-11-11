'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ChatInterface } from "@/components/admin/ChatInterface";
import { toast } from "sonner";
import { 
  IconSearch, 
  IconFilter, 
  IconMail, 
  IconTrophy,
  IconClipboard,
  IconBook,
  IconChartBar,
  IconCheck,
  IconX,
  IconClock,
  IconMessageCircle
} from '@tabler/icons-react';

interface StudentProgress {
  studentId: string;
  clerkUserId: string;
  email: string;
  name: string;
  profileImage?: string;
  totalCourses: number;
  quizStats: {
    total: number;
    passed: number;
    failed: number;
    averageScore: number;
  };
  assignmentStats: {
    total: number;
    submitted: number;
    graded: number;
    pending: number;
    late: number;
    averageGrade: number;
  };
  courseProgress: any[];
  recentQuizzes: any[];
  recentAssignments: any[];
}

export default function StudentProgressPage() {
  const { user } = useUser();
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<StudentProgress | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalQuizzes: 0,
    totalAssignments: 0,
    pendingGrading: 0
  });

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, courseFilter, students]);

  const fetchStudentProgress = async () => {
    try {
      const response = await fetch('/api/admin/students/progress');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setStudents(data.students || []);
      setFilteredStudents(data.students || []);
      setSummary(data.summary || { totalStudents: 0, totalQuizzes: 0, totalAssignments: 0, pendingGrading: 0 });
    } catch (error) {
      console.error('Error fetching student progress:', error);
      toast.error('Failed to load student progress');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Course filter
    if (courseFilter && courseFilter !== 'all') {
      filtered = filtered.filter(student =>
        student.courseProgress.some(cp => cp.courseId === courseFilter)
      );
    }

    setFilteredStudents(filtered);
  };

  const handleMessageStudent = (student: StudentProgress) => {
    setSelectedStudent(student);
    setShowChatDialog(true);
  };

  const viewStudentDetails = (student: StudentProgress) => {
    setSelectedStudent(student);
    setShowDetailsDialog(true);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <SiteHeader />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading student progress...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Progress Tracking</h1>
            <p className="text-muted-foreground">
              Monitor student participation, quiz scores, and assignment submissions
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <IconBook className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalStudents}</div>
                <p className="text-xs text-muted-foreground">Enrolled in courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
                <IconTrophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">Total quiz submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assignments</CardTitle>
                <IconClipboard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.totalAssignments}</div>
                <p className="text-xs text-muted-foreground">Total submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
                <IconClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{summary.pendingGrading}</div>
                <p className="text-xs text-muted-foreground">Need to grade</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {/* TODO: Add course options dynamically */}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Student Progress Table */}
          <Card>
            <CardHeader>
              <CardTitle>Student Progress Overview</CardTitle>
              <CardDescription>
                {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="text-center">Courses</TableHead>
                    <TableHead className="text-center">Quizzes</TableHead>
                    <TableHead className="text-center">Quiz Avg</TableHead>
                    <TableHead className="text-center">Assignments</TableHead>
                    <TableHead className="text-center">Assignment Avg</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No students found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student) => (
                      <TableRow key={student.studentId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.profileImage} />
                              <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.name}</div>
                              <div className="text-sm text-muted-foreground">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{student.totalCourses}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-green-600 flex items-center gap-1">
                              <IconCheck className="h-3 w-3" />
                              {student.quizStats.passed}
                            </span>
                            <span className="text-red-600 flex items-center gap-1">
                              <IconX className="h-3 w-3" />
                              {student.quizStats.failed}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">
                              {student.quizStats.averageScore.toFixed(1)}%
                            </span>
                            <Progress 
                              value={student.quizStats.averageScore} 
                              className="h-1 w-20"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span>{student.assignmentStats.graded}/{student.assignmentStats.total}</span>
                            {student.assignmentStats.pending > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {student.assignmentStats.pending} pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {student.assignmentStats.graded > 0 ? (
                            <div className="flex flex-col items-center">
                              <span className="font-semibold">
                                {student.assignmentStats.averageGrade.toFixed(1)}%
                              </span>
                              <Progress 
                                value={student.assignmentStats.averageGrade} 
                                className="h-1 w-20"
                              />
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewStudentDetails(student)}
                            >
                              <IconChartBar className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMessageStudent(student)}
                            >
                              <IconMail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Student Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Student Progress Details</DialogTitle>
              <DialogDescription>
                Detailed progress information for {selectedStudent?.name}
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="space-y-6">
                {/* Student Info */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedStudent.profileImage} />
                    <AvatarFallback className="text-lg">
                      {selectedStudent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                  </div>
                </div>

                {/* Course Progress */}
                <div>
                  <h4 className="font-semibold mb-3">Course Progress</h4>
                  <div className="space-y-3">
                    {selectedStudent.courseProgress.map((course, idx) => (
                      <Card key={idx}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h5 className="font-medium">{course.courseName}</h5>
                              <p className="text-sm text-muted-foreground">
                                Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge>{course.progress.progressPercentage.toFixed(0)}% Complete</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Quiz Performance</p>
                              <p className="font-semibold">
                                {course.quizzes.passed}/{course.quizzes.total} passed
                                {course.quizzes.total > 0 && 
                                  ` (${course.quizzes.averageScore.toFixed(1)}% avg)`
                                }
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Assignment Performance</p>
                              <p className="font-semibold">
                                {course.assignments.graded}/{course.assignments.total} graded
                                {course.assignments.graded > 0 && 
                                  ` (${course.assignments.averageGrade.toFixed(1)}% avg)`
                                }
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-3">Recent Quiz Attempts</h4>
                    <div className="space-y-2">
                      {selectedStudent.recentQuizzes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No quiz attempts yet</p>
                      ) : (
                        selectedStudent.recentQuizzes.map((quiz, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                            <div>
                              <p className="font-medium">{quiz.courseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(quiz.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={quiz.passed ? "default" : "destructive"}>
                              {quiz.score.toFixed(0)}%
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Recent Assignments</h4>
                    <div className="space-y-2">
                      {selectedStudent.recentAssignments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No assignments submitted yet</p>
                      ) : (
                        selectedStudent.recentAssignments.map((assignment, idx) => (
                          <div key={idx} className="flex justify-between items-center text-sm border-b pb-2">
                            <div>
                              <p className="font-medium">{assignment.courseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(assignment.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {assignment.isLate && <Badge variant="destructive" className="text-xs">Late</Badge>}
                              {assignment.grade !== undefined ? (
                                <Badge>{assignment.grade.toFixed(0)}%</Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button onClick={() => handleMessageStudent(selectedStudent)}>
                    <IconMail className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                  <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Chat Interface Dialog */}
        <Dialog open={showChatDialog} onOpenChange={setShowChatDialog}>
          <DialogContent className="max-w-4xl h-[600px] p-0">
            <DialogTitle className="sr-only">
              Chat with {selectedStudent?.name}
            </DialogTitle>
            {selectedStudent && user && (
              <ChatInterface
                currentUserId={user.id}
                currentUserName={user.fullName || user.username || 'Admin'}
                recipientId={selectedStudent.clerkUserId}
                recipientName={selectedStudent.name}
              />
            )}
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
