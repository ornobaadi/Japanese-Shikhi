import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Course from '@/lib/models/Course';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    // Create multiple sample courses for testing
    const sampleCourses = [
      {
        title: "Japanese for Beginners - Hiragana & Basic Conversation",
        titleJp: "初心者のための日本語 - ひらがなと基本会話",
        description: "Start your Japanese learning journey with this comprehensive beginner course. Learn Hiragana, basic vocabulary, and essential conversation skills that will help you communicate in everyday situations.",
        descriptionJp: "この総合的な初心者コースで日本語学習の旅を始めましょう。ひらがな、基本的な語彙、日常的な場面でのコミュニケーションに役立つ会話スキルを学習します。",
        level: "beginner",
        category: "conversation",
        tags: ["hiragana", "conversation", "vocabulary", "beginner", "fundamentals"],
        estimatedDuration: 1200, // 20 hours
        difficulty: 3,
        isPremium: true,
        isPublished: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&h=450&fit=crop",
        actualPrice: 99,
        discountedPrice: 49,
        enrollmentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        learningObjectives: [
          "Master all 46 Hiragana characters",
          "Build a vocabulary of 100+ essential words",
          "Construct basic sentences and questions",
          "Introduce yourself and others confidently",
          "Handle simple conversations about daily activities",
          "Understand Japanese sentence structure basics"
        ],
        prerequisites: ["No prior Japanese knowledge required"],
        totalLessons: 12,
        averageRating: 4.8,
        totalRatings: 156,
        enrolledStudents: 1247,
        courseLanguage: { primary: "japanese", secondary: "english" }
      },
      {
        title: "Katakana Mastery & Foreign Words",
        titleJp: "カタカナマスタリーと外来語",
        description: "Master the Katakana writing system and learn how foreign words are adapted into Japanese. Essential for reading modern Japanese texts and understanding borrowed vocabulary.",
        level: "beginner",
        category: "reading",
        tags: ["katakana", "foreign-words", "reading", "writing"],
        estimatedDuration: 900, // 15 hours
        difficulty: 4,
        isPremium: true,
        isPublished: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1524639064490-254e0a740547?w=800&h=450&fit=crop",
        actualPrice: 79,
        discountedPrice: 39,
        enrollmentDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        learningObjectives: [
          "Write all 46 Katakana characters fluently",
          "Recognize foreign loanwords in Japanese",
          "Understand sound adaptations in borrowed words",
          "Read basic Japanese texts with Katakana"
        ],
        prerequisites: ["Basic Hiragana knowledge recommended"],
        totalLessons: 10,
        averageRating: 4.6,
        totalRatings: 89,
        enrolledStudents: 892,
        courseLanguage: { primary: "japanese", secondary: "english" }
      },
      {
        title: "Essential Kanji for Daily Life",
        titleJp: "日常生活に必要な漢字",
        description: "Learn the most important Kanji characters used in everyday Japanese. Focus on recognition, meaning, and basic stroke order for practical communication.",
        level: "intermediate",
        category: "kanji",
        tags: ["kanji", "daily-life", "reading", "intermediate"],
        estimatedDuration: 2400, // 40 hours
        difficulty: 6,
        isPremium: true,
        isPublished: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1606115915090-be18fea23ec7?w=800&h=450&fit=crop",
        actualPrice: 149,
        discountedPrice: 89,
        learningObjectives: [
          "Recognize 200+ essential Kanji characters",
          "Understand basic stroke order principles",
          "Read simple Japanese texts and signs",
          "Write common Kanji from memory"
        ],
        prerequisites: ["Solid knowledge of Hiragana and Katakana"],
        totalLessons: 20,
        averageRating: 4.9,
        totalRatings: 234,
        enrolledStudents: 1563,
        courseLanguage: { primary: "japanese", secondary: "english" }
      },
      {
        title: "Japanese Grammar Fundamentals",
        titleJp: "日本語文法の基礎",
        description: "Master the building blocks of Japanese grammar. Learn sentence patterns, particles, verb conjugations, and essential grammar structures for effective communication.",
        level: "intermediate",
        category: "grammar",
        tags: ["grammar", "particles", "verbs", "sentence-structure"],
        estimatedDuration: 1800, // 30 hours
        difficulty: 7,
        isPremium: true,
        isPublished: true,
        actualPrice: 129,
        discountedPrice: 79,
        enrollmentDeadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        learningObjectives: [
          "Master essential Japanese particles",
          "Conjugate verbs in different tenses",
          "Construct complex sentences",
          "Use polite and casual speech forms"
        ],
        prerequisites: ["Basic vocabulary and Hiragana/Katakana knowledge"],
        totalLessons: 15,
        averageRating: 4.7,
        totalRatings: 178,
        enrolledStudents: 956,
        courseLanguage: { primary: "japanese", secondary: "english" }
      },
      {
        title: "Business Japanese Communication",
        titleJp: "ビジネス日本語コミュニケーション",
        description: "Professional Japanese for workplace communication. Learn keigo (honorific language), business etiquette, and formal communication skills for corporate environments.",
        level: "advanced",
        category: "conversation",
        tags: ["business", "keigo", "formal", "workplace", "advanced"],
        estimatedDuration: 3000, // 50 hours
        difficulty: 9,
        isPremium: true,
        isPublished: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=450&fit=crop",
        actualPrice: 199,
        discountedPrice: 149,
        learningObjectives: [
          "Master keigo (honorific language)",
          "Conduct business meetings in Japanese",
          "Write professional emails and documents",
          "Understand Japanese business culture"
        ],
        prerequisites: ["Intermediate Japanese proficiency required"],
        totalLessons: 25,
        averageRating: 4.9,
        totalRatings: 67,
        enrolledStudents: 423,
        courseLanguage: { primary: "japanese", secondary: "english" }
      },
      {
        title: "Free Introduction to Japanese",
        titleJp: "日本語入門（無料）",
        description: "Get started with Japanese for free! Learn basic greetings, numbers, and simple phrases. Perfect for absolute beginners who want to explore the language.",
        level: "beginner",
        category: "vocabulary",
        tags: ["free", "introduction", "greetings", "numbers", "basics"],
        estimatedDuration: 360, // 6 hours
        difficulty: 1,
        isPremium: false,
        isPublished: true,
        thumbnailUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=450&fit=crop",
        learningObjectives: [
          "Learn basic Japanese greetings",
          "Count from 1 to 100",
          "Introduce yourself in Japanese",
          "Understand Japanese writing systems overview"
        ],
        prerequisites: [],
        totalLessons: 6,
        averageRating: 4.5,
        totalRatings: 892,
        enrolledStudents: 5634,
        courseLanguage: { primary: "japanese", secondary: "english" }
      }
    ];

    const createdCourses = [];
    
    for (const courseData of sampleCourses) {
      // Check if course already exists
      const existingCourse = await Course.findOne({ title: courseData.title });
      
      if (!existingCourse) {
        const course = new Course({
          ...courseData,
          lessons: [],
          completionRate: Math.floor(Math.random() * 30) + 70, // Random completion rate 70-100%
          metadata: {
            version: "1.0.0",
            lastUpdated: new Date(),
            createdBy: "system-seeder"
          }
        });
        
        await course.save();
        createdCourses.push(course);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${createdCourses.length} sample courses created successfully`,
      data: createdCourses
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating sample courses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sample courses' },
      { status: 500 }
    );
  }
}