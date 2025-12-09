import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Rating from "@/lib/models/Rating";
import Course from "@/lib/models/Course";
import { clerkClient } from "@clerk/nextjs/server";

// DELETE - Delete a rating
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await connectToDatabase();

    const rating = await Rating.findById(id);

    if (!rating) {
      return NextResponse.json(
        { error: "Rating not found" },
        { status: 404 }
      );
    }

    const courseId = rating.courseId;
    await Rating.findByIdAndDelete(id);

    // Update course average rating
    const allRatings = await Rating.find({ courseId });
    const avgRating = allRatings.length > 0
      ? allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
      : 0;

    await Course.findByIdAndUpdate(courseId, {
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalRatings: allRatings.length,
    });

    return NextResponse.json({
      success: true,
      message: "Rating deleted",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return NextResponse.json(
      { error: "Failed to delete rating" },
      { status: 500 }
    );
  }
}
