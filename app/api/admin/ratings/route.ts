import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Rating, { IRating } from "@/lib/models/Rating";
import Course from "@/lib/models/Course";
import { clerkClient } from "@clerk/nextjs/server";

// GET - Fetch all ratings for admin
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    try {
      const clerkUser = await (await clerkClient()).users.getUser(user.id);
      const isAdmin = (clerkUser.publicMetadata as any)?.role === 'admin';

      if (!isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    await connectToDatabase();

    let query: any = {};
    if (courseId) {
      query.courseId = courseId;
    }

    const ratings = await Rating.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
}

// POST - Add fake rating by admin
export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    try {
      const clerkUser = await (await clerkClient()).users.getUser(user.id);
      const isAdmin = (clerkUser.publicMetadata as any)?.role === 'admin';

      if (!isAdmin) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 });
      }
    } catch (error) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json() as Partial<IRating>;

    if (!body.courseId || !body.rating || !body.review || !body.userName) {
      return NextResponse.json(
        { error: "courseId, rating, review, and userName are required" },
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

    const newRating = new Rating({
      courseId: body.courseId,
      userId: `fake_${Date.now()}`,
      userName: body.userName,
      userEmail: body.userEmail,
      rating: body.rating,
      review: body.review,
      isFakeRating: true,
      isVerified: true,
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
    console.error("Error creating fake rating:", error);
    return NextResponse.json(
      { error: "Failed to create rating" },
      { status: 500 }
    );
  }
}
