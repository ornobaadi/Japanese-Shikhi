import { currentUser } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Contact from "@/lib/models/Contact";

export async function GET() {
  try {
    await connectToDatabase();

    const contact = await Contact.findOne().lean();
    
    return NextResponse.json({
      success: true,
      data: contact || {},
    });
  } catch (error) {
    console.error("Error fetching contact:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact information" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    await connectToDatabase();

    const contact = await Contact.findOneAndUpdate(
      {},
      {
        ...body,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      success: true,
      data: contact.toObject(),
    });
  } catch (error) {
    console.error("Error updating contact:", error);
    return NextResponse.json(
      { error: "Failed to update contact information" },
      { status: 500 }
    );
  }
}
