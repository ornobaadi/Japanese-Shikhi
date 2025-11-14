import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import { User, Course, QuizSubmission, AssignmentSubmission } from '@/lib/models';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Student Progress API - Starting request');
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No userId found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('👤 User ID:', userId);
    await connectToDatabase();
    console.log('💾 Database connected');

    // Check if user is admin
    const adminUser = await User.findOne({ clerkUserId: userId });
    console.log('👨‍💼 Admin user check:', adminUser ? 'Found' : 'Not found');
    console.log('🔐 Subscription status:', adminUser?.subscriptionStatus);
    
    if (!adminUser || adminUser.subscriptionStatus !== 'lifetime') {
      console.log('❌ Access denied - not admin');
      return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    // Build query filter
    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;

    // Fetch all students with enrolled courses
    console.log('👥 Fetching students...');
    const students = await User.find({
      'enrolledCourses.0': { $exists: true } // Has at least one enrolled course
    }).select('clerkUserId email firstName lastName profileImageUrl enrolledCourses');
    console.log(`📊 Found ${students.length} students with enrolled courses`);

    // Fetch all quiz submissions
    const quizSubmissions = await QuizSubmission.find(filter)
      .sort({ submittedAt: -1 })
      .lean()
      .catch(err => {
        console.log('QuizSubmission find error:', err);
        return [];
      });

    // Fetch all assignment submissions
    const assignmentSubmissions = await AssignmentSubmission.find(filter)
      .sort({ submittedAt: -1 })
      .lean()
      .catch(err => {
        console.log('AssignmentSubmission find error:', err);
        return [];
      });

    // Fetch course details for reference
    const courseIds = [...new Set([
      ...students.flatMap(s => s.enrolledCourses.map((c: any) => c.courseId.toString())),
      ...quizSubmissions.map(q => q.courseId.toString()),
      ...assignmentSubmissions.map(a => a.courseId.toString())
    ])];

    const courses = await Course.find({
      _id: { $in: courseIds }
    }).select('_id title thumbnail');

    const courseMap = courses.reduce((acc, course) => {
      const courseId = course._id?.toString() || '';
      acc[courseId] = {
        title: course.title,
        thumbnail: course.thumbnail
      };
      return acc;
    }, {} as Record<string, any>);

    // Aggregate student progress data
    const studentProgress = students.map(student => {
      const studentQuizzes = quizSubmissions.filter(
        q => q.studentId === student.clerkUserId
      );
      
      const studentAssignments = assignmentSubmissions.filter(
        a => a.studentId === student.clerkUserId
      );

      // Calculate statistics
      const quizStats = {
        total: studentQuizzes.length,
        passed: studentQuizzes.filter(q => q.passed === true).length,
        failed: studentQuizzes.filter(q => q.passed === false).length,
        averageScore: studentQuizzes.length > 0
          ? studentQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / studentQuizzes.length
          : 0
      };

      const assignmentStats = {
        total: studentAssignments.length,
        submitted: studentAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length,
        graded: studentAssignments.filter(a => a.status === 'graded').length,
        pending: studentAssignments.filter(a => a.status === 'submitted').length,
        late: studentAssignments.filter(a => a.isLate).length,
        averageGrade: studentAssignments.filter(a => a.grade !== undefined).length > 0
          ? studentAssignments.filter(a => a.grade !== undefined).reduce((sum, a) => sum + (a.percentage || 0), 0) /
            studentAssignments.filter(a => a.grade !== undefined).length
          : 0
      };

      // Get course-wise breakdown
      const courseProgress = student.enrolledCourses.map((enrollment: any) => {
        const courseIdStr = enrollment.courseId.toString();
        const courseQuizzes = studentQuizzes.filter(q => q.courseId.toString() === courseIdStr);
        const courseAssignments = studentAssignments.filter(a => a.courseId.toString() === courseIdStr);

        return {
          courseId: courseIdStr,
          courseName: courseMap[courseIdStr]?.title || 'Unknown Course',
          thumbnail: courseMap[courseIdStr]?.thumbnail,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          quizzes: {
            total: courseQuizzes.length,
            passed: courseQuizzes.filter(q => q.passed).length,
            averageScore: courseQuizzes.length > 0
              ? courseQuizzes.reduce((sum, q) => sum + q.percentage, 0) / courseQuizzes.length
              : 0
          },
          assignments: {
            total: courseAssignments.length,
            submitted: courseAssignments.filter(a => ['submitted', 'graded'].includes(a.status)).length,
            graded: courseAssignments.filter(a => a.status === 'graded').length,
            averageGrade: courseAssignments.filter(a => a.grade !== undefined).length > 0
              ? courseAssignments.filter(a => a.grade !== undefined).reduce((sum, a) => sum + (a.percentage || 0), 0) /
                courseAssignments.filter(a => a.grade !== undefined).length
              : 0
          }
        };
      });

      return {
        studentId: student.clerkUserId,
        email: student.email,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unnamed User',
        profileImage: student.profileImageUrl,
        totalCourses: student.enrolledCourses.length,
        quizStats,
        assignmentStats,
        courseProgress,
        recentQuizzes: studentQuizzes.slice(0, 5).map(q => ({
          courseId: q.courseId,
          courseName: courseMap[q.courseId?.toString()]?.title || 'Unknown Course',
          score: q.percentage || 0,
          passed: q.passed || false,
          submittedAt: q.submittedAt
        })),
        recentAssignments: studentAssignments.slice(0, 5).map(a => ({
          courseId: a.courseId,
          courseName: courseMap[a.courseId?.toString()]?.title || 'Unknown Course',
          status: a.status || 'unknown',
          grade: a.percentage || 0,
          submittedAt: a.submittedAt,
          isLate: a.isLate || false
        }))
      };
    });

    // Sort by most active (most submissions)
    studentProgress.sort((a, b) => 
      (b.quizStats.total + b.assignmentStats.total) - (a.quizStats.total + a.assignmentStats.total)
    );

    return NextResponse.json({
      success: true,
      students: studentProgress,
      summary: {
        totalStudents: studentProgress.length,
        totalQuizzes: quizSubmissions.length,
        totalAssignments: assignmentSubmissions.length,
        pendingGrading: assignmentSubmissions.filter(a => a.status === 'submitted').length
      }
    });

  } catch (error) {
    console.error('❌ Error fetching student progress:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch student progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
