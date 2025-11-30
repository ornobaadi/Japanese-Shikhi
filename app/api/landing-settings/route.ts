import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import LandingPageSettings from '@/lib/models/LandingPageSettings';
import Enrollment from '@/lib/models/Enrollment';

// GET - Fetch landing page settings
export async function GET() {
  try {
    await connectDB();

    // Get settings
    let settings = await LandingPageSettings.findOne({ isActive: true });

    // If no settings exist, create default
    if (!settings) {
      settings = await LandingPageSettings.create({
        hero: {
          heading: 'Learn Japanese Language',
          subheading: 'Master Japanese with Expert Instructors',
          description: 'Join thousands of students learning Japanese online with our comprehensive courses',
          ctaPrimary: 'Get Started',
          ctaSecondary: 'View Courses',
        },
        features: [
          {
            icon: 'IconLanguage',
            title: 'Native Instructors',
            description: 'Learn from experienced Japanese native speakers',
          },
          {
            icon: 'IconCertificate',
            title: 'Certified Courses',
            description: 'Get recognized certificates upon completion',
          },
          {
            icon: 'IconClock',
            title: 'Flexible Schedule',
            description: 'Learn at your own pace with lifetime access',
          },
          {
            icon: 'IconUsers',
            title: 'Community Support',
            description: 'Join our active community of learners',
          },
        ],
        stats: {
          baseEnrollmentCount: 50,
          showRealCount: true,
          coursesCount: 10,
          instructorsCount: 5,
          successRate: 95,
        },
        testimonials: [
          {
            name: 'Ahmed Rahman',
            role: 'Student',
            content: 'Best Japanese learning platform in Bangladesh. The instructors are amazing!',
            rating: 5,
          },
          {
            name: 'Fatima Khan',
            role: 'Working Professional',
            content: 'I learned Japanese from scratch and now I can communicate confidently.',
            rating: 5,
          },
        ],
        pricing: [
          {
            name: 'Basic',
            price: 2000,
            currency: 'BDT',
            duration: 'month',
            features: ['Access to basic courses', 'Community support', 'Certificate of completion'],
            popular: false,
            ctaText: 'Get Started',
          },
          {
            name: 'Pro',
            price: 5000,
            currency: 'BDT',
            duration: 'month',
            features: ['All basic features', 'Live classes', 'One-on-one mentoring', 'Priority support'],
            popular: true,
            ctaText: 'Get Started',
          },
        ],
      });
    }

    // Calculate real enrollment count
    const realEnrollmentCount = await Enrollment.countDocuments();
    const totalEnrollments = settings.stats.showRealCount 
      ? settings.stats.baseEnrollmentCount + realEnrollmentCount 
      : settings.stats.baseEnrollmentCount;

    return NextResponse.json({
      success: true,
      data: {
        ...settings.toObject(),
        stats: {
          ...settings.stats,
          totalEnrollments,
          realEnrollmentCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching landing page settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST/PUT - Update landing page settings (Admin only)
export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();

    // Find existing settings or create new
    let settings = await LandingPageSettings.findOne({ isActive: true });

    if (settings) {
      // Update existing
      Object.assign(settings, body);
      await settings.save();
    } else {
      // Create new
      settings = await LandingPageSettings.create(body);
    }

    return NextResponse.json({
      success: true,
      data: settings,
      message: 'Landing page settings updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating landing page settings:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
