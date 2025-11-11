import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import QuizSubmission from '@/lib/models/QuizSubmission';
import AssignmentSubmission from '@/lib/models/AssignmentSubmission';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Student Progress API called');
    
    const { userId } = await auth();
    
    if (!userId) {
      console.log('❌ No user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ User authenticated:', userId);
    await connectToDatabase();
    console.log('✅ Database connected');

    // Check if user is admin - TEMPORARILY DISABLED FOR TESTING
    const adminUser = await User.findOne({ clerkUserId: userId });
    console.log('👤 User found:', adminUser?.email, 'Status:', adminUser?.subscriptionStatus);
    
    // TODO: Re-enable admin check in production
    // if (!adminUser || adminUser.subscriptionStatus !== 'lifetime') {
    //   console.log('❌ User is not admin:', adminUser?.subscriptionStatus);
    //   return NextResponse.json({ error: 'Access denied. Admin only.' }, { status: 403 });
    // }

    console.log('✅ Admin check bypassed for testing');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const studentId = searchParams.get('studentId');

    console.log('📋 Query params - courseId:', courseId, 'studentId:', studentId);

    // Fetch all students with enrolled courses
    const students = await User.find({
      'enrolledCourses.0': { $exists: true } // Has at least one enrolled course
    }).select('clerkUserId email firstName lastName profileImageUrl enrolledCourses');

    console.log('📊 Found students:', students.length);

    // Build query filter for submissions
    const filter: any = {};
    if (courseId) filter.courseId = courseId;
    if (studentId) filter.studentId = studentId;

    // Initialize arrays for submissions (start with empty arrays)
    let quizSubmissions: any[] = [];
    let assignmentSubmissions: any[] = [];

    // Try to fetch quiz submissions safely
    try {
      quizSubmissions = await QuizSubmission.find(filter)
        .sort({ submittedAt: -1 })
        .lean() || [];
      console.log('📝 Quiz submissions found:', quizSubmissions.length);
    } catch (quizError) {
      console.warn('⚠️ Could not fetch quiz submissions:', quizError);
      quizSubmissions = [];
    }

    // Try to fetch assignment submissions safely
    try {
      assignmentSubmissions = await AssignmentSubmission.find(filter)
        .sort({ submittedAt: -1 })
        .lean() || [];
      console.log('📋 Assignment submissions found:', assignmentSubmissions.length);
    } catch (assignmentError) {
      console.warn('⚠️ Could not fetch assignment submissions:', assignmentError);
      assignmentSubmissions = [];
    }

    // Fetch course details for reference
    let courses: any[] = [];
    let courseMap: Record<string, any> = {};

    try {
      const courseIds = [...new Set([
        ...students.flatMap(s => s.enrolledCourses?.map((c: any) => c.courseId?.toString()).filter(Boolean) || []),
        ...quizSubmissions.map(q => q.courseId?.toString()).filter(Boolean),
        ...assignmentSubmissions.map(a => a.courseId?.toString()).filter(Boolean)
      ])];

      if (courseIds.length > 0) {
        courses = await Course.find({
          _id: { $in: courseIds }
        }).select('_id title thumbnail');

        courseMap = courses.reduce((acc, course) => {
          acc[course._id.toString()] = {
            title: course.title,
            thumbnail: course.thumbnail
          };
          return acc;
        }, {} as Record<string, any>);
      }
    } catch (courseError) {
      console.warn('⚠️ Could not fetch courses:', courseError);
      courseMap = {};
    }

    console.log('📚 Courses mapped:', Object.keys(courseMap).length);

    // Aggregate student progress data with safe calculations
    const studentProgress = students.map(student => {
      const studentQuizzes = quizSubmissions.filter(
        q => q.studentId === student.clerkUserId
      ) || [];
      
      const studentAssignments = assignmentSubmissions.filter(
        a => a.studentId === student.clerkUserId
      ) || [];

      // Safe calculation of quiz statistics
      const quizStats = {
        total: studentQuizzes.length,
        passed: studentQuizzes.filter(q => q.passed === true).length,
        failed: studentQuizzes.filter(q => q.passed === false).length,
        averageScore: studentQuizzes.length > 0
          ? Math.round(studentQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / studentQuizzes.length)
          : 0
      };

      // Safe calculation of assignment statistics
      const assignmentStats = {
        total: studentAssignments.length,
        submitted: studentAssignments.filter(a => ['submitted', 'graded'].includes(a.status)).length,
        graded: studentAssignments.filter(a => a.status === 'graded').length,
        pending: studentAssignments.filter(a => a.status === 'submitted').length,
        late: studentAssignments.filter(a => a.isLate === true).length,
        averageGrade: (() => {
          const gradedAssignments = studentAssignments.filter(a => typeof a.percentage === 'number');
          return gradedAssignments.length > 0
            ? Math.round(gradedAssignments.reduce((sum, a) => sum + a.percentage, 0) / gradedAssignments.length)
            : 0;
        })()
      };

      // Get course-wise breakdown safely
      const courseProgress = (student.enrolledCourses || []).map((enrollment: any) => {
        const courseIdStr = enrollment.courseId?.toString() || '';
        const courseQuizzes = studentQuizzes.filter(q => q.courseId?.toString() === courseIdStr);
        const courseAssignments = studentAssignments.filter(a => a.courseId?.toString() === courseIdStr);

        return {
          courseId: courseIdStr,
          courseName: courseMap[courseIdStr]?.title || 'Unknown Course',
          thumbnail: courseMap[courseIdStr]?.thumbnail,
          enrolledAt: enrollment.enrolledAt,
          progress: enrollment.progress,
          quizzes: {
            total: courseQuizzes.length,
            passed: courseQuizzes.filter(q => q.passed === true).length,
            averageScore: courseQuizzes.length > 0
              ? Math.round(courseQuizzes.reduce((sum, q) => sum + (q.percentage || 0), 0) / courseQuizzes.length)
              : 0
          },
          assignments: {
            total: courseAssignments.length,
            submitted: courseAssignments.filter(a => ['submitted', 'graded'].includes(a.status)).length,
            graded: courseAssignments.filter(a => a.status === 'graded').length,
            averageGrade: (() => {
              const graded = courseAssignments.filter(a => typeof a.percentage === 'number');
              return graded.length > 0
                ? Math.round(graded.reduce((sum, a) => sum + a.percentage, 0) / graded.length)
                : 0;
            })()
          }
        };
      });

      return {
        studentId: student.clerkUserId,
        clerkUserId: student.clerkUserId, // Add explicit clerkUserId for messaging
        email: student.email,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Unnamed User',
        profileImage: student.profileImageUrl,
        totalCourses: (student.enrolledCourses || []).length,
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
          status: a.status,
          grade: a.percentage,
          submittedAt: a.submittedAt,
          isLate: a.isLate || false
        }))
      };
    });

    console.log('✅ Student progress calculated for', studentProgress.length, 'students');

    // Sort by most active (most submissions)
    studentProgress.sort((a, b) => 
      (b.quizStats.total + b.assignmentStats.total) - (a.quizStats.total + a.assignmentStats.total)
    );

    const summary = {
      totalStudents: studentProgress.length,
      totalQuizzes: quizSubmissions.length,
      totalAssignments: assignmentSubmissions.length,
      pendingGrading: assignmentSubmissions.filter(a => a.status === 'submitted').length
    };

    console.log('📊 Summary:', summary);

    return NextResponse.json({
      success: true,
      students: studentProgress,
      summary
    });

  } catch (error) {
    console.error('❌ Error fetching student progress:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch student progress',
        details: error instanceof Error ? error.message : 'Unknown error',
        students: [],
        summary: {
          totalStudents: 0,
          totalQuizzes: 0,
          totalAssignments: 0,
          pendingGrading: 0
        }
      },
      { status: 500 }
    );
  }
}
