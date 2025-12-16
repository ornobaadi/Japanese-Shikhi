import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';
import User from '@/lib/models/User';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { ObjectId } from 'mongodb';

// GET /api/courses/[id]/curriculum - get curriculum with access control
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    await connectToDatabase();
    const { id } = await params;

    // Use native MongoDB driver to avoid Mongoose schema casting issues with attachments/driveLinks
    const db = Course.db;
    const collection = db.collection('courses');
    const course = await collection.findOne({ _id: new ObjectId(id) });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if course is published
    if (!course.isPublished) {
      return NextResponse.json({ error: 'Course not available' }, { status: 403 });
    }

    // Check if user is admin
    let isAdmin = false;
    if (userId) {
      try {
        const client = await clerkClient();
        const clerkUser = await client.users.getUser(userId);
        isAdmin = clerkUser.publicMetadata?.role === 'admin';
      } catch (e) {
        console.error('Error checking admin status:', e);
      }
    }

    // Check if user is enrolled (only if user is logged in and not admin)
    let isEnrolled = false;
    if (userId && !isAdmin) {
      const user = await User.findOne({ clerkUserId: userId });
      if (user) {
        isEnrolled = user.enrolledCourses.some((ec: any) => 
          ec.courseId && ec.courseId.toString() === id
        );
      }
    }

    // Admins have full access
    if (isAdmin) {
      isEnrolled = true;
    }

    // Initialize curriculum if it doesn't exist
    if (!course.curriculum) {
      return NextResponse.json({
        success: true,
        title: course.title,
        description: course.description || '',
        curriculum: {
          modules: []
        },
        accessInfo: {
          isEnrolled,
          hasAccess: isEnrolled,
          canPreview: course.allowFreePreview,
          freePreviewCount: course.freePreviewCount || 0
        }
      });
    }

    // Filter content based on enrollment and free preview settings
    // Ensure modules are in order
    const modules = Array.isArray(course.curriculum.modules)
      ? course.curriculum.modules.slice().sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
      : [];

    const filteredCurriculum = {
      modules: modules
        .slice(0, isEnrolled ? modules.length : 1) // Non-enrolled users see only first module (section)
        .map((module: any, moduleIndex: number) => {
          // Track which item types have been shown for non-enrolled users
          const shownItemTypes = new Set<string>();

          // For enrolled/admin users, show all items; for preview, show only one of each type
          const moduleItems = (module.items || [])
            .filter((item: any) => {
              // Enrolled and admin users see all items
              if (isEnrolled || isAdmin) return true;
              // Non-enrolled users only see published items for preview
              return item.isPublished;
            })
            .map((item: any, itemIndex: number) => {
              const itemObj = item.toObject ? item.toObject() : item;
              const itemType = itemObj.type || 'other'; // Get item type (Live Class, Quiz, etc.)

              // Determine if user has access to this item
              let hasAccess = false;
              if (isEnrolled) {
                // Enrolled users get full access to all items
                hasAccess = true;
              } else if (course.allowFreePreview && !shownItemTypes.has(itemType)) {
                // Non-enrolled users get access to first item of each type only
                hasAccess = true;
                shownItemTypes.add(itemType); // Mark this type as shown
              }

              // Debug log for attachments
              if (item.attachments && item.attachments.length > 0) {
                console.log(`📎 API: Item "${itemObj.title}" has ${item.attachments.length} attachments:`, item.attachments);
              } else {
                console.log(`❌ API: Item "${itemObj.title}" has NO attachments. Raw item:`, {
                  attachments: item.attachments,
                  driveLinks: item.driveLinks,
                  type: item.type
                });
              }
              if (item.driveLinks && item.driveLinks.length > 0) {
                console.log(`🔗 API: Item "${itemObj.title}" has ${item.driveLinks.length} drive links:`, item.driveLinks);
              }

              // Explicitly include attachments and driveLinks
              const result = {
                ...itemObj,
                attachments: item.attachments || itemObj.attachments || [],
                driveLinks: item.driveLinks || itemObj.driveLinks || [],
                hasAccess,
                isLocked: !hasAccess,
                requiresEnrollment: !hasAccess && !isEnrolled
              };
              
              return result;
            });
          
          return {
            ...module.toObject ? module.toObject() : module,
            items: moduleItems,
            hasUnlockedItems: moduleItems.some((item: any) => item.hasAccess)
          };
        })
        // Show module if: (1) user enrolled/admin, OR (2) module is published, OR (3) has unlocked items
        .filter((module: any) => 
          isEnrolled || 
          isAdmin || 
          module.isPublished || 
          module.hasUnlockedItems
        )
        // Only show modules that have items
        .filter((module: any) => module.items.length > 0)
    };

    return NextResponse.json({
      success: true,
      title: course.title,
      description: course.description || '',
      curriculum: filteredCurriculum,
      accessInfo: {
        isEnrolled,
        hasAccess: isEnrolled,
        canPreview: course.allowFreePreview,
        freePreviewCount: 1, // Show one item of each type from first module to non-enrolled users
        isLoggedIn: !!userId
      }
    });
  } catch (error: any) {
    console.error('Error fetching curriculum:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curriculum', details: error.message },
      { status: 500 }
    );
  }
}