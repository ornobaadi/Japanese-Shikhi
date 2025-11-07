import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import Course from '@/lib/models/Course';
import { nanoid } from 'nanoid';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get user and course data
    const user = await User.findOne({ clerkUserId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if user has completed the course
    const enrollment = user.enrolledCourses.find(
      (ec: any) => ec.id.toString() === id
    );

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
    }

    // Check if course is completed (100% progress)
    if (enrollment.progress.progressPercentage < 100) {
      return NextResponse.json(
        { error: 'Course not completed yet', progress: enrollment.progress.progressPercentage },
        { status: 403 }
      );
    }

    // Generate certificate ID if not exists
    let certificateId = enrollment.certificateId;
    if (!certificateId) {
      certificateId = `CERT-${nanoid(12).toUpperCase()}`;
      
      // Update user with certificate ID and completion date
      enrollment.certificateId = certificateId;
      enrollment.completedAt = enrollment.completedAt || new Date();
      await user.save();
    }

    // Create PDF certificate
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 landscape
    const { width, height } = page.getSize();

    // Load fonts
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    const timesRomanItalicFont = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

    // Draw border
    page.drawRectangle({
      x: 50,
      y: 50,
      width: width - 100,
      height: height - 100,
      borderColor: rgb(0.2, 0.2, 0.6),
      borderWidth: 3,
    });

    page.drawRectangle({
      x: 55,
      y: 55,
      width: width - 110,
      height: height - 110,
      borderColor: rgb(0.2, 0.2, 0.6),
      borderWidth: 1,
    });

    // Draw logo circle at top center
    const logoX = width / 2;
    const logoY = height - 80;
    const logoRadius = 35;
    
    // Outer circle (red border)
    page.drawCircle({
      x: logoX,
      y: logoY,
      size: logoRadius,
      borderColor: rgb(0.86, 0.15, 0.15), // Red color
      borderWidth: 3,
      color: rgb(1, 1, 1), // White fill
    });

    // Japanese text "日本語" in logo
    page.drawText('日本語', {
      x: logoX - 25,
      y: logoY + 15,
      size: 14,
      font: timesRomanBoldFont,
      color: rgb(0.86, 0.15, 0.15),
    });

    // Mount Fuji shape (simplified as triangle)
    page.drawLine({
      start: { x: logoX - 20, y: logoY - 5 },
      end: { x: logoX, y: logoY - 25 },
      thickness: 2,
      color: rgb(0.86, 0.15, 0.15),
    });
    page.drawLine({
      start: { x: logoX, y: logoY - 25 },
      end: { x: logoX + 20, y: logoY - 5 },
      thickness: 2,
      color: rgb(0.86, 0.15, 0.15),
    });
    page.drawLine({
      start: { x: logoX - 20, y: logoY - 5 },
      end: { x: logoX + 20, y: logoY - 5 },
      thickness: 2,
      color: rgb(0.86, 0.15, 0.15),
    });

    // Sun (circle)
    page.drawCircle({
      x: logoX + 15,
      y: logoY - 10,
      size: 7,
      color: rgb(0.86, 0.15, 0.15),
    });

    // Platform name below logo
    page.drawText('Japanese Shikhi', {
      x: logoX - 55,
      y: logoY - 50,
      size: 14,
      font: timesRomanBoldFont,
      color: rgb(0.2, 0.2, 0.6),
    });

    // Title
    page.drawText('CERTIFICATE OF COMPLETION', {
      x: width / 2 - 220,
      y: height - 160,
      size: 32,
      font: timesRomanBoldFont,
      color: rgb(0.2, 0.2, 0.6),
    });

    // Subtitle
    page.drawText('This is to certify that', {
      x: width / 2 - 100,
      y: height - 220,
      size: 16,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Student name
    const studentName = user.fullName || user.username || user.email;
    const nameWidth = timesRomanBoldFont.widthOfTextAtSize(studentName, 28);
    page.drawText(studentName, {
      x: width / 2 - nameWidth / 2,
      y: height - 270,
      size: 28,
      font: timesRomanBoldFont,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Name underline
    page.drawLine({
      start: { x: width / 2 - nameWidth / 2 - 20, y: height - 280 },
      end: { x: width / 2 + nameWidth / 2 + 20, y: height - 280 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Completion text
    page.drawText('has successfully completed the course', {
      x: width / 2 - 145,
      y: height - 320,
      size: 16,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Course name
    const courseNameWidth = timesRomanBoldFont.widthOfTextAtSize(course.title, 22);
    page.drawText(course.title, {
      x: width / 2 - courseNameWidth / 2,
      y: height - 360,
      size: 22,
      font: timesRomanBoldFont,
      color: rgb(0.2, 0.2, 0.6),
    });

    // Date
    const completionDate = enrollment.completedAt
      ? new Date(enrollment.completedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    page.drawText(`Date: ${completionDate}`, {
      x: 100,
      y: 150,
      size: 14,
      font: timesRomanFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Certificate ID
    page.drawText(`Certificate ID: ${certificateId}`, {
      x: 100,
      y: 120,
      size: 12,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Signature section
    page.drawText('Japanese Shikhi Platform', {
      x: width - 250,
      y: 150,
      size: 14,
      font: timesRomanItalicFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawLine({
      start: { x: width - 250, y: 145 },
      end: { x: width - 100, y: 145 },
      thickness: 1,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText('Authorized Signature', {
      x: width - 235,
      y: 125,
      size: 11,
      font: timesRomanFont,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Serialize PDF
    const pdfBytes = await pdfDoc.save();

    // Return PDF
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="certificate-${course.title.replace(/\s+/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating certificate:', error);
    return NextResponse.json(
      { error: 'Failed to generate certificate' },
      { status: 500 }
    );
  }
}

