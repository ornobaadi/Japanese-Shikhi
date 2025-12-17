import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await clientPromise;
    const db = (await import('mongoose')).connection.db;
    if (!db) throw new Error('MongoDB connection is not established');

    // Get user's enrolled courses
    const enrollments = await db
      .collection('enrollments')
      .find({ userId: user.id })
      .toArray();

    const courseIds = enrollments.map(e => e.courseId);

    // Fetch notifications from multiple sources
    const [courses, assignments, resources, submissions] = await Promise.all([
      // Get course details
      db.collection('courses')
        .find({ _id: { $in: courseIds.map(id => new ObjectId(id)) } })
        .project({ title: 1 })
        .toArray(),

      // Get recent assignments (last 30 days)
      db.collection('courses')
        .aggregate([
          { $match: { _id: { $in: courseIds.map(id => new ObjectId(id)) } } },
          { $unwind: '$modules' },
          { $unwind: '$modules.items' },
          {
            $match: {
              'modules.items.type': 'assignment',
              'modules.items.createdAt': {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
              }
            }
          },
          {
            $project: {
              courseId: '$_id',
              courseTitle: '$title',
              assignmentTitle: '$modules.items.title',
              assignmentDescription: '$modules.items.description',
              dueDate: '$modules.items.dueDate',
              createdAt: '$modules.items.createdAt',
              moduleIndex: '$modules.moduleIndex',
              itemIndex: '$modules.items.itemIndex'
            }
          },
          { $sort: { createdAt: -1 } },
          { $limit: 20 }
        ])
        .toArray(),

      // Get recent resources (last 30 days)
      db.collection('resources')
        .find({
          courseId: { $in: courseIds },
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray(),

      // Get user's recent assignment submissions
      db.collection('assignmentSubmissions')
        .find({
          studentId: user.id,
          submittedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
        .sort({ submittedAt: -1 })
        .limit(20)
        .toArray()
    ]);

    // Create course map
    const courseMap = new Map(
      courses.map(c => [c._id.toString(), c.title])
    );

    // Format notifications
    const notifications: any[] = [];

    // Add assignment notifications
    for (const assignment of assignments) {
      const courseTitle = courseMap.get(assignment.courseId.toString()) || 'Unknown Course';
      
      // Check if student has submitted
      const hasSubmitted = submissions.some(
        s => s.courseId === assignment.courseId.toString() &&
             s.assignmentId === `${assignment.moduleIndex}-${assignment.itemIndex}`
      );

      // Calculate time remaining
      let timeRemaining = null;
      let isOverdue = false;
      if (assignment.dueDate) {
        const now = new Date();
        const dueDate = new Date(assignment.dueDate);
        const diff = dueDate.getTime() - now.getTime();
        
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          if (days > 0) {
            timeRemaining = `${days} day${days > 1 ? 's' : ''} remaining`;
          } else if (hours > 0) {
            timeRemaining = `${hours} hour${hours > 1 ? 's' : ''} remaining`;
          } else {
            timeRemaining = 'Less than 1 hour';
          }
        } else {
          isOverdue = true;
          timeRemaining = 'Overdue';
        }
      }

      notifications.push({
        type: 'assignment',
        courseId: assignment.courseId.toString(),
        courseTitle,
        title: assignment.assignmentTitle,
        description: assignment.assignmentDescription,
        dueDate: assignment.dueDate,
        timeRemaining,
        isOverdue,
        hasSubmitted,
        createdAt: assignment.createdAt,
        link: `/dashboard/courses/${assignment.courseId}/curriculum`
      });
    }

    // Add resource notifications
    for (const resource of resources) {
      const courseTitle = courseMap.get(resource.courseId) || 'Unknown Course';
      
      notifications.push({
        type: 'resource',
        courseId: resource.courseId,
        courseTitle,
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType,
        attachments: resource.attachments || [],
        createdAt: resource.createdAt,
        link: `/dashboard/courses/${resource.courseId}/curriculum`
      });
    }

    // Add submission status notifications (graded assignments)
    for (const submission of submissions) {
      if (submission.status === 'graded' && submission.grade) {
        const courseTitle = courseMap.get(submission.courseId) || 'Unknown Course';
        
        notifications.push({
          type: 'submission',
          courseId: submission.courseId,
          courseTitle,
          title: `${submission.assignmentTitle} - Graded`,
          description: `Your assignment has been graded: ${submission.grade}/${submission.maxGrade || 100}`,
          grade: submission.grade,
          maxGrade: submission.maxGrade || 100,
          feedback: submission.feedback,
          gradedAt: submission.gradedAt,
          createdAt: submission.gradedAt || submission.submittedAt,
          link: `/dashboard/courses/${submission.courseId}/curriculum`
        });
      }
    }

    // Add announcements from course updates
    const announcements = await db.collection('courses')
      .aggregate([
        { $match: { _id: { $in: courseIds.map(id => new ObjectId(id)) } } },
        { $unwind: '$modules' },
        { $unwind: '$modules.items' },
        {
          $match: {
            'modules.items.type': 'announcement',
            'modules.items.createdAt': {
              $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $project: {
            courseId: '$_id',
            courseTitle: '$title',
            announcementTitle: '$modules.items.title',
            announcementContent: '$modules.items.content',
            createdAt: '$modules.items.createdAt'
          }
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 }
      ])
      .toArray();

    for (const announcement of announcements) {
      notifications.push({
        type: 'announcement',
        courseId: announcement.courseId.toString(),
        courseTitle: announcement.courseTitle,
        title: announcement.announcementTitle,
        description: announcement.announcementContent,
        createdAt: announcement.createdAt,
        link: `/dashboard/courses/${announcement.courseId}/curriculum`
      });
    }

    // Sort all notifications by date (newest first)
    notifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Group by course
    const groupedByCourse = notifications.reduce((acc, notif) => {
      if (!acc[notif.courseId]) {
        acc[notif.courseId] = {
          courseId: notif.courseId,
          courseTitle: notif.courseTitle,
          notifications: []
        };
      }
      acc[notif.courseId].notifications.push(notif);
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      success: true,
      notifications,
      groupedByCourse: Object.values(groupedByCourse),
      stats: {
        total: notifications.length,
        assignments: notifications.filter(n => n.type === 'assignment').length,
        resources: notifications.filter(n => n.type === 'resource').length,
        announcements: notifications.filter(n => n.type === 'announcement').length,
        graded: notifications.filter(n => n.type === 'submission').length,
        pendingAssignments: notifications.filter(n => 
          n.type === 'assignment' && !n.hasSubmitted && !n.isOverdue
        ).length,
        overdueAssignments: notifications.filter(n => 
          n.type === 'assignment' && !n.hasSubmitted && n.isOverdue
        ).length
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
