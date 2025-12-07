import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Rating, { IRating } from "@/lib/models/Rating";
import Course from "@/lib/models/Course";

// GET - Fetch all ratings for a course or all ratings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    await connectToDatabase();

    let query = Rating.find({
      $or: [
        { isFakeRating: false },
        { isFakeRating: true }
      ]
    });

    if (courseId) {
      // Fetch ratings for specific course
      query = query.where('courseId', courseId);
    }

    const ratings = await query
      .populate('courseId', 'title')
      .sort({ createdAt: -1 })
      .lean();

    // Map ratings to include courseName
    const mappedRatings = ratings.map((r: any) => ({
      ...r,
      courseName: r.courseId?.title || 'Unknown Course'
    }));

    // Calculate average rating
    const avgRating = mappedRatings.length > 0
      ? (mappedRatings.reduce((sum: number, r: any) => sum + r.rating, 0) / mappedRatings.length).toFixed(1)
      : 0;

    return NextResponse.json({
      success: true,
      data: mappedRatings,
      stats: {
        totalRatings: mappedRatings.length,
        averageRating: parseFloat(avgRating as string),
      }
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

// POST - Create a new rating
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    const body = await request.json() as Partial<IRating>;

    if (!body.courseId || !body.rating || !body.review) {
      return NextResponse.json(
        { error: "courseId, rating, and review are required" },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already rated this course (for non-fake ratings)
    if (!body.isFakeRating && user) {
      const existingRating = await Rating.findOne({
        courseId: body.courseId,
        userId: user.id,
        isFakeRating: false,
      });

      if (existingRating) {
        return NextResponse.json(
          { error: "You have already rated this course" },
          { status: 400 }
        );
      }
    }

    const newRating = new Rating({
      courseId: body.courseId,
      userId: user?.id || 'anonymous',
      userName: body.userName || user?.fullName || 'Anonymous',
      userEmail: body.userEmail || user?.emailAddresses[0]?.emailAddress,
      rating: body.rating,
      review: body.review,
      isFakeRating: body.isFakeRating || false,
      isVerified: body.isVerified || !body.isFakeRating,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newRating.save();

    // Update course average rating
    const allRatings = await Rating.find({ courseId: body.courseId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

    await Course.findByIdAndUpdate(body.courseId, {
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalRatings: allRatings.length,
    });

    return NextResponse.json(
      {
        success: true,
        data: newRating.toObject(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}
